/*import { IsUrl, IsOptional, IsString } from 'class-validator';

export class UrlDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  customShortUrl?: string;

  @IsOptional()
  @IsString()
  userId?: string; // Add userId field
}*/

export class UrlDto {
  originalUrl: string;
  customShortUrl?: string;
  userId: string;
}