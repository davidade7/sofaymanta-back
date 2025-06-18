import { Module } from '@nestjs/common';
import { UserMediaInteractionsService } from './user-media-interactions.service';
import { UserMediaInteractionsController } from './user-media-interactions.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [UserMediaInteractionsController],
  providers: [UserMediaInteractionsService],
  exports: [UserMediaInteractionsService],
})
export class UserMediaInteractionsModule {}
