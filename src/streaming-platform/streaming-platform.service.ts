import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStreamingPlatformDto } from './dto/create-streaming-platform.dto';
import { UpdateStreamingPlatformDto } from './dto/update-streaming-platform.dto';
import type { StreamingPlatform } from './entities/streaming-platform.entity';

@Injectable()
export class StreamingPlatformsService {
  constructor(private supabaseService: SupabaseService) { }

  async create(
    createDto: CreateStreamingPlatformDto,
  ): Promise<StreamingPlatform> {
    // Verificar si el código ya existe
    const existing = await this.findByCode(createDto.code);
    if (existing) {
      throw new ConflictException(
        `Una plataforma con el código '${createDto.code}' ya existe`,
      );
    }

    const { data, error }: { data: StreamingPlatform | null; error: any } =
      await this.supabaseService
        .getAdminClient()
        .from('StreamingPlatforms')
        .insert([
          {
            ...createDto,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('No se pudo crear la plataforma de streaming');
    return data;
  }

  async findAll(activeOnly: boolean = false): Promise<StreamingPlatform[]> {
    let query = this.supabaseService
      .getClient()
      .from('StreamingPlatforms')
      .select('*');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error }: { data: StreamingPlatform[] | null; error: any } =
      await query.order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findOne(id: string): Promise<StreamingPlatform> {
    const { data, error }: { data: StreamingPlatform | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('StreamingPlatforms')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        throw new NotFoundException(
          `Plataforma de streaming con ID ${id} no encontrada`,
        );
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundException(`Plataforma de streaming con ID ${id} no encontrada`);
    }

    return data;
  }

  async findByCode(code: string): Promise<StreamingPlatform | null> {
    const { data, error }: { data: StreamingPlatform | null; error: any } =
      await this.supabaseService
        .getClient()
        .from('StreamingPlatforms')
        .select('*')
        .eq('code', code)
        .single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  async update(
    id: string,
    updateDto: UpdateStreamingPlatformDto,
  ): Promise<StreamingPlatform> {
    // Si cambiamos el código, verificar que no exista ya
    if (updateDto.code) {
      const existing = await this.findByCode(updateDto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Una plataforma con el código '${updateDto.code}' ya existe`,
        );
      }
    }

    const { data, error }: { data: StreamingPlatform | null; error: any } =
      await this.supabaseService
        .getAdminClient()
        .from('StreamingPlatforms')
        .update({
          ...updateDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'PGRST116') {
        throw new NotFoundException(
          `Plataforma de streaming con ID ${id} no encontrada`,
        );
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundException(`Plataforma de streaming con ID ${id} no encontrada`);
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('StreamingPlatforms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async toggleActive(id: string): Promise<StreamingPlatform> {
    const platform = await this.findOne(id);
    return this.update(id, { is_active: !platform.is_active });
  }
}
