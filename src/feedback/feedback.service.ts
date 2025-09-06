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

  async findLastByUserId(userid: string, limit: number): Promise<(AV.Queriable & FeedbackDto)[]> {
    const query = this.createQuery();

    query.equalTo('userid', userid);
    query.addDescending('createdAt');
    query.limit(limit);
    const instances= await query.find();

    return instances as (AV.Queriable & FeedbackDto)[];
  }

}
