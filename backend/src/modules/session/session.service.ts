import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginStaffDto } from './dto/login-staff.dto';
import { verify } from 'argon2';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';
import type { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { StaffResponseDto } from '../staff/dto/staff-response.dto';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { RedisService } from '@/src/core/redis/redis.service';
// import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        // private readonly telegramService: TelegramService,
    ) { }

    public async login(req: Request, loginStaffDto: LoginStaffDto, userAgent: string): Promise<StaffResponseDto> {
        const { email, password } = loginStaffDto;

        const user = await this.prismaService.staff.findFirst({
            where: {
                email,
            },
            include: {
                notificationSettings: true
            }
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        // const isValidPassword = await verify(user.password, password);

        // if (!isValidPassword) {
        //     throw new NotFoundException('Неверный пароль');
        // }

        const metadata = getSessionMetadata(req, userAgent)

        if (
            user.notificationSettings?.authLogin &&
            user.telegramId
        ) {
            // await this.telegramService.sendLoginStaff(
            //     user.telegramId,
            //     metadata
            // )
        }

        await saveSession(req, user, metadata);
        return plainToInstance(StaffResponseDto, user);
    }

    public async logout(req: Request): Promise<{ success: boolean }> {
        await destroySession(req, this.configService);
        return { success: true };
    }

    public async findByUser(req: Request) {
        const userId = req.session.staffId

        if (!userId) {
            throw new NotFoundException('Пользователь не обнаружен')
        }

        const keys = await this.redisService.keys('*')
        const userSessions: any[] = []

        if (!keys) {
            throw new NotFoundException('Пользователь не обнаружен')
        }

        for (const key of keys) {
            const sessionData = await this.redisService.get(key)

            if (sessionData) {
                const session = JSON.parse(sessionData)
                if (session.staffId === userId) {
                    userSessions.push({
                        ...session,
                        id: key.split(':')[1]
                    })
                }
            }
        }
        userSessions.sort((a, b) => b.createdAt - a.createdAt)
        return userSessions.filter(session => session.id !== req.session.id)
    }

    public async findCurrent(req: Request) {
        const sessionId = req.session.id

        const sessionData = await this.redisService.get(
            `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
        )
        if (!sessionData) {
            throw new NotFoundException('Сессия не найдена')
        }
        const session = JSON.parse(sessionData)

        return {
            ...session,
            id: sessionId
        }
    }

    public async clearSession(req: Request) {
        req.res?.clearCookie(
            this.configService.getOrThrow<string>('SESSION_NAME')
        )
        return true
    }

    public async remove(req: Request, id: string) {
        if (req.session.id === id) {
            throw new NotFoundException('Нельзя удалить текущую сессию')
        }

        await this.redisService.del(
            `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
        )

        return true
    }
}