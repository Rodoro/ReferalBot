import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from '../modules/banners/banners.module';
import { ConfigModule } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true
    }),
    PrismaModule,

    BannersModule,
  ],
})
export class CoreModule { }
