import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { TmdbService } from './tmdb.service';

@Controller('movies')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('recent')
  async getRecentMovies(): Promise<any> {
    return this.tmdbService.getRecentMovies();
  }

  @Get('detail/:id')
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.tmdbService.getMovieDetails(id, lang || 'es-ES');
  }
}
