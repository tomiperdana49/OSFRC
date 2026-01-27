import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from '../entities/invoice.entity';
import { Unit } from '../entities/unit.entity';
import { Payment } from '../entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Unit, Payment])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule { }
