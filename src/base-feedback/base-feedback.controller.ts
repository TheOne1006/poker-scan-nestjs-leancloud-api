import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  Req,
  Ip,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RSAValidateGuard } from '../common/auth';
import { BaseFeedbackService } from './base-feedback.service';
import { CreateBaseFeedbackDtoWithRSA, BaseFeedbackResponseDto } from './dtos';
import { BaseFeedbackRateLimitGuard } from './base-feedback.guard';
import { SerializerInterceptor } from '../common/interceptors/serializer.interceptor';
import { SerializerClass, RSAFields } from '../common/decorators';

@Controller('api/base-feedbacks')
@ApiTags('base-feedbacks')
@UseInterceptors(SerializerInterceptor)
export class BaseFeedbackController {
  private readonly logger = new Logger('app:BaseFeedbackController');

  constructor(private readonly baseFeedbackService: BaseFeedbackService) {}

  @Post()
  @UseGuards(BaseFeedbackRateLimitGuard)
  @RSAFields('deviceId', 'contact')
  @UseGuards(RSAValidateGuard)
  @SerializerClass(BaseFeedbackResponseDto)
  @ApiOperation({ summary: 'Create a new feedback' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: BaseFeedbackResponseDto })
  @ApiResponse({ status: 429, description: 'Too Many Requests.' })
  async create(@Body() createDto: CreateBaseFeedbackDtoWithRSA, @Ip() ip: string) {

    const { rsaData, ...rest } = createDto;
    return this.baseFeedbackService.create(rest, ip);
  }
}
