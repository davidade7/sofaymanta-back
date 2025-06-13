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

interface TvShow {
  id: number;
  name: string; // Note: 'name' pour les séries, pas 'title'
  overview: string;
  first_air_date: string;
  poster_path?: string;
  vote_average: number;
}

interface TvShowResponse {
  results: TvShow[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface MultiSearchResponse {
  page: number;
  results: MultiSearchResult[];
  total_pages: number;
  total_results: number;
}

type MultiSearchResult =
  | MovieSearchResult
  | TvShowSearchResult
  | PersonSearchResult;

interface BaseSearchResult {
  id: number;
  media_type: string;
  popularity: number;
  backdrop_path?: string;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
}

interface MovieSearchResult extends BaseSearchResult {
  media_type: 'movie';
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  video: boolean;
}

interface TvShowSearchResult extends BaseSearchResult {
  media_type: 'tv';
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  poster_path?: string;
  origin_country: string[];
}

interface PersonSearchResult extends BaseSearchResult {
  media_type: 'person';
  name: string;
  profile_path?: string;
  known_for_department: string;
  known_for: (MovieSearchResult | TvShowSearchResult)[];
}

@Injectable()
export class MediaService {
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

  async searchMultimedia(
    query: string,
    language: string = 'es-ES',
  ): Promise<MultiSearchResult[]> {
    try {
      const response = await axios.get<MultiSearchResponse>(
        `${this.apiUrl}/search/multi`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            accept: 'application/json',
          },
          params: {
            query: query,
            include_adult: false,
            language: language,
            page: 1, // Limiter à la première page pour éviter trop de résultats
          },
        },
      );

      // Vérifier que les résultats sont conformes aux types attendus
      return response.data.results.filter(
        (result) =>
          result.media_type === 'movie' ||
          result.media_type === 'tv' ||
          result.media_type === 'person',
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Erreur lors de la recherche multimédia: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  async getPopularMovies(language: string = 'es-ES'): Promise<Movie[]> {
    try {
      // Récupérer les 100 films les mieux notés (5 pages de 20 films)
      const allMovies: Movie[] = [];

      for (let page = 1; page <= 5; page++) {
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
              page: page,
              sort_by: 'vote_average.desc',
              'vote_count.gte': 1000, // Minimum de votes pour éviter les films obscurs
              'release_date.gte': '2000-01-01', // Films depuis 2000 pour la pertinence
            },
          },
        );
        allMovies.push(...response.data.results);
      }

      // Mélanger le tableau et retourner 30 films au hasard
      const shuffledMovies = this.shuffleArray([...allMovies]);
      return shuffledMovies.slice(0, 30);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Erreur lors de la récupération des films populaires: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecentTvShows(language: string = 'es-ES'): Promise<TvShow[]> {
    try {
      const response = await axios.get<TvShowResponse>(
        `${this.apiUrl}/tv/on_the_air`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            accept: 'application/json',
          },
          params: {
            language: language,
            page: 1,
          },
        },
      );
      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Erreur lors de la récupération des séries: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPopularTvShows(language: string = 'es-ES'): Promise<TvShow[]> {
    try {
      // Récupérer les 100 séries les mieux notées (5 pages de 20 séries)
      const allTvShows: TvShow[] = [];

      for (let page = 1; page <= 5; page++) {
        const response = await axios.get<TvShowResponse>(
          `${this.apiUrl}/discover/tv`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              accept: 'application/json',
            },
            params: {
              include_adult: false,
              language: language,
              page: page,
              sort_by: 'vote_average.desc',
              'vote_count.gte': 500, // Minimum de votes pour éviter les séries obscures
              'first_air_date.gte': '2000-01-01', // Séries depuis 2000 pour la pertinence
            },
          },
        );
        allTvShows.push(...response.data.results);
      }

      // Mélanger le tableau et retourner 30 séries au hasard
      const shuffledTvShows = this.shuffleArray([...allTvShows]);
      return shuffledTvShows.slice(0, 30);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Erreur lors de la récupération des séries populaires: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTvShowDetails(
    tvId: number,
    language: string = 'es-ES',
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/tv/${tvId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          accept: 'application/json',
        },
        params: {
          language: language,
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `Série avec l'ID ${tvId} introuvable`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        `Erreur lors de la récupération des détails de la série: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTvShowSeasonDetails(
    serieId: number,
    seasonNumber: number,
    language: string = 'es-ES',
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/tv/${serieId}/season/${seasonNumber}`,
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
      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `Saison ${seasonNumber} de la série avec l'ID ${serieId} introuvable`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Erreur lors de la récupération des détails de la saison: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPersonDetails(
    personId: number,
    language: string = 'es-ES',
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/person/${personId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          accept: 'application/json',
        },
        params: {
          language: language,
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `Personne avec l'ID ${personId} introuvable`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Erreur lors de la récupération des détails de la personne: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPersonCredits(
    personId: number,
    language: string = 'es-ES',
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/person/${personId}/combined_credits`,
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
      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `Personne avec l'ID ${personId} introuvable`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Erreur lors de la récupération des crédits de la personne: ${axiosError.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
