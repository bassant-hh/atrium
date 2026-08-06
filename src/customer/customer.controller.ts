import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import {
  CustomerLoginResponseDto,
  CustomerProfileResponseDto,
  CustomerRegisterResponseDto,
} from './dto/customer-auth-response.dto';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';
import { CustomerJwtPayload } from './interfaces/customer-jwt-payload.interface';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterCustomerDto,
  ): Promise<CustomerRegisterResponseDto> {
    return this.customerService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginCustomerDto,
  ): Promise<CustomerLoginResponseDto> {
    return this.customerService.login(dto);
  }

  @Get('profile')
  @UseGuards(CustomerJwtGuard)
  async profile(
    @Req() req: Request & { customer: CustomerJwtPayload },
  ): Promise<CustomerProfileResponseDto> {
    return this.customerService.profile(req.customer._id);
  }
}
