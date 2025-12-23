import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseInterceptors,
  ParseIntPipe,
  UploadedFiles,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiConsumes, ApiBody, ApiHeader } from '@nestjs/swagger';
import * as crypto from 'crypto';
import * as fs from 'fs';

import { SerializerClass, RSAFields } from '../common/decorators';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { RefreshableCacheInterceptor, CacheKeyBy } from '../core/interceptors';
import { RSAValidateGuard } from '../common/auth';
import { config } from '../../config';

import { GamesService } from './games.service';
import { GamePreviewDto, GameDto, GameUploadDtoWithRSA } from './dtos';

const getPrivateKey = () => {
  if (config.rsa.privateKey) return config.rsa.privateKey;
  if (config.rsa.privateKeyFile) {
    return fs.readFileSync(config.rsa.privateKeyFile, 'utf8');
  }
  return '';
};

@Controller('api/games')
@ApiTags('games')
@UseInterceptors(SerializerInterceptor)
export class GamesController {
  constructor(private readonly service: GamesService) {}

  @Post('/upload')
  @ApiOperation({ summary: '上传游戏配置' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: GameUploadDtoWithRSA })
  @ApiHeader({
    name: 'admin-password',
    description: 'Admin Password',
    required: true,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'backgrounds', maxCount: 3 },
        { name: 'logo', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 512 * 1024, // 512KB
        },
        fileFilter: (req, file, cb) => {
          // 1. 限制文件格式
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
            return cb(new BadRequestException('Only jpg, jpeg, png files are allowed!'), false);
          }

          // 2. 校验 admin-password (从 header 获取)
          const adminPassword = config.app.adminPassword;
          const headerPassword = req.headers['admin-password'];

          if (headerPassword !== adminPassword) {
             return cb(new BadRequestException('Invalid admin password'), false);
          }
          
          cb(null, true);
        },
        storage: diskStorage({
          destination: (req, file, cb) => {
            const root = join(__dirname, '../../..');
            if (file.fieldname === 'logo') {
              cb(null, join(root, 'public/uploads/logos'));
            } else {
              cb(null, join(root, 'public/uploads/backgrounds'));
            }
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = randomUUID();
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @RSAFields('name', 'header:admin-password', 'supportAppVersion')
  @UseGuards(RSAValidateGuard)
  async upload(
    @Headers('admin-password') adminPassword: string,
    @Body() dto: GameUploadDtoWithRSA,
    @UploadedFiles()
    files: { backgrounds?: Express.Multer.File[]; logo?: Express.Multer.File[] },
  ) {
    if (adminPassword !== config.app.adminPassword) {
       throw new BadRequestException('Invalid admin password');
    }
    const { rsaData, ...data } = dto;

    await this.service.upload(data, files);
    return { success: true };
  }

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
