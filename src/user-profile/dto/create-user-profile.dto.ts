import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  IsNumber,
} from 'class-validator';

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
  @IsOptional()
  streaming_platforms?: string[];
}
