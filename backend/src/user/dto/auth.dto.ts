import {
  IsString,
  MinLength,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MinLength(5)
  @IsOptional()
  email: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  username: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @MinLength(5)
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  university: string;

  @IsString()
  @IsIn(['ADMIN', 'CLIENT', 'DELIVERY'])
  role: 'ADMIN' | 'CLIENT' | 'DELIVERY';

  @IsString()
  @IsNotEmpty()
  idFront: string;

  @IsString()
  @IsNotEmpty()
  idBack: string;

  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
