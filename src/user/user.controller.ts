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
    // Valider que c'est bien un INSERT sur la table users
    if (webhookData.type !== 'INSERT' || webhookData.table !== 'users') {
      return { success: false, message: 'Invalid webhook data' };
    }

    try {
      const createUserDto: CreateUserDto = {
        id: webhookData.record.id,
        email: webhookData.record.email,
        role: 'user',
      };

      const user = await this.usersService.create(createUserDto);

      return {
        success: true,
        message: 'User created successfully',
        user,
      };
    } catch (error: unknown) {
      this.logger.error('Error creating user via webhook:', error);
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      return {
        success: false,
        message: 'Error creating user',
        error: errorMessage,
      };
    }
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdOrThrow(id);
  }
}
