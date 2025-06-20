import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

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
}
