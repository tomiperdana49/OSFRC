import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from '../entities/unit.entity';
import { User } from '../entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Unit, User])],
    controllers: [UnitsController],
    providers: [UnitsService],
})
export class UnitsModule { }
