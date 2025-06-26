import { forwardRef, Module } from '@nestjs/common';
import { UserMediaInteractionsService } from './user-media-interactions.service';
import { UserMediaInteractionsController } from './user-media-interactions.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [SupabaseModule, forwardRef(() => MediaModule)],
  controllers: [UserMediaInteractionsController],
  providers: [UserMediaInteractionsService],
  exports: [UserMediaInteractionsService],
})
export class UserMediaInteractionsModule {}
