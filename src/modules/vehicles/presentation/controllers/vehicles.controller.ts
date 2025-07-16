import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/domain/roles.decorator';
import { VehiclesService } from '../../application/services/vehicles.service';
import { ApiResponseSwagger } from 'src/shared/infrastructure/swagger/response.swagger';
import {
  createSwagger,
  deleteSwagger,
  findOneSwagger,
  findSwagger,
  updateSwagger,
} from 'src/shared/infrastructure/swagger/http.swagger';
import { VehicleResponse } from '../../application/dtos/vehicle.response.dto';
import { UpdateVehicleDto, VehicleDto } from '../../domain/dtos/vehicle.dtos';
import { PaginationVehicleDto } from '../../application/dtos/pagination-vehicle.dto';
import { PaginatedResponse } from 'src/shared/applications/dtos/paginationResponse.dto';

const C = 'Vehicles';

@ApiTags(C)
@Controller({ path: 'vehicles', version: '1' })
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseSwagger(createSwagger(VehicleResponse, C))
  async create(@Body() dto: VehicleDto): Promise<VehicleResponse> {
    return this.service.create({ data: dto });
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(findSwagger(VehicleResponse, C))
  async findAll(
    @Query() pagination: PaginationVehicleDto,
  ): Promise<PaginatedResponse<VehicleResponse>> {
    return this.service.findAll(pagination as any);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(findOneSwagger(VehicleResponse, C))
  async findOne(@Param('id') id: string): Promise<VehicleResponse> {
    return this.service.findOne({ where: { id: +id } });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponseSwagger(updateSwagger(VehicleResponse, C))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponse> {
    const where = { id: +id };
    return this.service.update({ where }, { where, data: dto });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponseSwagger(deleteSwagger(VehicleResponse, C))
  async remove(@Param('id') id: string): Promise<VehicleResponse> {
    const where = { id: +id };
    return this.service.remove({ where }, { where });
  }
}
