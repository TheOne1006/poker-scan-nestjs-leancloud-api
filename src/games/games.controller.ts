import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
// 缓存通过服务层实现（简单内存 TTL）
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SerializerClass } from '../common/decorators';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { Roles } from '../common/decorators';

import { GamesService } from './games.service';
import { GamePreviewDto, GameDto } from './dtos';

@Controller('api/games')
@ApiTags('games')
@UseInterceptors(SerializerInterceptor)
export class GamesController {
  constructor(private readonly service: GamesService) {}

  @Get()
  @ApiOperation({ summary: '游戏配置预览列表（公开）' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'version', required: false })
  @SerializerClass(GamePreviewDto)
  async list(
    @Query('type') type?: string,
    @Query('version') version?: string,
  ) {
    const where: any = {};
    if (type) where.type = type;
    if (version) where.version = parseInt(version);
    const result = await this.service.list(where);
    return result;
  }

  @Get('/:id')
  @ApiOperation({ summary: '游戏配置详情' })
  @ApiParam({ name: 'id', type: String })
  @SerializerClass(GameDto)
  async detail(@Param('id') id: string) {
    return this.service.findByPk(id);
  }

  @Get('/:id/download')
  @ApiOperation({ summary: '下载游戏配置打包（登录用户）' })
  @ApiParam({ name: 'id', type: String })
  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(ROLE_USER)
  async download(@Param('id') id: string) {
    const instance = await this.service.findByPk(id);
    if (!instance) return { url: '' };
    const url = await this.service.buildZipAndGetUrl(instance);
    return { url };
  }
}
