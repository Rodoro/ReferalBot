import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
    constructor(private prisma: PrismaService) { }

    create(data: CreateBannerDto) {
        return this.prisma.banner.create({ data });
    }

    findAll() {
        return this.prisma.banner.findMany();
    }

    findOne(id: number) {
        return this.prisma.banner.findUnique({ where: { id } });
    }

    update(id: number, data: UpdateBannerDto) {
        return this.prisma.banner.update({ where: { id }, data });
    }

    remove(id: number) {
        return this.prisma.banner.delete({ where: { id } });
    }
}