import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from './ticket.entity';
import { Invoice } from './invoice.entity';

@Entity()
export class Unit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    unitNumber: string;

    @ManyToOne(() => User, (user) => user.units)
    owner: User;

    @OneToMany(() => Ticket, (ticket) => ticket.unit)
    tickets: Ticket[];

    @OneToMany(() => Invoice, (invoice) => invoice.unit)
    invoices: Invoice[];

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    basePrice: number;

    @Column({
        type: 'enum',
        enum: ['Monthly', 'Yearly'],
        default: 'Monthly'
    })
    billingCycle: string;

    @Column({ type: 'int', default: 20 })
    invoiceDay: number;

    @Column({ nullable: true })
    ownerSince: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    yearlyDiscount: number;

    @Column({ default: 0 })
    outstandingBalance: number;
}
