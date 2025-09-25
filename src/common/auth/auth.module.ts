import {
  Module,
  // HttpModule,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { AppleAuthService } from './apple-auth.services';
import { JwtModule } from '@nestjs/jwt';

// config
import { config } from '../../../config/';  

@Module({
  imports: [JwtModule.register({
    secret: config.jwt.secret,
    signOptions: { expiresIn: config.jwt.expiresIn },
  })],
  providers: [AuthService, AppleAuthService],
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
