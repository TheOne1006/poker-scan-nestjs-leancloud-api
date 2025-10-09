import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { AppleModule } from '../common/apple/apple.module';

import { AuthModule } from '../common/auth/auth.module';
import { UsersService } from '../users/users.service';


@Module({
  imports: [AppleModule, AuthModule],
  controllers: [PurchaseController],
  providers: [PurchaseService, UsersService],
  exports: [PurchaseService],
})
export class PurchaseModule {}