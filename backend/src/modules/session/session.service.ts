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
import { UserResponseDto } from '../user/dto/user-response.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly telegramService: TelegramService,
    ) { }

    public async loginByToken(req: Request, tokenValue: string, userAgent: string) {
        if (tokenValue == undefined) {
            throw new NotFoundException('Ссылка для регистрации не действительна')
        }
        const record = await this.prismaService.token.findFirst({
            where: {
                token: tokenValue,
                type: 'TELEGRAM_AUTH'
            },
            include: {
                user: true
            }
        })

        if (!record || record.expiresIn < new Date()) {
            throw new NotFoundException('Ссылка для регистрации не действительна')
        }

        const metadata = getSessionMetadata(req, userAgent)

        await saveSession(req, record.user as any, metadata)

        await this.prismaService.token.delete({ where: { id: record.id } })

        if (record.messageId && record.chatId) {
            await this.telegramService.removeKeyboard(record.chatId, record.messageId)
        }

        return plainToInstance(UserResponseDto, record.user)
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
            this.configService.getOrThrow<string>('SESSION_NAME'),
            {
                domain: this.configService.getOrThrow<string>('SESSION_DOMAIN')
            }
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