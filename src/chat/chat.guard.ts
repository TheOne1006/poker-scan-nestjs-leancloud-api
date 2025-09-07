import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ChatService } from './chat.service';
import { ChatMessageSender, ChatLogDtoOnServer } from './dtos';


const RECEIVE_ON_HOUR_LIMIT = 30;

/**
 * Chat Access Limit guard
 *
 * 校验Chat的访问限制
 */
@Injectable()
export class ChatAccessLimitGuard implements CanActivate {
    constructor(
        protected readonly reflector: Reflector, 
        protected readonly chatService: ChatService) { }

    /**
     * 校验Chat的访问限制
     * @param  {ExecutionContext} context
     * @returns boolean
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = request.user;
        
        const chat = await this.chatService.findChatByUserId(user.id);

        if (chat) {
            // 校验最近半个小时内是否有新增记录
            const logs: ChatLogDtoOnServer[] = chat.get('logs') || [];
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
            const filterUserLogs = logs.filter(log => log.sender === ChatMessageSender.USER);
            const receiveOnHour = filterUserLogs.filter(log => new Date(log.createdAt).getTime() > oneHourAgo.getTime()).length;

            // 每小时接收消息次数超过30次，抛出异常
            if (receiveOnHour >= RECEIVE_ON_HOUR_LIMIT) {
                // 计算剩余时间，让消息更友好
                throw new ForbiddenException(
                    `每小时接收消息次数超过${RECEIVE_ON_HOUR_LIMIT}次，请稍后再试`
                );
            }
        }

        return true;
    }
}
