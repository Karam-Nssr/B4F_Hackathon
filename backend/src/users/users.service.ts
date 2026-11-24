import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDisk, type StorageDisk } from '@nestjs/storage';
import { Model } from 'mongoose';
import { AVATARS_DISK, avatarPublicUrl } from '../storage/storage.config.js';
import { User } from './schemas/user.schema.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectDisk(AVATARS_DISK) private readonly avatars: StorageDisk,
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
    return this.toProfile(user);
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
      return this.toProfile(user);
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

  /** Makes `photoKey` the user's photo and drops the file behind the previous key. */
  async setPhoto(userId: string, photoKey: string) {
    const previous = await this.userModel
      .findById(userId)
      .select('photoKey')
      .lean()
      .exec();
    if (!previous) {
      throw new NotFoundException('User not found');
    }
    if (previous.photoKey && previous.photoKey !== photoKey) {
      await this.deletePhotoFile(previous.photoKey);
    }
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { photoKey } },
        { returnDocument: 'after' },
      )
      .select('-passwordHash')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toProfile(user);
  }

  /** Forgets the photo — 404 when there is none — and drops the file behind it. */
  async clearPhoto(userId: string) {
    const current = await this.userModel
      .findById(userId)
      .select('photoKey')
      .lean()
      .exec();
    if (!current) {
      throw new NotFoundException('User not found');
    }
    if (!current.photoKey) {
      throw new NotFoundException('No profile photo');
    }
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $unset: { photoKey: 1 } },
        { returnDocument: 'after' },
      )
      .select('-passwordHash')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.deletePhotoFile(current.photoKey);
    return this.toProfile(user);
  }

  /** The profile clients see: never the password hash, always a `photoUrl` (or `null`). */
  private toProfile<T extends { photoKey?: string | null }>(
    user: T,
  ): T & { photoUrl: string | null } {
    return {
      ...user,
      photoUrl: user.photoKey ? avatarPublicUrl(user.photoKey) : null,
    };
  }

  /**
   * Best effort: the file is garbage either way, so a disk that refuses the delete
   * (or is already empty) must not fail the request that replaced or cleared it.
   */
  private async deletePhotoFile(key: string): Promise<void> {
    try {
      await this.avatars.delete(key);
    } catch {
      // Nothing to do: the key is being dropped from the profile regardless.
    }
  }
}
