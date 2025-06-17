import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post(':userId')
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.userProfileService.createUserProfile(
      userId,
      createUserProfileDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProfileService.getUserProfile(id);
  }
}
