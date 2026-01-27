import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Get()
    findAll() {
        return this.unitsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.unitsService.findOne(+id);
    }

    @Post()
    create(@Body() data: any) {
        return this.unitsService.create(data);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.unitsService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.unitsService.remove(+id);
    }
}
