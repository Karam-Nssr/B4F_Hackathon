import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { StoredUpload } from '@nestjs/storage';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { Roles } from '../common/auth/roles.decorator.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { avatarUploadOptions, PHOTO_FIELD } from '../storage/storage.config.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, updateProfileDto);
  }

  @Patch('me/photo')
  @UseInterceptors(FileInterceptor(PHOTO_FIELD, avatarUploadOptions()))
  updatePhoto(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: StoredUpload,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Attach the profile photo as the "photo" field',
      );
    }
    return this.usersService.setPhoto(user.sub, file.key);
  }

  @Delete('me/photo')
  removePhoto(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.clearPhoto(user.sub);
  }
}
