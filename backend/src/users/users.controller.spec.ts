import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InMemoryDisk, StorageModule, type StoredUpload } from '@nestjs/storage';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import {
  AVATARS_DISK,
  MAX_AVATAR_SIZE,
} from '../storage/storage.config.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

const USER = { sub: '507f1f77bcf86cd799439011', role: 'user' as const };

function createUsersService() {
  return {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    setPhoto: vi.fn(),
    clearPhoto: vi.fn(),
  };
}

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: ReturnType<typeof createUsersService>;

  beforeEach(async () => {
    usersService = createUsersService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('hands the stored photo key to the service', async () => {
    usersService.setPhoto.mockResolvedValue({
      photoUrl: '/api/media/avatars/new.png',
    });
    const file = { key: 'new.png' } as StoredUpload;

    await expect(controller.updatePhoto(USER, file)).resolves.toEqual({
      photoUrl: '/api/media/avatars/new.png',
    });
    expect(usersService.setPhoto).toHaveBeenCalledWith(USER.sub, 'new.png');
  });

  it('rejects a photo request that carries no file', () => {
    expect(() => controller.updatePhoto(USER, undefined)).toThrow(
      BadRequestException,
    );
    expect(usersService.setPhoto).not.toHaveBeenCalled();
  });

  it('clears the photo through the service', async () => {
    usersService.clearPhoto.mockResolvedValue({ photoUrl: null });

    await expect(controller.removePhoto(USER)).resolves.toEqual({
      photoUrl: null,
    });
    expect(usersService.clearPhoto).toHaveBeenCalledWith(USER.sub);
  });
});

describe('UsersController photo uploads', () => {
  const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
  const avatars = new InMemoryDisk();
  const usersService = createUsersService();
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          default: AVATARS_DISK,
          disks: { [AVATARS_DISK]: avatars },
        }),
      ],
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = USER;
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    avatars.clear();
    usersService.setPhoto.mockReset();
    usersService.setPhoto.mockResolvedValue({ photoUrl: null });
  });

  it('stores a photo and hands its key to the service', async () => {
    await request(app.getHttpServer())
      .patch('/api/users/me/photo')
      .attach('photo', PNG, { filename: 'photo.png', contentType: 'image/png' })
      .expect(200);

    const [key] = avatars.keys();
    expect(key).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(usersService.setPhoto).toHaveBeenCalledWith(USER.sub, key);
    expect(await avatars.getBuffer(key)).toEqual(PNG);
  });

  it('refuses a file whose bytes are no allowed image, writing nothing', async () => {
    await request(app.getHttpServer())
      .patch('/api/users/me/photo')
      .attach('photo', Buffer.from('<html><body>not an image</body></html>'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
      .expect(415);

    expect(avatars.keys()).toEqual([]);
    expect(usersService.setPhoto).not.toHaveBeenCalled();
  });

  it('refuses a file over 5 MiB, writing nothing', async () => {
    const oversized = Buffer.alloc(MAX_AVATAR_SIZE + 1);
    PNG.copy(oversized);

    await request(app.getHttpServer())
      .patch('/api/users/me/photo')
      .attach('photo', oversized, {
        filename: 'huge.png',
        contentType: 'image/png',
      })
      .expect(413);

    expect(avatars.keys()).toEqual([]);
    expect(usersService.setPhoto).not.toHaveBeenCalled();
  });

  it('answers 404 when there is no photo to delete', async () => {
    usersService.clearPhoto.mockRejectedValue(
      new NotFoundException('No profile photo'),
    );

    await request(app.getHttpServer()).delete('/api/users/me/photo').expect(404);
  });
});
