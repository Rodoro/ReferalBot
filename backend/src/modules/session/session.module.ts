import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { LoggingModule } from '../logging/logging.module';

@Module({
    controllers: [SessionController],
    providers: [SessionService],
    imports: [LoggingModule]
})
export class SessionModule { }