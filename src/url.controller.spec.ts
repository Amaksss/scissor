import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from '../src/urls/url.controller';
import { UrlService } from '../src/urls/url.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { CreateUrlDto } from '../src/urls/dto/create-url.dto';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { Url } from '../src/urls/schemas/url.schema';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  const mockUrlService = {
    shortenUrl: jest.fn(),
    getAnalytics: jest.fn(),
    getLinkHistory: jest.fn(),
    handleRedirect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        { provide: UrlService, useValue: mockUrlService },
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  describe('shortenUrl', () => {
    it('should return shortened URL', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'http://example.com',
        customShortUrl: null,
        generateQr: true,
      };

      jest.spyOn(service, 'shortenUrl').mockResolvedValue({
        ...createUrlDto,
        shortUrl: 'abc123',
        qrCodeUrl: 'mockQrCodeUrl',
        clicks: 0, // default initial value
        sources: [], // default initial value
        userId: 'mockUserId', // mock user ID
        createdAt: new Date(),
        updatedAt: new Date(),
        // Include any other fields required by the Url schema
      } as Url);

      const result = await controller.shortenUrl(createUrlDto, { user: { userId: 'userId' } } as unknown as Request);
expect(result).toEqual({
  ...createUrlDto,
  shortUrl: 'abc123',
  qrCodeUrl: 'mockQrCodeUrl',
      });
    });
  });

  describe('getAnalytics', () => {
    it('should return URL analytics', async () => {
      jest.spyOn(service, 'getAnalytics').mockResolvedValue({
        originalUrl: 'http://example.com',
        shortUrl: 'shortUrl',
        customShortUrl: null,
        qrCodeUrl: 'qrCodeUrl',
        clicks: 10,
        sources: ['source'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.getAnalytics('shortUrl', { user: { userId: 'userId' } } as unknown as Request);
expect(result).toEqual({
  originalUrl: 'http://example.com',
  shortUrl: 'shortUrl',
  customShortUrl: null,
  qrCodeUrl: 'qrCodeUrl',
  clicks: 10,
  sources: ['source'],
  createdAt: expect.any(Date),
  updatedAt: expect.any(Date),
})
    })
});


describe('getLinkHistory', () => {
    it('should return link history for the user', async () => {
      const mockUrls = [
        {
          originalUrl: 'http://example.com',
          shortUrl: 'shortUrl1',
          clicks: 5,
          sources: ['source1', 'source2'],
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
          customShortUrl: 'customShortUrl1',
          qrCodeUrl: 'qrCodeUrl1',
          // Include the necessary methods and properties for Mongoose document simulation
          save: jest.fn(),
          toObject: jest.fn().mockReturnValue({
            originalUrl: 'http://example.com',
            shortUrl: 'shortUrl1',
            clicks: 5,
            sources: ['source1', 'source2'],
            userId: 'userId',
            createdAt: new Date(),
            updatedAt: new Date(),
            customShortUrl: 'customShortUrl1',
            qrCodeUrl: 'qrCodeUrl1',
          }),
        } as unknown as Url, // Cast to Url type
        {
          originalUrl: 'http://example2.com',
          shortUrl: 'shortUrl2',
          clicks: 3,
          sources: ['source3', 'source4'],
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
          customShortUrl: 'customShortUrl2',
          qrCodeUrl: 'qrCodeUrl2',
          // Include the necessary methods and properties for Mongoose document simulation
          save: jest.fn(),
          toObject: jest.fn().mockReturnValue({
            originalUrl: 'http://example2.com',
            shortUrl: 'shortUrl2',
            clicks: 3,
            sources: ['source3', 'source4'],
            userId: 'userId',
            createdAt: new Date(),
            updatedAt: new Date(),
            customShortUrl: 'customShortUrl2',
            qrCodeUrl: 'qrCodeUrl2',
          }),
        } as unknown as Url, // Cast to Url type
      ];
  
      jest.spyOn(service, 'getLinkHistory').mockResolvedValue(mockUrls);
  
      const result = await controller.getLinkHistory('userId', { user: { userId: 'userId' } } as unknown as Request);
      expect(result).toEqual(mockUrls);
    });
  });


/*describe('getLinkHistory', () => {
    it('should return link history for the user', async () => {
      const mockUrls = [
        {
          originalUrl: 'http://example.com',
          shortUrl: 'shortUrl1',
          clicks: 5,
          sources: ['source1', 'source2'],
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
          customShortUrl: 'customShortUrl1',
          qrCodeUrl: 'qrCodeUrl1',
        },
        {
          originalUrl: 'http://example2.com',
          shortUrl: 'shortUrl2',
          clicks: 3,
          sources: ['source3', 'source4'],
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
          customShortUrl: 'customShortUrl2',
          qrCodeUrl: 'qrCodeUrl2',
        },
      ];
  
      jest.spyOn(service, 'getLinkHistory').mockResolvedValue(mockUrls);
  
      const result = await controller.getLinkHistory('userId', { user: { userId: 'userId' } } as unknown as Request);
      expect(result).toEqual(mockUrls);
    });
  });*/

  /*describe('getLinkHistory', () => {
    it('should return link history for the user', async () => {
      jest.spyOn(service, 'getLinkHistory').mockResolvedValue([
        { originalUrl: 'http://example.com', shortUrl: 'shortUrl1' },
        { originalUrl: 'http://example2.com', shortUrl: 'shortUrl2' },
      ]);

      const result = await controller.getLinkHistory('userId', { user: { userId: 'userId' } } as Request);
      expect(result).toEqual([
        { originalUrl: 'http://example.com', shortUrl: 'shortUrl1' },
        { originalUrl: 'http://example2.com', shortUrl: 'shortUrl2' },
      ]);
    });
  });*/

  describe('redirectUrl', () => {
    it('should redirect to the original URL', async () => {
      jest.spyOn(service, 'handleRedirect').mockResolvedValue('http://example.com');

      const result = await controller.redirectUrl('shortUrl', { headers: {} } as Request, { redirect: jest.fn() } as any);
      expect(result).toBeUndefined();
    });

    it('should return 404 if URL is not found', async () => {
      jest.spyOn(service, 'handleRedirect').mockRejectedValue(new NotFoundException());

      const result = await controller.redirectUrl('shortUrl', { headers: {} } as Request, { status: jest.fn().mockReturnThis(), json: jest.fn() } as any);
      expect(result).toBeUndefined();
    });
  });
});