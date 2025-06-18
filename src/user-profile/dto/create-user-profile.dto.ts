import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  IsNumber,
  IsIn,
} from 'class-validator';
import { STREAMING_PLATFORM_LIST } from '../../common/constants/streaming-platforms';

export class CreateUserProfileDto {
  @IsString()
  @MaxLength(30)
  @IsOptional()
  username?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  favorite_movie_genres?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  favorite_tv_genres?: number[];

  @IsArray()
  @IsString({ each: true })
  @IsIn(STREAMING_PLATFORM_LIST, { each: true })
  @IsOptional()
  streaming_platforms?: string[];
}
