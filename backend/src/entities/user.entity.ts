import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Unit } from './unit.entity';
import { Ticket } from './ticket.entity';
import { Announcement } from './announcement.entity';

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    RESIDENT = 'resident',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    whatsapp: string;

    @Column({ nullable: true })
    ktpPhoto: string;

    @Column({ select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.RESIDENT,
    })
    role: UserRole;

    @OneToMany(() => Unit, (unit) => unit.owner)
    units: Unit[];

    @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
    assignedTickets: Ticket[];

    @OneToMany(() => Announcement, (announcement) => announcement.createdBy)
    announcements: Announcement[];

    @CreateDateColumn()
    createdAt: Date;
}
