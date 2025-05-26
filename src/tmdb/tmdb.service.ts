import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

interface MovieResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  vote_average: number;
}

@Injectable()
export class TmdbService {
  private readonly apiUrl: string;
  private readonly accessToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = 'https://api.themoviedb.org/3';
    const accessToken = this.configService.get<string>('TMDB_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('TMDB_ACCESS_TOKEN not found in environment variables');
    }
    this.accessToken = accessToken;
  }

  async getRecentMovies(): Promise<Movie[]> {
    try {
      const response = await axios.get<MovieResponse>(
        `${this.apiUrl}/discover/movie`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            accept: 'application/json',
          },
          params: {
            include_adult: false,
            include_video: false,
            language: 'fr-FR',
            page: 1,
            sort_by: 'popularity.desc',
            with_release_type: '2|3',
            'release_date.gte': this.getDateString(-30), // 30 jours en arrière
            'release_date.lte': this.getDateString(30), // 30 jours en avant
          },
        },
      );
      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Erreur lors de la récupération des films: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }
}
