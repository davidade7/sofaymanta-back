import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4200',
      'https://sofaymanta-front.vercel.app',
    ], // Les deux origines
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Si vous devez envoyer des cookies/tokens
  });

  // Middleware de logging global
  app.use((req: any, res: any, next: () => void) => {
    const logger = new Logger('HTTP');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.log(`${req.method} => ${req.originalUrl}`);
    next();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();
