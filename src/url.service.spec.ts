import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from '../src/urls/url.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url, UrlDocument } from '../src/urls/schemas/url.schema';
import * as QRCode from 'qrcode';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUrlDto } from '../src/urls/dto/create-url.dto';
import { NotFoundException } from '@nestjs/common';

describe('UrlService', () => {
    let service: UrlService;
    let model: Model<UrlDocument>;
  
    const mockUrlModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      updateOne: jest.fn(),
    };
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UrlService,
          { provide: getModelToken(Url.name), useValue: mockUrlModel },
        ],
      }).compile();
  
      service = module.get<UrlService>(UrlService);
      model = module.get<Model<UrlDocument>>(getModelToken(Url.name));
    });
  
    describe('shortenUrl', () => {
      it('should create a shortened URL', async () => {
        const createUrlDto: CreateUrlDto = { originalUrl: 'http://example.com', customShortUrl: null };
  
        // Mocking the URL creation logic
        mockUrlModel.create.mockImplementationOnce(() => ({
          ...createUrlDto,
          shortUrl: 'abc123',
          save: jest.fn().mockResolvedValueOnce({ ...createUrlDto, shortUrl: 'abc123' }),
        }));
  
        const result = await service.shortenUrl(createUrlDto, 'userId');
        expect(result).toEqual({
          ...createUrlDto,
          shortUrl: 'abc123',
        });
        expect(mockUrlModel.create).toHaveBeenCalledWith(expect.objectContaining({
          originalUrl: createUrlDto.originalUrl,
          shortUrl: 'abc123',
          userId: 'userId',
        }));
      });
  
      it('should throw an exception if custom short URL is unavailable', async () => {
        mockUrlModel.findOne.mockResolvedValueOnce({} as any);
        const createUrlDto: CreateUrlDto = { originalUrl: 'http://example.com', customShortUrl: 'customUrl' };
  
        await expect(service.shortenUrl(createUrlDto, 'userId')).rejects.toThrow(HttpException);
      });
    });
  
    describe('getAnalytics', () => {
      it('should return URL analytics', async () => {
        mockUrlModel.findOne.mockResolvedValueOnce({
          originalUrl: 'http://example.com',
          shortUrl: 'shortUrl',
          customShortUrl: null,
          clicks: 10,
          sources: ['source'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
  
        const result = await service.getAnalytics('shortUrl', 'userId');
        expect(result).toEqual({
          originalUrl: 'http://example.com',
          shortUrl: 'shortUrl',
          customShortUrl: null,
          clicks: 10,
          sources: ['source'],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
  
      it('should throw an exception if URL is not found', async () => {
        mockUrlModel.findOne.mockResolvedValueOnce(null);
        await expect(service.getAnalytics('shortUrl', 'userId')).rejects.toThrow(NotFoundException);
      });
    });
  
    describe('getLinkHistory', () => {
      it('should return user link history', async () => {
        mockUrlModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce([
            { originalUrl: 'http://example.com', shortUrl: 'shortUrl1' },
            { originalUrl: 'http://example2.com', shortUrl: 'shortUrl2' },
          ]),
        });
  
        const result = await service.getLinkHistory('userId');
        expect(result).toEqual([
          { originalUrl: 'http://example.com', shortUrl: 'shortUrl1' },
          { originalUrl: 'http://example2.com', shortUrl: 'shortUrl2' },
        ]);
      });
    });
  
    describe('handleRedirect', () => {
      it('should redirect and increment click count', async () => {
        mockUrlModel.findOne.mockResolvedValueOnce({
          originalUrl: 'http://example.com',
          shortUrl: 'shortUrl',
          clicks: 10,
          sources: [],
          save: jest.fn(),
        });
  
        mockUrlModel.updateOne.mockResolvedValueOnce({} as any);
  
        const result = await service.handleRedirect('shortUrl', 'referrer');
        expect(result).toBe('http://example.com');
        expect(mockUrlModel.updateOne).toHaveBeenCalledWith(
          { shortUrl: 'shortUrl' },
          { $inc: { clicks: 1 }, $push: { sources: 'referrer' } }
        );
      });
  
      it('should throw an exception if URL is not found', async () => {
        mockUrlModel.findOne.mockResolvedValueOnce(null);
        await expect(service.handleRedirect('shortUrl', 'referrer')).rejects.toThrow(NotFoundException);
      });
    });
  
    describe('generateShortUrl', () => {
      it('should generate a short URL of specified length', () => {
        const shortUrl = service['generateShortUrl']();
        expect(shortUrl).toHaveLength(7);
      });
    });
  });