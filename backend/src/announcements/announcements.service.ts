import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectRepository(Announcement)
        private readonly announcementRepo: Repository<Announcement>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    findAll() {
        return this.announcementRepo.find({
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number) {
        const announcement = await this.announcementRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!announcement) throw new NotFoundException('Announcement not found');
        return announcement;
    }

    async create(data: any) {
        const { createdById, ...announcementData } = data;
        const announcement = this.announcementRepo.create(announcementData as Partial<Announcement>);

        if (createdById) {
            const creator = await this.userRepo.findOne({ where: { id: createdById } });
            if (creator) announcement.createdBy = creator;
        }

        return this.announcementRepo.save(announcement);
    }

    async remove(id: number) {
        const announcement = await this.findOne(id);
        return this.announcementRepo.remove(announcement);
    }
}
