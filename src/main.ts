import { bootstrap } from './bootstrap';

async function main(): Promise<void> {
  const app = await bootstrap();
  await app.listen(process.env.PORT ?? 3000);
}

void main();
