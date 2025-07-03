import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from '../modules/banners/banners.module';
import { ConfigModule } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.utils';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from '../modules/session/session.module';
import { UserModule } from '../modules/user/user.module';
import { MinioModule } from './minio/minio.module';
import { StaffModule } from '../modules/staff/staff.module';
import { AgentModule } from '../modules/agent/agent.module';
import { SalesPointModule } from '../modules/sales-point/sales-point.module';
import { PoetModule } from '../modules/poet/poet.module';
import { SalesOutletModule } from '../modules/sales-outlet/sales-outlet.module';
import { VideoEditorModule } from '../modules/video-editor/video-editor.module';
import { StatisticsModule } from '../modules/statistics/statistics.module';
import { QrCodeModule } from '../modules/qr-code/qr-code.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true
    }),
    PrismaModule,
    RedisModule,
    MinioModule,

    BannersModule,
    QrCodeModule,
    SessionModule,
    UserModule,
    StaffModule,
    AgentModule,
    SalesPointModule,
    PoetModule,
    SalesOutletModule,
    VideoEditorModule,
    StatisticsModule
  ],
})
export class CoreModule { }
