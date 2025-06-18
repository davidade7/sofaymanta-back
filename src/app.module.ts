import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './media/media.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UserMediaInteractionsModule } from './user-media-interactions/user-media-interactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    MediaModule,
    UserProfileModule,
    UserMediaInteractionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
