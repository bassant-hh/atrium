import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../order/enums/payment-method.enum';

export class CreateCustomerOrderDto {
  @IsNotEmpty()
  @IsString()
  pickup: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsOptional()
  pickupLocationDetails?: {
    type: string;
    address: Record<string, any>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };

  @IsOptional()
  destinationLocationDetails?: {
    type: string;
    address: Record<string, any>;
    coordinates: { latitude: number; longitude: number };
    formattedAddress: string;
  };

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
