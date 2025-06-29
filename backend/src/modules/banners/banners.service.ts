import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { MinioService } from '../../core/minio/minio.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BannersService {
    constructor(
        private prisma: PrismaService,
        private minio: MinioService,
        private config: ConfigService,
    ) { }

    // FIX: Бред
    private normalize(data: Partial<CreateBannerDto>) {
        const result: any = {};
        if (data.qrTopOffset !== undefined) result.qrTopOffset = Number(data.qrTopOffset);
        if (data.qrLeftOffset !== undefined) result.qrLeftOffset = Number(data.qrLeftOffset);
        if (data.qrSize !== undefined) result.qrSize = Number(data.qrSize);
        return result;
    }

    async create(data: CreateBannerDto, file: Express.Multer.File) {
        const bucket = this.config.get<string>('MINIO_BANNER_BUCKET');
        const imageUrl = await this.minio.upload(file, bucket);
        const parsedData = this.normalize(data);
        return this.prisma.banner.create({ data: { ...parsedData, imageUrl } });
    }

    findAll() {
        return this.prisma.banner.findMany();
    }

    findOne(id: number) {
        return this.prisma.banner.findUnique({ where: { id } });
    }

    async update(id: number, data: UpdateBannerDto, file?: Express.Multer.File) {
        const updateData: any = { ...data };
        if (file) {
            const bucket = this.config.get<string>('MINIO_BANNER_BUCKET');
            updateData.imageUrl = await this.minio.upload(file, bucket);
        }
        return this.prisma.banner.update({ where: { id }, data: updateData });
    }

    remove(id: number) {
        return this.prisma.banner.delete({ where: { id } });
    }
}