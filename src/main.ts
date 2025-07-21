import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://sofaymanta-front.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Si necesitas enviar cookies/tokens
  });

  // Middleware global de logging
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
