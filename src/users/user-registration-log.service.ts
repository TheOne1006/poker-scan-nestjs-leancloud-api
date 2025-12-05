import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRegistrationLog } from './user-registration-log.entity';

@Injectable()
export class UserRegistrationLogsService {
  private readonly logger = new Logger('app:UserRegistrationLogService');

  constructor(
    @InjectModel(UserRegistrationLog)
    private readonly userRegistrationLogModel: typeof UserRegistrationLog,
  ) {}

  async findOne(where: any): Promise<UserRegistrationLog> {
    return this.userRegistrationLogModel.findOne({ where });
  }

  // 注册
  async insert(
    uid: string,
    deviceId: string = "",
    appleSub: string = "",
  ): Promise<UserRegistrationLog> {

    const createdDto = {
      uid,
      deviceId,
      appleSub,
    };

    // 创建用户log
    try {
      const ins = await this.userRegistrationLogModel.create(createdDto);
      return ins
    } catch (error) {
      this.logger.error("create user log failed", error);
      throw new Error("create user log failed");
    }
  }

}
