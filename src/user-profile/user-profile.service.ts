import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private supabaseService: SupabaseService) {}

  async createFromWebhook(id: string, email: string): Promise<UserProfile> {
    try {
      // Vérifier si le profil existe déjà
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
              is_public: true,
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
        `Profil utilisateur avec l'ID ${userId} introuvable`,
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
        `Profil utilisateur avec l'ID ${userId} introuvable`,
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

    // Ajouter le genre s'il n'existe pas déjà
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
}
