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
import { AppleTransactionValidationService } from '../common/apple/apple-transaction-validation.service';

import {
  PurchaseSignedTransactionValidationRequestDto,
  RestorePurchasesRequestDto,
  PurchaseValidationResponseDto,
  RestorePurchasesResponseDto,
  Platform,
  PurchaseStatus,
  PurchaseCreateDto,
} from './dtos';

@Controller('api/purchases')
@ApiTags('purchases')
// @UseGuards(RolesGuard)
// @ApiBearerAuth('access-token')
// @Roles(ROLE_USER)
@UseInterceptors(SerializerInterceptor)
export class PurchaseController {
  private readonly logger = new Logger('app:PurchaseController');

  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly appleTransactionValidationService: AppleTransactionValidationService,
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
  // @UseGuards(RolesGuard)
  // @ApiBearerAuth('access-token')
  // @Roles(ROLE_USER)
  // @SerializerClass(PurchaseValidationResponseDto)
  async validatePurchase(
    @Body() dto: PurchaseSignedTransactionValidationRequestDto,
    // @User() user: RequestUser,
  ): Promise<any> {
    try {
      // this.logger.log(`用户 ${user.id} 开始验证 ${dto.platform} 平台的内购凭证`);

      // 检查是否已存在相同的交易记录（避免重复处理）
      if (dto.platform === Platform.APPLE) {

        const { signedTransactionInfo } = dto
        await this.appleTransactionValidationService.validateSignedTransaction(
          signedTransactionInfo
        )

        return {
          success: true,
          message: '验证成功'
        }
      }

      // 其他平台的验证逻辑可以在这里添加
      throw new HttpException(
        `暂不支持 ${dto.platform} 平台的验证`,
        HttpStatus.BAD_REQUEST
      );

    } catch (error) {
      // this.logger.error(`用户 ${user.id} 内购验证失败:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        message: `验证失败: ${error.message}`,
      };
    }
  }
}