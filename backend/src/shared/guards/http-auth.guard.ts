import { PrismaService } from "@/src/core/prisma/prisma.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';

@Injectable()
export class HttpAuthGuard implements CanActivate {
    constructor(private readonly prismaService: PrismaService) { }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        if (!request.session?.staffId) {
            throw new UnauthorizedException('Пользователь не авторизован');
        }

        const user = await this.prismaService.staff.findUnique({
            where: { id: request.session.staffId }
        });

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }

        request.user = user;
        return true;
    }
}