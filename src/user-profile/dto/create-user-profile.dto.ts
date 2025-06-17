import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  username?: string;
}
