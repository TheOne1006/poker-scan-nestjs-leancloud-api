import { Injectable, Logger } from '@nestjs/common';
import { LeanCloudBaseService, AV } from '../common/leancloud';
import {
  FeedbackDto,
  FeedbackCreateDtoWithUserId,
  FeedbackUpdateDto,
} from './dtos';

const MODEL_NAME = 'feedback';

@Injectable()
export class FeedbackService extends LeanCloudBaseService<
  FeedbackDto,
  FeedbackCreateDtoWithUserId,
  FeedbackUpdateDto
> {
  private readonly logger = new Logger('app:FeedbackService');

  constructor() {
    super(MODEL_NAME);
  }

  async findLastOneByUserId(userid: string): Promise<AV.Queriable & FeedbackDto> {
    const query = this.createQuery();

    query.equalTo('userid', userid);
    query.addDescending('createdAt');

    const instance = await query.first();

    return instance as AV.Queriable & FeedbackDto;
  }

}