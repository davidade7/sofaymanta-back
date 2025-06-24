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
    // Validation pour les épisodes
    this.validateEpisodeData(createDto);

    // Vérifier si une interaction existe déjà - utiliser la méthode détaillée
    const existingInteraction = await this.findByUserAndMediaDetails(
      userId,
      createDto.media_id,
      createDto.media_type,
      createDto.season_number,
      createDto.episode_number,
    );

    if (existingInteraction) {
      throw new ConflictException(
        'Une interaction existe déjà pour ce contenu',
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
    // Pour les films, pas de saison/épisode
    if (dto.media_type === 'movie') {
      if (dto.season_number || dto.episode_number) {
        throw new BadRequestException(
          "Les films ne peuvent pas avoir de saisons ou d'épisodes",
        );
      }
    }

    // Pour les séries avec épisodes, saison obligatoire
    if (dto.media_type === 'tv' && dto.episode_number && !dto.season_number) {
      throw new BadRequestException(
        'Le numéro de saison est requis pour les épisodes',
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

    // Gestion des saisons et épisodes
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

  // Méthodes utilitaires
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

    // Gestion des saisons et épisodes
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
}
