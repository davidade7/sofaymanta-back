import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProfileService.getUserProfile(id);
  }

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

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateUserProfile(id, updateUserProfileDto);
  }
}
