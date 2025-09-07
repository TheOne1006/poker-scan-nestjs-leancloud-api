import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatAccessLimitGuard } from './chat.guard';
import { FlowiseService } from '../common/flowise/flowise.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [ChatService, ChatAccessLimitGuard, FlowiseService],
  exports: [ChatService],
})
export class ChatModule {}
