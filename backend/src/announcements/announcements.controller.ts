import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    @Get()
    findAll() {
        return this.announcementsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.announcementsService.findOne(+id);
    }

    @Post()
    create(@Body() data: any) {
        return this.announcementsService.create(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.announcementsService.remove(+id);
    }
}
