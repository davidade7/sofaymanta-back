export class StreamingPlatform {
  id: string;
  code: string; // Identificador único (ej: 'netflix', 'prime_video') - corresponde a tus constantes
  name: string; // Nombre mostrado (ej: 'Netflix', 'Prime Video') - corresponde a tus etiquetas
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
