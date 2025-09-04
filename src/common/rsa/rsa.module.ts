import { Module } from '@nestjs/common';
import { RSAService } from './rsa.service';
import { RsaController } from './rsa.controller';

@Module({
  controllers: [RsaController],
  providers: [RSAService],
  exports: [RSAService],
})
export class RsaModule {}