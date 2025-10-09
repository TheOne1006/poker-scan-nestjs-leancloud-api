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
import { Environment } from '@apple/app-store-server-library';

import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { Roles, SerializerClass, User } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';

import { PurchaseService } from './purchase.service';
import { AppleTransactionValidationService } from '../common/apple/apple-transaction-validation.service';
import { UsersService } from '../users/users.service';

import {
  PurchaseSignedTransactionValidationRequestDto,
  RestorePurchasesRequestDto,
  PurchaseValidationResponseDto,
  RestorePurchasesResponseDto,
  Platform,
  PurchaseStatus,
  PurchaseCreateDto,
  ValidatePurchaseResponseDto,
} from './dtos';

import { purchaseProjects, ProductItem } from './purchase.products.connstants'


@Controller('api/purchases')
@ApiTags('purchases')
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
@Roles(ROLE_USER)
@UseInterceptors(SerializerInterceptor)
export class PurchaseController {
  private readonly logger = new Logger('app:PurchaseController');

  constructor(
    private readonly service: PurchaseService,
    private readonly usersService: UsersService,
    private readonly appleTransactionValidationService: AppleTransactionValidationService,
  ) {}

  // 检查项目是否有效
  private checkPurchaseProduct(productId: string): ProductItem {
    const item = purchaseProjects.find(p => p.productId === productId);
    if (!item) {
      throw new Error('找不到有效的项目');
    }
    return item;
  }

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
  @SerializerClass(ValidatePurchaseResponseDto)
  async validatePurchase(
    @Body() dto: PurchaseSignedTransactionValidationRequestDto,
    @User() user: RequestUser,
  ): Promise<ValidatePurchaseResponseDto> {

    const userIns = await this.usersService.findByPk(user.id);

    const { signedTransactionInfo, transactionId, platform, productId } = dto

    const product = this.checkPurchaseProduct(productId);

    if (!userIns) {
      throw new HttpException(
        `用户不存在`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (platform !== Platform.IOS) {
      // 其他平台的验证逻辑可以在这里添加
      throw new HttpException(
        `暂不支持 ${platform} 平台的验证`,
        HttpStatus.BAD_REQUEST
      );
    }

      // 查看 数据库中是否存在
      const ins = await this.service.findOne({ transactionId })

      if (ins) {
        return {
          isNewOrder: false,
          message: '交易已完成',
          purchase: ins
        }
      }

      const transactionPayload = await this.appleTransactionValidationService.validateTransactionComplete(
        signedTransactionInfo,
        transactionId,
      )

      const userUid = userIns.get('uid') as string;

      if (transactionPayload.appAccountToken !== userUid) {
        throw new HttpException(
          `验证失败`,
          HttpStatus.BAD_REQUEST
        );
      }

      // 保存到数据库
      const createDto: PurchaseCreateDto = {
        userId: user.id,
        productId: transactionPayload.productId,
        transactionId: transactionPayload.transactionId,
        payload: transactionPayload,
        environment: transactionPayload.environment as Environment,
        platform: Platform.IOS,
        status: PurchaseStatus.COMPLETED,
        purchaseDate: new Date(transactionPayload.purchaseDate),
      }

      // 保存到数据库
      const result = await this.service.create(createDto)

      // 处理 user
      await this.usersService.updateVipDate(userIns, product.vipDays)

      return {
        isNewOrder: true,
        message: 'vip 订单完成',
        purchase: result
      }
    }
}