import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UserMediaInteractionsService } from './user-media-interactions.service';
import { CreateUserMediaInteractionDto } from './dto/create-user-media-interaction.dto';
import { UpdateUserMediaInteractionDto } from './dto/update-user-media-interaction.dto';

@Controller('user-media-interactions')
export class UserMediaInteractionsController {
  constructor(
    private readonly userMediaInteractionsService: UserMediaInteractionsService,
  ) {}

  @Post(':userId')
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createUserMediaInteractionDto: CreateUserMediaInteractionDto,
  ) {
    return this.userMediaInteractionsService.create(
      userId,
      createUserMediaInteractionDto,
    );
  }

  @Get('user/:userId')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userMediaInteractionsService.findByUser(userId);
  }

  @Get('user/:userId/media/:mediaId')
  async findByUserAndMedia(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Query('mediaType') mediaType: 'movie' | 'tv',
  ) {
    return this.userMediaInteractionsService.findByUserAndMedia(
      userId,
      mediaId,
      mediaType,
    );
  }

  @Get('user/:userId/media/:mediaId/details')
  async findByUserAndMediaDetails(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Query('mediaType') mediaType: 'movie' | 'tv',
    @Query('seasonNumber', new ParseIntPipe({ optional: true }))
    seasonNumber?: number,
    @Query('episodeNumber', new ParseIntPipe({ optional: true }))
    episodeNumber?: number,
  ) {
    return this.userMediaInteractionsService.findByUserAndMediaDetails(
      userId,
      mediaId,
      mediaType,
      seasonNumber,
      episodeNumber,
    );
  }

  @Get('user/:userId/media/:mediaId/episodes/ratings')
  async getEpisodeRatings(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Query('seasonNumber', new ParseIntPipe({ optional: true }))
    seasonNumber?: number,
  ) {
    return this.userMediaInteractionsService.getEpisodeRatings(
      userId,
      mediaId,
      seasonNumber,
    );
  }

  @Get('user/:userId/ratings')
  async getUserRatings(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('mediaType') mediaType?: 'movie' | 'tv',
  ) {
    return this.userMediaInteractionsService.getUserRatings(userId, mediaType);
  }

  @Get('user/:userId/comments')
  async getUserComments(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userMediaInteractionsService.getUserComments(userId);
  }

  @Get('media/:mediaId/ratings')
  async getMediaRatings(
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Query('mediaType') mediaType: 'movie' | 'tv',
    @Query('seasonNumber', new ParseIntPipe({ optional: true }))
    seasonNumber?: number,
    @Query('episodeNumber', new ParseIntPipe({ optional: true }))
    episodeNumber?: number,
  ) {
    return this.userMediaInteractionsService.getMediaRatings(
      mediaId,
      mediaType,
      seasonNumber,
      episodeNumber,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userMediaInteractionsService.findOne(id);
  }

  @Patch(':id/user/:userId')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserMediaInteractionDto: UpdateUserMediaInteractionDto,
  ) {
    return this.userMediaInteractionsService.update(
      id,
      userId,
      updateUserMediaInteractionDto,
    );
  }

  @Delete(':id/user/:userId')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.userMediaInteractionsService.remove(id, userId);
  }
}
