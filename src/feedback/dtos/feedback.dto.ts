import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';


// 1. 定义枚举
export enum FeedbackType {
  BUG = 'bug',
  SUGGESTION = 'suggestion',
  FEATURE = 'feature',
}


class FeedbackBaseDto {
  @ApiProperty({
    example: '应用在某些情况下会崩溃',
    description: '问题描述',
  })
  description: string;

  @ApiProperty({
    example: ['feedback-image-123.jpg', 'feedback-image-456.jpg'],
    description: '图片文件名',
    required: false,
  })
  images?: string[];

  @ApiProperty({
    example: 'bug',
    enum: FeedbackType,
    description: '反馈类型 (bug, suggestion, feature)',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  // enum: ['bug', 'suggestion', 'feature']
  @IsEnum(FeedbackType)
  type: string;
}

export class FeedbackDto extends FeedbackBaseDto {
  @Expose({
    name: 'objectId',
  })
  id: string;


  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class FeedbackCreateDto extends FeedbackBaseDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class FeedbackCreateDtoWithUserId extends FeedbackCreateDto {
  userid: string;
}



export class FeedbackCreateDtoWithRSA extends FeedbackCreateDto {
  @ApiProperty({
    example: 'xxxxxxx',
    description: 'RSA 加密的数据, 格式为: {"description":"应用在某些情况下会崩溃","imageFileName":"feedback-image-123.jpg","type":"bug"}',
  })
  @IsNotEmpty()
  @IsString()
  rsaData: string;
}

export class FeedbackUpdateDto {
  @ApiProperty({
    example: '应用在某些情况下会崩溃',
    description: '问题描述',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'feedback-image-123.jpg',
    description: '图片文件名',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    example: 'resolved',
    description: '反馈状态',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}