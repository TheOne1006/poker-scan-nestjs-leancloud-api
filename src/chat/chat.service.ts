import { Injectable, Logger } from '@nestjs/common';
import { Object } from 'leancloud-storage';
import { LeanCloudBaseService, AV } from '../common/leancloud';
import {
  ChatDto,
  ChatLogDto,
  ChatMessageSender,
  ChatLogBaseDto
} from './dtos';

const CHAT_MODEL_NAME = 'chat';
const LOG_MODEL_NAME = 'chat_logs';


@Injectable()
export class ChatService {
  protected chatModel: any;
  protected logModel: any;
  private readonly logger = new Logger('app:ChatService');

  constructor() {
    this.chatModel = AV.Object.extend(CHAT_MODEL_NAME);
    this.logModel = AV.Object.extend(LOG_MODEL_NAME);
  }

  // protected createQuery() {
  //   const query = new AV.Query(this._modelName);
  //   return query;
  // }


  /**
   * 创建聊天日志
   * @param logs ChatLogBaseDto[]
   * @returns (AV.Queriable & ChatLogDto)[]
   */
  async createChatLogs(logs: ChatLogBaseDto[]): Promise<(AV.Queriable & ChatLogDto)[]> {
    const batch = logs.map(log => new this.logModel(log));
    const instances = await AV.Object.saveAll(batch);
    return instances as (AV.Queriable & ChatLogDto)[];
  }

  async updateChatLog(instance: AV.Queriable & ChatLogDto, updateDto: Record<string, any>): Promise<AV.Queriable & ChatLogDto> {
    for (const key in updateDto) {
      if (Object.prototype.hasOwnProperty.call(updateDto, key)) {
        const value = updateDto[key];
        instance.set(key, value);
      }
    }
    await instance.save();
    return instance as AV.Queriable & ChatLogDto;
  }

  async createChat(userId: string, logsDict: Record<string, any>[]): Promise<AV.Queriable & ChatDto> {
    // const logsInstances = await this.createChatLogs(logs);
    // const logsDict = logsInstances.map(log => log.toJSON());
    const chat = new this.chatModel({
      logs: logsDict,
      userId,
      logStartAt: new Date(),
    });
    await chat.save();
    return chat as AV.Queriable & ChatDto;
  }

  // appendLogs2Chat
  async appendLogs2Chat(instance: AV.Queriable & ChatDto, logsDict: Record<string, any>[]): Promise<AV.Queriable & ChatDto> {
    // const logsInstances = await this.createChatLogs(logs);
    // const logsDict = logsInstances.map(log => log.toJSON());
    (instance as any).add('logs', logsDict);
    await instance.save();
    return instance as AV.Queriable & ChatDto;
  }


  // updatteLogOnChat
  async updateLogOnChat(
    instance: AV.Queriable & ChatDto, 
    logId: string, 
    updateLog: Record<string, any>): Promise<AV.Queriable & ChatDto> {
    const logs = (instance.get('logs') as Record<string, any>[]).map(item => item.objectId === logId ? updateLog : item);
    instance.set('logs', logs);
    await instance.save();
    return instance as AV.Queriable & ChatDto;
  }

  // clearLog
  async clearLogs(userId: string): Promise<AV.Queriable & ChatDto> {
    const query = new AV.Query(CHAT_MODEL_NAME);
    query.equalTo('userId', userId);
    const instance = await query.first();
    instance.set('logs', []);
    instance.set('logStartAt', new Date());
    await instance.save();
    return instance as AV.Queriable & ChatDto;
  }

  // findChatByUserId
  async findChatByUserId(userId: string): Promise<(AV.Queriable & ChatDto) | null> {
    const query = new AV.Query(CHAT_MODEL_NAME);
    query.equalTo('userId', userId);
    const instance = await query.first();
    if (!instance) {
      return null;
    }
    return instance as AV.Queriable & ChatDto;
  }

  // findChatLogByIdAndUserId
  async findChatLogByIdAndUserId(logId: string, userId: string): Promise<(AV.Queriable & ChatLogDto) | null> {
    const query = new AV.Query(LOG_MODEL_NAME);
    query.equalTo('objectId', logId);
    query.equalTo('userId', userId);
    const instance = await query.first();
    return instance as AV.Queriable & ChatLogDto;
  }

}
