import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongodbService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const mongoUri = this.configService.get<string>('MONGODB_URI');
    console.log('MongoDB URI:', mongoUri); // This should print your MongoDB Atlas URI
  }
}