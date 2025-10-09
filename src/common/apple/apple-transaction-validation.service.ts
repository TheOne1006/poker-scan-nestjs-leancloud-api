import { Injectable } from '@nestjs/common';
import { AppleEnvironment, PurchaseValidationResult } from './dtos';
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { lastValueFrom } from 'rxjs';

/**
 * Apple App Store Server API - JWS 交易校验
 */
@Injectable()
export class AppleTransactionValidationService {

  // private clientId: string = config.apple.clientID;
  private keyId: string = config.apple.iap.keyId;
  private issuerId: string = config.apple.iap.issuerId;
  private bundleId: string = config.apple.clientID;
  private privateKeyPem: string = config.apple.iap.privateKeyString;


  constructor(private readonly http: HttpService) {
    // KID
    // ISSID
    // KEY_DATA
  }


  async validateSignedTransaction(signedTransactionInfo: string)  {


    let token = this.buildAppStoreJwt({
      keyId: this.keyId,
      issuerId: this.issuerId,
      bundleId: this.bundleId,
      privateKeyPem: this.privateKeyPem
    })

    console.log(token)

  }




  /**
   * 映射环境字符串至枚举
   */
  private mapEnvironment(env: string): AppleEnvironment {
    const normalized = String(env || '').toLowerCase();
    if (normalized.includes('sandbox')) return AppleEnvironment.SANDBOX;
    return AppleEnvironment.PRODUCTION;
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