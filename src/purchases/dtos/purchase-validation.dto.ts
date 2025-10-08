import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Platform } from './purchase.dto';
import { AppleEnvironment } from '../../common/apple/dtos';

/**
 * 购买验证请求 DTO
 * 用于验证内购凭证的请求体
 */
export class PurchaseValidationRequestDto {
  @ApiProperty({
    example: 'ewoJInNpZ25hdHVyZSIgPSAiQW...',
    description: 'Base64 编码的购买凭证数据',
  })
  @IsNotEmpty()
  @IsString()
  receiptData: string;

  @ApiProperty({
    example: 'com.example.product.premium',
    description: '产品ID',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    example: 'apple',
    enum: Platform,
    description: '购买平台',
  })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({
    example: 'production',
    enum: AppleEnvironment,
    description: 'Apple 验证环境（可选，不传则自动检测）',
    required: false,
  })
  @IsOptional()
  @IsEnum(AppleEnvironment)
  environment?: AppleEnvironment;
}

/**
 * 恢复购买请求 DTO
 * 用于恢复购买的请求体
 */
export class RestorePurchasesRequestDto {
  @ApiProperty({
    example: 'ewoJInNpZ25hdHVyZSIgPSAiQW...',
    description: 'jwt凭证',
  })
  @IsNotEmpty()
  @IsString()
  signedTransactionInfo: string;

  @ApiProperty({
    example: 'com.example.product.premium',
    description: '产品ID',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    example: 'apple',
    enum: Platform,
    description: '购买平台',
  })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: Platform;
}

/**
 * 购买验证响应 DTO
 * 统一的购买验证响应格式
 */
export class PurchaseValidationResponseDto {
  @ApiProperty({
    example: true,
    description: '验证是否成功',
  })
  success: boolean;

  @ApiProperty({
    example: 'txn_123456789',
    description: '交易ID',
    required: false,
  })
  transactionId?: string;

  @ApiProperty({
    example: 'com.example.product.premium',
    description: '产品ID',
    required: false,
  })
  productId?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '购买日期',
    required: false,
  })
  purchaseDate?: Date;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: '过期日期（仅订阅产品）',
    required: false,
  })
  expiresDate?: Date;

  @ApiProperty({
    example: true,
    description: '是否为订阅产品',
    required: false,
  })
  isSubscription?: boolean;

  @ApiProperty({
    example: 'production',
    description: '验证环境',
    required: false,
  })
  environment?: string;

  @ApiProperty({
    example: '验证成功',
    description: '响应消息',
  })
  message: string;

  @ApiProperty({
    example: 'purchase_12345',
    description: '数据库中的购买记录ID',
    required: false,
  })
  purchaseId?: string;
}

/**
 * 恢复购买响应 DTO
 * 恢复购买的响应格式
 */
export class RestorePurchasesResponseDto {
  @ApiProperty({
    example: true,
    description: '恢复是否成功',
  })
  success: boolean;

  @ApiProperty({
    example: 3,
    description: '恢复的购买记录数量',
  })
  count: number;

  @ApiProperty({
    type: [PurchaseValidationResponseDto],
    description: '恢复的购买记录列表',
  })
  purchases: PurchaseValidationResponseDto[];

  @ApiProperty({
    example: '成功恢复 3 个购买记录',
    description: '响应消息',
  })
  message: string;
}