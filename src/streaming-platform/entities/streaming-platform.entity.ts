export class StreamingPlatform {
  id: string;
  code: string; // Identifiant unique (ex: 'netflix', 'prime_video') - correspond à vos constantes
  name: string; // Nom affiché (ex: 'Netflix', 'Prime Video') - correspond à vos labels
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
