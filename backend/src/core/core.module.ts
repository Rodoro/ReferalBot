import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from '../modules/banners/banners.module';
import { ConfigModule } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.utils';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from '../modules/session/session.module';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true
    }),
    PrismaModule,
    RedisModule,

    BannersModule,
    SessionModule,
    UserModule
  ],
})
export class CoreModule { }
