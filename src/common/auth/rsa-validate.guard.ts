import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { uniq } from 'lodash';
import { Reflector } from '@nestjs/core';
import { RSAService } from '../rsa/rsa.service';
import { config } from '../../../config';
// config
const { enable } = config.rsa;


@Injectable()
export class RSAValidateGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rsaService: RSAService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    let rsaFields = this.getRsaFields(context);
    // skip
    if (rsaFields.length === 0 || enable === false) {
      return true;
    }

    // 强制添加 时间戳 timestamp
    rsaFields = rsaFields.concat('_timestamp');

    const request = context.switchToHttp().getRequest();
    const body = request.body || {};
    const headers = request.headers || {};

    // Check for mock skip
    if (body['_mockPokerScanAPIAllowRSA']) {
      return body['_mockPokerScanAPIAllowRSA'];
    }

    // Get RSA Data (Body -> Header)
    const rsaData = body.rsaData || headers['rsa-data'] || headers['rsadata'];
    if (!rsaData) {
      throw new BadRequestException('rsaData is required for RSA validation');
    }

    const validationData: { [key: string]: any } = {};

    // Collect data for all fields
    for (const field of rsaFields) {
      let value: any;

      if (field.startsWith('header:')) {
        // Explicit header field
        const headerKey = field.split(':')[1];
        value = headers[headerKey.toLowerCase()]; // Headers are usually lowercase in Node.js
      } else {
        // Try body first, then header
        value = body[field];
        if (value === undefined || value === null) {
          value = headers[field.toLowerCase()];
        }
      }

      // Missing field check
      if (value === undefined || value === null) {
        throw new BadRequestException(`Missing required field for RSA validation: ${field}`);
      }

      validationData[field] = value;
    }

    // Timestamp check
    const timestampInRSA: number = parseInt(validationData['_timestamp']);
    if (isNaN(timestampInRSA)) {
        throw new BadRequestException(`Invalid timestamp format`);
    }
    
    // 判断 timestampInRSA 必须 与 now 相差在 5 分钟内
    const now = Date.now();
    if (Math.abs(now - timestampInRSA) > 5 * 60 * 1000) {
      throw new BadRequestException(`RSA 数据验证失败: Timestamp expired`);
    }

    const isRSAValid = this.rsaService.checkDataWithRSAFields(validationData, rsaFields, rsaData);
    
    if (!isRSAValid) {
      throw new BadRequestException('RSA 数据验证失败');
    }

    return true;
  }


  getRsaFields(context: ExecutionContext): string[] {
    const methodHandleRsaFields =
      this.reflector.get<string[]>('rsa-fields', context.getHandler()) || [];

    const clsHandleRsaFields =
      this.reflector.get<string[]>('rsa-fields', context.getClass()) || [];

    return uniq([...clsHandleRsaFields, ...methodHandleRsaFields]);
  }
}
