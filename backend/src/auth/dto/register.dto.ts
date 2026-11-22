import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { USER_ROLES, type UserRole } from '../../users/schemas/user.schema.js';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @ValidateIf((register) => !register.role || register.role === 'user')
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  phone?: string;

  @ValidateIf((register) => !register.role || register.role === 'user')
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  nationalId?: string;
}
