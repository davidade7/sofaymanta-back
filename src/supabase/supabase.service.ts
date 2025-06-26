// filepath: c:\Users\Usuario\Documents\David\Code\sofaymanta-backend\src\supabase\supabase.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private adminSupabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error(
        'Variables de entorno de Supabase faltantes. Verifica tu archivo .env',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Cliente para las consultas del lado del cliente (autenticación estándar)
  getClient() {
    return this.supabase;
  }

  // Cliente admin con privilegios elevados (para operaciones administrativas)
  getAdminClient() {
    return this.adminSupabase;
  }
}
