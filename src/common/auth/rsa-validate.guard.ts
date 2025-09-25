import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { uniq } from 'lodash';
import { Reflector } from '@nestjs/core';
import { RSAService } from '../rsa/rsa.service';

@Injectable()
export class RSAValidateGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rsaService: RSAService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rsaFields = this.getRsaFields(context);
    if (rsaFields.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Request body is required for RSA validation');
    }

    const { rsaData, ...dataWithoutRSA } = body;

    if (dataWithoutRSA['_mockPokerScanAPIAllowRSA']) {
      return dataWithoutRSA['_mockPokerScanAPIAllowRSA'];
    }


    if (!rsaData) {
      throw new BadRequestException('rsaData is required for RSA validation');
    }

    const isRSAValid = this.rsaService.checkDataWithRSAFields(dataWithoutRSA, rsaFields, rsaData);
    
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
