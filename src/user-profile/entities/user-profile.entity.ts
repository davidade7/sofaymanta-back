export class UserProfile {
  id: string;
  username?: string;
  created_at: Date;
  updated_at: Date;

  // Vous pouvez ajouter des méthodes utilitaires ici
  get displayName(): string {
    return this.username || 'Utilisateur anonyme';
  }
}
