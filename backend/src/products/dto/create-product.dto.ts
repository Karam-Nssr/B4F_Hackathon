import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  description!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  category!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  priceSyp!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  imageUrl!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
