import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
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

    async export(format: string) {
        const banners = await this.prisma.banner.findMany();
        const filenameBase = 'banners';
        const header = ['id', 'imageUrl', 'qrTopOffset', 'qrLeftOffset', 'qrSize', 'width', 'height', 'createdAt'];
        switch (format) {
            case 'json':
                return {
                    data: JSON.stringify(banners, null, 2),
                    type: 'application/json',
                    filename: `${filenameBase}.json`,
                } as const;
            case 'csv':
                const rows = banners.map(b => [b.id, b.imageUrl, b.qrTopOffset, b.qrLeftOffset, b.qrSize, b.width, b.height, b.createdAt.toISOString()].join(','));
                return {
                    data: [header.join(','), ...rows].join('\n'),
                    type: 'text/csv',
                    filename: `${filenameBase}.csv`,
                } as const;
            case 'xlsx':
                const data = [
                    header,
                    ...banners.map(b => [
                        b.id,
                        b.imageUrl,
                        b.qrTopOffset,
                        b.qrLeftOffset,
                        b.qrSize,
                        b.width,
                        b.height,
                        b.createdAt.toISOString(),
                    ]),
                ];
                const worksheet = XLSX.utils.aoa_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Banners');
                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                return {
                    data: buffer,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    filename: `${filenameBase}.xlsx`,
                } as const;
            case 'xml':
            default:
                const items = banners
                    .map(
                        b => `\n  <banner>\n    <id>${b.id}</id>\n    <imageUrl>${b.imageUrl}</imageUrl>\n    <qrTopOffset>${b.qrTopOffset}</qrTopOffset>\n    <qrLeftOffset>${b.qrLeftOffset}</qrLeftOffset>\n    <qrSize>${b.qrSize}</qrSize>\n    <width>${b.width}</width>\n    <height>${b.height}</height>\n    <createdAt>${b.createdAt.toISOString()}</createdAt>\n  </banner>`,
                    )
                    .join('');
                return {
                    data: `<?xml version="1.0" encoding="UTF-8"?>\n<banners>${items}\n</banners>`,
                    type: 'application/xml',
                    filename: `${filenameBase}.xml`,
                } as const;
        }
    }

    async exportXml() {
        const res = await this.export('xml');
        return res.data as string;
    }
}