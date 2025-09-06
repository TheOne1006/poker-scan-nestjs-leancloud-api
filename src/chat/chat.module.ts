import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatAccessLimitGuard } from './chat.guard';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [ChatService, ChatAccessLimitGuard],
  exports: [ChatService],
})
export class ChatModule {}
