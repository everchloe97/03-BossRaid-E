import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BaseAPIDocumentation } from './config/baseApiDocs';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './config/sentryInterceptor.config';
import { HttpResponseInterceptor } from './common/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('/api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  Sentry
  if (process.env.NODE_ENV == 'dev') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN
    });
    app.useGlobalInterceptors(new SentryInterceptor());
  } else {
    app.useGlobalInterceptors(new HttpResponseInterceptor());
  }


  // Swagger API Docs
  const documentOptions = new BaseAPIDocumentation().initializeOptions();
  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
