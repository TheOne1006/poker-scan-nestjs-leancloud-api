import { AV } from './leancloud';


/**
 * 基础服务
 * T: 实体类型
 * C: CreateDto 类型
 * U: UpdateDto 类型
 */
export abstract class LeanCloudBaseService<T, C, U>  {
  private _modelName: string;
  protected MainModel: any;
  constructor(modelName: string) {
    const AVModel = AV.Object.extend(modelName);
    this._modelName = modelName;
    this.MainModel = AVModel;
  }

  protected createQuery() {
    const query = new AV.Query(this._modelName);
    return query;
  }

  async create(createDto: C): Promise<AV.Queriable & T> {
    const ins = new this.MainModel(createDto);
    await ins.save();
    return ins;
  }

  /**
   * 列表
   * @param eqMapper
   * @param skip
   * @param limit
   * @param sortAttr
   * @param sortBy
   * @returns
   */
  async findAll(
    eqMapper: Record<string, any>,
    skip?: number,
    limit?: number,
    sortAttr?: string,
    sortBy?: string,
  ): Promise<(AV.Queriable & T)[]> {
    const query = this.createQuery();

    if (eqMapper) {
      for (const key in eqMapper) {
        if (Object.prototype.hasOwnProperty.call(eqMapper, key)) {
          const val = eqMapper[key];
          query.equalTo(key, val);
        }
      }
    }

    if (skip) {
      query.skip(skip);
    }

    if (limit) {
      query.limit(limit);
    }

    if (sortAttr && sortBy) {
      if (sortBy === 'ASC') {
        query.addAscending(sortAttr);
      } else {
        query.addDescending(sortAttr);
      }
    }

    const list = await query.find();

    return list as (AV.Queriable & T)[];
  }

  async count(eqMapper: Record<string, any>): Promise<number> {
    const query = this.createQuery();

    if (eqMapper) {
      for (const key in eqMapper) {
        if (Object.prototype.hasOwnProperty.call(eqMapper, key)) {
          const val = eqMapper[key];
          query.equalTo(key, val);
        }
      }
    }

    const num = await query.count();

    return num;
  }

  async findByPk(pk: string): Promise<AV.Queriable & T> {
    const query = this.createQuery();
    const instance = await query.get(pk);
    return instance as AV.Queriable & T;
  }

  async findOne(eqMapper: Record<string, any>): Promise<AV.Queriable & T> {
    const query = this.createQuery();

    if (eqMapper) {
      for (const key in eqMapper) {
        if (Object.prototype.hasOwnProperty.call(eqMapper, key)) {
          const val = eqMapper[key];
          query.equalTo(key, val);
        }
      }
    }

    const instance = await query.first();

    return instance as AV.Queriable & T;
  }

  async removeByPk(pk: string): Promise<AV.Queriable & T> {
    const query = this.createQuery();
    const instance = await query.get(pk);

    await instance.destroy();

    return instance as AV.Queriable & T;
  }

  async updateByPk(pk: string, updateDto: U): Promise<AV.Queriable & T> {
    const query = this.createQuery();
    const ins = await query.get(pk);

    for (const key in updateDto) {
      if (Object.prototype.hasOwnProperty.call(updateDto, key)) {
        const value = updateDto[key];
        ins.set(key, value);
      }
    }

    await ins.save();

    return ins as AV.Queriable & T;
  }
}
