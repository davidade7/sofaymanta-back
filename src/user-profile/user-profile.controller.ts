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
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProfileService.getUserProfile(id);
  }

  @Post(':userId')
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.userProfileService.createUserProfile(
      userId,
      createUserProfileDto,
    );
  }

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
}
