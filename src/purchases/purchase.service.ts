import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { LeanCloudBaseService, AV } from '../common/leancloud';
import {
  PurchaseDto,
  PurchaseCreateDto,
  PurchaseUpdateDto,
  PurchaseStatus,
} from './dtos';

const MODEL_NAME = 'purchases';

@Injectable()
export class PurchaseService extends LeanCloudBaseService<
  PurchaseDto,
  PurchaseCreateDto,
  PurchaseUpdateDto
> {
  private readonly logger = new Logger('app:PurchaseService');

  constructor() {
    super(MODEL_NAME);
  }

  /**
   * 更新状态
   *
   * @param id 
   * @param transactionId 
   * @param status 
   * @returns 
   */
  async updateStatus(id: string, transactionId: string, status: PurchaseStatus): Promise<AV.Queriable & PurchaseDto> {
    const ins = await this.findOne({
      objectId: id,
      transactionId: transactionId,
    });
    if (!ins) {
      throw new BadRequestException(`找不到交易记录：${id}`);
    }

    // 更新状态
    ins.set('status', status);

    await ins.save();

    return ins as AV.Queriable & PurchaseDto;
  }

  async findByUserId(userId: string, limit?: number): Promise<(AV.Queriable & PurchaseDto)[]> {
    const query = this.createQuery();
    
    query.equalTo('userId', userId);
    query.addDescending('createdAt');
    if (limit) {
      query.limit(limit);
    }
    const instances = await query.find();

    return instances as (AV.Queriable & PurchaseDto)[];
  }
  
  async updateByPk(pk: string, updateDto: PurchaseUpdateDto): Promise<AV.Queriable & PurchaseDto> {
    throw new Error("not implemented");
  }


  // 



}