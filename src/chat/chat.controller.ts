import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Logger,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';

// import { ParseInt } from '../common/pipes';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';

import { Roles, SerializerClass, User } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';

import { ChatAccessLimitGuard } from './chat.guard';
import { ChatService } from './chat.service';

import {
  ChatDto,
  ChatLogDto,
  ChatMessageDto,
  ChatMessageSender,
  ChatMessageType,
} from './dtos';

@Controller('api/chats')
@ApiTags('chats')
@UseGuards(RolesGuard)
@ApiSecurity('api_key')
@Roles(ROLE_USER)
@UseInterceptors(SerializerInterceptor)
export class ChatController {
  private readonly logger = new Logger('app:ChatController');

  constructor(protected readonly service: ChatService) {}

  @Post()
  @UseGuards(ChatAccessLimitGuard)
  @ApiOperation({
    summary: '接收用户消息',
  })
  @SerializerClass(ChatDto)
  async receiveUserMessage(
    @Body() dto: ChatMessageDto,
    @User() user: RequestUser,
  ): Promise<ChatDto> {
    
    const chat = await this.service.findChatByUserId(user.id);

    // 先创建 log
    const inputLog: ChatLogDto = {
      text: dto.text,
      type: dto.type as ChatMessageType,
      sender: ChatMessageSender.USER,
      attachments: [],
      supportId: '',
      userId: user.id,
    }
    // 不存在，则创建 chat
    if (!chat) { 
      const instance = await this.service.createChat(user.id, [inputLog]);
      return instance;
    }

    const instance = await this.service.appendLogs2Chat(chat, [inputLog]);

    // TODO: message to ai service

    return instance;
  }
 
  @Get('/current')
  @ApiOperation({
    summary: '获取当前聊天会话详情',
  })
  @SerializerClass(ChatDto)
  async findCurrentChat(@User() user: RequestUser): Promise<ChatDto> {
    const instance = await this.service.findChatByUserId(user.id)
    return instance;
  }
}
