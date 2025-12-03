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
  NotFoundException,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
  // ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ParseInt } from '../common/pipes';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';

import { Roles, SerializerClass, User, ClassSerializerOptions } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';

import { ChatAccessLimitGuard } from './chat.guard';
import { ChatService } from './chat.service';
import { FlowiseService } from '../common/assistant/flowise.service';
import { DifyService } from '../common/assistant/dify.service';
import { config } from '../../config';
import { Chat } from './chat.entity';
import { ChatLog } from './chat-log.entity';

const assistantChannel = config.assistant.channel;

import {
  ChatDto,
  ChatLogDto,
  ChatMessageDto,
  ChatMessageSender,
  ChatMessageType,
  ChatLogStatus,
  ChatLogBaseDto,
} from './dtos';

@Controller('api/chats')
@ApiTags('chats')
@UseGuards(RolesGuard)
// @ApiSecurity('api_key')
@ApiBearerAuth('access-token')
@Roles(ROLE_USER)
@UseInterceptors(SerializerInterceptor)
export class ChatController {
  private readonly logger = new Logger('app:ChatController');

  constructor(
    protected readonly service: ChatService,
    protected readonly flowiseService: FlowiseService,
    protected readonly difyService: DifyService,
  ) {}

  @Post()
  @UseGuards(ChatAccessLimitGuard)
  @ApiOperation({
    summary: '接收用户消息',
  })
  @SerializerClass(ChatLogDto)
  async receiveUserMessage(
    @Body() dto: ChatMessageDto,
    @User() user: RequestUser,
  ): Promise<ChatLogDto> {
    
    let chat = await this.service.findChatByUId(user.uid);
    
    // 不存在，则创建 chat
    if (!chat) { 
      chat = await this.service.createChat(user.uid);
    }

    // console.log('dto', dto);

    // 先创建 log
    const inputLog: ChatLogBaseDto = {
      text: dto.text,
      type: dto.type as ChatMessageType,
      sender: ChatMessageSender.USER,
      status: ChatLogStatus.COMPLETED,
      relation: {},
      supportId: '',
      uid: user.uid,
    }

    const replayLog: ChatLogBaseDto = {
      text: "处理中... 请稍等",
      type: dto.type as ChatMessageType,
      sender: ChatMessageSender.AI_CUSTOMER,
      status: ChatLogStatus.PENDING,
      relation: {},
      supportId: '',
      uid: user.uid,
    }
    const [inputLogInstance, replayLogInstance] = await this.service.batchCreateChatLogs(
      [inputLog, replayLog],
      chat.conversationId
    );

    await this.service.appendLogs2Chat(chat, [inputLogInstance, replayLogInstance]);
    
    if (assistantChannel === 'dify') {
      this.sendMessageToAiServiceWithDify(
        chat,
        replayLogInstance,
        inputLogInstance.text,
        );
    } else {
      this.sendMessageToAiServiceWithFlowise(
        chat,
        replayLogInstance,
        inputLogInstance.text,
      );
    }

    return replayLogInstance as any;
  }

  private async sendMessageToAiServiceWithDify(
    chat: Chat,
    replayLog: ChatLog,
    text: string) {
    const result = await this.difyService.chat(text, chat.uid, chat.conversationId);

    const aiReplayLog = {
      text: result.answer,
      type: ChatMessageType.TEXT,
      sender: ChatMessageSender.AI_CUSTOMER,
      status: ChatLogStatus.COMPLETED,
      relation: {},
      supportId: '',
      uid: chat.uid,
    } as ChatLogDto;
    const conversationId = result.conversation_id;

    const log = await this.service.updateLog(replayLog, aiReplayLog);
    await this.service.updateLogOnChat(chat, replayLog.id, log, conversationId);
  }


  /**
   * 发送消息到 Flowise AI 服务
   * @param chat 聊天实例
   * @param replayLog 回复日志实例
   * @param text 文本
   */
  private async sendMessageToAiServiceWithFlowise(
    chat: Chat,
    replayLog: ChatLog,
    text: string) {

    const instanceLogs = chat.logs;
    const firstLogId = instanceLogs && instanceLogs.length > 0 ? instanceLogs[0].id.toString() : '';
    try {
      const result = await this.flowiseService.prediction(text, firstLogId);

      const aiReplayLog = {
        text: result.text,
        type: ChatMessageType.TEXT,
        sender: ChatMessageSender.AI_CUSTOMER,
        status: ChatLogStatus.COMPLETED,
        relation: {},
        supportId: '',
        uid: chat.uid,
      };

      const log = await this.service.updateLog(replayLog, aiReplayLog);
      await this.service.updateLogOnChat(chat, replayLog.id, log);
    } catch (error) {
      this.logger.error(error);
    }
  
  }
 
  @Get('/current')
  @ApiOperation({
    summary: '获取当前聊天会话详情',
  })
  @SerializerClass(ChatDto)
  @ClassSerializerOptions({
    enableCircularCheck: true, // 处理循环引用
    // excludeExtraneousValues: true, // 只保留 @Expose 标记的属性
    // enableImplicitConversion: false, // 按需启用（通常不建议自动转换类型）
  })
  async findCurrentChat(@User() user: RequestUser): Promise<ChatDto> {
    const instance = await this.service.findChatByUId(user.uid)
    if (!instance) {
      const newInstance = await this.service.createChat(user.uid);
      return newInstance as any;
    }
    return instance as any;
  }

  @Get('/logs/:id')
  @ApiOperation({
    summary: '获取聊天会话日志',
  })
  @SerializerClass(ChatLogDto)
  async findChatLogByPk(
    @Param('id', ParseInt) id: number,
    @User() user: RequestUser, 
    ): Promise<ChatLogDto> {
    const instance = await this.service.findChatLogByPKAndUId(id, user.uid)
    if (!instance) {
      throw new NotFoundException(`Chat log with ID ${id} not found`);
    }
    return instance as any;
  }


  @Post('/clearHistory')
  @ApiOperation({
    summary: '清除聊天历史',
  })
  @SerializerClass(ChatDto)
  async clearHistory(@User() user: RequestUser): Promise<ChatDto> {
    const instance = await this.service.resetChat(user.uid)
    return instance as any;
  }

}
