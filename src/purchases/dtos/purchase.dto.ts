import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import {
  Environment,
  JWSTransactionDecodedPayload,
} from '@apple/app-store-server-library';

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
  IOS = 'ios',
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
  uid: string;

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

  @ApiProperty({
    example: '{}',
    description: '交易数据',
  })
  @IsNotEmpty()
  payload: JWSTransactionDecodedPayload;


  @ApiProperty(
    {
      example: 'Sandbox',
      enum: Environment,
      description: '环境',
    },
  )
  @IsNotEmpty()
  @IsString()
  environment: Environment;

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

export class ExportPurchaseDto {
  @Expose()
  uid: string;

  @Expose()
  productId: string;

  @Expose()
  transactionId: string;

  @Expose()
  purchaseDate: Date;

  @Expose()
  environment: Environment;

  // 平台
  @Expose()
  platform: Platform;

  @Exclude()
  payload: JWSTransactionDecodedPayload;
}

export class ValidatePurchaseResponseDto {

  @Expose()
  isNewOrder: boolean;

  @Expose()
  message: string;

  @Expose()
  @Type(() => ExportPurchaseDto)
  purchase: ExportPurchaseDto;
}

