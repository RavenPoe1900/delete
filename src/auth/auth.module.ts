import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthController } from './insfractuture/auth.controller';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
