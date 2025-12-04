import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BaseFeedbackService } from './base-feedback.service';

@Injectable()
export class BaseFeedbackRateLimitGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly baseFeedbackService: BaseFeedbackService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { device_id } = request.body;
    const ip = request.ip || request.socket.remoteAddress; // Get IP address

    // 1. Device ID Check
    if (device_id) {
       const feedbacks = await this.baseFeedbackService.findLastByDeviceId(device_id, 3);
       this.checkLimit(feedbacks);
    }

    // 2. IP Check
    if (ip) {
      const feedbacksByIp = await this.baseFeedbackService.findLastByIp(ip, 3);
      this.checkLimit(feedbacksByIp);
    }

    return true;
  }

  private checkLimit(feedbacks: any[]) {
    // If we found 3 feedbacks, we need to check if the 3rd one is within the 30 minute window
    if (feedbacks.length >= 3) {
      // feedbacks are ordered by createdAt DESC, so index 0 is newest, index 2 is oldest of the 3
      const oldestOfInterest = feedbacks[2];
      const createdAt = oldestOfInterest.createdAt;
      const now = new Date();
      const diffTime = now.getTime() - createdAt.getTime();
      const diffMinutes = diffTime / (1000 * 60);

      if (diffMinutes < 30) {
        // 429 Too Many Requests
        const remainingMinutes = Math.ceil(30 - diffMinutes);
        throw new HttpException(
          `Submission limit exceeded. Please try again in ${remainingMinutes} minutes.`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }
  }
}
