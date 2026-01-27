import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../entities/unit.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UnitsService {
    constructor(
        @InjectRepository(Unit)
        private readonly unitRepo: Repository<Unit>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    findAll() {
        return this.unitRepo.find({ relations: ['owner'] });
    }

    async findOne(id: number) {
        const unit = await this.unitRepo.findOne({ where: { id }, relations: ['owner', 'invoices', 'tickets'] });
        if (!unit) throw new NotFoundException(`Unit #${id} not found`);
        return unit;
    }

    async create(data: any) {
        const { ownerId, ...unitData } = data;
        // Explictly type the created entity to avoid Array inference
        const unit: Unit = this.unitRepo.create(unitData as Partial<Unit>);

        if (ownerId) {
            const owner = await this.userRepo.findOne({ where: { id: ownerId } });
            if (owner) {
                unit.owner = owner;
            }
        }

        return this.unitRepo.save(unit);
    }

    async update(id: number, data: any) {
        const { ownerId, ...unitData } = data;
        const unit = await this.findOne(id);

        if (ownerId) {
            const owner = await this.userRepo.findOne({ where: { id: ownerId } });
            if (owner) {
                unit.owner = owner;
            }
        }

        Object.assign(unit, unitData);
        return this.unitRepo.save(unit);
    }

    async remove(id: number) {
        const unit = await this.findOne(id);
        return this.unitRepo.remove(unit);
    }
}
