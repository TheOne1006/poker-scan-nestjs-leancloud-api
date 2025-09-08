import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type, Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDate } from 'class-validator';

import { ChatMessageType,
  // ChatMessageSender,
  ChatLogDto,
 } from './chat-log.dto';

export class ChatDto {
  @Expose({
    name: 'objectId',
  })
  id: string;

  @ApiProperty({
    examples: [{
      text: '你好，我有问题需要咨询',
      type: 'text',
      sender: 'user',
      relation: {},
      supportId: 'xxx121ea121',
      userId: 'xxx121ea121',
    }],
    description: 'chat logs 列表',
    isArray: true,
  })
  @Expose()
  @Type(() => ChatLogDto)
  logs: ChatLogDto[];


  @ApiProperty({
    example: 'xxx121ea121',
    description: '对应的 userid',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  // 记录开始时间
  @ApiProperty({
    example: '2021-01-01',
    description: '记录开始时间',
  })
  @IsNotEmpty()
  @IsDate()
  logStartAt: Date;


  // 会话id
  @Exclude()
  conversationId: string;
}



export class ChatMessageDto {

  @ApiProperty({
    example: '你好，我有问题需要咨询',
    description: '初始消息内容',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    example: 'text',
    enum: ChatMessageType,
    description: '消息类型',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ChatMessageType)
  type: string;
}
