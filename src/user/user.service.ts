import { Injectable, ConflictException, Logger } from '@nestjs/common';
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
        this.logger.warn(`User with ID ${createUserDto.id} already exists`);
        throw new ConflictException(
          `Un utilisateur avec l'ID ${createUserDto.id} existe déjà`,
        );
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
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
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

      this.logger.log(`User created successfully: ${data.id}`);
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
}
