import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { Roles, SerializerClass, User } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';

import { PurchaseService } from './purchase.service';
import { AppleReceiptValidationService } from '../common/apple/apple-receipt-validation.service';

import {
  PurchaseValidationRequestDto,
  RestorePurchasesRequestDto,
  PurchaseValidationResponseDto,
  RestorePurchasesResponseDto,
  Platform,
  PurchaseStatus,
  PurchaseCreateDto,
} from './dtos';

@Controller('api/purchases')
@ApiTags('purchases')
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@Roles(ROLE_USER)
@UseInterceptors(SerializerInterceptor)
export class PurchaseController {
  private readonly logger = new Logger('app:PurchaseController');

  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly appleValidationService: AppleReceiptValidationService,
  ) {}

  /**
   * 验证内购凭证
   * 
   * 流程：
   * 1. 验证请求参数
   * 2. 根据平台调用相应的验证服务
   * 3. 将验证成功的购买记录保存到数据库
   * 4. 返回验证结果
   */
  @Post('validate')
  @ApiOperation({
    summary: '验证内购凭证',
    description: '验证用户购买凭证的有效性，支持 Apple 内购验证',
  })
  @ApiResponse({
    status: 200,
    description: '验证成功',
    type: PurchaseValidationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '验证失败或参数错误',
  })
  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(ROLE_USER)
  @SerializerClass(PurchaseValidationResponseDto)
  async validatePurchase(
    @Body() dto: PurchaseValidationRequestDto,
    @User() user: RequestUser,
  ): Promise<PurchaseValidationResponseDto> {
    try {
      this.logger.log(`用户 ${user.id} 开始验证 ${dto.platform} 平台的内购凭证`);

      // 检查是否已存在相同的交易记录（避免重复处理）
      if (dto.platform === Platform.APPLE) {
        const validationResult = await this.appleValidationService.validateReceipt(
          dto.receiptData,
          dto.environment
        );

        if (!validationResult.isValid) {
          return {
            success: false,
            message: validationResult.errorMessage || '凭证验证失败',
          };
        }

        // 检查是否已存在该交易记录
        const existingPurchase = await this.purchaseService.findByTransactionId(
          validationResult.transactionId
        );

        if (existingPurchase) {
          this.logger.log(`交易 ${validationResult.transactionId} 已存在，返回现有记录`);
          return {
            success: true,
            transactionId: validationResult.transactionId,
            productId: validationResult.productId,
            purchaseDate: validationResult.purchaseDate,
            expiresDate: validationResult.expiresDate,
            isSubscription: validationResult.isSubscription,
            environment: validationResult.environment,
            message: '凭证验证成功（已存在记录）',
            purchaseId: existingPurchase.get('objectId'),
          };
        }

        // 创建新的购买记录
        const createDto: PurchaseCreateDto = {
          userId: user.id,
          productId: validationResult.productId,
          transactionId: validationResult.transactionId,
          platform: Platform.APPLE,
          purchaseDate: validationResult.purchaseDate,
          expiresDate: validationResult.expiresDate,
          status: PurchaseStatus.COMPLETED,
        };

        const purchaseRecord = await this.purchaseService.create(createDto);

        this.logger.log(`用户 ${user.id} 内购验证成功，交易ID: ${validationResult.transactionId}`);

        return {
          success: true,
          transactionId: validationResult.transactionId,
          productId: validationResult.productId,
          purchaseDate: validationResult.purchaseDate,
          expiresDate: validationResult.expiresDate,
          isSubscription: validationResult.isSubscription,
          environment: validationResult.environment,
          message: '凭证验证成功',
          purchaseId: purchaseRecord.get('objectId'),
        };
      }

      // 其他平台的验证逻辑可以在这里添加
      throw new HttpException(
        `暂不支持 ${dto.platform} 平台的验证`,
        HttpStatus.BAD_REQUEST
      );

    } catch (error) {
      this.logger.error(`用户 ${user.id} 内购验证失败:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        message: `验证失败: ${error.message}`,
      };
    }
  }

  /**
   * 恢复购买
   * 
   * 流程：
   * 1. 验证请求参数
   * 2. 根据平台调用相应的恢复购买服务
   * 3. 将恢复的购买记录同步到数据库
   * 4. 返回恢复结果
   */
  @Post('restore')
  @ApiOperation({
    summary: '恢复购买',
    description: '恢复用户之前的购买记录，通常用于重新安装应用或更换设备后',
  })
  @ApiResponse({
    status: 200,
    description: '恢复成功',
    type: RestorePurchasesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '恢复失败或参数错误',
  })
  @SerializerClass(RestorePurchasesResponseDto)
  async restorePurchases(
    @Body() dto: RestorePurchasesRequestDto,
    @User() user: RequestUser,
  ): Promise<RestorePurchasesResponseDto> {
    try {
      this.logger.log(`用户 ${user.id} 开始恢复 ${dto.platform} 平台的购买记录`);

      if (dto.platform === Platform.APPLE) {
        const restoreResult = await this.appleValidationService.restorePurchases(dto.receiptData);

        if (!restoreResult.isValid) {
          return {
            success: false,
            count: 0,
            purchases: [],
            message: restoreResult.errorMessage || '恢复购买失败',
          };
        }

        const restoredPurchases: PurchaseValidationResponseDto[] = [];

        // 处理每个恢复的购买记录
        for (const purchase of restoreResult.purchases) {
          try {
            // 检查是否已存在该交易记录
            const existingPurchase = await this.purchaseService.findByTransactionId(
              purchase.transactionId
            );

            let purchaseId: string;

            if (existingPurchase) {
              this.logger.log(`交易 ${purchase.transactionId} 已存在，更新记录`);
              
              // 更新现有记录（如果需要）
              await this.purchaseService.updateStatus(
                existingPurchase.get('objectId'),
                purchase.transactionId,
                PurchaseStatus.COMPLETED
              );
              
              purchaseId = existingPurchase.get('objectId');
            } else {
              // 创建新的购买记录
              const createDto: PurchaseCreateDto = {
                userId: user.id,
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                platform: Platform.APPLE,
                purchaseDate: purchase.purchaseDate,
                expiresDate: purchase.expiresDate,
                status: PurchaseStatus.COMPLETED,
              };

              const newPurchase = await this.purchaseService.create(createDto);
              purchaseId = newPurchase.get('objectId');
              
              this.logger.log(`为用户 ${user.id} 创建新的购买记录: ${purchase.transactionId}`);
            }

            restoredPurchases.push({
              success: true,
              transactionId: purchase.transactionId,
              productId: purchase.productId,
              purchaseDate: purchase.purchaseDate,
              expiresDate: purchase.expiresDate,
              isSubscription: purchase.isSubscription,
              environment: purchase.environment,
              message: '恢复成功',
              purchaseId,
            });

          } catch (error) {
            this.logger.error(`处理交易 ${purchase.transactionId} 时出错:`, error);
            
            // 即使单个记录处理失败，也继续处理其他记录
            restoredPurchases.push({
              success: false,
              transactionId: purchase.transactionId,
              productId: purchase.productId,
              message: `处理失败: ${error.message}`,
            });
          }
        }

        const successCount = restoredPurchases.filter(p => p.success).length;

        this.logger.log(`用户 ${user.id} 恢复购买完成，成功 ${successCount} 条记录`);

        return {
          success: true,
          count: successCount,
          purchases: restoredPurchases,
          message: `成功恢复 ${successCount} 个购买记录`,
        };
      }

      // 其他平台的恢复逻辑可以在这里添加
      throw new HttpException(
        `暂不支持 ${dto.platform} 平台的恢复购买`,
        HttpStatus.BAD_REQUEST
      );

    } catch (error) {
      this.logger.error(`用户 ${user.id} 恢复购买失败:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        count: 0,
        purchases: [],
        message: `恢复失败: ${error.message}`,
      };
    }
  }
}