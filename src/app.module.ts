import { Module } from '@nestjs/common';
import { MongodbModule } from './mongodb/mongodb.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'
import { UrlModule } from './urls/url.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RateLimiterModule, RateLimiterGuard } from 'nestjs-rate-limiter';
import { APP_GUARD } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthService } from './auth/auth.service';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public') // Path to your public folder
      
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RateLimiterModule.register({ points: 10, duration: 60}),
    MongodbModule,
    AuthModule,
    UserModule,
    UrlModule,
  ],
  controllers: [AppController],
  providers: [AppService,  { provide: APP_GUARD, useClass: RateLimiterGuard}],
})


export class AppModule {}

