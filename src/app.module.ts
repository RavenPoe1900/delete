import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/application/roles.guard';
import { AuthGuard } from './auth/application/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AutomapperModule } from '@automapper/nestjs';
import { jwtConfig } from './config/jwt-config';
import { MODULES } from './config/config-modules';
import { prismaConfig } from './config/prisma-config';
import { PrismaModule } from 'nestjs-prisma';
import { PassportModule } from '@nestjs/passport';
import { pojos } from '@automapper/pojos';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register(jwtConfig),
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    PrismaModule.forRoot(prismaConfig),
    PassportModule,
    // Módulos agrupados
    ...MODULES,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
