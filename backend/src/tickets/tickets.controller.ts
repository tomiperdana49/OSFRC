import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketStatus } from '../entities/ticket.entity';
import { UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.ticketsService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(+id);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.RESIDENT)
    create(@Body() data: any) {
        return this.ticketsService.create(data);
    }

    @Post(':id/assign')
    assign(
        @Param('id') id: string,
        @Body() body: { technicianId: number, estimate?: string }
    ) {
        const estimateDate = body.estimate ? new Date(body.estimate) : undefined;
        return this.ticketsService.assignTechnician(+id, body.technicianId, estimateDate);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
        return this.ticketsService.updateStatus(+id, status);
    }

    @Post(':id/comments')
    addComment(
        @Param('id') id: string,
        @Body() body: { text: string, imageUrl?: string },
        @Req() req: any
    ) {
        return this.ticketsService.addComment(+id, req.user.id, body.text, body.imageUrl);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.ticketsService.remove(+id);
    }
}
