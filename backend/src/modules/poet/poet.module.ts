import { Module } from '@nestjs/common';
import { PoetController } from './poet.controller';
import { PoetService } from './poet.service';

@Module({
    controllers: [PoetController],
    providers: [PoetService],
    imports: [],
})
export class PoetModule { }