import { ApiProperty } from '@nestjs/swagger';
import { UserRoleDetailDto } from './user-role-detail.dto';
import { Role } from '@prisma/client';
import { TripSummaryDto } from './trip-summary.dto';
import { VehicleSummaryDto } from './vehicle-summary.dto';
import { CarrierAccountSummaryDto } from './carrier-account-summary.dto';
import { RatingDetailDto } from './rating-detail.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user.',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: "The user's email address.",
    format: 'email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: "The user's phone number.",
    nullable: true,
    example: '+1234567890',
  })
  phone?: string;

  @ApiProperty({
    type: [UserRoleDetailDto],
    description: 'List of roles assigned to the user.',
  })
  roles: UserRoleDetailDto[];

  @ApiProperty({
    enum: Role,
    description: 'The last role the user actively used.',
    nullable: true,
    example: Role.SHIPPER,
  })
  lastUsedRole?: Role;

  @ApiProperty({
    type: [TripSummaryDto],
    description: 'A list of trips where the user acted as a shipper.',
  })
  tripsAsShipper: TripSummaryDto[];

  @ApiProperty({
    type: [TripSummaryDto],
    description: 'A list of trips where the user acted as a carrier.',
  })
  tripsAsCarrier: TripSummaryDto[];

  @ApiProperty({
    type: [VehicleSummaryDto],
    description:
      'A list of vehicles associated with the user (if they are a carrier).',
  })
  vehicles: VehicleSummaryDto[];

  @ApiProperty({
    type: CarrierAccountSummaryDto,
    description: 'Summary of the carrier account associated with the user.',
    nullable: true,
  })
  carrierAccount?: CarrierAccountSummaryDto;

  @ApiProperty({
    description:
      'The average rating received by the user when acting as a shipper.',
    nullable: true,
    example: 4.75,
  })
  averageRatingAsShipper?: number;

  @ApiProperty({
    description:
      'The total number of ratings received by the user as a shipper.',
    example: 20,
  })
  totalRatingsAsShipper: number;

  @ApiProperty({
    description:
      'The average rating received by the user when acting as a carrier.',
    nullable: true,
    example: 4.92,
  })
  averageRatingAsCarrier?: number;

  @ApiProperty({
    description:
      'The total number of ratings received by the user as a carrier.',
    example: 55,
  })
  totalRatingsAsCarrier: number;

  @ApiProperty({
    type: [RatingDetailDto],
    description: 'A list of ratings given by this user to others.',
  })
  ratingsGiven: RatingDetailDto[];

  @ApiProperty({
    type: [RatingDetailDto],
    description: 'A list of ratings received by this user from others.',
  })
  ratingsReceived: RatingDetailDto[];

  @ApiProperty({
    description: 'The timestamp when the user account was created.',
    format: 'date-time',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the user account was last updated.',
    format: 'date-time',
    example: '2025-07-14T14:30:00Z',
  })
  updatedAt: Date;
}
