import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/src/core/prisma/prisma.service";
import { UserResponseDto } from "./dto/user-response.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        // private readonly configService: ConfigService,
        // private readonly redisService: RedisService,
        // private readonly telegramService: TelegramService,
    ) { }

    async me(id: number): Promise<UserResponseDto> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User member not found');
        }

        return plainToInstance(UserResponseDto, user);
    }

    async create(data: CreateUserDto): Promise<UserResponseDto> {
        const existing = await this.prismaService.user.findUnique({
            where: { telegramId: data.telegramId },
        });

        if (existing) {
            return plainToInstance(UserResponseDto, existing);
        }

        const user = await this.prismaService.user.create({ data });
        return plainToInstance(UserResponseDto, user);
    }

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.prismaService.user.findMany();
        return users.map((user) => plainToInstance(UserResponseDto, user));
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.prismaService.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('User member not found');
        }

        return plainToInstance(UserResponseDto, user);
    }

    async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.prismaService.user.update({ where: { id }, data });
        return plainToInstance(UserResponseDto, user);
    }

    async remove(id: number): Promise<UserResponseDto> {
        const user = await this.prismaService.user.delete({ where: { id } });
        return plainToInstance(UserResponseDto, user);
    }
}