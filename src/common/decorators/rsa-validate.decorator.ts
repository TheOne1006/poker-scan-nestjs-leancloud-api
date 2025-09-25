import { SetMetadata } from '@nestjs/common';

/**
 * 标记需要进行 RSA 数据校验的路由
 */
export const RSAFields = (...fields: string[]) => SetMetadata('rsa-fields', fields);
