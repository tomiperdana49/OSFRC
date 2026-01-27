import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Unit } from '../entities/unit.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepo: Repository<Invoice>,
        @InjectRepository(Unit)
        private readonly unitRepo: Repository<Unit>,
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
    ) { }

    async findAll() {
        await this.checkOverdue();
        await this.syncAllBalances();
        return this.invoiceRepo.find({ relations: ['unit'], order: { period: 'DESC' } });
    }

    async findOne(id: number) {
        const invoice = await this.invoiceRepo.findOne({ where: { id }, relations: ['unit'] });
        if (!invoice) throw new NotFoundException(`Invoice #${id} not found`);
        return invoice;
    }

    async syncAllBalances() {
        const units = await this.unitRepo.find();
        for (const unit of units) {
            await this.syncUnitBalance(unit.id);
        }
    }

    async checkOverdue() {
        const now = new Date();
        await this.invoiceRepo.createQueryBuilder()
            .update(Invoice)
            .set({ status: InvoiceStatus.OVERDUE })
            .where("dueDate < :now AND status = :unpaid", { now, unpaid: InvoiceStatus.UNPAID })
            .execute();
    }

    async generateMonthlyBilling(period: string, baseAmount: number) {
        const units = await this.unitRepo.find();
        const invoices: Invoice[] = [];
        const month = period.split('-')[1]; // YYYY-MM

        for (const unit of units) {
            // Check if invoice already exists for this unit and period
            const existing = await this.invoiceRepo.findOne({ where: { unit: { id: unit.id }, period } });
            if (existing) continue;

            // Logic for Billing Cycle
            if (unit.billingCycle === 'Yearly' && month !== '01') {
                // Skip yearly units if it's not January
                continue;
            }

            // Logic for Owner Registration Date (Start Date)
            if (unit.ownerSince) {
                const [pYear, pMonth] = period.split('-').map(Number);
                const periodDate = new Date(pYear, pMonth - 1, 1);

                const ownerDate = new Date(unit.ownerSince);
                const ownerStartDate = new Date(ownerDate.getFullYear(), ownerDate.getMonth(), 1);

                if (periodDate < ownerStartDate) {
                    // Skip if billing period is before owner started
                    continue;
                }
            }

            const dueDate = new Date();
            dueDate.setDate(unit.invoiceDay || 20);

            // Use unit's specific basePrice if available, otherwise fallback to global baseAmount
            let finalAmount = Number(unit.basePrice) > 0 ? Number(unit.basePrice) : baseAmount;

            // Apply yearly discount if applicable
            if (unit.billingCycle === 'Yearly' && Number(unit.yearlyDiscount) > 0) {
                finalAmount = Math.max(0, finalAmount - Number(unit.yearlyDiscount));
            }

            const invoice = this.invoiceRepo.create({
                unit,
                period,
                totalAmount: finalAmount,
                paidAmount: 0,
                status: InvoiceStatus.UNPAID,
                dueDate,
            });
            invoices.push(invoice);
        }

        const savedInvoices = await this.invoiceRepo.save(invoices);
        await this.syncAllBalances();
        return savedInvoices;
    }

    async update(id: number, data: Partial<Invoice>) {
        const invoice = await this.findOne(id);
        Object.assign(invoice, data);

        // Auto status update if amount changes
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = InvoiceStatus.PAID;
        } else if (new Date(invoice.dueDate) < new Date() && invoice.status !== InvoiceStatus.PAID) {
            invoice.status = InvoiceStatus.OVERDUE;
        } else {
            invoice.status = InvoiceStatus.UNPAID;
        }

        const updated = await this.invoiceRepo.save(invoice);
        await this.syncUnitBalance(invoice.unit.id);
        return updated;
    }

    async remove(id: number) {
        const invoice = await this.findOne(id);
        const unitId = invoice.unit.id;
        await this.invoiceRepo.remove(invoice);
        await this.syncUnitBalance(unitId);
        return { deleted: true };
    }

    async recordPayment(invoiceId: number, amount: number) {
        const invoice = await this.findOne(invoiceId);

        const payment = this.paymentRepo.create({
            invoice,
            amount,
            status: PaymentStatus.VERIFIED,
            paymentDate: new Date(),
            verifiedAt: new Date(),
        });

        await this.paymentRepo.save(payment);

        invoice.paidAmount = Number(invoice.paidAmount) + Number(amount);
        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = InvoiceStatus.PAID;
        }

        await this.invoiceRepo.save(invoice);
        await this.syncUnitBalance(invoice.unit.id);

        return { invoice, payment };
    }

    async syncUnitBalance(unitId: number) {
        const unit = await this.unitRepo.findOne({ where: { id: unitId } });
        if (!unit) return;

        const allInvoices = await this.invoiceRepo.find({
            where: { unit: { id: unitId } }
        });

        const newBalance = allInvoices.reduce((acc, inv) => {
            const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
            return acc + (outstanding > 0 ? outstanding : 0);
        }, 0);

        unit.outstandingBalance = newBalance;
        await this.unitRepo.save(unit);
    }
}
