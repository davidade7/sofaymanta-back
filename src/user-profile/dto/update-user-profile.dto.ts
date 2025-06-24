import { IsString, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProfileDto } from './create-user-profile.dto';

export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  email?: string;
}
