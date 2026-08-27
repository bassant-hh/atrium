import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^01[0125][0-9]{8}$/, {
    message:
      'Phone number must be a valid Egyptian mobile number (e.g., 01012345678).',
  })
  phone?: string;
}
