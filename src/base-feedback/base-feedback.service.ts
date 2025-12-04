import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseFeedback } from './base-feedback.entity';
import { CreateBaseFeedbackDto } from './dtos';

@Injectable()
export class BaseFeedbackService {
  private readonly logger = new Logger('app:BaseFeedbackService');

  constructor(
    @InjectModel(BaseFeedback)
    private readonly baseFeedbackModel: typeof BaseFeedback,
  ) {}

  async create(dto: CreateBaseFeedbackDto, ip?: string): Promise<BaseFeedback> {
    return this.baseFeedbackModel.create({
      ...dto,
      ip,
    });
  }

  async findLastByDeviceId(deviceId: string, limit: number = 3): Promise<BaseFeedback[]> {
    return this.baseFeedbackModel.findAll({
      where: { deviceId: deviceId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async findLastByIp(ip: string, limit: number = 3): Promise<BaseFeedback[]> {
    return this.baseFeedbackModel.findAll({
      where: { ip },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
