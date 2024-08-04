import { IsNotEmpty, IsOptional, IsString, IsUrl, IsBoolean } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsUrl()
  @IsString()
  originalUrl: string;

  @IsOptional()
  @IsString()
  customShortUrl?: string;

  @IsOptional()
  @IsBoolean()
  generateQr?: boolean;
}