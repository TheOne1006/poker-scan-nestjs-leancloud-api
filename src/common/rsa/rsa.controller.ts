import {
  Controller,
  Post,
  Get,
  Body,
  Logger,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RSAService } from './rsa.service';

import { SerializerInterceptor } from '../interceptors/serializer.interceptor';

import { AnyDto } from './any.dto';

@Controller('api/rsa')
@ApiTags('rsa')
@UseInterceptors(SerializerInterceptor)
export class RsaController {
  private readonly logger = new Logger('app:RsaController');
  
  constructor(
    protected readonly service: RSAService,
  ) {}


  @Post('/encrypt')
  @ApiOperation({
    summary: '加密数据',
  })
  encrypt(@Body() dto: AnyDto): string {
    return this.service.encrypt(JSON.stringify(dto));
  }
}