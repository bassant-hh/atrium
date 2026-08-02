import { IsString,MinLength,IsOptional,IsEmail,IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @MinLength(5)
    @IsOptional()
    email:string;
    
    @IsString()
    @MinLength(3)
    @IsOptional()
    username:string;
    
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    fullname:string;
    
    @IsEmail()
    @MinLength(5)
    @IsNotEmpty()
    email:string;
    
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    username: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
    
    @IsString()
    role: "ADMIN" | "CLIENT" | "DELIVERY";
    
    @IsString()
    @IsOptional()
    idCard?: string;
}