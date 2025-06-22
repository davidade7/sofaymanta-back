import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.findById(createUserDto.id);
      if (existingUser) {
        return existingUser;
      }

      const { data, error }: { data: User | null; error: any } =
        await this.supabaseService
          .getClient()
          .from('Users')
          .insert([
            {
              id: createUserDto.id,
              email: createUserDto.email,
              role: createUserDto.role || 'user',
            },
          ])
          .select()
          .single();

      if (error) {
        this.logger.error('Error creating user:', error);
        throw error;
      }

      if (!data) {
        throw new Error('User not created');
      }

      return data;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const { data, error }: { data: User | null; error: any } =
        await this.supabaseService
          .getClient()
          .from('Users')
          .select('*')
          .eq('id', id)
          .single();

      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error finding user ${id}:`, error);
      return null;
    }
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }
    return user;
  }
}
