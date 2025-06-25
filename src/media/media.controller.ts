import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { MediaService } from './media.service';
import { UserMediaInteractionsService } from '../user-media-interactions/user-media-interactions.service';
import { UserProfileService } from '../user-profile/user-profile.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly userMediaInteractionsService: UserMediaInteractionsService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get('search')
  async searchMultimedia(
    @Query('query') query: string,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.searchMultimedia(query, lang || 'es-ES');
  }

  @Get('movies/recent')
  async getRecentMovies(@Query('lang') lang: string): Promise<any> {
    return this.mediaService.getRecentMovies(lang || 'es-ES');
  }

  @Get('movies/popular')
  async getPopularMovies(@Query('lang') lang: string): Promise<any> {
    return this.mediaService.getPopularMovies(lang || 'es-ES');
  }

  @Get('movies/detail/:id')
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getMovieDetails(id, lang || 'es-ES');
  }

  @Get('movies/:id/credits')
  async getMovieCredits(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getMovieCredits(id, lang || 'es-ES');
  }

  @Get('tv/recent')
  async getRecentTvShows(@Query('lang') lang: string): Promise<any> {
    return this.mediaService.getRecentTvShows(lang || 'es-ES');
  }

  @Get('tv/popular')
  async getPopularTvShows(@Query('lang') lang: string): Promise<any> {
    return this.mediaService.getPopularTvShows(lang || 'es-ES');
  }

  @Get('tv/detail/:id')
  async getTvShowDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getTvShowDetails(id, lang || 'es-ES');
  }

  @Get('tv/:seriesId/season/:seasonNumber')
  async getTvShowSeasonDetails(
    @Param('seriesId', ParseIntPipe) seriesId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getTvShowSeasonDetails(
      seriesId,
      seasonNumber,
      lang || 'es-ES',
    );
  }

  @Get('tv/:seriesId/season/:seasonNumber/episode/:episodeNumber')
  async getTvShowEpisodeDetails(
    @Param('seriesId', ParseIntPipe) seriesId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getTvShowEpisodeDetails(
      seriesId,
      seasonNumber,
      episodeNumber,
      lang || 'es-ES',
    );
  }

  @Get('tv/:seriesId/season/:seasonNumber/episode/:episodeNumber/credits')
  async getTvShowEpisodeCredits(
    @Param('seriesId', ParseIntPipe) seriesId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getTvShowEpisodeCredits(
      seriesId,
      seasonNumber,
      episodeNumber,
      lang || 'es-ES',
    );
  }

  @Get('person/:id')
  async getPersonDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getPersonDetails(id, lang || 'es-ES');
  }

  @Get('person/:id/combinedCredits')
  async getPersonCredits(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getPersonCredits(id, lang || 'es-ES');
  }

  @Get('recommendations')
  async getPersonalizedRecommendations(
    @Query('userId') userId: string,
    @Query('mediaType') mediaType: 'movie' | 'tv' = 'movie',
    @Query('lang') lang: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<any> {
    if (!userId) {
      throw new Error('userId is required');
    }

    return this.mediaService.getPersonalizedRecommendations(
      userId,
      this.userMediaInteractionsService,
      this.userProfileService,
      mediaType,
      lang || 'es-ES',
      page,
      limit,
    );
  }

  @Get('recommendations/movies')
  async getPersonalizedMovieRecommendations(
    @Query('userId') userId: string,
    @Query('lang') lang: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<any> {
    if (!userId) {
      throw new Error('userId is required');
    }

    return this.mediaService.getPersonalizedRecommendations(
      userId,
      this.userMediaInteractionsService,
      this.userProfileService,
      'movie',
      lang || 'es-ES',
      page,
      limit,
    );
  }

  @Get('recommendations/tv')
  async getPersonalizedTvRecommendations(
    @Query('userId') userId: string,
    @Query('lang') lang: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<any> {
    if (!userId) {
      throw new Error('userId is required');
    }

    return this.mediaService.getPersonalizedRecommendations(
      userId,
      this.userMediaInteractionsService,
      this.userProfileService,
      'tv',
      lang || 'es-ES',
      page,
      limit,
    );
  }
}
