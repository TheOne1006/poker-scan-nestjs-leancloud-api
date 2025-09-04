import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../common/auth/auth.module';
import { RSAService } from '../common/rsa/rsa.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, RSAService],
  exports: [UsersService],
})
export class UsersModule {}