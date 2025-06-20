export class UserMediaInteraction {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  season_number?: number;
  episode_number?: number;
  rating?: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}
