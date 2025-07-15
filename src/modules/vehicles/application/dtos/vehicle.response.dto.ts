import { ApiProperty } from '@nestjs/swagger';
import { VehicleType, VehicleStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class VehicleResponse {
  @ApiProperty({ description: 'Unique identifier of the vehicle' })
  id: number;

  @ApiProperty({
    description: 'ID of the carrier (user) associated with the vehicle',
  })
  carrierId: number;

  @ApiProperty({
    description: 'License plate of the vehicle',
    example: 'ABC-123',
  })
  plate: string;

  @ApiProperty({
    enum: VehicleType,
    description: 'Type of the vehicle',
    example: VehicleType.TRUCK,
  })
  type: VehicleType;

  @ApiProperty({
    description: 'Make of the vehicle',
    example: 'Ford',
    required: false,
  })
  make?: string;

  @ApiProperty({
    description: 'Model of the vehicle',
    example: 'F-150',
    required: false,
  })
  model?: string;

  @ApiProperty({
    description: 'Year of the vehicle',
    example: 2020,
    required: false,
  })
  year?: number;

  @ApiProperty({
    description: 'Color of the vehicle',
    example: 'Red',
    required: false,
  })
  color?: string;

  @ApiProperty({
    description: 'Capacity of the vehicle in kilograms',
    example: 1000.5,
    type: 'number',
    format: 'float',
    required: false,
  })
  capacityKg?: Decimal;

  @ApiProperty({
    enum: VehicleStatus,
    description: 'Current status of the vehicle',
    example: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @ApiProperty({
    description: 'Last known latitude of the vehicle',
    example: 34.052235,
    type: 'number',
    format: 'float',
    required: false,
  })
  lastLat?: Decimal;

  @ApiProperty({
    description: 'Last known longitude of the vehicle',
    example: -118.243683,
    type: 'number',
    format: 'float',
    required: false,
  })
  lastLng?: Decimal;

  @ApiProperty({
    description: 'Date and time when the vehicle record was created',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the vehicle record was last updated',
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}
