import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDate } from 'class-validator';

export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SUPPORT = 'support',
  // 命令行
  COMMAND = 'command',
}

export enum ChatMessageSender {
  USER = 'user',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
  AI = 'ai',
}

export class ChatLogDto {
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
    example: 'user',
    enum: ChatMessageSender,
    description: '发送者 (user, customer, system)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(ChatMessageSender)
  sender: string;

  @ApiProperty({
    example: ['file1.jpg', 'file2.pdf'],
    description: '附件文件名',
    required: false,
  })
  attachments: string[];

  @ApiProperty({
    example: 'xxx121ea121',
    description: '对应的 support 的 id',
  })
  @IsNotEmpty()
  @IsString()
  supportId: string;


  @ApiProperty({
    example: 'xxx121ea121',
    description: '对应的 userid',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

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
