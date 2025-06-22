import { PartialType } from '@nestjs/mapped-types';
import { CreateStreamingPlatformDto } from './create-streaming-platform.dto';

export class UpdateStreamingPlatformDto extends PartialType(
  CreateStreamingPlatformDto,
) {}
