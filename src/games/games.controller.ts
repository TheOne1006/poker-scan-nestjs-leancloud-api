import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SerializerClass } from '../common/decorators';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { RefreshableCacheInterceptor, CacheKeyBy } from '../core/interceptors';

import { GamesService } from './games.service';
import { GamePreviewDto, GameDto } from './dtos';

@Controller('api/games')
@ApiTags('games')
@UseInterceptors(SerializerInterceptor)
export class GamesController {
  constructor(private readonly service: GamesService) {}

  @Get()
  @ApiOperation({ summary: '游戏配置预览列表' })
  @ApiQuery({ name: 'supportAppVersion', required: true })
  @UseInterceptors(RefreshableCacheInterceptor)
  @CacheKeyBy({ query: ['supportAppVersion'] })
  @CacheTTL(60 * 60 * 1000)
  @SerializerClass(GamePreviewDto)
  async list(
    @Query('supportAppVersion', ParseIntPipe) supportAppVersion: number,
  ) {
    const result = await this.service.list(supportAppVersion);
    return result;
  }

  @Get('/:id')
  @ApiOperation({ summary: '游戏配置详情' })
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(RefreshableCacheInterceptor)
  @CacheKeyBy({ params: ['id'] })
  @CacheTTL(60 * 60 * 1000)
  @SerializerClass(GameDto)
  async detail(@Param('id') id: string) {
    return this.service.findByPk(id);
  }

  @Get('/:id/download')
  @ApiOperation({ summary: '下载游戏配置打包' })
  @ApiParam({ name: 'id', type: String })
  async download(@Param('id') id: string) {
    const instance = await this.service.findByPk(id);
    if (!instance) return { url: '' };
    const url = await this.service.buildZipAndGetUrl(instance);
    return { url };
  }
}
