import { Module } from '@nestjs/common';
import { UsersService } from './application/services/users.service';
import { PrismaService } from 'nestjs-prisma';
import { UsersController } from './presentation/controllers/users.controller';
import { AutomapperModule } from '@automapper/nestjs';
import { PrismaUserToDtoProfile } from './infrastructure/mappers/prisma-user.profile';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PrismaUserToDtoProfile],
  imports: [AutomapperModule],
  exports: [UsersService],
})
export class UsersModule {}
