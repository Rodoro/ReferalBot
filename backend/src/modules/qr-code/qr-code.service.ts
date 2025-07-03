import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { InputJsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class QrCodeService {
    constructor(private prisma: PrismaService) { }

    create(data: CreateQrCodeDto) {
        return this.prisma.qrCode.create({ data });
    }

    findAll() {
        return this.prisma.qrCode.findMany();
    }

    findOne(id: number) {
        return this.prisma.qrCode.findUnique({ where: { id } });
    }

    findMain() {
        return this.prisma.qrCode.findFirst({ where: { type: 'MAIN' } });
    }

    async updateMain(dto: UpdateQrCodeDto) {
        const { data, options, ...rest } = dto as Record<string, unknown>;
        const payload: { data?: string; options?: InputJsonValue } = {};

        if (typeof data === 'string') payload.data = data;
        if (options && typeof options === 'object') payload.options = options as InputJsonValue;
        else if (Object.keys(rest).length) payload.options = rest as InputJsonValue;

        const main = await this.prisma.qrCode.findFirst({ where: { type: 'MAIN' } });
        if (main) {
            return this.prisma.qrCode.update({ where: { id: main.id }, data: payload });
        }
        return this.prisma.qrCode.create({
            data: {
                type: 'MAIN',
                data: payload.data ?? '',
                options: payload.options ?? {},
            },
        });
    }

    update(id: number, data: UpdateQrCodeDto) {
        return this.prisma.qrCode.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.qrCode.delete({ where: { id } });
    }
}