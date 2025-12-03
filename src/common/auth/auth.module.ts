import {
  Module,
  // HttpModule,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import type { StringValue } from "ms";
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

// config
import { config } from '../../../config/';  

@Module({
  imports: [JwtModule.register({
    secret: config.jwt.secret,
    signOptions: { expiresIn: config.jwt.expiresIn as StringValue },
  })],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /**
     * 全局验证支持 authmiddleware
     */
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
