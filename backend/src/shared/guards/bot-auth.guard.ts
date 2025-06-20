import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class BotAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-bot-token'];
    const expected = this.configService.get<string>('BOT_SERVICE_TOKEN');
    if (!token || token !== expected) {
      throw new UnauthorizedException('Invalid bot token');
    }
    return true;
  }
}