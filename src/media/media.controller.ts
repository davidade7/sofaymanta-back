import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { TmdbService } from './media.service';

@Controller('media')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('movies/recent')
  async getRecentMovies(@Query('lang') lang: string): Promise<any> {
    return this.tmdbService.getRecentMovies(lang || 'es-ES');
  }

  @Get('movies/detail/:id')
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.tmdbService.getMovieDetails(id, lang || 'es-ES');
  }
}
