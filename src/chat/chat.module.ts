import { Module } from '@nestjs/common';
// http module
import { HttpModule } from '@nestjs/axios';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatAccessLimitGuard } from './chat.guard';
import { FlowiseService } from '../common/assistant/flowise.service';
import { DifyService } from '../common/assistant/dify.service';

@Module({
  imports: [HttpModule.register({
    // 15秒超时
    timeout: 15000,
    // 最多5次重定向
    maxRedirects: 5,
  })],
  controllers: [ChatController],
  providers: [ChatService, ChatAccessLimitGuard, FlowiseService, DifyService],
  exports: [ChatService],
})
export class ChatModule {}
