import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Unit } from '../entities/unit.entity';
import { Ticket } from '../entities/ticket.entity';
import { Invoice } from '../entities/invoice.entity';
import { ActivityLog } from '../entities/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Unit, Ticket, Invoice, ActivityLog]),
  ],
  providers: [SeedService],
})
export class SeedModule { }
