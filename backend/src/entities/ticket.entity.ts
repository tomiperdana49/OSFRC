import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Unit } from './unit.entity';
import { User } from './user.entity';

export enum TicketCategory {
    AIR = 'Air',
    INTERNET = 'Internet',
    SECURITY = 'Security',
    OTHER = 'Other',
}

export enum TicketStatus {
    NEW = 'New',
    IN_PROGRESS = 'In Progress',
    CLOSED = 'Closed',
    OVERDUE = 'Overdue',
}

export enum TicketPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical',
}

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Unit, (unit) => unit.tickets, { onDelete: 'CASCADE' })
    unit: Unit;

    @Column({
        type: 'enum',
        enum: TicketCategory,
    })
    category: TicketCategory;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.NEW,
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        default: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @Column('text')
    description: string;

    @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
    assignedTo: User;

    @OneToMany(() => TicketComment, (comment) => comment.ticket)
    comments: TicketComment[];

    @Column({ nullable: true })
    estimatedCompletion: Date;

    @Column({ nullable: true })
    closedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity()
export class TicketComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    text: string;

    @ManyToOne(() => Ticket, (ticket) => ticket.comments, { onDelete: 'CASCADE' })
    ticket: Ticket;

    @ManyToOne(() => User)
    author: User;

    @CreateDateColumn()
    createdAt: Date;
}
