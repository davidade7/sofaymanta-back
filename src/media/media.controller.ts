import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { TmdbService } from './media.service';

@Controller('movies')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('recent')
  async getRecentMovies(@Query('lang') lang: string): Promise<any> {
    return this.tmdbService.getRecentMovies(lang || 'es-ES');
  }

  @Get('detail/:id')
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang: string,
  ): Promise<any> {
    return this.tmdbService.getMovieDetails(id, lang || 'es-ES');
  }
}
