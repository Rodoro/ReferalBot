import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateSalesPointDto } from './dto/create-sales-point.dto';
import { UpdateSalesPointDto } from './dto/update-sales-point.dto';
import { SalesPointResponseDto } from './dto/sales-point-response.dto';

@Injectable()
export class SalesPointService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateSalesPointDto): Promise<SalesPointResponseDto> {
        const referralCode = Math.random().toString(36).slice(2, 10);
        const sp = await this.prismaService.salesPoint.create({
            data: {
                user: { connect: { id: data.userId } },
                agentId: data.agentId,
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
                referralCode,
            },
            include: { user: true },
        });

        await this.prismaService.salesOutlet.create({
            data: {
                partnerId: sp.id,
                address: data.city,
                name: data.fullName,
                description: '',
                verified: false,
                referralCode
            },
        });
        return plainToInstance(SalesPointResponseDto, { ...sp.user, ...sp });
    }

    async findAll(): Promise<SalesPointResponseDto[]> {
        const points = await this.prismaService.salesPoint.findMany();
        return points.map((p) => plainToInstance(SalesPointResponseDto, p));
    }

    async findOne(id: number): Promise<SalesPointResponseDto> {
        const point = await this.prismaService.salesPoint.findUnique({ where: { userId: id } });
        if (!point) {
            throw new NotFoundException('SalesPoint not found');
        }
        return plainToInstance(SalesPointResponseDto, point);
    }

    async update(id: number, data: UpdateSalesPointDto): Promise<SalesPointResponseDto> {
        const point = await this.prismaService.salesPoint.update({ where: { userId: id }, data });
        return plainToInstance(SalesPointResponseDto, point);
    }

    async remove(id: number): Promise<SalesPointResponseDto> {
        const point = await this.prismaService.salesPoint.delete({ where: { userId: id } });
        return plainToInstance(SalesPointResponseDto, point);
    }

    async findByAgent(agentId: number): Promise<SalesPointResponseDto[]> {
        const points = await this.prismaService.salesPoint.findMany({ where: { agentId: agentId } });
        return points.map((p) => plainToInstance(SalesPointResponseDto, p));
    }
}