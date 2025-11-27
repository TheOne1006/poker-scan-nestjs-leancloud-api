import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'crypto';
import { Chat } from './chat.entity';
import { ChatLog } from './chat-log.entity';
import {
  ChatDto,
  ChatLogDto,
  ChatLogBaseDto,
  ChatMessageType,
  ChatLogStatus,
  ChatMessageSender
} from './dtos';

@Injectable()
export class ChatService {
  private readonly logger = new Logger('app:ChatService');

  constructor(
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
    @InjectModel(ChatLog)
    private readonly chatLogModel: typeof ChatLog,
  ) {}

  /**
   * 创建聊天日志
   * @param logs ChatLogBaseDto[]
   * @param conversationId string
   * @returns ChatLog[]
   */
  async batchCreateChatLogs(logs: ChatLogBaseDto[], conversationId: string): Promise<ChatLog[]> {
    const records = logs.map(log => ({
      ...log,
      type: log.type as ChatMessageType,
      status: log.status as ChatLogStatus,
      sender: log.sender as ChatMessageSender,
      conversationId,
    }));
    return this.chatLogModel.bulkCreate(records);
  }

  async updateLog(instance: ChatLog, updateDto: Record<string, any>): Promise<ChatLog> {
    return instance.update(updateDto);
  }



  /**
   * 创建聊天会话，并可选地附带初始化日志
   * 目的：与 `feedback.controller` 的使用保持一致，当不存在会话时直接新建；
   *      若提供日志则写入同一 `conversationId` 下并返回包含日志的会话
   */
  async createChat(uId: string): Promise<Chat> {
    const conversationId = randomUUID();

    const chat = await this.chatModel.create({
      uid: uId,
      conversationId,
      logStartAt: new Date(),
    });
    return chat;
  }

  // appendLogs2Chat
  async appendLogs2Chat(
    instance: Chat,
    chatLogs: ChatLogDto[],
    conversationId: string = ''
  ): Promise<Chat> {
    // 如果传入的 conversationId 与当前实例不同，则更新实例
    if (conversationId && instance.conversationId !== conversationId) {
      instance.conversationId = conversationId;
    }
    instance.logs = [...(instance.logs || []), ...chatLogs]

    await instance.save();

    // 重新加载实例以包含最新日志
    return instance.reload();
  }



  // updatteLogOnChat
  async updateLogOnChat(
    instance: Chat,
    logId: number, 
    updateLog: ChatLog,
    conversationId: string = ''
  ): Promise<Chat> {
    
    if (conversationId && instance.conversationId !== conversationId) {
      instance.conversationId = conversationId;
    }
    let logs = instance.logs.map(log => log.id == logId ? updateLog : log)
    instance.logs = logs

    await instance.save();

    // 重新加载实例以包含最新日志
    return instance.reload();
  }

  // resetChat
  async resetChat(uid: string): Promise<Chat> {
    const chat = await this.findChatByUId(uid);
    if (!chat) return null;


    chat.logStartAt = new Date();
    chat.conversationId = randomUUID();
    chat.logs = []
    await chat.save();
    
    return chat.reload();
  }

  // findChatByUId
  async findChatByUId(uid: string): Promise<Chat | null> {
    return this.chatModel.findOne({
      where: { uid: uid }
    });
  }

  // findChatLogByPKAndUId
  async findChatLogByPKAndUId(pk: number, uid: string): Promise<ChatLog | null> {
    return this.chatLogModel.findOne({
      where: { id: pk, uid }
    });
  }

}
