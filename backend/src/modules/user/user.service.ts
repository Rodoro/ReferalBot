import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/src/core/prisma/prisma.service";
import { UserResponseDto } from "./dto/user-response.dto";
import { CreateUserDto } from "./dto/create-user.dto";

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
        const user = await this.prismaService.user.create({ data });
        return plainToInstance(UserResponseDto, user);
    }
}