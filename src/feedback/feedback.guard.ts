import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeedbackService } from './feedback.service';
// import { RequestUser } from '../interfaces';

/**
 * Feedback Access Limit guard
 *
 * 校验Feedback的访问限制
 */
@Injectable()
export class FeedbackAccessLimitGuard implements CanActivate {
    constructor(
        protected readonly reflector: Reflector, 
        protected readonly feedbackService: FeedbackService) { }

    /**
     * 校验Feedback的访问限制
     * @param  {ExecutionContext} context
     * @returns boolean
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = request.user;
        
        const feedbacks = await this.feedbackService.findLastByUserId(user.id, 3);

        // 半小时内超过3次，抛出异常
        if (feedbacks.length >= 3) {
            // 校验最近半个小时内是否有新增记录
            const createdAt = feedbacks[0].get('createdAt');
            const now = new Date();
            const diffTime = now.getTime() - createdAt.getTime();
            const diffMinutes = diffTime / (1000 * 60); // 转换为分钟（更直观）

            // 如果小于30分钟，抛出带自定义消息的异常
            if (diffMinutes < 30) {
                // 计算剩余时间，让消息更友好
                const remainingMinutes = Math.ceil(30 - diffMinutes);
                throw new ForbiddenException(
                    `提交过于频繁，请在${remainingMinutes}分钟后再次提交反馈`
                );
            }
        }

        return true;
    }
}
