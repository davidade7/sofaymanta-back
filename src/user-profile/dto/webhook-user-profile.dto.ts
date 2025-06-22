import { IsString, IsObject } from 'class-validator';

export class WebhookUserDto {
  @IsString()
  type: string;

  @IsString()
  table: string;

  @IsObject()
  record: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
}
