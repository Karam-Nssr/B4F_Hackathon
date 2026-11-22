import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  nationalId?: string;
}
