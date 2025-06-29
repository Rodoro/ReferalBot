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
        if (data.width !== undefined) result.width = Number(data.width);
        if (data.height !== undefined) result.height = Number(data.height);
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
        const updateData: any = this.normalize(data);
        if (file) {
            const bucket = this.config.get<string>('MINIO_BANNER_BUCKET');
            updateData.imageUrl = await this.minio.upload(file, bucket);
        }
        return this.prisma.banner.update({ where: { id }, data: updateData });
    }

    remove(id: number) {
        return this.prisma.banner.delete({ where: { id } });
    }

    async duplicate(id: number) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner) throw new Error('Banner not found');
        const { imageUrl, qrTopOffset, qrLeftOffset, qrSize } = banner;
        return this.prisma.banner.create({
            data: { imageUrl, qrTopOffset, qrLeftOffset, qrSize },
        });
    }

    async exportXml() {
        const banners = await this.prisma.banner.findMany();
        const items = banners.map(b => `\n  <banner>\n    <id>${b.id}</id>\n    <imageUrl>${b.imageUrl}</imageUrl>\n    <qrTopOffset>${b.qrTopOffset}</qrTopOffset>\n    <qrLeftOffset>${b.qrLeftOffset}</qrLeftOffset>\n    <qrSize>${b.qrSize}</qrSize>\n    <width>${b.width}</width>\n    <height>${b.height}</height>\n    <createdAt>${b.createdAt.toISOString()}</createdAt>\n  </banner>`).join('');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<banners>${items}\n</banners>`;
    }
}