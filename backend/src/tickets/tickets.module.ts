import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket, TicketComment } from '../entities/ticket.entity';
import { TicketCategory } from '../entities/ticket-category.entity';
import { User } from '../entities/user.entity';
import { Unit } from '../entities/unit.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { TicketCategoriesController } from './ticket-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketComment, TicketCategory, User, Unit, ActivityLog])],
  controllers: [TicketsController, TicketCategoriesController],
  providers: [TicketsService],
})
export class TicketsModule { }
