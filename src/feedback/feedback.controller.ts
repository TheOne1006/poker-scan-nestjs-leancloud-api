import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  Query,
  UseInterceptors,
  Header,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { AV } from '../common/leancloud';

import { Response } from 'express';
import { ExpressResponse } from '../common/decorators';
import * as fs from 'fs';

import {
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';

import { ParseInt } from '../common/pipes';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';

import { Roles, SerializerClass, User } from '../common/decorators';
import { RolesGuard } from '../common/auth';
import { ROLE_USER } from '../common/constants';
import { RequestUser } from '../common/interfaces';

import { FeedbackAccessLimitGuard } from './feedback.guard';

import { FeedbackService } from './feedback.service';
import { ChatService } from '../chat/chat.service';

import {
  FeedbackDto,
  FeedbackCreateDto,
  FeedbackCreateDtoWithUserId,
  FeedbackQueryWhereDto,
  FeedbackUpdateDto,
  FeedbackType
} from './dtos';

import { ChatMessageType, ChatMessageSender, ChatLogDto } from '../chat/dtos';

@Controller('api/feedbacks')
@ApiTags('feedbacks')
@UseGuards(RolesGuard)
@ApiSecurity('api_key')
@Roles(ROLE_USER)
@UseInterceptors(SerializerInterceptor)
export class FeedbackController {
  private readonly logger = new Logger('app:FeedbackController');

  constructor(
    protected readonly service: FeedbackService,
    protected readonly chatService: ChatService,
  ) {}

  @Post()
  @UseGuards(FeedbackAccessLimitGuard)
  @UseInterceptors(FilesInterceptor('images', 5, { // 改为FilesInterceptor，最多上传5张图片
    storage: diskStorage({
      destination: join(__dirname, '../../..', 'client/uploads/feedback'),
      filename: (_req, file, cb) => {
        const uniqueSuffix = randomUUID();
        // const ext = extname(file.originalname);
        cb(null, `feedback-${uniqueSuffix}-${file.originalname}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('只支持图片格式 (jpeg, png, gif, webp)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 每张图片最大5MB
    },
  }))
  @ApiOperation({
    summary: '提交用户反馈',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '反馈信息和图片',
    schema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: '问题描述',
          example: '应用在某些情况下会崩溃',
        },
        type: {
          type: 'string',
          description: '反馈类型',
          example: 'bug',
          enum: [FeedbackType.BUG, FeedbackType.SUGGESTION, FeedbackType.FEATURE],
        },
        images: { // 字段名改为复数形式
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          description: '图片文件数组',
        },
      },
      required: ['description', 'type'],
    },
  })
  @SerializerClass(FeedbackDto)
  async create(
    @Body() dto: FeedbackCreateDto,
    @User() user: RequestUser,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<FeedbackDto> {
    // 如果有文件上传，设置文件名
    if (files && files.length > 0) {
      dto.images = files.map(file => file.filename); // 存储多个文件名
    } else {
      dto.images = [];
    }

    const dtoWithUserId = {
      ...dto,
      userid: user.id,
    }
    
    const instance = await this.service.create(dtoWithUserId);

    // 无需返回
    this.append2Chat(instance, user);

    return instance;
  }

  private async append2Chat(instance: AV.Queriable & FeedbackDto, user: RequestUser) {
    try {
      // 添加到 chat
      const chat = await this.chatService.findChatByUserId(user.id);

      // 先创建 log
      const inputLog: ChatLogDto = {
        text: instance.get('description'),
        type: ChatMessageType.SUPPORT,
        sender: ChatMessageSender.USER,
        attachments: instance.get('images'),
        supportId: instance.get('objectId'),
        userId: user.id,
      }

      // 系统反馈
      const replayLog: ChatLogDto = {
        text: '感谢您的反馈，我们会尽快处理',
        type: ChatMessageType.TEXT,
        sender: ChatMessageSender.CUSTOMER,
        attachments: [],
        supportId: '',
        userId: user.id,
      }
      // 
      if (!chat) {
        await this.chatService.createChat(user.id, [inputLog, replayLog]);
      } else {
        await this.chatService.appendLogs2Chat(chat, [inputLog, replayLog]);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }


  @Get()
  @ApiOperation({
    summary: '反馈列表',
  })
  @ApiQuery({
    name: '_sort',
    description: '排序字段',
    required: false,
  })
  @ApiQuery({
    name: '_order',
    description: '排序方式',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    description: 'filter',
    required: false,
  })
  @ApiQuery({
    name: '_end',
    description: '结束索引',
    required: false,
  })
  @ApiQuery({
    name: '_start',
    description: '开始索引',
    required: false,
  })
  @SerializerClass(FeedbackDto)
  async list(
    @ExpressResponse() res: Response,
    @User() user: RequestUser,
    @Query() where: FeedbackQueryWhereDto = {},
    @Query('_start', ParseInt) start?: number,
    @Query('_end', ParseInt) end?: number,
    @Query('_sort') sort?: string,
    @Query('_order') order?: string,
  ): Promise<FeedbackDto[]> {
    const offset = start || 0;
    const limit = end - start > 0 ? end - start + 1 : 0;

    const [sortAttr, sortBy] = sort && order ? [sort, order] : ['', ''];

    const eqMapper = {
      ...where,
      userid: user.id,
    };

    const list = await this.service.findAll(
      eqMapper,
      offset,
      limit,
      sortAttr,
      sortBy,
    );
    // const count = await this.service.count(eqMapper);
    return list;
  }

  @Get('/:pk')
  @ApiOperation({
    summary: '反馈详情',
  })
  @SerializerClass(FeedbackDto)
  @ApiParam({ name: 'pk', description: 'pk', type: String })
  async findByPk(@Param('pk') pk: string): Promise<FeedbackDto> {
    const instance = await this.service.findByPk(pk);
    return instance;
  }
}
