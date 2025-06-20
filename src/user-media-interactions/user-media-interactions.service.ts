import {
  Injectable,
  NotFoundException,
  ConflictException,
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
    // Vérifier si une interaction existe déjà pour ce média
    const existingInteraction = await this.findByUserAndMedia(
      userId,
      createDto.mediaId,
      createDto.mediaType,
    );

    if (existingInteraction) {
      throw new ConflictException('Une interaction existe déjà pour ce média');
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

  async findByUserAndMedia(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
  ): Promise<UserMediaInteraction | null> {
    const { data, error }: { data: UserMediaInteraction | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserMediaInteractions')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        return null; // Aucune interaction trouvée
      }
      throw error;
    }
    return data;
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

    // Ajoutez cette vérification
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
        .eq('user_id', userId) // S'assurer que l'utilisateur ne peut modifier que ses propres interactions
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
}
