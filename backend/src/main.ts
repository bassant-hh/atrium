import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Request, Response } from 'express';

const server = express();
let isInitialized = false;

async function bootstrapServerless() {
  if (!isInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://localhost:4200',
        'https://atrium-frontend-vite.vercel.app',
        'https://atrium-frontend-vite-8bkzbftx3-bassant-hhs-projects.vercel.app',
        /^https:\/\/atrium-frontend-vite-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.init();
    isInitialized = true;
  }
}

export default async function handler(req: Request, res: Response) {
  await bootstrapServerless();
  server(req, res);
}

async function bootstrapLocal() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4200',
      'https://atrium-frontend-vite.vercel.app',
      'https://atrium-frontend-vite-8bkzbftx3-bassant-hhs-projects.vercel.app',
      /^https:\/\/atrium-frontend-vite-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port, '0.0.0.0');
}

if (!process.env.VERCEL) {
  bootstrapLocal();
}
