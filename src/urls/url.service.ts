import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url, UrlDocument } from './schemas/url.schema';
import { CreateUrlDto } from './dto/create-url.dto';
import * as QRCode from 'qrcode';
import * as cache from 'memory-cache';
import axios from 'axios';



@Injectable()
export class UrlService {

  private readonly BASE_URL = 'https://scissor-t2n9.onrender.com/urls/'; // Add your base URL here

  constructor(@InjectModel(Url.name) private readonly urlModel: Model<UrlDocument>) {}

  async shortenUrl(createUrlDto: CreateUrlDto, userId: string): Promise<Url> {
    const { originalUrl, customShortUrl } = createUrlDto;

    // Check cache for existing short URL for the given original URL
    const cacheKey = `shortened_${originalUrl}`;
    let cachedUrl = cache.get(cacheKey);
    
    if (cachedUrl) {
      return cachedUrl;
    }


    let shortUrl;
    if (customShortUrl) {
      const existingUrl = await this.urlModel.findOne({ shortUrl: customShortUrl });
      if (existingUrl) {
        throw new HttpException('Custom URL is unavailable', HttpStatus.BAD_REQUEST);
      }
      shortUrl = customShortUrl;
    } else {
      shortUrl = this.generateShortUrl();
    }

    const fullShortUrl = `${this.BASE_URL}${shortUrl}`; // Full URL with base
    console.log('Full Short URL:', fullShortUrl);
    const qrCodeUrl = await this.generateQrCode(fullShortUrl); // Generate QR code with full URL

    //const qrCodeUrl = await this.generateQrCode(shortUrl);

    const createdUrl = new this.urlModel({
      originalUrl,
      //shortUrl,
      shortUrl,
      customShortUrl,
      qrCodeUrl,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUrl: Url = await createdUrl.save()

    //return await createdUrl.save();

     // Cache the newly created shortened URL
     cache.put(cacheKey, savedUrl, 60 * 60 * 1000); // Cache for 60 minutes

     return savedUrl;
  }

  

  // Helper method to generate a QR code
  private async generateQrCode(url: string): Promise<string> {
    try {
      //return await QRCode.toDataURL(url);
      const qrCodeDataUrl = await QRCode.toDataURL(url);
    console.log('QR Code Data URL:', qrCodeDataUrl); // Check this URL to verify content
    return qrCodeDataUrl;
    } catch (error) {
      throw new HttpException('Failed to generate QR code', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAnalytics(shortUrl: string, userId: string): Promise<any> {
    const urlDoc = await this.urlModel.findOne({ shortUrl, userId });
    if (!urlDoc) {
      throw new NotFoundException('URL not found');
    }

    return {
      originalUrl: urlDoc.originalUrl,
      shortUrl: urlDoc.shortUrl,
      customShortUrl: urlDoc.customShortUrl,
      qrCodeUrl: urlDoc.qrCodeUrl,
      clicks: urlDoc.clicks,
      sources: urlDoc.sources,
      createdAt: urlDoc.createdAt,
      updatedAt: urlDoc.updatedAt,
    };
  }

  async getLinkHistory(userId: string): Promise<Url[]> {
    return await this.urlModel.find({ userId }).exec();
  }

  async findOriginalUrl(shortUrl: string): Promise<string> {
    const urlDoc = await this.urlModel.findOne({ shortUrl });
    if (!urlDoc) {
      throw new NotFoundException('Short URL not found');
    }
  
   // Increment click count
   urlDoc.clicks += 1;
   await urlDoc.save();

   return urlDoc.originalUrl;
 }

  async handleRedirect(shortUrl: string, referrer: string): Promise<string> {
    const urlDoc = await this.urlModel.findOne({ shortUrl });
    if (!urlDoc) {
      throw new NotFoundException('URL not found');
    }

    await this.urlModel.updateOne(
      { shortUrl },
      { $inc: { clicks: 1 }, $push: { sources: referrer } }
    );

    return urlDoc.originalUrl;
  }

  

  // Helper method to generate a short URL
  private generateShortUrl(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = 7; // Length of the short URL
    let shortUrl = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      shortUrl += chars[randomIndex];
    }
    return shortUrl; 
  }
}



