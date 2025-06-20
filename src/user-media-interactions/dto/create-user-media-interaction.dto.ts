import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateUserMediaInteractionDto {
  @IsNumber()
  media_id: number;

  @IsString()
  @IsIn(['movie', 'tv'])
  media_type: 'movie' | 'tv';

  @IsOptional()
  @IsNumber()
  @Min(1)
  season_number?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  episode_number?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
