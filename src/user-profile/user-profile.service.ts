import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(private supabaseService: SupabaseService) {}

  async getUserProfile(userId: string) {
    const { data, error }: { data: UserProfile | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserProfiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
  }

  async createUserProfile(userId: string, profileData) {
    const { data, error }: { data: UserProfile | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('UserProfiles')
        .insert([{ id: userId, ...profileData }])
        .select()
        .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updateData: UpdateUserProfileDto) {
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
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  }

  async addFavoriteGenre(
    userId: string,
    genreId: number,
    mediaType: 'movie' | 'tv',
  ) {
    // Récupérer le profil actuel
    const profile = await this.getUserProfile(userId);

    if (!profile) {
      throw new Error('User profile not found');
    }

    const genreField =
      mediaType === 'movie' ? 'favorite_movie_genres' : 'favorite_tv_genres';
    const currentGenres = profile[genreField] || [];

    // Ajouter le genre s'il n'existe pas déjà
    if (!currentGenres.includes(genreId)) {
      const updatedGenres = [...currentGenres, genreId];

      await this.updateUserProfile(userId, {
        [genreField]: updatedGenres,
      });
    }
  }

  async removeFavoriteGenre(
    userId: string,
    genreId: number,
    mediaType: 'movie' | 'tv',
  ) {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const genreField =
      mediaType === 'movie' ? 'favorite_movie_genres' : 'favorite_tv_genres';
    const currentGenres = profile[genreField] || [];

    const updatedGenres = currentGenres.filter((id) => id !== genreId);

    await this.updateUserProfile(userId, {
      [genreField]: updatedGenres,
    });
  }

  async addStreamingPlatform(userId: string, platform: string) {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }
    const currentPlatforms = profile.streaming_platforms || [];

    if (!currentPlatforms.includes(platform)) {
      const updatedPlatforms = [...currentPlatforms, platform];

      await this.updateUserProfile(userId, {
        streaming_platforms: updatedPlatforms,
      });
    }
  }

  async removeStreamingPlatform(userId: string, platform: string) {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }
    const currentPlatforms = profile.streaming_platforms || [];

    const updatedPlatforms = currentPlatforms.filter((p) => p !== platform);

    await this.updateUserProfile(userId, {
      streaming_platforms: updatedPlatforms,
    });
  }
}
