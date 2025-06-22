import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateVideoEditorDto } from './dto/create-video-editor.dto';
import { UpdateVideoEditorDto } from './dto/update-video-editor.dto';
import { VideoEditorResponseDto } from './dto/video-editor-response.dto';

@Injectable()
export class VideoEditorService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateVideoEditorDto): Promise<VideoEditorResponseDto> {
        const ve = await this.prismaService.videoEditor.create({
            data: {
                user: { connect: { id: data.userId } },
                fullName: data.fullName,
                city: data.city,
                inn: data.inn,
                phone: data.phone,
                businessType: data.businessType,
                bik: data.bik,
                account: data.account,
                bankName: data.bankName,
                bankKs: data.bankKs,
                bankDetails: data.bankDetails,
                approved: data.approved,
                contractSigned: data.contractSigned,
            },
            include: { user: true },
        });
        return plainToInstance(VideoEditorResponseDto, { ...ve.user, ...ve });
    }

    async findAll(): Promise<VideoEditorResponseDto[]> {
        const list = await this.prismaService.videoEditor.findMany();
        return list.map((l) => plainToInstance(VideoEditorResponseDto, l));
    }

    async findOne(id: number): Promise<VideoEditorResponseDto> {
        const ve = await this.prismaService.videoEditor.findUnique({ where: { id } });
        if (!ve) {
            throw new NotFoundException('VideoEditor not found');
        }
        return plainToInstance(VideoEditorResponseDto, ve);
    }

    async update(id: number, data: UpdateVideoEditorDto): Promise<VideoEditorResponseDto> {
        const ve = await this.prismaService.videoEditor.update({ where: { userId: id }, data });
        return plainToInstance(VideoEditorResponseDto, ve);
    }

    async remove(id: number): Promise<VideoEditorResponseDto> {
        const ve = await this.prismaService.videoEditor.delete({ where: { id } });
        return plainToInstance(VideoEditorResponseDto, ve);
    }
}