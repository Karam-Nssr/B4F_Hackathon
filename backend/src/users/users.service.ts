import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updates: UpdateProfileDto) {
    if (!Object.keys(updates).length) {
      throw new BadRequestException('At least one profile field is required');
    }
    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $set: updates },
          {
            returnDocument: 'after',
            runValidators: true,
          },
        )
        .select('-passwordHash')
        .lean()
        .exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      // MongoDB duplicate-key (code 11000) on the unique `email` index.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: unknown }).code === 11000
      ) {
        throw new ConflictException('This email is already in use');
      }
      throw error;
    }
  }
}
