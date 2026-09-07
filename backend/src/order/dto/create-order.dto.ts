import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class LocationCoordinatesDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class LocationDetailsDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  address?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationCoordinatesDto)
  coordinates?: LocationCoordinatesDto;

  @IsOptional()
  @IsString()
  formattedAddress?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  pickup: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  pickupLocationDetails?: LocationDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  destinationLocationDetails?: LocationDetailsDto;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
