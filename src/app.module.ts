/* istanbul ignore file */
import { Module } from '@nestjs/common';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

// import {
//   utilities as nestWinstonModuleUtilities,
//   WinstonModule,
// } from 'nest-winston';
import { CoreModule } from './core/core.module';
import { AppController } from './app.controller';
import { SettingController } from './setting.controller';
import { AppService } from './app.service';
import { FeedbackModule } from './feedback/feedback.module';
import { BaseFeedbackModule } from './base-feedback/base-feedback.module';
import { UsersModule } from './users/users.module';
import { AppleModule } from './common/apple/apple.module';
import { RsaModule } from './common/rsa/rsa.module';
import { ChatModule } from './chat/chat.module';
import { PurchaseModule } from './purchases/purchase.module';

@Module({
  imports: [
    CoreModule,
    FeedbackModule,
    BaseFeedbackModule,
    UsersModule,
    ChatModule,
    AppleModule,
    PurchaseModule,
    // RsaModule,
    ...(process.env.NODE_ENV === 'production' ? [] : [RsaModule]),
  ],
  // controllers: [],
  // providers: [],
  controllers: [AppController, SettingController],
  providers: [AppService],
})
export class AppModule { }
