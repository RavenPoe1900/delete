import { Injectable } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { PrismaService } from 'nestjs-prisma';
import { Prisma, User } from '@prisma/client';

import { PrismaGenericService } from 'src/shared/infrastructure/generic/prisma-service.generic';

import { UserDto } from '../dtos/user.dtos';
import { UserResponseDto } from '../dtos/user-response.dto';
import { PaginatedResponse } from 'src/shared/applications/dtos/paginationResponse.dto';

import { hashPassword } from 'src/shared/applications/utils/hash';
import { userSelectWithoutPassword } from '../../infrastructure/prisma/user.select';

@Injectable()
export class UsersService extends PrismaGenericService<
  User,
  Prisma.UserCreateArgs,
  Prisma.UserFindManyArgs,
  Prisma.UserFindUniqueArgs,
  Prisma.UserUpdateArgs,
  Prisma.UserDeleteArgs
> {
  constructor(
    prismaService: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {
    super(prismaService.user, {
      modelName: 'User',
      errorDictionary: {
        User: {
          unique: {
            email: 'A user with that email already exists.',
            username: 'The username is already in use.',
          },
        },
      },
    });
  }

  private toDto(entity: User): UserResponseDto {
    return this.mapper.map(entity, 'User', UserResponseDto);
  }

  private toDtoArray(entities: User[]): UserResponseDto[] {
    return this.mapper.mapArray(entities, 'User', UserResponseDto);
  }

  async createOne(dto: UserDto): Promise<UserResponseDto> {
    const args: Prisma.UserCreateArgs = {
      data: {
        password: await hashPassword(dto.password),
        email: dto.email,
        phone: dto.phone,
        lastUsedRole: dto.role,
        roles: { create: { role: dto.role } },
      },
      select: userSelectWithoutPassword,
    };
    const user = await super.create(args);
    return this.toDto(user);
  }

  async findPaginated(
    params: Prisma.UserFindManyArgs,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const page = await super.findAll(params);
    return {
      ...page,
      data: this.toDtoArray(page.data),
    };
  }

  async findById(id: number): Promise<UserResponseDto | null> {
    const user = await super.findOne({
      where: { id },
      select: userSelectWithoutPassword,
    });
    return user ? this.toDto(user) : null;
  }

  async updateOne(
    id: number,
    data: Prisma.UserUpdateInput,
  ): Promise<UserResponseDto> {
    const updated = await super.update(
      { where: { id } },
      { where: { id }, data, select: userSelectWithoutPassword },
    );
    return this.toDto(updated);
  }

  async removeOne(id: number): Promise<UserResponseDto> {
    const removed = await super.remove(
      { where: { id } },
      { where: { id }, select: userSelectWithoutPassword },
    );
    return this.toDto(removed);
  }
}
