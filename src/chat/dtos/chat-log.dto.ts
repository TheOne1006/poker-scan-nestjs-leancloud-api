import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDate } from 'class-validator';

export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FEEDBACK = 'feedback',
  // 命令行
  COMMAND = 'command',
}

export enum ChatMessageSender {
  USER = 'user',
  // 人工客服
  HUMAN_CUSTOMER = 'human_customer',
  // 系统回复
  SYSTEM = 'system',
  // 自动回复
  AUTO_REPLY = 'auto_reply',
  // AI 客服
  AI_CUSTOMER = 'ai_customer',
  // 命令
  COMMAND = 'command',
}

export enum ChatLogStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}



export class ChatLogBaseDto {  
  @ApiProperty({
    example: '你好，我有问题需要咨询',
    description: '消息内容',
  })
  text: string;

  @ApiProperty({
    example: 'text',
    enum: ChatMessageType,
    description: '消息类型 (text, image, file, support, command)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ChatMessageType)
  type: string;


  @ApiProperty({
    example: 'pending',
    enum: ChatLogStatus,
    description: '状态 (pending, completed, failed)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ChatLogStatus)
  status: string;

  @ApiProperty({
    example: 'user',
    enum: ChatMessageSender,
    description: '发送者 (user, customer, system)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ChatMessageSender)
  sender: string;

  @ApiProperty({
    example: 'xxx121ea121',
    description: '对应的 support 的 id',
  })
  @IsNotEmpty()
  @IsString()
  supportId: string;


  @ApiProperty({
    example: {},
    description: '关联的实体',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ obj }) => {
    // objectId 转换为 id
    const relation = {...obj.relation};
    if (relation) {
      relation.id = relation.objectId || relation.id;
      delete relation.objectId;
    }
    return relation;
  })
  relation: Record<string, any>;


  @ApiProperty({
    example: 'xxx121ea121',
    description: '对应的 userid',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class ChatLogDto extends ChatLogBaseDto {
  @Expose({
    name: 'objectId',
  })
  id: string;
}

export class ChatLogDtoOnServer extends ChatLogDto {
  @ApiProperty({
    example: '2021-01-01',
    description: '创建时间',
  })
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
}
