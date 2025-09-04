import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackAccessLimitGuard } from './feedback.guard';

@Module({
  imports: [],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackAccessLimitGuard],
  exports: [FeedbackService],
})
export class FeedbackModule {}