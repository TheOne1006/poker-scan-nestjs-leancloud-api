import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum PurchaseStatus {
  // 待支付
  PENDING = 'pending',
  // 已支付
  COMPLETED = 'completed',
  // 已取消
  FAILED = 'failed',
  // 已退款
  REFUNDED = 'refunded',
  // 已过期
  EXPIRED = 'expired',
}

// 订单平台
export enum Platform {
  APPLE = 'apple',
  CUSTOM = 'custom',
  SITE = 'site',
}

class PurchaseBaseDto {
  @ApiProperty({
    example: 'user123',
    description: '用户ID',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'com.example.product.premium',
    description: '产品ID',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    example: 'txn_123456789',
    description: '交易ID',
  })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  // 平台
  @ApiProperty({
    example: 'apple',
    enum: Platform,
    description: '平台',
  })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '购买日期',
  })
  @IsNotEmpty()
  @IsDateString()
  purchaseDate: Date;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: '过期日期',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresDate?: Date;

  @ApiProperty({
    example: 'completed',
    enum: PurchaseStatus,
    description: '购买状态',
  })
  @IsNotEmpty()
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus;
}

export class PurchaseDto extends PurchaseBaseDto {
  @Expose({
    name: 'objectId',
  })
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class PurchaseCreateDto extends PurchaseBaseDto {}


export class PurchaseUpdateDto {
  @ApiProperty({
    example: 'completed',
    enum: PurchaseStatus,
    description: '购买状态',
    required: false,
  })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;
}