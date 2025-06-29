import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MinioModule } from '../../core/minio/minio.module';

@Module({
    imports: [PrismaModule, MinioModule],
    controllers: [BannersController],
    providers: [BannersService],
})
export class BannersModule { }