import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  id: string; // UUID fourni par Supabase Auth

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin' = 'user';
}
