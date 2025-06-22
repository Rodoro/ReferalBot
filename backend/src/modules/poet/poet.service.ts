import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreatePoetDto } from './dto/create-poet.dto';
import { UpdatePoetDto } from './dto/update-poet.dto';
import { PoetResponseDto } from './dto/poet-response.dto';

@Injectable()
export class PoetService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreatePoetDto): Promise<PoetResponseDto> {
        const poet = await this.prismaService.poet.create({
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
        return plainToInstance(PoetResponseDto, { ...poet.user, ...poet });
    }

    async findAll(): Promise<PoetResponseDto[]> {
        const poets = await this.prismaService.poet.findMany();
        return poets.map((p) => plainToInstance(PoetResponseDto, p));
    }

    async findOne(id: number): Promise<PoetResponseDto> {
        const poet = await this.prismaService.poet.findUnique({ where: { id } });
        if (!poet) {
            throw new NotFoundException('Poet not found');
        }
        return plainToInstance(PoetResponseDto, poet);
    }

    async update(id: number, data: UpdatePoetDto): Promise<PoetResponseDto> {
        const poet = await this.prismaService.poet.update({ where: { userId: id }, data });
        return plainToInstance(PoetResponseDto, poet);
    }

    async remove(id: number): Promise<PoetResponseDto> {
        const poet = await this.prismaService.poet.delete({ where: { id } });
        return plainToInstance(PoetResponseDto, poet);
    }
}