import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, type UserDocument } from '../users/schemas/user.schema.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const role = registerDto.role ?? 'user';
    if (role === 'admin') {
      throw new ForbiddenException(
        'Admin accounts cannot be registered publicly',
      );
    }
    if (Buffer.byteLength(registerDto.password, 'utf8') > 72) {
      throw new BadRequestException("Password exceeds bcrypt's 72-byte limit");
    }

    const email = registerDto.email.toLowerCase();
    if (await this.userModel.exists({ email })) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    let user: UserDocument;
    try {
      user = await this.userModel.create({
        fullName: registerDto.fullName,
        email,
        passwordHash,
        role,
        phone: registerDto.phone,
        nationalId: registerDto.nationalId,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('Email is already registered', {
          cause: error,
        });
      }
      throw error;
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
      role: user.role,
    });

    return {
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    if (Buffer.byteLength(loginDto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const user = await this.userModel
      .findOne({ email: loginDto.email.toLowerCase() })
      .select('+passwordHash')
      .exec();
    if (
      !user ||
      !(await bcrypt.compare(loginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: user._id.toString(),
        role: user.role,
      }),
      user: this.toSafeUser(user),
    };
  }

  private toSafeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      nationalId: user.nationalId,
      createdAt: user.createdAt,
    };
  }
}
