import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket, TicketStatus, TicketComment } from '../entities/ticket.entity';
import { TicketCategory } from '../entities/ticket-category.entity';
import { User } from '../entities/user.entity';
import { Unit } from '../entities/unit.entity';
import { ActivityLog } from '../entities/activity-log.entity';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        @InjectRepository(TicketComment)
        private readonly commentRepo: Repository<TicketComment>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Unit)
        private readonly unitRepo: Repository<Unit>,
        @InjectRepository(ActivityLog)
        private readonly activityLogRepo: Repository<ActivityLog>,
    ) { }

    async findAll(user?: any) {
        const where: any = {};
        if (user?.role === 'staff') {
            where.assignedTo = { id: user.id };
        }

        return this.ticketRepo.find({
            where,
            relations: ['unit', 'assignedTo', 'category'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number) {
        const ticket = await this.ticketRepo.findOne({
            where: { id },
            relations: ['unit', 'assignedTo', 'comments', 'comments.author', 'category']
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async create(data: any) {
        const { unitId, categoryId, ...ticketData } = data;
        const ticket = this.ticketRepo.create(ticketData as Partial<Ticket>);

        if (unitId) {
            const unit = await this.unitRepo.findOne({ where: { id: unitId } });
            if (unit) ticket.unit = unit;
        }

        if (categoryId) {
            const category = await this.ticketRepo.manager.findOne(TicketCategory, { where: { id: categoryId } });
            if (category) ticket.category = category;
        }

        return this.ticketRepo.save(ticket);
    }

    async assignTechnician(ticketId: number, technicianId: number, estimate?: Date) {
        const ticket = await this.findOne(ticketId);
        const technician = await this.userRepo.findOne({ where: { id: technicianId } });
        if (!technician) throw new NotFoundException('Technician not found');

        ticket.assignedTo = technician;
        // Keep status as NEW or current status when assigned
        if (estimate) {
            ticket.estimatedCompletion = estimate;
        }
        return this.ticketRepo.save(ticket);
    }

    async updateStatus(ticketId: number, status: TicketStatus) {
        const ticket = await this.findOne(ticketId);
        ticket.status = status;

        if (status === TicketStatus.IN_PROGRESS) {
            ticket.startedAt = new Date();
        } else if (status === TicketStatus.CLOSED) {
            ticket.closedAt = new Date();
        }

        return this.ticketRepo.save(ticket);
    }

    async addComment(ticketId: number, authorId: number, text: string, imageUrl?: string) {
        const ticket = await this.findOne(ticketId);
        const author = await this.userRepo.findOne({ where: { id: authorId } });
        if (!author) throw new NotFoundException('Author not found');

        const comment = this.commentRepo.create({
            ticket,
            author,
            text,
            imageUrl,
        });

        await this.commentRepo.save(comment);

        // Record Activity Log
        const log = this.activityLogRepo.create({
            description: `${author.name} added comment to Ticket #${ticketId}: "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
        });
        await this.activityLogRepo.save(log);

        return comment;
    }

    async remove(id: number) {
        const ticket = await this.findOne(id);
        return this.ticketRepo.remove(ticket);
    }
}
