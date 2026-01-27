import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket, TicketComment } from '../entities/ticket.entity';
import { User } from '../entities/user.entity';
import { Unit } from '../entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketComment, User, Unit])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule { }
