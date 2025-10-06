import {
  Module,
  // HttpModule,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppleAuthService } from './apple-auth.services';
import { AppleReceiptValidationService } from './apple-receipt-validation.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AppleAuthService, AppleReceiptValidationService],
  exports: [AppleAuthService, AppleReceiptValidationService],
})
export class AppleModule {}
