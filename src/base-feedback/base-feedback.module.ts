import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BaseFeedbackController } from './base-feedback.controller';
import { BaseFeedbackService } from './base-feedback.service';
import { BaseFeedback } from './base-feedback.entity';
import { RSAService } from '../common/rsa/rsa.service';

@Module({
  imports: [SequelizeModule.forFeature([BaseFeedback])],
  controllers: [BaseFeedbackController],
  providers: [BaseFeedbackService, RSAService],
  exports: [BaseFeedbackService],
})
export class BaseFeedbackModule {}
