import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Unit } from './unit.entity';
import { Payment } from './payment.entity';

export enum InvoiceStatus {
    UNPAID = 'Unpaid',
    PAID = 'Paid',
    OVERDUE = 'Overdue',
}

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Unit, (unit) => unit.invoices, { onDelete: 'CASCADE' })
    unit: Unit;

    @Column()
    period: string; // YYYY-MM

    @Column('decimal', { precision: 12, scale: 2 })
    totalAmount: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    paidAmount: number;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.UNPAID,
    })
    status: InvoiceStatus;

    @Column()
    dueDate: Date;

    @OneToMany(() => Payment, (payment) => payment.invoice)
    payments: Payment[];

    @CreateDateColumn()
    createdAt: Date;
}
