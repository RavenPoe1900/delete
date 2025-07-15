import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-service.generic';

@Injectable()
export class VehiclesService extends PrismaGenericService<
  Vehicle,
  Prisma.VehicleCreateArgs,
  Prisma.VehicleFindManyArgs,
  Prisma.VehicleFindUniqueArgs,
  Prisma.VehicleUpdateArgs,
  Prisma.VehicleDeleteArgs
> {
  constructor(prismaService: PrismaService) {
    super(prismaService.vehicle, {});
  }
}
