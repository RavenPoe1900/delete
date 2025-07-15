import { UsersModule } from 'src/modules/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';

export const MODULES = [UsersModule, VehiclesModule, AuthModule];
