import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../order/enums/payment-method.enum';
import { LocationDetailsDto } from '../../order/dto/create-order.dto';

export class CreateCustomerOrderDto {
  @IsNotEmpty()
  @IsString()
  pickup: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  pickupLocationDetails?: LocationDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  destinationLocationDetails?: LocationDetailsDto;

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
