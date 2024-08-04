import { Controller, Post, Body, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string, password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
async login(@Body() body: { email: string, password: string }) {
  const token = await this.authService.login(body.email, body.password);
  if (!token) {
    throw new UnauthorizedException('Invalid credentials');
  }
  return { accessToken: token };
}
}