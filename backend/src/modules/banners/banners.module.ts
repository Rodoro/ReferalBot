import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BannersController],
    providers: [BannersService],
})
export class BannersModule { }