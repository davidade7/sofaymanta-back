import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserMediaInteractionDto } from './dto/create-user-media-interaction.dto';
import { UpdateUserMediaInteractionDto } from './dto/update-user-media-interaction.dto';
import { UserMediaInteraction } from './entities/user-media-interaction.entity';

@Injectable()
export class UserMediaInteractionsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(
    userId: string,
    createDto: CreateUserMediaInteractionDto,
  ): Promise<UserMediaInteraction> {
    // Validación para los episodios
    this.validateEpisodeData(createDto);

    // Verificar si ya existe una interacción - usar el método detallado
    const existingInteraction = await this.findByUserAndMediaDetails(
      userId,
      createDto.media_id,
      createDto.media_type,
      createDto.season_number,
      createDto.episode_number,
    );

    if (existingInteraction) {
      throw new ConflictException(
        'Ya existe una interacción para este contenido',
      );
    }

    const { data, error }: { data: UserMediaInteraction | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .insert([
          {
            user_id: userId,
            ...createDto,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

    if (error) throw error;
    if (!data) {
      throw new NotFoundException('UserMediaInteraction not found');
    }
    return data;
  }

  private validateEpisodeData(dto: CreateUserMediaInteractionDto): void {
    // Para las películas, no hay temporadas/episodios
    if (dto.media_type === 'movie') {
      if (dto.season_number || dto.episode_number) {
        throw new BadRequestException(
          'Las películas no pueden tener temporadas o episodios',
        );
      }
    }

    // Para las series con episodios, temporada obligatoria
    if (dto.media_type === 'tv' && dto.episode_number && !dto.season_number) {
      throw new BadRequestException(
        'El número de temporada es requerido para los episodios',
      );
    }
  }

  async findByUser(userId: string): Promise<UserMediaInteraction[]> {
    const { data, error }: { data: UserMediaInteraction[] | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findByUserAndMediaDetails(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    seasonNumber?: number,
    episodeNumber?: number,
  ): Promise<UserMediaInteraction | null> {
    let query = this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    // Gestión de las temporadas y episodios
    if (seasonNumber !== undefined) {
      query = query.eq('season_number', seasonNumber);
    } else {
      query = query.is('season_number', null);
    }

    if (episodeNumber !== undefined) {
      query = query.eq('episode_number', episodeNumber);
    } else {
      query = query.is('episode_number', null);
    }

    const { data, error }: { data: UserMediaInteraction | null; error: any } =
      await query.single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  async findByUserAndMedia(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
  ): Promise<UserMediaInteraction | null> {
    return this.findByUserAndMediaDetails(userId, mediaId, mediaType);
  }

  async getEpisodeRatings(
    userId: string,
    mediaId: number,
    seasonNumber?: number,
  ): Promise<UserMediaInteraction[]> {
    let query = this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', 'tv')
      .not('episode_number', 'is', null)
      .not('rating', 'is', null);

    if (seasonNumber) {
      query = query.eq('season_number', seasonNumber);
    }

    const { data, error }: { data: UserMediaInteraction[] | null; error: any } =
      await query
        .order('season_number', { ascending: true })
        .order('episode_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getSeasonRatings(
    userId: string,
    mediaId: number,
  ): Promise<UserMediaInteraction[]> {
    const { data, error }: { data: UserMediaInteraction[] | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', 'tv')
        .not('season_number', 'is', null)
        .is('episode_number', null)
        .not('rating', 'is', null)
        .order('season_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findOne(id: string): Promise<UserMediaInteraction> {
    const { data, error }: { data: UserMediaInteraction | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Interaction with ID ${id} not found`);
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }

    return data;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateUserMediaInteractionDto,
  ): Promise<UserMediaInteraction> {
    const { data, error }: { data: UserMediaInteraction | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .update({
          ...updateDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        throw new NotFoundException(
          `Interaction with ID ${id} not found or access denied`,
        );
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getUserRatings(
    userId: string,
    mediaType?: 'movie' | 'tv',
  ): Promise<UserMediaInteraction[]> {
    let query = this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .select('*')
      .eq('user_id', userId)
      .not('rating', 'is', null);

    if (mediaType) {
      query = query.eq('media_type', mediaType);
    }

    const { data, error }: { data: UserMediaInteraction[] | null; error: any } =
      await query.order('rating', { ascending: false });

    if (error) throw error;
    return (data as UserMediaInteraction[]) || [];
  }

  async getUserComments(userId: string): Promise<UserMediaInteraction[]> {
    const { data, error }: { data: UserMediaInteraction[] | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .select('*')
        .eq('user_id', userId)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  async getMediaRatings(
    mediaId: number,
    mediaType: 'movie' | 'tv',
    seasonNumber?: number,
    episodeNumber?: number,
  ): Promise<(UserMediaInteraction & { username?: string })[]> {
    let query = this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .select(
        `
        *,
        UserProfiles:user_id (
          username
        )
      `,
      )
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .not('rating', 'is', null);

    // Gestión de las temporadas y episodios
    if (seasonNumber !== undefined) {
      query = query.eq('season_number', seasonNumber);
    } else if (mediaType === 'movie') {
      query = query.is('season_number', null).is('episode_number', null);
    }

    if (episodeNumber !== undefined) {
      query = query.eq('episode_number', episodeNumber);
    } else if (seasonNumber === undefined && mediaType === 'tv') {
      query = query.is('season_number', null).is('episode_number', null);
    } else if (seasonNumber !== undefined && episodeNumber === undefined) {
      query = query.is('episode_number', null);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;

    for (const item of data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      item.username = item.UserProfiles?.username || null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete item.UserProfiles;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data || [];
  }

  async getHighRatedMedia(
    minRating: number = 7,
    mediaType?: 'movie' | 'tv',
  ): Promise<UserMediaInteraction[]> {
    let query = this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .select('*')
      .gte('rating', minRating)
      .is('season_number', null)
      .is('episode_number', null)
      .not('rating', 'is', null);

    // Si se solicita un tipo de medio específico
    if (mediaType) {
      query = query.eq('media_type', mediaType);
    }

    const { data, error }: { data: UserMediaInteraction[] | null; error: any } =
      await query.order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRatingsCount(): Promise<{ count: number }> {
    const { count, error } = await this.supabaseService
      .getClient()
      .from('UserMediaInteractions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return { count: count || 0 };
  }
}
