import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UserMediaInteractionsModule } from '../user-media-interactions/user-media-interactions.module';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  imports: [UserMediaInteractionsModule, UserProfileModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
