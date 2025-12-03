import {
  Module,
  // HttpModule,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppleAuthService } from './apple-auth.services';
import { AppleTransactionValidationService } from './apple-transaction-validation.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AppleAuthService, AppleTransactionValidationService],
  exports: [AppleAuthService, AppleTransactionValidationService],
})
export class AppleModule {}
