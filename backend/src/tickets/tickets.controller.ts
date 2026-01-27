import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketStatus } from '../entities/ticket.entity';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    findAll() {
        return this.ticketsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(+id);
    }

    @Post()
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
        @Body() body: { authorId: number, text: string }
    ) {
        return this.ticketsService.addComment(+id, body.authorId, body.text);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ticketsService.remove(+id);
    }
}
