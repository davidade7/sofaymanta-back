import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('movies/recent')
  async getRecentMovies(@Query('lang') lang: string): Promise<any> {
    return this.mediaService.getRecentMovies(lang || 'es-ES');
  }

  @Get('movies/detail/:id')
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.mediaService.getMovieDetails(id, lang || 'es-ES');
  }

  @Get('tv/recent')
  async getRecentTvShows(@Query('lang') lang: string): Promise<any> {
    return this.mediaService.getRecentTvShows(lang || 'es-ES');
  }
}
