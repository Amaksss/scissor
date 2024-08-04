import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as mongoose from 'mongoose';
//import mongoose from 'mongoose';




dotenv.config();

async function bootstrap() 
{
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule
  );
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Listen for Mongoose connection events
  mongoose.connection.once('open', () => {
    console.log('Successfully connected to the database');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Database connection error:', err);
  });
  
  

  await app.listen(4000);
}
bootstrap();
