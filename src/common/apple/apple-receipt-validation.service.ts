import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { config } from '../../../config';


import {
  AppleReceiptValidationResponse,
  InAppPurchase,
  PurchaseValidationResult, 
  RestorePurchasesResult,
  AppleEnvironment,
 } from './dtos';


@Injectable()
export class AppleReceiptValidationService {
  private readonly logger = new Logger('app:AppleReceiptValidationService');
  
  // Apple 验证服务器 URL
  private readonly PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
  private readonly SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

  // Apple 共享密钥
  private readonly APPLE_SHARED_SECRET = config.apple.sharedSecret;
  
  constructor(private readonly httpService: HttpService) {}

  /**
   * 将 Apple API 返回的环境字符串转换为 AppleEnvironment 枚举
   * @param appleEnvironment Apple API 返回的环境字符串
   * @returns AppleEnvironment 枚举值
   */
  private convertAppleEnvironment(appleEnvironment: 'Sandbox' | 'Production'): AppleEnvironment {
    return appleEnvironment.toLowerCase() === 'sandbox' ? AppleEnvironment.SANDBOX : AppleEnvironment.PRODUCTION;
  }

  /**
   * 验证 Apple 内购收据
   * 
   * 这是主要的验证方法，支持两种验证策略：
   * 1. 优先生产环境验证，失败时自动降级到沙箱环境
   * 2. 根据传入的环境参数指定验证环境
   * 
   * Apple 推荐的最佳实践：
   * - 始终先尝试生产环境验证
   * - 如果返回状态码 21007（沙箱收据在生产环境验证），则切换到沙箱环境
   * - 验证成功后，检查收据中的 environment 字段确认实际环境
   * 
   * @param receiptData Base64 编码的收据数据
   * @param environment 可选的环境指定，不传则自动检测
   * @returns 验证结果
   */
  async validateReceipt(
    receiptData: string, 
    environment?: AppleEnvironment
  ): Promise<PurchaseValidationResult> {
    try {
      // 如果指定了环境，直接验证
      if (environment) {
        return await this.validateReceiptWithEnvironment(receiptData, environment);
      }

      // 自动检测环境：优先生产环境，失败时降级沙箱
      try {
        // 首先尝试生产环境验证
        this.logger.log('开始生产环境收据验证');
        return await this.validateReceiptWithEnvironment(receiptData, AppleEnvironment.PRODUCTION);
      } catch (error) {
        // 如果是沙箱收据在生产环境验证错误（状态码21007），切换到沙箱
        if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
          const errorMessage = error.message;
          if (errorMessage.includes('21007') || errorMessage.includes('sandbox')) {
            this.logger.log('检测到沙箱收据，切换到沙箱环境验证');
            return await this.validateReceiptWithEnvironment(receiptData, AppleEnvironment.SANDBOX);
          }
        }
        throw error;
      }
    } catch (error) {
      this.logger.error('收据验证失败', error);
      throw new BadRequestException(`收据验证失败: ${error.message}`);
    }
  }

  /**
   * 恢复购买验证
   * 
   * 恢复购买是指用户在新设备上或重新安装应用后，
   * 重新获取之前购买的非消耗型产品和有效订阅的过程。
   * 
   * 验证逻辑：
   * 1. 验证收据有效性
   * 2. 提取所有有效的内购交易
   * 3. 过滤掉已过期的订阅
   * 4. 返回所有可恢复的购买记录
   * 
   * @param receiptData Base64 编码的收据数据
   * @returns 恢复购买结果，包含所有有效的购买记录
   */
  async restorePurchases(receiptData: string): Promise<RestorePurchasesResult> {
    try {
      this.logger.log('开始恢复购买验证');
      
      // 首先验证收据
      const validationResponse = await this.callAppleVerificationAPI(receiptData, AppleEnvironment.PRODUCTION);
      
      // 如果是沙箱收据，切换到沙箱环境
      if (validationResponse.status === 21007) {
        this.logger.log('检测到沙箱收据，切换到沙箱环境');
        const sandboxResponse = await this.callAppleVerificationAPI(receiptData, AppleEnvironment.SANDBOX);
        return this.extractRestorablePurchases(sandboxResponse);
      }
      
      if (validationResponse.status !== 0) {
        throw new BadRequestException(`收据验证失败，状态码: ${validationResponse.status}`);
      }

      return this.extractRestorablePurchases(validationResponse);
    } catch (error) {
      this.logger.error('恢复购买失败', error);
      return {
        isValid: false,
        purchases: [],
        errorMessage: `恢复购买失败: ${error.message}`
      };
    }
  }

  /**
   * 指定环境验证收据
   * 
   * @param receiptData Base64 编码的收据数据
   * @param environment 验证环境
   * @returns 验证结果
   */
  private async validateReceiptWithEnvironment(
    receiptData: string, 
    environment: AppleEnvironment
  ): Promise<PurchaseValidationResult> {
    
    const response = await this.callAppleVerificationAPI(receiptData, environment);
    
    // 检查验证状态
    if (response.status !== 0) {
      const errorMessage = this.getErrorMessage(response.status);
      throw new BadRequestException(`收据验证失败: ${errorMessage} (状态码: ${response.status})`);
    }

    // 提取最新的有效交易
    const latestTransaction = this.extractLatestValidTransaction(response);
    
    return {
      isValid: true,
      transactionId: latestTransaction.transaction_id,
      productId: latestTransaction.product_id,
      purchaseDate: new Date(parseInt(latestTransaction.purchase_date_ms)),
      expiresDate: latestTransaction.expires_date_ms ? 
        new Date(parseInt(latestTransaction.expires_date_ms)) : undefined,
      originalTransactionId: latestTransaction.original_transaction_id,
      isSubscription: !!latestTransaction.expires_date,
      environment: this.convertAppleEnvironment(response.environment),
      bundleId: response.receipt.bundle_id
    };
  }

  /**
   * 调用 Apple 验证 API
   * 
   * @param receiptData Base64 编码的收据数据
   * @param environment 验证环境
   * @returns Apple 验证响应
   */
  private async callAppleVerificationAPI(
    receiptData: string, 
    environment: AppleEnvironment
  ): Promise<AppleReceiptValidationResponse> {
    
    const url = environment === AppleEnvironment.PRODUCTION ? this.PRODUCTION_URL : this.SANDBOX_URL;
    
    // 构建请求体
    const requestBody = {
      'receipt-data': receiptData,
      'password': this.APPLE_SHARED_SECRET, // App Store Connect 中配置的共享密钥
      'exclude-old-transactions': true // 排除旧交易，提高性能
    };

    this.logger.log(`向 Apple ${environment} 环境发送验证请求`);
    
    try {
      const response = await firstValueFrom(
        this.httpService.post<AppleReceiptValidationResponse>(url, requestBody, {
          timeout: 10000, // 10秒超时
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      this.logger.log(`Apple ${environment} 环境返回状态码: ${response.data.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Apple ${environment} 环境验证请求失败`, error);
      throw new HttpException(
        `Apple 验证服务请求失败: ${error.message}`, 
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * 提取最新的有效交易
   * 
   * 对于订阅产品，Apple 会返回多个交易记录（历史续订记录）
   * 我们需要找到最新的有效交易
   * 
   * @param response Apple 验证响应
   * @returns 最新的有效交易
   */
  private extractLatestValidTransaction(response: AppleReceiptValidationResponse): InAppPurchase {
    // 优先使用 latest_receipt_info（主要包含订阅信息）
    const transactions = response.latest_receipt_info || response.receipt.in_app;
    
    if (!transactions || transactions.length === 0) {
      throw new BadRequestException('收据中未找到有效的交易记录');
    }

    // 按购买日期降序排序，获取最新交易
    const sortedTransactions = transactions.sort((a, b) => 
      parseInt(b.purchase_date_ms) - parseInt(a.purchase_date_ms)
    );

    // 对于订阅产品，检查是否过期
    const latestTransaction = sortedTransactions[0];
    
    // 如果是订阅产品且已过期，查找下一个有效交易
    if (latestTransaction.expires_date_ms) {
      const expiresDate = new Date(parseInt(latestTransaction.expires_date_ms));
      const now = new Date();
      
      if (expiresDate <= now && !latestTransaction.cancellation_date) {
        // 订阅已过期且未被取消，查找其他有效订阅
        const validSubscription = sortedTransactions.find(transaction => {
          if (!transaction.expires_date_ms) return false;
          const expires = new Date(parseInt(transaction.expires_date_ms));
          return expires > now && !transaction.cancellation_date;
        });
        
        if (!validSubscription) {
          throw new BadRequestException('所有订阅均已过期');
        }
        
        return validSubscription;
      }
    }

    return latestTransaction;
  }

  /**
   * 提取可恢复的购买记录
   * 
   * 恢复购买时需要返回所有有效的购买记录，包括：
   * 1. 非消耗型产品（永久有效）
   * 2. 有效的订阅产品
   * 
   * @param response Apple 验证响应
   * @returns 恢复购买结果
   */
  private extractRestorablePurchases(response: AppleReceiptValidationResponse): RestorePurchasesResult {
    const allTransactions = [
      ...(response.receipt.in_app || []),
      ...(response.latest_receipt_info || [])
    ];

    if (allTransactions.length === 0) {
      return {
        isValid: true,
        purchases: [],
        errorMessage: '未找到可恢复的购买记录'
      };
    }

    const now = new Date();
    const validPurchases: PurchaseValidationResult[] = [];
    
    // 用于去重的 Set
    const processedTransactions = new Set<string>();

    allTransactions.forEach(transaction => {
      // 避免重复处理相同交易
      if (processedTransactions.has(transaction.transaction_id)) {
        return;
      }
      processedTransactions.add(transaction.transaction_id);

      // 检查是否为有效交易
      let isValid = true;
      
      // 如果是订阅产品，检查是否过期
      if (transaction.expires_date_ms) {
        const expiresDate = new Date(parseInt(transaction.expires_date_ms));
        isValid = expiresDate > now && !transaction.cancellation_date;
      }
      
      // 如果交易被取消，则无效
      if (transaction.cancellation_date) {
        isValid = false;
      }

      if (isValid) {
        validPurchases.push({
          isValid: true,
          transactionId: transaction.transaction_id,
          productId: transaction.product_id,
          purchaseDate: new Date(parseInt(transaction.purchase_date_ms)),
          expiresDate: transaction.expires_date_ms ? 
            new Date(parseInt(transaction.expires_date_ms)) : undefined,
          originalTransactionId: transaction.original_transaction_id,
          isSubscription: !!transaction.expires_date,
          environment: this.convertAppleEnvironment(response.environment),
          bundleId: response.receipt.bundle_id
        });
      }
    });

    return {
      isValid: true,
      purchases: validPurchases
    };
  }

  /**
   * 根据状态码获取错误信息
   * 
   * Apple 验证 API 返回的常见状态码说明
   * 
   * @param status 状态码
   * @returns 错误信息
   */
  private getErrorMessage(status: number): string {
    const errorMessages: Record<number, string> = {
      21000: '收据数据格式错误',
      21002: '收据数据格式错误',
      21003: '收据无法认证',
      21004: '提供的共享密钥与账户记录不匹配',
      21005: '收据服务器暂时不可用',
      21006: '收据有效但订阅已过期',
      21007: '收据来自沙箱环境，但发送到了生产环境验证',
      21008: '收据来自生产环境，但发送到了沙箱环境验证',
      21009: '内部数据访问错误',
      21010: '用户账户无法找到或已删除'
    };

    return errorMessages[status] || `未知错误 (状态码: ${status})`;
  }
}