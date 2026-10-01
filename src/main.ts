import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './bootstrap';

async function main(): Promise<void> {
  const app = configureApplication(await NestFactory.create(AppModule));
  await app.listen(process.env.PORT ?? 3000);
}

void main();
