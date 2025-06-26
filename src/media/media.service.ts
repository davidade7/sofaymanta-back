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
  name: string;
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

interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

interface CastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface CrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  credit_id: string;
  department: string;
  job: string;
}

interface TvEpisodeDetails {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  episode_type: string;
  season_number: number;
  still_path?: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  production_code: string;
  crew: CrewMember[];
  guest_stars: GuestStar[];
}

interface GuestStar {
  character: string;
  credit_id: string;
  order: number;
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
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
            page: 1, // Limitar a la primera página para evitar demasiados resultados
          },
        },
      );

      // Verificar que los resultados cumplan con los tipos esperados
      return response.data.results.filter(
        (result) =>
          result.media_type === 'movie' ||
          result.media_type === 'tv' ||
          result.media_type === 'person',
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Error al buscar multimedia: ${axiosError.message || 'Error desconocido'}`,
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
            'release_date.gte': this.getDateString(-30), // 30 días atrás
            'release_date.lte': this.getDateString(30), // 30 días adelante
          },
        },
      );
      return response.data.results;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Error al recuperar las películas: ${axiosError.message || 'Error desconocido'}`,
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

      console.error('Error de API:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
      });

      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `Película con ID ${movieId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        `Error al recuperar los detalles de la película: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPopularMovies(language: string = 'es-ES'): Promise<Movie[]> {
    try {
      // Recuperar las 100 películas mejor calificadas (5 páginas de 20 películas)
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
              'vote_count.gte': 1000, // Mínimo de votos para evitar películas oscuras
              'release_date.gte': '2000-01-01', // Películas desde 2000 para relevancia
            },
          },
        );
        allMovies.push(...response.data.results);
      }

      // Mezclar el array y devolver 30 películas al azar
      const shuffledMovies = this.shuffleArray([...allMovies]);
      return shuffledMovies.slice(0, 30);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Error al recuperar las películas populares: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMovieCredits(
    movieId: number,
    language: string = 'es-ES',
  ): Promise<MovieCredits> {
    try {
      const response = await axios.get<MovieCredits>(
        `${this.apiUrl}/movie/${movieId}/credits`,
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
          `Película con ID ${movieId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los créditos de la película: ${axiosError.message || 'Error desconocido'}`,
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
        `Error al recuperar las series: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPopularTvShows(language: string = 'es-ES'): Promise<TvShow[]> {
    try {
      // Recuperar las 100 series mejor calificadas (5 páginas de 20 series)
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
              'vote_count.gte': 500, // Mínimo de votos para evitar series oscuras
              'first_air_date.gte': '2000-01-01', // Series desde 2000 para relevancia
            },
          },
        );
        allTvShows.push(...response.data.results);
      }

      // Mezclar el array y devolver 30 series al azar
      const shuffledTvShows = this.shuffleArray([...allTvShows]);
      return shuffledTvShows.slice(0, 30);
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Error al recuperar las series populares: ${axiosError.message || 'Error desconocido'}`,
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
          `Serie con ID ${tvId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        `Error al recuperar los detalles de la serie: ${axiosError.message || 'Error desconocido'}`,
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
          `Temporada ${seasonNumber} de la serie con ID ${serieId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los detalles de la temporada: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTvShowEpisodeDetails(
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
    language: string = 'es-ES',
  ): Promise<TvEpisodeDetails> {
    try {
      const response = await axios.get<TvEpisodeDetails>(
        `${this.apiUrl}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
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
          `Episodio ${episodeNumber} de la temporada ${seasonNumber} de la serie con ID ${seriesId} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los detalles del episodio: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTvShowEpisodeCredits(
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
    language: string = 'es-ES',
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/credits`,
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
          `Créditos del episodio ${episodeNumber} de la temporada ${seasonNumber} de la serie con ID ${seriesId} no encontrados`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los créditos del episodio: ${axiosError.message || 'Error desconocido'}`,
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
          `Persona con ID ${personId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los detalles de la persona: ${axiosError.message || 'Error desconocido'}`,
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
          `Persona con ID ${personId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los créditos de la persona: ${axiosError.message || 'Error desconocido'}`,
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

  async getMediaGenres(
    mediaId: number,
    mediaType: 'movie' | 'tv',
    language: string = 'es-ES',
  ): Promise<Array<{ id: number; name: string }>> {
    try {
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const response = await axios.get<{
        genres: Array<{ id: number; name: string }>;
      }>(`${this.apiUrl}/${endpoint}/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          accept: 'application/json',
        },
        params: {
          language: language,
        },
      });

      return response.data.genres || [];
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new HttpException(
          `${mediaType === 'movie' ? 'Película' : 'Serie'} con ID ${mediaId} no encontrada`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Error al recuperar los géneros de la ${mediaType === 'movie' ? 'película' : 'serie'}: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPersonalizedRecommendations(
    userId: string,
    userInteractionsService: {
      getHighRatedMedia: (
        minRating: number,
        mediaType: 'movie' | 'tv',
      ) => Promise<Array<{ media_id: number; media_type: string }>>;
      getUserRatings: (
        userId: string,
        mediaType?: 'movie' | 'tv',
      ) => Promise<Array<{ media_id: number; media_type: string }>>;
    },
    userProfileService: {
      getFavoriteGenres: (userId: string) => Promise<{
        movie_genres: number[];
        tv_genres: number[];
      }>;
      getUserStreamingPlatforms: (userId: string) => Promise<string[]>;
    },
    mediaType: 'movie' | 'tv' = 'movie',
    language: string = 'es-ES',
    page: number = 1,
    limit: number = 20,
  ): Promise<Movie[] | TvShow[]> {
    try {
      // 1. Recuperar los medios bien calificados por el usuario
      const highRatedMedia = await userInteractionsService.getHighRatedMedia(
        7,
        mediaType,
      );

      // 1.5. Recuperar TODOS los medios ya evaluados para excluirlos
      const allUserRatings = await userInteractionsService.getUserRatings(
        userId,
        mediaType,
      );
      const excludedMediaIds = new Set(
        allUserRatings.map((rating) => rating.media_id),
      );

      // 2. Recuperar los géneros favoritos del usuario
      const favoriteGenres = await userProfileService.getFavoriteGenres(userId);
      const userFavoriteGenres =
        mediaType === 'movie'
          ? favoriteGenres.movie_genres || []
          : favoriteGenres.tv_genres || [];

      // 3. Analizar los géneros de los medios bien calificados
      const genreCounter: Record<number, number> = {};

      // Contar los géneros de los medios bien calificados
      for (const media of highRatedMedia) {
        try {
          const mediaGenres = await this.getMediaGenres(
            media.media_id,
            mediaType,
            language,
          );
          for (const genre of mediaGenres) {
            genreCounter[genre.id] = (genreCounter[genre.id] || 0) + 1;
          }
        } catch {
          // Ignorar errores para medios específicos
          continue;
        }
      }

      // 4. Combinar con los géneros favoritos (darles más peso)
      for (const genreId of userFavoriteGenres) {
        genreCounter[genreId] = (genreCounter[genreId] || 0) + 3; // Peso más alto
      }

      // 5. Recuperar los 2 géneros más populares
      const sortedGenres = Object.entries(genreCounter)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 2)
        .map(([genreId]) => parseInt(genreId));

      if (sortedGenres.length === 0) {
        // Si no se encuentran géneros, usar contenido popular por defecto
        const defaultResults =
          mediaType === 'movie'
            ? await this.getPopularMovies(language)
            : await this.getPopularTvShows(language);

        // Excluir medios ya evaluados incluso en resultados por defecto
        const filteredDefaults = defaultResults.filter(
          (media) => !excludedMediaIds.has(media.id),
        );
        return filteredDefaults.slice(0, limit) as Movie[] | TvShow[];
      }

      // 6. Recuperar las plataformas de streaming del usuario
      const userPlatforms =
        await userProfileService.getUserStreamingPlatforms(userId);

      // 7. Recuperar varias páginas para tener más resultados
      const allResults: (Movie | TvShow)[] = [];
      const maxPages = Math.ceil(limit / 20) + 2; // +2 páginas adicionales para compensar exclusiones

      for (
        let currentPage = page;
        currentPage < page + maxPages;
        currentPage++
      ) {
        // Preparar los parámetros para el descubrimiento
        const discoverParams: Record<string, any> = {
          include_adult: false,
          language: language,
          page: currentPage,
          sort_by: 'vote_average.desc',
          'vote_count.gte': mediaType === 'movie' ? 500 : 300,
          with_genres: sortedGenres.join(','),
        };

        // Parámetros específicos según el tipo de medio
        if (mediaType === 'movie') {
          discoverParams.include_video = false;
          discoverParams['release_date.gte'] = '2010-01-01';
        } else {
          discoverParams['first_air_date.gte'] = '2010-01-01';
        }

        // Agregar plataformas de streaming si están disponibles
        if (userPlatforms.length > 0) {
          discoverParams['with_watch_providers'] = userPlatforms.join('|');
          discoverParams['watch_region'] = 'ES'; // Ajustar según tu región
        }

        // 8. Hacer la petición de descubrimiento
        const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
        const response = await axios.get<MovieResponse | TvShowResponse>(
          `${this.apiUrl}/discover/${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              accept: 'application/json',
            },
            params: discoverParams,
          },
        );

        // Filtrar medios ya evaluados
        const filteredResults = response.data.results.filter(
          (media) => !excludedMediaIds.has(media.id),
        );

        allResults.push(...filteredResults);

        // Parar si tenemos suficientes resultados
        if (allResults.length >= limit) {
          break;
        }

        // Parar si hemos llegado a la última página
        if (currentPage >= response.data.total_pages) {
          break;
        }
      }

      // Devolver el número solicitado de resultados
      return allResults.slice(0, limit) as Movie[] | TvShow[];
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Error al recuperar las recomendaciones personalizadas: ${axiosError.message || 'Error desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
