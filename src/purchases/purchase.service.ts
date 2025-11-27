import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Purchase } from './purchase.entity';
import {
  PurchaseDto,
  PurchaseCreateDto,
  PurchaseUpdateDto,
  PurchaseStatus,
} from './dtos';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger('app:PurchaseService');

  constructor(
    @InjectModel(Purchase)
    private readonly purchaseModel: typeof Purchase,
  ) {}

  /**
   * 更新状态
   *
   * @param id 
   * @param transactionId 
   * @param status 
   * @returns 
   */
  async updateStatus(id: number, transactionId: string, status: PurchaseStatus): Promise<Purchase> {
    const ins = await this.purchaseModel.findOne({
      where: {
        id: id,
        transactionId: transactionId,
      }
    });
    if (!ins) {
      throw new BadRequestException(`找不到交易记录：${id}`);
    }

    // 更新状态
    ins.status = status;

    await ins.save();

    return ins;
  }

  async findByUId(uid: string, limit?: number): Promise<Purchase[]> {
    const options: any = {
      where: { uid },
      order: [['createdAt', 'DESC']],
    };
    
    if (limit) {
      options.limit = limit;
    }
    return this.purchaseModel.findAll(options);
  }

  async findOne(where: any): Promise<Purchase> {
    return this.purchaseModel.findOne({ where });
  }

  async create(createDto: PurchaseCreateDto): Promise<Purchase> {
    return this.purchaseModel.create(createDto);
  }

  async findAll(where: any): Promise<Purchase[]> {
    return this.purchaseModel.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  async updateByPk(pk: string, updateDto: PurchaseUpdateDto): Promise<Purchase> {
    throw new Error("not implemented");
  }
}
