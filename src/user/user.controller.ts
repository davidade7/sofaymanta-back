import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('webhook/create')
  @HttpCode(HttpStatus.CREATED)
  async createFromWebhook(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Webhook received for user creation:', createUserDto);

    try {
      const user = await this.usersService.create(createUserDto);
      this.logger.log(`User created successfully via webhook: ${user.id}`);
      return {
        success: true,
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      this.logger.error('Error creating user via webhook:', error);
      throw error;
    }
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Fetching user with ID: ${id}`);
    return this.usersService.findById(id);
  }
}
