import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, IsNull } from 'typeorm';
import { Unit } from '../entities/unit.entity';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { ActivityLog } from '../entities/activity-log.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Unit)
        private unitRepository: Repository<Unit>,
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    async getDashboardData() {
        const totalUnits = await this.unitRepository.count();
        const vacantUnits = await this.unitRepository.count({
            where: { owner: IsNull() }
        });

        const outstandingInvoices = await this.invoiceRepository.find({
            where: { status: In([InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE]) },
        });
        const outstandingBalance = outstandingInvoices.reduce((acc, inv) => acc + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0);

        const openTicketsCount = await this.ticketRepository.count({
            where: { status: In([TicketStatus.NEW, TicketStatus.IN_PROGRESS]) },
        });

        const overdueTicketsCount = await this.ticketRepository.count({
            where: { status: TicketStatus.OVERDUE },
        });

        const openTickets = await this.ticketRepository.find({
            where: { status: In([TicketStatus.NEW, TicketStatus.IN_PROGRESS]) },
            relations: ['unit', 'assignedTo'],
            order: { createdAt: 'DESC' },
            take: 3,
        });

        // Current month billing summary
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthlyInvoices = await this.invoiceRepository.find({
            where: { period: currentPeriod },
        });

        const totalInvoiced = monthlyInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
        const totalPaid = monthlyInvoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
        const monthlyOutstanding = totalInvoiced - totalPaid;

        const topOverdueUnits = await this.invoiceRepository.find({
            where: { status: InvoiceStatus.OVERDUE },
            relations: ['unit'],
            order: { totalAmount: 'DESC' },
            take: 2,
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const activities = await this.activityLogRepository.find({
            where: { createdAt: Between(todayStart, todayEnd) },
            order: { createdAt: 'DESC' },
            take: 10,
        });

        return {
            kpi: {
                totalUnits,
                vacantUnits,
                outstandingBalance,
                openTickets: openTicketsCount,
                overdueTickets: overdueTicketsCount,
            },
            openTickets: openTickets.map(t => ({
                id: t.id,
                unit: t.unit?.unitNumber || 'N/A',
                category: t.category,
                status: t.status,
                age: this.calculateAge(t.createdAt),
                assigned: t.assignedTo?.name || '-',
            })),
            billingSummary: {
                period: currentPeriod,
                totalInvoices: totalInvoiced,
                paid: totalPaid,
                outstanding: monthlyOutstanding,
                paidPercentage: totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0,
                topOverdueUnits: topOverdueUnits.map(inv => ({
                    unit: inv.unit?.unitNumber || 'N/A',
                    amount: Number(inv.totalAmount) - Number(inv.paidAmount),
                    duration: '1 month', // Simplified
                })),
            },
            activities: activities.map(a => ({
                time: a.createdAt.toTimeString().substring(0, 5),
                text: a.description,
            })),
        };
    }

    private calculateAge(createdAt: Date): string {
        const diff = Date.now() - createdAt.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }
}
