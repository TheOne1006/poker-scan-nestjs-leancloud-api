import { Injectable, BadRequestException } from '@nestjs/common';
import { AppleEnvironment, PurchaseValidationResult } from './dtos';
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import { lastValueFrom } from 'rxjs';

import {
  // SignedDataVerifier,
  Environment,
  JWSTransactionDecodedPayload,
  // AppleRootCerts
} from '@apple/app-store-server-library';

import { config } from '../../../config';

/**
 * Apple App Store Server API - JWS 交易校验
 */
@Injectable()
export class AppleTransactionValidationService {

  // private clientId: string = config.apple.clientID;
  private keyId: string = config.apple.iap.keyId;
  private issuerId: string = config.apple.iap.issuerId;
  private bundleId: string = config.apple.clientID;
  private privateKeyPem: string;
  // private signedDataVerifier: SignedDataVerifier;
  // = config.apple.iap.privateKeyString;

  constructor(private readonly http: HttpService) {

    // 转换成 pem 格式
    const moreLine = config.apple.iap.privateKeyString
      .replace(/(.{64})/g, '$1\n'); // 每64字符添加换行

    // 前后添加 换行
    this.privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${moreLine}\n-----END PRIVATE KEY-----`;
  }


  // 校验两种 transactionPayload
  private checkTransactionPayloadSame(payload: JWSTransactionDecodedPayload, serverPayload: JWSTransactionDecodedPayload, withoutKeys: string[] = ['signedDate']): boolean {
    // 遍历 serverPayload 以 serverPayload 为准
    for (const key in serverPayload) {
      if (serverPayload.hasOwnProperty(key)) {
        if (withoutKeys.includes(key)) {
          continue;
        }

        if (payload[key] !== serverPayload[key]) {
          console.error(`payload[${key}] 不一致: ` + payload[key] + ' != ' + serverPayload[key])

          return false;
        }
      }
    }

    return true;
  }

  // 完整的交易校验流程
  async validateTransactionComplete(signedTransactionInfo: string, transactionId: string): Promise<JWSTransactionDecodedPayload> {
    try {
      // 1. 解码 JWS
      const payload = this.decodeJWSPayload(signedTransactionInfo)

      if (payload.transactionId !== transactionId) {
        throw new BadRequestException('交易ID不一致');
      }

      // 2. 获取 online transaction
      const transactionPayload = await this.verifyTransactionWithApple(payload.transactionId, payload.environment as Environment);


      // 3. 校验交易信息是否一致
      if (!this.checkTransactionPayloadSame(payload, transactionPayload)) {
        throw new BadRequestException('交易信息不一致');
      }

      return payload;
    } catch (error) {
      console.error('解码 JWS 失败:', error);
      throw new BadRequestException('无效的 JWS 格式');
    }
  }

  // 手动解码 JWS payload（不验证签名）
  private decodeJWSPayload(jws: string): JWSTransactionDecodedPayload {
    const parts = jws.split('.');
    if (parts.length !== 3) {
      throw new Error('无效的 JWS 格式 decodeJWSPayload 解析失败');
    }

    // 即系
    const [encodedHeader, payload, signature] = parts

    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  }

  // 通过 App Store Server API 验证交易状态
  async verifyTransactionWithApple(transactionId: string, environment: Environment): Promise<JWSTransactionDecodedPayload> {
    const baseUrl = environment === Environment.SANDBOX ? 'https://api.storekit-sandbox.itunes.apple.com' : 'https://api.storekit.itunes.apple.com';

    const url = `${baseUrl}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`;

    const token = this.buildAppStoreJwt({
      keyId: this.keyId,
      issuerId: this.issuerId,
      bundleId: this.bundleId,
      privateKeyPem: this.privateKeyPem,
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // console.log('查询交易URL:', url);
    const response = await lastValueFrom(this.http.get(url, { headers }));

    if (response.data && response.data.signedTransactionInfo) {
      // 解码返回的交易信息
      const transactionPayload = this.decodeJWSPayload(response.data.signedTransactionInfo);

      // console.log('=== Apple 服务器返回的交易信息 ===');
      // // console.log('交易状态:', 'VALID'); // 能查到就说明有效
      // console.log('交易ID:', transactionPayload.transactionId);
      // console.log('产品ID:', transactionPayload.productId);
      // console.log('购买时间:', new Date(transactionPayload.purchaseDate));
      // console.log('完整信息:', JSON.stringify(transactionPayload, null, 2));

      return transactionPayload
    } else {
      throw new BadRequestException('无效的 JWS 格式 verifyTransactionWithApple 解析失败');
    }
  }

  /**
   * 生成用于调用 App Store Server API 的 ES256 JWT
   * options:
   * - keyId(kid): App Store Connect 密钥的 Key ID
   * - issuerId(iss): App Store Connect Issuer ID
   * - bundleId(bid): 你的 App Bundle ID
   * - privateKeyPem: .p8 私钥内容（字符串）
   * - expiresInSeconds?: 令牌有效期（默认 3600s）
   */
  private buildAppStoreJwt(options: {
    keyId: string;
    issuerId: string;
    bundleId: string;
    privateKeyPem: string;
    expiresInSeconds?: number;
  }): string {
    const { keyId, issuerId, bundleId, privateKeyPem, expiresInSeconds = 3600 } = options;
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      iss: issuerId,
      iat: nowSec,
      exp: nowSec + expiresInSeconds,
      aud: 'appstoreconnect-v1',
      bid: bundleId,
    };

    return jwt.sign(payload, privateKeyPem, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
        typ: 'JWT',
      },
    });
  }

  /**
   * 获取交易历史（App Store Server API v1）
   * - transactionId: 目标交易 ID
   * - env: AppleEnvironment（决定 sandbox 或 production 端点）
   * - auth: JWT 构建参数
   */
  async getTransactionHistory(
    transactionId: string,
    env: AppleEnvironment,
    auth: {
      keyId: string;
      issuerId: string;
      bundleId: string;
      privateKeyPem: string;
    },
  ): Promise<any> {
    const baseUrl =
      env === AppleEnvironment.SANDBOX
        ? 'https://api.storekit-sandbox.itunes.apple.com'
        : 'https://api.storekit.itunes.apple.com';

    const url = `${baseUrl}/inApps/v1/history/${encodeURIComponent(transactionId)}`;
    const token = this.buildAppStoreJwt({
      keyId: auth.keyId,
      issuerId: auth.issuerId,
      bundleId: auth.bundleId,
      privateKeyPem: auth.privateKeyPem,
    });

    const headers = { Authorization: `Bearer ${token}` };

    const resp = await lastValueFrom(this.http.get(url, { headers }));
    return resp?.data;
  }
}