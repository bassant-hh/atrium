import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
  amount?: number;
}
