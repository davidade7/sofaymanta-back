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
import { WebhookUserDto } from './dto/webhook-user.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('webhook/create')
  @HttpCode(HttpStatus.CREATED)
  async createFromWebhook(@Body() webhookData: WebhookUserDto) {
    this.logger.log('Webhook received for user creation:', webhookData);

    try {
      // Extraire les données du record
      const createUserDto: CreateUserDto = {
        id: webhookData.record.id,
        email: webhookData.record.email,
        role: 'user', // Rôle par défaut
      };

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
