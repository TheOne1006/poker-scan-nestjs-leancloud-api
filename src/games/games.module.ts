import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SequelizeModule } from '@nestjs/sequelize';
import { RSAService } from '../common/rsa/rsa.service';
import { Game } from './games.entity';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { RefreshableCacheInterceptor } from '../core/interceptors';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 * 1000,
    }),
    SequelizeModule.forFeature([Game]),
  ],
  controllers: [GamesController],
  providers: [GamesService, RSAService, RefreshableCacheInterceptor],
  exports: [GamesService],
})
export class GamesModule {}
