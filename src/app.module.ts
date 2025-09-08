/* istanbul ignore file */
import { Module,
  //  MiddlewareConsumer, RequestMethod 
  } from '@nestjs/common';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

// import {
//   utilities as nestWinstonModuleUtilities,
//   WinstonModule,
// } from 'nest-winston';
import { CoreModule } from './core/core.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeedbackModule } from './feedback/feedback.module';
import { UsersModule } from './users/users.module';
import { RsaModule } from './common/rsa/rsa.module';
import { ChatModule } from './chat/chat.module';

// import { SpaMiddleware } from './common/spa/aps.middleware';

@Module({
  imports: [,
    CoreModule,
    FeedbackModule,
    UsersModule,
    ChatModule,
    ...(process.env.NODE_ENV === 'production' ? [] : [RsaModule]),
  ],
  // controllers: [],
  // providers: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(SpaMiddleware)
  //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  // }
}
