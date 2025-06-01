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

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path?: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  budget: number;
  revenue: number;
  status: string;
  tagline?: string;
  homepage?: string;
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

  async getRecentMovies(language: string = 'es-ES'): Promise<Movie[]> {
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
            language: language,
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

  async getMovieDetails(
    movieId: number,
    language: string = 'es-ES',
  ): Promise<MovieDetails> {
    try {
      const response = await axios.get<MovieDetails>(
        `${this.apiUrl}/movie/${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            accept: 'application/json',
          },
          params: {
            language: language,
          },
        },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      console.error('API Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
      });

      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `Film avec l'ID ${movieId} introuvable`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        `Erreur lors de la récupération des détails du film: ${axiosError.message || 'Unknown error'}`,
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
