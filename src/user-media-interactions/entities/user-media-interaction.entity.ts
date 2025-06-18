export class UserMediaInteraction {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  rating?: number; // Note sur 10 par exemple
  comment?: string;
  created_at: Date;
  updated_at: Date;
}
