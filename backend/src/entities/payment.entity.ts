import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

export enum PaymentStatus {
    PENDING = 'Pending',
    VERIFIED = 'Verified',
    REJECTED = 'Rejected',
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.payments, { onDelete: 'CASCADE' })
    invoice: Invoice;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @CreateDateColumn()
    paymentDate: Date;

    @Column({ nullable: true })
    verifiedAt: Date;

    @Column({ nullable: true })
    rejectionReason: string;
}
