import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private adminSupabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_ANON_KEY')!,
    );

    // Client avec les droits d'administration (service_role)
    this.adminSupabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_KEY')!,
    );
  }

  // Client pour les requêtes côté client (authentification standard)
  getClient() {
    return this.supabase;
  }

  // Client admin avec des privilèges élevés (pour les opérations administratives)
  getAdminClient() {
    return this.adminSupabase;
  }
}
