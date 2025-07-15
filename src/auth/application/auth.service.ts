import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../domain/login.dto';

import { Prisma, Role, User } from '@prisma/client';
import { SignUpDto } from '../domain/sign-up.dto';
import { LoginResponseDto } from '../domain/login-response.dto'; // 👈 DTO con access_token
import { UsersService } from 'src/modules/users/application/services/users.service';
import {
  hashPassword,
  validatePassword,
} from 'src/shared/applications/utils/hash';
import { IPayload } from 'src/shared/domain/interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const findUser: Prisma.UserFindUniqueArgs = {
      where: { email: loginDto.email },
      select: {
        id: true,
        password: true,
        roles: { select: { role: true } },
      },
    };

    let user: User;
    try {
      user = await this.usersService.findOne(findUser);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'Entity not found') {
        throw new UnauthorizedException();
      }
      throw e;
    }

    const ok = await validatePassword(loginDto.password, user.password);
    if (!ok) throw new UnauthorizedException();

    const payload: IPayload = { id: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const role: Role = signUpDto.role ?? Role.SHIPPER;

    const data: Prisma.UserCreateArgs = {
      data: {
        email: signUpDto.email,
        password: await hashPassword(signUpDto.password),
        lastUsedRole: role,
        roles: { create: { role } },
      },
    };

    await this.usersService.create(data);
  }

  async changeUser(userId: number, role: Role): Promise<void> {
    const whereById: Prisma.UserWhereUniqueInput = { id: userId };

    try {
      await this.usersService.update(
        { where: whereById },
        {
          where: whereById,
          data: { lastUsedRole: role },
        },
      );
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}
