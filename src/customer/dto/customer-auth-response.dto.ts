export class CustomerUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export class CustomerRegisterResponseDto {
  token: string;
  customer: CustomerUserDto;
}

export class CustomerLoginResponseDto {
  token: string;
  customer: CustomerUserDto;
}

export class CustomerProfileResponseDto extends CustomerUserDto {
  createdAt?: Date;
  updatedAt?: Date;
}
