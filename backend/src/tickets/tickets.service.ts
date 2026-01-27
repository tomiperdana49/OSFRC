import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketComment } from '../entities/ticket.entity';
import { User } from '../entities/user.entity';
import { Unit } from '../entities/unit.entity';

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
    ) { }

    async findAll() {
        return this.ticketRepo.find({
            relations: ['unit', 'assignedTo'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number) {
        const ticket = await this.ticketRepo.findOne({
            where: { id },
            relations: ['unit', 'assignedTo', 'comments', 'comments.author']
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async create(data: any) {
        const { unitId, ...ticketData } = data;
        const ticket = this.ticketRepo.create(ticketData as Partial<Ticket>);

        if (unitId) {
            const unit = await this.unitRepo.findOne({ where: { id: unitId } });
            if (unit) ticket.unit = unit;
        }

        return this.ticketRepo.save(ticket);
    }

    async assignTechnician(ticketId: number, technicianId: number, estimate?: Date) {
        const ticket = await this.findOne(ticketId);
        const technician = await this.userRepo.findOne({ where: { id: technicianId } });
        if (!technician) throw new NotFoundException('Technician not found');

        ticket.assignedTo = technician;
        ticket.status = TicketStatus.IN_PROGRESS;
        if (estimate) {
            ticket.estimatedCompletion = estimate;
        }
        return this.ticketRepo.save(ticket);
    }

    async updateStatus(ticketId: number, status: TicketStatus) {
        const ticket = await this.findOne(ticketId);
        ticket.status = status;
        if (status === TicketStatus.CLOSED) {
            ticket.closedAt = new Date();
        } else {
            ticket.closedAt = null;
        }
        return this.ticketRepo.save(ticket);
    }

    async addComment(ticketId: number, authorId: number, text: string) {
        const ticket = await this.findOne(ticketId);
        const author = await this.userRepo.findOne({ where: { id: authorId } });
        if (!author) throw new NotFoundException('Author not found');

        const comment = this.commentRepo.create({
            ticket,
            author,
            text,
        });

        return this.commentRepo.save(comment);
    }

    async remove(id: number) {
        const ticket = await this.findOne(id);
        return this.ticketRepo.remove(ticket);
    }
}
