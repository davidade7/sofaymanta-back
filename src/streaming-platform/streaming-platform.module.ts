import { Module } from '@nestjs/common';
import { StreamingPlatformsService } from './streaming-platform.service';
import { StreamingPlatformsController } from './streaming-platform.controller';

@Module({
  controllers: [StreamingPlatformsController],
  providers: [StreamingPlatformsService],
  exports: [StreamingPlatformsService],
})
export class StreamingPlatformsModule {}
