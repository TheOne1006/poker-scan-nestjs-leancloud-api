import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, Length } from 'class-validator';
import { Expose } from 'class-transformer';

export enum PlatformType {
  IOS = 'iOS',
  ANDROID = 'Android',
  WEB = 'Web',
  OTHER = 'Other',
}

export class BaseFeedbackResponseDto {
  @ApiProperty({
    example: 'App crashes on startup',
    description: 'Feedback content',
  })
  @Expose()
  content: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Contact information',
    required: false,
  })
  @Expose()
  contact?: string;
}

export class CreateBaseFeedbackDto {
  @ApiProperty({
    example: 'App crashes on startup',
    description: 'Feedback content',
    minLength: 7,
    maxLength: 99,
  })
  @IsNotEmpty()
  @IsString()
  @Length(7, 99, { message: 'Content must be longer than 6 and shorter than 100 characters' })
  content: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Contact information',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({
    example: 'iOS',
    enum: PlatformType,
    description: 'Platform (iOS, Android, Web, Other)',
  })
  @IsNotEmpty()
  @IsEnum(PlatformType)
  platform: PlatformType;

  @ApiProperty({
    example: 'device-uuid-1234-5678',
    description: 'Unique device identifier',
  })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}




export class CreateBaseFeedbackDtoWithRSA extends CreateBaseFeedbackDto {
  @ApiProperty({
    example: 'xxxxxxx',
    description: 'RSA 加密的数据',
  })
  @IsNotEmpty()
  @IsString()
  rsaData: string;
}
