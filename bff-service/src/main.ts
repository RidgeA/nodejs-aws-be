import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const config = await app.get<ConfigService>(ConfigService);

  await app.listen(config.get<string>('PORT'));
}

bootstrap();
