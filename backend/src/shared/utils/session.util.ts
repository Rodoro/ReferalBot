import type { User } from "@/prisma/generated";
import type { Request } from "express";
import { InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SessionMetadata } from "../types/session-metadata.types";

export function saveSession(
    req: Request,
    user: User,
    metadata: SessionMetadata
) {
    return new Promise((resolve, reject) => {
        req.session.createdAt = new Date()
        req.session.staffId = user.id
        req.session.metadata = metadata

        req.session.save(err => {
            if (err) {
                return reject(new InternalServerErrorException('Не удалось сохронить сессию'))
            }
            resolve(user)
        })
    })
}

export function destroySession(req: Request, configService: ConfigService) {
    return new Promise((resolve, reject) => {
        req.session.destroy(err => {
            if (err) {
                return reject(new InternalServerErrorException('Не удалось заверщить сессию'))
            }

            req.res?.clearCookie(
                configService.getOrThrow<string>('SESSION_NAME'),
                {
                    domain: configService.getOrThrow<string>('SESSION_DOMAIN')
                }
            )
            resolve(true)
        })
    })
}