import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateSalesOutletDto } from './dto/create-sales-outlet.dto';
import { UpdateSalesOutletDto } from './dto/update-sales-outlet.dto';
import { SalesOutletResponseDto } from './dto/sales-outlet-response.dto';
import { OutletType } from '@/prisma/generated';

@Injectable()
export class SalesOutletService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateSalesOutletDto): Promise<SalesOutletResponseDto> {
        const outlet = await this.prismaService.salesOutlet.create({
            data: {
                address: data.address,
                name: data.name,
                type: data.type ?? OutletType.SELLER,
                telegramId: String(data.telegramId),
                link: data.link,
                description: data.description,
                verified: data.verified,
                referralCode: Math.random().toString(36).slice(2, 10),
                partner: {
                    connect: {
                        id: data.partnerId,
                    },
                },
            },
        });
        return plainToInstance(SalesOutletResponseDto, outlet);
    }

    async findAll(): Promise<SalesOutletResponseDto[]> {
        const outlets = await this.prismaService.salesOutlet.findMany();
        return outlets.map((o) => plainToInstance(SalesOutletResponseDto, o));
    }

    async findByTelegramId(telegramId: string): Promise<SalesOutletResponseDto> {
        const outlet = await this.prismaService.salesOutlet.findFirst({
            where: { telegramId, type: OutletType.SELLER },
        });
        if (!outlet) {
            throw new NotFoundException('SalesOutlet not found');
        }
        return plainToInstance(SalesOutletResponseDto, outlet);
    }

    async findOne(id: number): Promise<SalesOutletResponseDto> {
        const outlet = await this.prismaService.salesOutlet.findUnique({ where: { id } });
        if (!outlet) {
            throw new NotFoundException('SalesOutlet not found');
        }
        return plainToInstance(SalesOutletResponseDto, outlet);
    }

    async findOneWithPartner(id: number) {
        const outlet = await this.prismaService.salesOutlet.findUnique({
            where: { id },
            include: { partner: true },
        })
        if (!outlet) {
            throw new NotFoundException('SalesOutlet not found')
        }
        return outlet
    }

    async update(id: number, data: UpdateSalesOutletDto): Promise<SalesOutletResponseDto> {
        const outlet = await this.prismaService.salesOutlet.update({ where: { id }, data });
        return plainToInstance(SalesOutletResponseDto, outlet);
    }

    async remove(id: number): Promise<SalesOutletResponseDto> {
        const outlet = await this.prismaService.salesOutlet.delete({ where: { id } });
        return plainToInstance(SalesOutletResponseDto, outlet);
    }

    async findByPartner(partnerId: number): Promise<SalesOutletResponseDto[]> {
        const outlets = await this.prismaService.salesOutlet.findMany({ where: { partnerId } });
        return outlets.map((o) => plainToInstance(SalesOutletResponseDto, o));
    }

    async generateForExistingPartners(): Promise<{ created: number }> {
        const partners = await this.prismaService.salesPoint.findMany();
        let created = 0;

        for (const partner of partners) {
            const existing = await this.prismaService.salesOutlet.findFirst({
                where: { partnerId: partner.id },
            });
            if (!existing) {
                await this.prismaService.salesOutlet.create({
                    data: {
                        partnerId: partner.id,
                        address: partner.city,
                        name: partner.fullName,
                        description: '',
                        verified: false,
                        referralCode: Math.random().toString(36).slice(2, 10),
                    },
                });
                created++;
            }
        }

        return { created };
    }
}