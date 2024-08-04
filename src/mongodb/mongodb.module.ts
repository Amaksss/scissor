import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongodbService } from './mongodb.service';

/*@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://amakaorabuchi:YHzsBU0bqIIGjaGA@cluster0.2apynxe.mongodb.net/scissor_api?retryWrites=true&w=majority&appName=Cluster0'),
  ],
})
export class MongodbModule {}*/

@Module({
  imports: [
    ConfigModule, // Load .env file
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MongodbService],
})
export class MongodbModule {}