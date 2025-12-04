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
import { AppleAuthTokenService } from './apple-auth-token.services';



@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AppleAuthService, AppleTransactionValidationService, AppleAuthTokenService],
  exports: [AppleAuthService, AppleTransactionValidationService, AppleAuthTokenService],
})
export class AppleModule {}
