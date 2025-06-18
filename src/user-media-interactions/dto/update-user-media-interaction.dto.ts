import { PartialType } from '@nestjs/mapped-types';
import { CreateUserMediaInteractionDto } from './create-user-media-interaction.dto';

export class UpdateUserMediaInteractionDto extends PartialType(
  CreateUserMediaInteractionDto,
) {}
