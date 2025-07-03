import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { MinioService } from '../../core/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { InputJsonValue } from '@prisma/client/runtime/library';

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
        if (data.qrTopOffset !== undefined)
            result.qrTopOffset = Number(data.qrTopOffset);
        if (data.qrLeftOffset !== undefined)
            result.qrLeftOffset = Number(data.qrLeftOffset);
        if (data.qrSize !== undefined) result.qrSize = Number(data.qrSize);
        if (data.width !== undefined) result.width = Number(data.width);
        if (data.height !== undefined) result.height = Number(data.height);
        return result;
    }

    async create(
        data: CreateBannerDto,
        file: Express.Multer.File,
        authorId: number,
    ) {
        const bucket = this.config.get<string>('MINIO_BANNER_BUCKET');
        const imageUrl = await this.minio.upload(file, bucket);
        const { qrOptions, ...rest } = data as any;
        const parsedData = this.normalize(rest);
        const staff = await this.prisma.staff.findFirst({ where: { userId: authorId } });
        let options: InputJsonValue = {};
        if (typeof qrOptions === 'string') {
            try { options = JSON.parse(qrOptions) as InputJsonValue; } catch { options = {}; }
        } else if (qrOptions) options = qrOptions as InputJsonValue;
        const qr = await this.prisma.qrCode.create({
            data: { type: 'START_BANNER', data: '', options },
        });
        return this.prisma.banner.create({
            data: { ...parsedData, imageUrl, authorId: staff?.id, qrCodeId: qr.id },
            include: { author: { include: { user: { select: { displayName: true } } } }, qrCode: true },
        });
    }

    findAll() {
        return this.prisma.banner.findMany({
            include: {
                author: { include: { user: { select: { displayName: true } } } },
                qrCode: true,
            },
        });
    }

    findOne(id: number) {
        return this.prisma.banner.findUnique({
            where: { id },
            include: {
                author: { include: { user: { select: { displayName: true } } } },
                qrCode: true,
            },
        });
    }

    async update(
        id: number,
        data: UpdateBannerDto,
        file?: Express.Multer.File,
        authorId?: number,
    ) {
        const { qrOptions, ...rest } = data as any;
        const updateData: any = this.normalize(rest);
        if (file) {
            const bucket = this.config.get<string>('MINIO_BANNER_BUCKET');
            updateData.imageUrl = await this.minio.upload(file, bucket);
        }
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        let options: InputJsonValue | undefined = undefined;
        if (typeof qrOptions === 'string') {
            try { options = JSON.parse(qrOptions) as InputJsonValue; } catch { options = undefined; }
        } else if (qrOptions) options = qrOptions as InputJsonValue;
        if (!banner?.qrCodeId) {
            const qr = await this.prisma.qrCode.create({ data: { type: 'START_BANNER', data: '', options: options ?? {} } });
            updateData.qrCodeId = qr.id;
        } else if (options !== undefined) {
            await this.prisma.qrCode.update({ where: { id: banner.qrCodeId }, data: { options } });
        }
        if (authorId !== undefined) {
            const staff = await this.prisma.staff.findFirst({ where: { userId: authorId } });
            updateData.authorId = staff?.id;
        }
        return this.prisma.banner.update({
            where: { id },
            data: updateData,
            include: { author: { include: { user: { select: { displayName: true } } } }, qrCode: true },
        });
    }

    remove(id: number) {
        return this.prisma.banner.delete({ where: { id } });
    }

    async duplicate(id: number, authorId: number) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner) throw new Error('Banner not found');
        const { imageUrl, qrTopOffset, qrLeftOffset, qrSize, width, height } =
            banner;
        const staff = await this.prisma.staff.findFirst({ where: { userId: authorId } });
        return this.prisma.banner.create({
            data: {
                imageUrl,
                qrTopOffset,
                qrLeftOffset,
                qrSize,
                width,
                height,
                authorId: staff?.id,
            },
            include: { author: { include: { user: { select: { displayName: true } } } } },
        });
    }

    async exportXml() {
        const banners = await this.prisma.banner.findMany({
            include: { author: { include: { user: { select: { displayName: true } } } } },
        });
        const items = banners
            .map(
                (b) =>
                    `\n  <banner>\n    <id>${b.id}</id>\n    <imageUrl>${b.imageUrl}</imageUrl>\n    <qrTopOffset>${b.qrTopOffset}</qrTopOffset>\n    <qrLeftOffset>${b.qrLeftOffset}</qrLeftOffset>\n    <qrSize>${b.qrSize}</qrSize>\n    <width>${b.width}</width>\n    <height>${b.height}</height>\n    <createdAt>${b.createdAt.toISOString()}</createdAt>\n    <authorId>${b.authorId}</authorId>\n    <authorName>${b.author?.user.displayName ?? ''}</authorName>\n  </banner>`,
            )
            .join('');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<banners>${items}\n</banners>`;
    }
}