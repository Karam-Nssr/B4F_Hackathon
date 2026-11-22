import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/schemas/user.schema.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not allow public admin registration', async () => {
    await expect(
      service.register({
        fullName: 'Platform Admin',
        email: 'admin@example.com',
        password: 'strong-password',
        role: 'admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects passwords that exceed bcrypt byte limits', async () => {
    await expect(
      service.register({
        fullName: 'Buyer',
        email: 'buyer@example.com',
        password: 'é'.repeat(40),
        phone: '0912345678',
        nationalId: '123456789',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
