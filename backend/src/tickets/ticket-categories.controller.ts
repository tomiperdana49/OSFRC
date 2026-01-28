import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketCategory } from '../entities/ticket-category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('ticket-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketCategoriesController {
    constructor(
        @InjectRepository(TicketCategory)
        private readonly categoryRepo: Repository<TicketCategory>,
    ) { }

    @Get()
    findAll() {
        return this.categoryRepo.find({ order: { name: 'ASC' } });
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() data: any) {
        const category = this.categoryRepo.create(data);
        return this.categoryRepo.save(category);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id') id: string, @Body() data: any) {
        await this.categoryRepo.update(+id, data);
        return this.categoryRepo.findOne({ where: { id: +id } });
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.categoryRepo.delete(+id);
    }
}
