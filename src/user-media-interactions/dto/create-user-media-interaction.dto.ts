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
  mediaId: number;

  @IsString()
  @IsIn(['movie', 'tv'])
  mediaType: 'movie' | 'tv';

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
