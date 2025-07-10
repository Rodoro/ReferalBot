import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './core/redis/redis.service';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session'
import { ms, StringValue } from './shared/utils/ms.utils';
import { parseBoolean } from './shared/utils/parse-boolean.util';
import { RedisStore } from 'connect-redis';
import { IS_DEV_ENV } from './shared/utils/is-dev.utils';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  const config = app.get(ConfigService)
  const redis = app.get(RedisService)

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));

  app.use(session({
    secret: config.getOrThrow<string>('SESSION_SECRET'),
    name: config.getOrThrow<string>('SESSION_NAME'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: config.getOrThrow<string>('SESSION_DOMAIN'),
      maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAXAGE')),
      httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
      secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
      sameSite: 'lax',
    },
    store: new RedisStore({
      client: redis,
      prefix: config.getOrThrow<string>('SESSION_FOLDER')
    })
  }))

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie']
  })

  if (IS_DEV_ENV) {
    const configSwager = new DocumentBuilder()
      .setTitle('API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, configSwager);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(config.getOrThrow<string>('APP_PORT'));
}
bootstrap();
