import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Unit } from '../entities/unit.entity';
import { Ticket, TicketCategory, TicketStatus } from '../entities/ticket.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Unit) private unitRepo: Repository<Unit>,
        @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
        @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
        @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
    ) { }

    async onModuleInit() {
        const userCount = await this.userRepo.count();
        if (userCount === 0) {
            await this.seed();
        }
    }

    async seed() {
        console.log('Seeding data...');

        // Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const admin = await this.userRepo.save({
            name: 'Andi Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: UserRole.ADMIN,
        });

        const staff = await this.userRepo.save({
            name: 'Budi Technician',
            email: 'staff@example.com',
            password: hashedPassword,
            role: UserRole.STAFF,
        });

        const resident = await this.userRepo.save({
            name: 'Tomi Resident',
            email: 'res@example.com',
            password: hashedPassword,
            role: UserRole.RESIDENT,
        });

        // Units
        const unitsData = [
            { unitNumber: 'A-01', owner: resident },
            { unitNumber: 'A-02', owner: resident },
            { unitNumber: 'A-03', owner: admin },
            { unitNumber: 'B-12', owner: resident },
            { unitNumber: 'C-07', owner: resident },
            { unitNumber: 'C-11', owner: staff },
            { unitNumber: 'A-19', owner: resident },
        ];
        const units = await this.unitRepo.save(unitsData);

        // Tickets
        await this.ticketRepo.save([
            {
                unit: units.find(u => u.unitNumber === 'B-12'),
                category: TicketCategory.AIR,
                status: TicketStatus.NEW,
                description: 'Water leak in bathroom',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                unit: units.find(u => u.unitNumber === 'C-07'),
                category: TicketCategory.INTERNET,
                status: TicketStatus.IN_PROGRESS,
                description: 'Internet is slow',
                assignedTo: staff,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
                unit: units.find(u => u.unitNumber === 'A-19'),
                category: TicketCategory.SECURITY,
                status: TicketStatus.OVERDUE,
                description: 'CCTV not working',
                assignedTo: admin,
                createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000)
            },
        ]);

        // Invoices
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        await this.invoiceRepo.save([
            { unit: units[0], period: currentPeriod, totalAmount: 1500000, paidAmount: 1500000, status: InvoiceStatus.PAID, dueDate: new Date() },
            { unit: units[1], period: currentPeriod, totalAmount: 1500000, paidAmount: 0, status: InvoiceStatus.UNPAID, dueDate: new Date() },
            { unit: units[2], period: currentPeriod, totalAmount: 4200000, paidAmount: 0, status: InvoiceStatus.OVERDUE, dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { unit: units[5], period: currentPeriod, totalAmount: 2100000, paidAmount: 0, status: InvoiceStatus.OVERDUE, dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        ]);

        // Activity Logs
        await this.logRepo.save([
            { description: 'Ticket #421 closed (Unit B-07)', createdAt: new Date(Date.now() - 10 * 60 * 1000) },
            { description: 'Payment recorded (Unit C-02)', createdAt: new Date(Date.now() - 20 * 60 * 1000) },
            { description: 'New ticket created (Unit A-19)', createdAt: new Date(Date.now() - 35 * 60 * 1000) },
        ]);

        console.log('Seeding complete.');
    }
}
