import { Module } from '@nestjs/common';
import { TmdbController } from './media.controller';
import { TmdbService } from './media.service';

@Module({
  controllers: [TmdbController],
  providers: [TmdbService],
  exports: [TmdbService],
})
export class TmdbModule {}
