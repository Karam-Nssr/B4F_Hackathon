import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { getDiskToken } from '@nestjs/storage';
import { AVATARS_DISK } from '../storage/storage.config.js';
import { User } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';

const USER_ID = '507f1f77bcf86cd799439011';

/** A `.select(...).lean().exec()` query resolving to `value`. */
const leanSelect = <T>(value: T) => ({
  select: vi.fn(() => ({
    lean: () => ({ exec: vi.fn().mockResolvedValue(value) }),
  })),
});

function createUserModel() {
  return {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  };
}

function createAvatarsDisk() {
  return { delete: vi.fn().mockResolvedValue(undefined) };
}

describe('UsersService', () => {
  let service: UsersService;
  let userModel: ReturnType<typeof createUserModel>;
  let avatars: ReturnType<typeof createAvatarsDisk>;

  beforeEach(async () => {
    userModel = createUserModel();
    avatars = createAvatarsDisk();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getDiskToken(AVATARS_DISK), useValue: avatars },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('asks for the profile without its password hash', async () => {
    const query = leanSelect({ _id: USER_ID, photoKey: 'photo.png' });
    userModel.findById.mockReturnValue(query);

    await service.getProfile(USER_ID);

    expect(query.select).toHaveBeenCalledWith('-passwordHash');
  });

  it('returns the photo URL of an existing photo', async () => {
    userModel.findById.mockReturnValue(
      leanSelect({ _id: USER_ID, fullName: 'Buyer', photoKey: 'photo.png' }),
    );

    const profile = await service.getProfile(USER_ID);

    expect(profile.photoUrl).toBe('/api/media/avatars/photo.png');
  });

  it('returns a null photo URL when the user has no photo', async () => {
    userModel.findById.mockReturnValue(
      leanSelect({ _id: USER_ID, fullName: 'Buyer' }),
    );

    const profile = await service.getProfile(USER_ID);

    expect(profile.photoUrl).toBeNull();
  });

  it('adds the photo URL to a profile update', async () => {
    userModel.findByIdAndUpdate.mockReturnValue(
      leanSelect({
        _id: USER_ID,
        fullName: 'New Name',
        photoKey: 'photo.png',
      }),
    );

    const profile = await service.updateProfile(USER_ID, {
      fullName: 'New Name',
    });

    expect(profile.photoUrl).toBe('/api/media/avatars/photo.png');
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('replaces the photo and deletes the previous file', async () => {
    userModel.findById.mockReturnValue(
      leanSelect({ _id: USER_ID, photoKey: 'old.png' }),
    );
    userModel.findByIdAndUpdate.mockReturnValue(
      leanSelect({ _id: USER_ID, photoKey: 'new.png' }),
    );

    const profile = await service.setPhoto(USER_ID, 'new.png');

    expect(avatars.delete).toHaveBeenCalledWith('old.png');
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      USER_ID,
      { $set: { photoKey: 'new.png' } },
      { returnDocument: 'after' },
    );
    expect(profile.photoUrl).toBe('/api/media/avatars/new.png');
  });

  it('stores a first photo without deleting anything', async () => {
    userModel.findById.mockReturnValue(leanSelect({ _id: USER_ID }));
    userModel.findByIdAndUpdate.mockReturnValue(
      leanSelect({ _id: USER_ID, photoKey: 'first.png' }),
    );

    await service.setPhoto(USER_ID, 'first.png');

    expect(avatars.delete).not.toHaveBeenCalled();
  });

  it('still records the new photo when the old file cannot be deleted', async () => {
    avatars.delete.mockRejectedValueOnce(new Error('disk unavailable'));
    userModel.findById.mockReturnValue(
      leanSelect({ _id: USER_ID, photoKey: 'old.png' }),
    );
    userModel.findByIdAndUpdate.mockReturnValue(
      leanSelect({ _id: USER_ID, photoKey: 'new.png' }),
    );

    const profile = await service.setPhoto(USER_ID, 'new.png');

    expect(profile.photoUrl).toBe('/api/media/avatars/new.png');
  });

  it('stores no photo for a user that does not exist', async () => {
    userModel.findById.mockReturnValue(leanSelect(null));

    await expect(service.setPhoto(USER_ID, 'new.png')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(avatars.delete).not.toHaveBeenCalled();
  });

  it('clearing the photo drops the key and the file', async () => {
    userModel.findById.mockReturnValue(
      leanSelect({ _id: USER_ID, photoKey: 'old.png' }),
    );
    userModel.findByIdAndUpdate.mockReturnValue(leanSelect({ _id: USER_ID }));

    const profile = await service.clearPhoto(USER_ID);

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      USER_ID,
      { $unset: { photoKey: 1 } },
      { returnDocument: 'after' },
    );
    expect(avatars.delete).toHaveBeenCalledWith('old.png');
    expect(profile.photoUrl).toBeNull();
  });

  it('clearing a photo the user does not have is a 404', async () => {
    userModel.findById.mockReturnValue(leanSelect({ _id: USER_ID }));

    await expect(service.clearPhoto(USER_ID)).rejects.toThrow(
      'No profile photo',
    );
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(avatars.delete).not.toHaveBeenCalled();
  });
});
