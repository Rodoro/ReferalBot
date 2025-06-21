import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { StaffResponseDto } from './dto/staff-response.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateStaffDto): Promise<StaffResponseDto> {
        const staff = await this.prismaService.staff.create({
            data: {
                user: { connect: { id: data.userId } },
                firstName: data.firstName,
                midleName: data.midleName,
                lastName: data.lastName,
                permissions: data.permissions ?? '',
            },
            include: {
                user: true,
                notificationSettings: true,
            },
        });

        return plainToInstance(StaffResponseDto, {
            ...staff.user,
            ...staff,
        });
    }

    async findAll(): Promise<StaffResponseDto[]> {
        const staffs = await this.prismaService.staff.findMany({
            include: {
                user: true,
                notificationSettings: true,
            },
        });
        return staffs.map((s) => plainToInstance(StaffResponseDto, { ...s.user, ...s }));
    }

    async findOne(id: number): Promise<StaffResponseDto> {
        const staff = await this.prismaService.staff.findUnique({
            where: { id },
            include: {
                user: true,
                notificationSettings: true,
            },
        });
        if (!staff) {
            throw new NotFoundException('Staff member not found');
        }
        return plainToInstance(StaffResponseDto, { ...staff.user, ...staff });
    }

    async update(id: number, data: UpdateStaffDto): Promise<StaffResponseDto> {
        const staff = await this.prismaService.staff.update({
            where: { id },
            data: {
                firstName: data.firstName,
                midleName: data.midleName,
                lastName: data.lastName,
                permissions: data.permissions,
            },
            include: {
                user: true,
                notificationSettings: true,
            },
        });
        return plainToInstance(StaffResponseDto, { ...staff.user, ...staff });
    }

    async remove(id: number): Promise<StaffResponseDto> {
        const staff = await this.prismaService.staff.delete({
            where: { id },
            include: {
                user: true,
                notificationSettings: true,
            },
        });
        return plainToInstance(StaffResponseDto, { ...staff.user, ...staff });
    }
}