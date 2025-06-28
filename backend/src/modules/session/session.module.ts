import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    controllers: [SessionController],
    providers: [SessionService],
    imports: [TelegramModule]
})
export class SessionModule { }