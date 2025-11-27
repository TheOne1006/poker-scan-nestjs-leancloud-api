import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Purchase } from './purchase.entity';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { AppleModule } from '../common/apple/apple.module';

import { AuthModule } from '../common/auth/auth.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [AppleModule, AuthModule, SequelizeModule.forFeature([Purchase]), UsersModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
