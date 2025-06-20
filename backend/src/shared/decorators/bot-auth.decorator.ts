import { applyDecorators, UseGuards } from '@nestjs/common';
import { BotAuthGuard } from '../guards/bot-auth.guard';

export function BotAuthorization() {
  return applyDecorators(UseGuards(BotAuthGuard));
}