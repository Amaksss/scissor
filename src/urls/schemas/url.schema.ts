import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Url extends Document {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true })
  shortUrl: string;

  @Prop()
  customShortUrl?: string;

  @Prop()
  qrCodeUrl?: string;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ type: [String], default: [] })
  sources: string[];

  @Prop({ required: true })
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UrlSchema = SchemaFactory.createForClass(Url);

export type UrlDocument = Url & Document;