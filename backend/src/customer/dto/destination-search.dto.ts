import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DestinationSearchQueryDto {
  @IsString()
  @MinLength(2, { message: 'Search query must be at least 2 characters long.' })
  @MaxLength(100, { message: 'Search query cannot exceed 100 characters.' })
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number.' })
  @Min(-90, { message: 'Latitude must be >= -90.' })
  @Max(90, { message: 'Latitude must be <= 90.' })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number.' })
  @Min(-180, { message: 'Longitude must be >= -180.' })
  @Max(180, { message: 'Longitude must be <= 180.' })
  longitude?: number;
}

export class DestinationFieldsDto {
  university: string;
  faculty: string;
  deliveryPoint: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  officeName: string;
  landmark: string;
}

export class DestinationCoordsDto {
  latitude: number;
  longitude: number;
}

export class DestinationResultDto {
  id: string;
  name: string;
  displayTitle: string;
  displaySub: string;
  category: string;
  type: string;
  fields: DestinationFieldsDto;
  coords: DestinationCoordsDto;
  address: string;
  fullAddress: string;
}
