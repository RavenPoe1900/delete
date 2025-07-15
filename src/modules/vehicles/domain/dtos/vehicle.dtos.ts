import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Vehicle, VehicleStatus, VehicleType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

type VehicleWithoutId = Omit<
  Vehicle,
  | 'id'
  | 'password'
  | 'role'
  | 'averageRatingAsShipper'
  | 'totalRatingsAsShipper'
  | 'averageRatingAsCarrier'
  | 'totalRatingsAsCarrier'
  | 'createdAt'
  | 'updatedAt'
>;

export class VehicleDto implements VehicleWithoutId {
  @ApiProperty({
    description: 'ID of the carrier (user) associated with the vehicle',
    example: 1,
  })
  @IsNotEmpty({ message: 'Carrier ID is required' })
  @IsInt({ message: 'Carrier ID must be an integer' })
  carrierId: number;

  @ApiProperty({
    description: 'License plate of the vehicle',
    example: 'ABC-123',
    minLength: 3,
    maxLength: 15,
  })
  @IsNotEmpty({ message: 'Plate is required' })
  @IsString({ message: 'Plate must be a string' })
  @Length(3, 15, { message: 'Plate must be between 3 and 15 characters long' })
  plate: string;

  @ApiProperty({
    enum: VehicleType,
    description: 'Type of the vehicle',
    example: VehicleType.TRUCK,
  })
  @IsNotEmpty({ message: 'Vehicle type is required' })
  @IsEnum(VehicleType, { message: 'Invalid vehicle type' })
  type: VehicleType;

  @ApiProperty({
    description: 'Make of the vehicle',
    example: 'Ford',
    required: false,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Make must be a string' })
  @Length(1, 30, { message: 'Make must be between 1 and 30 characters long' })
  make: string;

  @ApiProperty({
    description: 'Model of the vehicle',
    example: 'F-150',
    required: false,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Model must be a string' })
  @Length(1, 30, { message: 'Model must be between 1 and 30 characters long' })
  model: string;

  @ApiProperty({
    description: 'Year of the vehicle',
    example: 2020,
    required: false,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt({ message: 'Year must be an integer' })
  @Min(1900, { message: 'Year must be at least 1900' })
  @Max(2100, { message: 'Year cannot be greater than 2100' })
  year: number;

  @ApiProperty({
    description: 'Color of the vehicle',
    example: 'Red',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  @Length(1, 20, { message: 'Color must be between 1 and 20 characters long' })
  color: string;

  @ApiProperty({
    description: 'Capacity of the vehicle in kilograms',
    example: 1000.5,
    required: false,
    type: 'number',
    format: 'float',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Decimal) // Importante para transformar el string/number de entrada a Decimal
  // No se usa @IsNumber ni @IsDecimal directamente con Decimal,
  // la validación de rango y precisión se haría manualmente o con un custom validator si es necesario.
  // Para Class Validator, si el input es un string que representa un número,
  // @Type(() => Decimal) lo convertirá. Si es un number, también funcionará.
  capacityKg: Decimal;

  @ApiProperty({
    enum: VehicleStatus,
    description: 'Current status of the vehicle',
    example: VehicleStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleStatus, { message: 'Invalid vehicle status' })
  status: VehicleStatus;

  @ApiProperty({
    description: 'Last known latitude of the vehicle',
    example: 34.052235,
    required: false,
    type: 'number',
    format: 'float',
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Decimal) // Importante para transformar el string/number de entrada a Decimal
  lastLat: Decimal;

  @ApiProperty({
    description: 'Last known longitude of the vehicle',
    example: -118.243683,
    required: false,
    type: 'number',
    format: 'float',
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @Type(() => Decimal) // Importante para transformar el string/number de entrada a Decimal
  lastLng: Decimal;
}

export class UpdateVehicleDto extends PartialType(VehicleDto) {}
