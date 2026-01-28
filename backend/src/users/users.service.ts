import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    findAll() {
        return this.userRepo.find();
    }

    async findByEmail(email: string) {
        return this.userRepo.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'password', 'role'] // Explicitly include password
        });
    }

    async findOne(id: number) {
        const user = await this.userRepo.findOne({ where: { id }, relations: ['units'] });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: any) {
        const { password, ...userData } = data;
        const user = this.userRepo.create(userData as Partial<User>);
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        } else {
            user.password = await bcrypt.hash('password123', 10); // Default password
        }
        return this.userRepo.save(user);
    }

    async update(id: number, data: any) {
        const user = await this.findOne(id);
        const { password, ...userData } = data;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        Object.assign(user, userData);
        return this.userRepo.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        return this.userRepo.remove(user);
    }
}
