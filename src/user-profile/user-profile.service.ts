import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private supabaseService: SupabaseService) {}

  async createFromWebhook(id: string, email: string): Promise<UserProfile> {
    try {
      // Verificar si el perfil ya existe
      const existingProfile = await this.getUserProfile(id);
      if (existingProfile) {
        return existingProfile;
      }

      const { data, error }: { data: UserProfile | null; error: any } =
        await this.supabaseService
          .getClient()
          .from('UserProfiles')
          .insert([
            {
              id,
              email,
              role: 'user',
            },
          ])
          .select()
          .single();

      if (error) {
        this.logger.error('Error creating user profile:', error);
        throw error;
      }

      if (!data) {
        throw new Error('User profile not created');
      }

      return data;
    } catch (error) {
      this.logger.error('Failed to create user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error }: { data: UserProfile | null; error: any } =
        await this.supabaseService
          .getClient()
          .from('UserProfiles')
          .select('*')
          .eq('id', userId)
          .single();

      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error finding user profile ${userId}:`, error);
      return null;
    }
  }

  async getUserProfileOrThrow(userId: string): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new NotFoundException(
        `Perfil de usuario con ID ${userId} no encontrado`,
      );
    }
    return profile;
  }

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const { data, error }: { data: UserProfile | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserProfiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
      this.logger.error('Error updating profile:', error);
      throw error;
    }

    if (!data) {
      throw new NotFoundException(
        `Perfil de usuario con ID ${userId} no encontrado`,
      );
    }

    return data;
  }

  async addFavoriteGenre(
    userId: string,
    genreId: number,
    mediaType: 'movie' | 'tv',
  ): Promise<void> {
    const profile = await this.getUserProfileOrThrow(userId);

    const genreField =
      mediaType === 'movie' ? 'favorite_movie_genres' : 'favorite_tv_genres';
    const currentGenres = profile[genreField] || [];

    // Agregar el género si no existe ya
    if (!currentGenres.includes(genreId)) {
      const updatedGenres = [...currentGenres, genreId];
      await this.updateUserProfile(userId, { [genreField]: updatedGenres });
    }
  }

  async removeFavoriteGenre(
    userId: string,
    genreId: number,
    mediaType: 'movie' | 'tv',
  ): Promise<void> {
    const profile = await this.getUserProfileOrThrow(userId);

    const genreField =
      mediaType === 'movie' ? 'favorite_movie_genres' : 'favorite_tv_genres';
    const currentGenres = profile[genreField] || [];

    const updatedGenres = currentGenres.filter((id) => id !== genreId);
    await this.updateUserProfile(userId, { [genreField]: updatedGenres });
  }

  async addStreamingPlatform(userId: string, platform: string): Promise<void> {
    const profile = await this.getUserProfileOrThrow(userId);
    const currentPlatforms = profile.streaming_platforms || [];

    if (!currentPlatforms.includes(platform)) {
      const updatedPlatforms = [...currentPlatforms, platform];
      await this.updateUserProfile(userId, {
        streaming_platforms: updatedPlatforms,
      });
    }
  }

  async removeStreamingPlatform(
    userId: string,
    platform: string,
  ): Promise<void> {
    const profile = await this.getUserProfileOrThrow(userId);
    const currentPlatforms = profile.streaming_platforms || [];

    const updatedPlatforms = currentPlatforms.filter((p) => p !== platform);
    await this.updateUserProfile(userId, {
      streaming_platforms: updatedPlatforms,
    });
  }

  async getFavoriteGenres(userId: string): Promise<{
    movie_genres: number[];
    tv_genres: number[];
  }> {
    const profile = await this.getUserProfileOrThrow(userId);

    return {
      movie_genres: profile.favorite_movie_genres || [],
      tv_genres: profile.favorite_tv_genres || [],
    };
  }

  async getUserStreamingPlatforms(userId: string): Promise<string[]> {
    const profile = await this.getUserProfileOrThrow(userId);
    return profile.streaming_platforms || [];
  }

  async deleteUserAccount(
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Verificar si el usuario existe usando el método existente
      const userProfile = await this.getUserProfileOrThrow(userId);

      // 2. Verificar directamente el rol desde la tabla UserProfiles
      if (userProfile.role !== 'user') {
        throw new ForbiddenException(
          'Solo los usuarios con el rol "user" pueden eliminar su cuenta',
        );
      }

      // 3. Anonimizar los datos del perfil usando el método updateUserProfile existente
      const anonymousUsername = `deleted_user_${Date.now().toString(36)}`;
      await this.updateUserProfile(userId, {
        username: anonymousUsername,
        email: '',
        role: 'deleted',
      });

      // 4. Eliminar el usuario de la autenticación
      const { error: deleteAuthError }: { error: any } =
        await this.supabaseService
          .getAdminClient()
          .auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        throw new Error(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Error al eliminar la autenticación: ${deleteAuthError.message}`,
        );
      }

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error al eliminar la cuenta del usuario ${userId}:`,
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error desconocido al eliminar la cuenta',
      };
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error }: { data: UserProfile[] | null; error: any } =
        await this.supabaseService
          .getClient()
          .from('UserProfiles')
          .select('id, created_at, updated_at, email, username, role')
          .eq('role', 'user')
          .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Failed to fetch users:', error);
      throw error;
    }
  }
}
