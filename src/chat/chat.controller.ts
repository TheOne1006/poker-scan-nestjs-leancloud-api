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
  // ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';

// import { ParseInt } from '../common/pipes';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';

import { Roles, SerializerClass, User, ClassSerializerOptions } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';
import { AV } from '../common/leancloud';

import { ChatAccessLimitGuard } from './chat.guard';
import { ChatService } from './chat.service';
import { FlowiseService } from '../common/flowise/flowise.service';

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
    
    let chat = await this.service.findChatByUserId(user.id);

    console.log('dto', dto);

    // 先创建 log
    const inputLog: ChatLogBaseDto = {
      text: dto.text,
      type: dto.type as ChatMessageType,
      sender: ChatMessageSender.USER,
      status: ChatLogStatus.COMPLETED,
      relation: {},
      supportId: '',
      userId: user.id,
    }

    const replayLog: ChatLogBaseDto = {
      text: "处理中... 请稍等",
      type: dto.type as ChatMessageType,
      sender: ChatMessageSender.AI_CUSTOMER,
      status: ChatLogStatus.PENDING,
      relation: {},
      supportId: '',
      userId: user.id,
    }
    const [inputLogInstance, replayLogInstance] = await this.service.createChatLogs([inputLog, replayLog]);
    const logsDict = [inputLogInstance, replayLogInstance].map(log => log.toJSON());

    // 不存在，则创建 chat
    if (!chat) { 
      chat = await this.service.createChat(user.id, logsDict);
    } else {
      chat = await this.service.appendLogs2Chat(chat, logsDict);
    }
    const instanceLogs = chat.get('logs') as ChatLogDto[];
    const firstLogObjectId = instanceLogs[0]['objectId'];

    if (firstLogObjectId) {
      this.sendMessageToAiService(
        chat,
        replayLogInstance,
        inputLogInstance.get('text'),
        firstLogObjectId
      );

    }

    return replayLogInstance;
  }

  private async sendMessageToAiService(
    chat: AV.Queriable & ChatDto,
    replayLog: AV.Queriable & ChatLogDto,
    text: string,
    sessionId: string = '') {
    try {
      const result = await this.flowiseService.prediction(text, sessionId);

      const aiReplayLog = {
        text: result.text,
        type: ChatMessageType.TEXT,
        sender: ChatMessageSender.AI_CUSTOMER,
        status: ChatLogStatus.COMPLETED,
        relation: {},
        supportId: '',
        userId: chat.get('userId'),
      } as ChatLogDto;

      const log = await this.service.updateChatLog(replayLog, aiReplayLog);
      const logDict = log.toJSON()

      await this.service.updateLogOnChat(chat, replayLog.get('objectId'), logDict);
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
    const instance = await this.service.findChatByUserId(user.id)
    if (!instance) {
      const newInstance = await this.service.createChat(user.id, []);
      return newInstance;
    }
    return instance;
  }

  @Get('/logs/:logId')
  @ApiOperation({
    summary: '获取聊天会话日志',
  })
  @SerializerClass(ChatLogDto)
  async findChatLogs(
    @Param('logId') logId: string,
    @User() user: RequestUser, 
    ): Promise<ChatLogDto> {
    const instance = await this.service.findChatLogByIdAndUserId(logId, user.id)
    return instance as ChatLogDto;
  }


  @Post('/clearHistory')
  @ApiOperation({
    summary: '清除聊天历史',
  })
  @SerializerClass(ChatDto)
  async clearHistory(@User() user: RequestUser): Promise<ChatDto> {
    const instance = await this.service.clearLogs(user.id)
    return instance;
  }

}
