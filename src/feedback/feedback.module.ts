import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Feedback } from './feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackAccessLimitGuard } from './feedback.guard';
// import { ChatService } from '../chat/chat.service';

import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [
    SequelizeModule.forFeature([Feedback]),
    ChatModule
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackAccessLimitGuard],
  exports: [FeedbackService],
})
export class FeedbackModule {}
