export class UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  display_name?: string;
  favorite_movie_genres?: number[];
  favorite_tv_genres?: number[];
  streaming_platforms?: string[];
  created_at: string;
  updated_at: string;
}
