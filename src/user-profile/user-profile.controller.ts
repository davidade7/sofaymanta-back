import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { WebhookUserDto } from './dto/webhook-user-profile.dto';

@Controller('user-profiles')
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('webhook/create')
  @HttpCode(HttpStatus.CREATED)
  async createFromWebhook(@Body() webhookData: WebhookUserDto) {
    if (webhookData.type !== 'INSERT' || webhookData.table !== 'users') {
      return { success: false, message: 'Invalid webhook data' };
    }

    try {
      const profile = await this.userProfileService.createFromWebhook(
        webhookData.record.id,
        webhookData.record.email,
      );

      return {
        success: true,
        message: 'User profile created successfully',
        profile,
      };
    } catch (error: unknown) {
      this.logger.error('Error creating user profile via webhook:', error);
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      return {
        success: false,
        message: 'Error creating user profile',
        error: errorMessage,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProfileService.getUserProfileOrThrow(id);
  }

  // Seule route de modification nécessaire
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateUserProfile(id, updateUserProfileDto);
  }

  @Post(':id/favorite-genres')
  async addFavoriteGenre(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { genreId: number; mediaType: 'movie' | 'tv' },
  ) {
    await this.userProfileService.addFavoriteGenre(
      id,
      body.genreId,
      body.mediaType,
    );
    return { message: 'Género añadido a favoritos' };
  }

  @Delete(':id/favorite-genres/:genreId')
  async removeFavoriteGenre(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('genreId', ParseIntPipe) genreId: number,
    @Query('mediaType') mediaType: 'movie' | 'tv',
  ) {
    await this.userProfileService.removeFavoriteGenre(id, genreId, mediaType);
    return { message: 'Género eliminado de favoritos' };
  }

  @Post(':id/streaming-platforms')
  async addStreamingPlatform(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { platform: string },
  ) {
    await this.userProfileService.addStreamingPlatform(id, body.platform);
    return { message: 'Plataforma añadida' };
  }

  @Delete(':id/streaming-platforms/:platform')
  async removeStreamingPlatform(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('platform') platform: string,
  ) {
    await this.userProfileService.removeStreamingPlatform(id, platform);
    return { message: 'Plataforma eliminada' };
  }

  @Delete(':id/delete-account')
  async deleteUserAccount(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.userProfileService.deleteUserAccount(id);

    if (result.success) {
      return {
        success: true,
        message: 'Cuenta eliminada con éxito',
      };
    } else {
      return {
        success: false,
        message: 'Error al eliminar la cuenta',
        error: result.error,
      };
    }
  }
}
