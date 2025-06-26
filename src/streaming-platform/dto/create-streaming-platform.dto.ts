import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateStreamingPlatformDto {
  @IsString()
  code: string; // code from TMDB

  @IsString()
  name: string; // 'Netflix', 'Prime Video'

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  website_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
