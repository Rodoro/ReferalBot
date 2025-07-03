import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';

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

    update(id: number, data: UpdateQrCodeDto) {
        return this.prisma.qrCode.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.qrCode.delete({ where: { id } });
    }
}