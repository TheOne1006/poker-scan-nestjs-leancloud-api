import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackAccessLimitGuard } from './feedback.guard';
import { ChatService } from '../chat/chat.service';



@Module({
  imports: [],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackAccessLimitGuard, ChatService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
