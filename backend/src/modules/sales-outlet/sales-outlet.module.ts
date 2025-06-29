import { Module } from '@nestjs/common';
import { SalesOutletController } from './sales-outlet.controller';
import { SalesOutletService } from './sales-outlet.service';

@Module({
    controllers: [SalesOutletController],
    providers: [SalesOutletService],
    imports: [],
})
export class SalesOutletModule { }