import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Feedback } from './feedback.entity';
import {
  FeedbackDto,
  FeedbackCreateDtoWithUId,
  FeedbackType
} from './dtos';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger('app:FeedbackService');

  constructor(
    @InjectModel(Feedback)
    private readonly feedbackModel: typeof Feedback,
  ) {}

  async create(dto: FeedbackCreateDtoWithUId): Promise<Feedback> {
    const { uid, type, ...rest } = dto;
    return this.feedbackModel.create({
      ...rest,
      uid,
      type: type as FeedbackType,
    });
  }

  async findAll(
    where: any = {},
    offset: number = 0,
    limit: number = 10,
    sort: string = 'createdAt',
    order: string = 'DESC',
  ): Promise<Feedback[]> {
    const { uid, ...otherWhere } = where;
    const findOptions: any = {
      where: {
        ...otherWhere,
      },
      offset,
      limit,
      order: [[sort || 'createdAt', order || 'DESC']],
    };

    if (uid) {
      findOptions.where.uid = uid;
    }

    return this.feedbackModel.findAll(findOptions);
  }

  async findByPk(pk: string | number): Promise<Feedback> {
    return this.feedbackModel.findByPk(pk);
  }

  async findLastByUid(uid: string, limit: number = 10): Promise<Feedback[]> {
    return this.feedbackModel.findAll({
      where: { uid },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
