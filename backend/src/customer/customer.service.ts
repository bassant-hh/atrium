import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Customer, CustomerDocument } from './customer.schema';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import {
  CustomerLoginResponseDto,
  CustomerProfileResponseDto,
  CustomerRegisterResponseDto,
  CustomerUserDto,
} from './dto/customer-auth-response.dto';
import { CustomerJwtPayload } from './interfaces/customer-jwt-payload.interface';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly configService: ConfigService,
  ) {}

  private generateCustomerToken(customer: {
    _id: { toString(): string } | string;
    email: string;
  }): string {
    const secret =
      this.configService.get<string>('JWT_SECRET') ?? 'somesecretkey';
    const payload: CustomerJwtPayload = {
      _id: customer._id.toString(),
      email: customer.email,
      type: 'CUSTOMER',
    };
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  private mapCustomerUser(customer: {
    _id: { toString(): string } | string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): CustomerUserDto {
    return {
      id: customer._id.toString(),
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    };
  }

  async register(
    dto: RegisterCustomerDto,
  ): Promise<CustomerRegisterResponseDto> {
    const existingEmail = await this.customerModel
      .findOne({ email: dto.email })
      .lean()
      .exec();

    if (existingEmail) {
      throw new ConflictException('Email address is already in use.');
    }

    const existingPhone = await this.customerModel
      .findOne({ phone: dto.phone })
      .lean()
      .exec();

    if (existingPhone) {
      throw new ConflictException('Phone number is already in use.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdCustomer = await this.customerModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
    });

    const token = this.generateCustomerToken(createdCustomer);

    return {
      token,
      customer: this.mapCustomerUser(createdCustomer),
    };
  }

  async login(dto: LoginCustomerDto): Promise<CustomerLoginResponseDto> {
    const customer = await this.customerModel
      .findOne({ email: dto.email })
      .exec();

    if (!customer) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, customer.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateCustomerToken(customer);

    return {
      token,
      customer: this.mapCustomerUser(customer),
    };
  }

  async profile(customerId: string): Promise<CustomerProfileResponseDto> {
    const customer = await this.customerModel
      .findById(customerId)
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }

    return {
      ...this.mapCustomerUser(customer),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async updateProfile(
    customerId: string,
    dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileResponseDto> {
    const customer = await this.customerModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer profile not found.');
    }

    const updates: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
    }> = {};

    if (dto.firstName !== undefined) {
      const trimmed = dto.firstName.trim();
      if (!trimmed) {
        throw new BadRequestException('First name cannot be empty.');
      }
      updates.firstName = trimmed;
    }

    if (dto.lastName !== undefined) {
      const trimmed = dto.lastName.trim();
      if (!trimmed) {
        throw new BadRequestException('Last name cannot be empty.');
      }
      updates.lastName = trimmed;
    }

    if (dto.phone !== undefined) {
      const trimmed = dto.phone.trim();
      if (!trimmed) {
        throw new BadRequestException('Phone number cannot be empty.');
      }
      if (trimmed !== customer.phone) {
        const phoneExists = await this.customerModel
          .findOne({ phone: trimmed, _id: { $ne: customerId } })
          .lean()
          .exec();
        if (phoneExists) {
          throw new ConflictException(
            'Phone number is already in use by another account.',
          );
        }
        updates.phone = trimmed;
      }
    }

    if (Object.keys(updates).length > 0) {
      Object.assign(customer, updates);
      await customer.save();
    }

    return {
      ...this.mapCustomerUser(customer),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
