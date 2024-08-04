import { Controller, Post, Body, Get, Param, UseGuards, Request, Req, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
//import { Response } from '@nestjs/common';
import { Response } from 'express';

@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(JwtAuthGuard)
  @Post('shorten')
  async shortenUrl(@Body() createUrlDto: CreateUrlDto, @Request() req) {
    console.log('User from request:', req.user);
    const userId = req.user.userId;
    
    const generateQrCode = !!createUrlDto.generateQr; // Coerces value to boolean
    
    console.log(userId)
    return await this.urlService.shortenUrl(createUrlDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':shortUrl/analytics')
  async getAnalytics(@Param('shortUrl') shortUrl: string, @Request() req) {
    const userId = req.user.userId;
    return await this.urlService.getAnalytics(shortUrl, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/history')
  async getLinkHistory(@Param('userId') userId: string, @Request() req) {
    if (userId !== req.user.userId) {
      throw new Error('Unauthorized access');
    }
    return await this.urlService.getLinkHistory(userId);
  }


@Get(':shortUrl')
  async redirectUrl(@Param('shortUrl') shortUrl: string, @Req() req, @Res() res) {
    const referrer = req.headers.referer || 'direct';
    try {
      const originalUrl = await this.urlService.handleRedirect(shortUrl, referrer);
      return res.redirect(originalUrl);
    } catch (error) {
      return res.status(404).json({ message: 'URL not found' });
    }
  }

  @Get(':shortUrl')
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    try {
      const originalUrl = await this.urlService.findOriginalUrl(shortUrl);
      return res.redirect(originalUrl);
    } catch (error) {
      return res.status(404).send('URL not found');
    }
  }
}

