import { Module } from '@nestjs/common';
import { VehiclesService } from './application/services/vehicles.service';
import { PrismaService } from 'nestjs-prisma';
import { VehiclesController } from './presentation/controllers/vehicles.controller';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
