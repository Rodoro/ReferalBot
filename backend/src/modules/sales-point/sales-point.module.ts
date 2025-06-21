import { Module } from '@nestjs/common';
import { SalesPointController } from './sales-point.controller';
import { SalesPointService } from './sales-point.service';

@Module({
    controllers: [SalesPointController],
    providers: [SalesPointService],
    imports: [],
})
export class SalesPointModule { }