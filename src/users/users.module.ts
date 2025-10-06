import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../common/auth/auth.module';
import { AppleModule } from '../common/apple/apple.module';
import { RSAService } from '../common/rsa/rsa.service';
import { PassportModule } from '@nestjs/passport';
// import { AppleStrategy } from '../common/passports/apple.passport';
import { AppleAuthService } from '../common/apple/apple-auth.services';


@Module({
  imports: [AuthModule, AppleModule, PassportModule],
  controllers: [UsersController, AuthController],
  // providers: [UsersService, RSAService, AppleStrategy, AppleAuthService],
  providers: [UsersService, RSAService, AppleAuthService],
  exports: [UsersService],
})
export class UsersModule {}
