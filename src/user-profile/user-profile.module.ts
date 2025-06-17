import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
