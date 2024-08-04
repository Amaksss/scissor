import { Controller, Body, Post, HttpStatus,  Get, Render , Res} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path'



@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  
  

  /*@Post('/auth/login')
  async login(@Body('email') email: string, @Body('password') password: string, @Res() res: Response) {
    try {
      const { access_token } = await this.authService.login(email, password);
      res.cookie('token', access_token, { httpOnly: true }); // Set the cookie
      res.redirect('/home.html');
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).send('Invalid credentials');
    }
  } */
}
