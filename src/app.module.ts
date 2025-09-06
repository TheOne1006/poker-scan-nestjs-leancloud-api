/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      // 排除API路由
      exclude: ['/api/{*test}'],
      serveStaticOptions: {
        // 当文件不存在时返回404
        fallthrough: false,
      },
    }),
    CoreModule,
    FeedbackModule,
    UsersModule,
    ChatModule,
    ...(process.env.NODE_ENV === 'production' ? [] : [RsaModule]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
