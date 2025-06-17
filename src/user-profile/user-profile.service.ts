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
}
