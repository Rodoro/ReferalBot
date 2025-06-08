import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  const config = app.get(ConfigService)

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie']
  })

  const configSwager = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, configSwager);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.getOrThrow<string>('APP_PORT'));
}
bootstrap();
