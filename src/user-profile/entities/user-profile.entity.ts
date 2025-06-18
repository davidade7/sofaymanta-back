export class UserProfile {
  id: string;
  username?: string;
  created_at: Date;
  updated_at: Date;
  favorite_movie_genres?: number[];
  favorite_tv_genres?: number[];
  streaming_platforms?: string[];

  // Vous pouvez ajouter des méthodes utilitaires ici
  get displayName(): string {
    return this.username || 'Anonymous User';
  }
}
