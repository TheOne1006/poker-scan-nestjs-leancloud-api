import { Module, Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { config } from '../../../config';

/**
 * 数据库 配置参数
 */
const { logging, ...sequelizeConfig } = config.sequelize;
// 创建 Nest 日志实例
const logger = new Logger('Sequelize');


/**
 * 数据库模块
 *
 * 默认东八区
 */
const databaseMysql = SequelizeModule.forRoot({
    ...sequelizeConfig,
    autoLoadModels: true,
    synchronize: false,
    // timezone: '+08:00',
    benchmark: true,
    logging: logging ? (sql, timingOrOptions) => {
      if (typeof timingOrOptions === 'number') {
        logger.debug(`${sql} (${timingOrOptions}ms)`);
      } else {
        logger.debug(`${sql}`);
      }
    } : false,
  },
);

@Module({
  imports: [databaseMysql],
  exports: [databaseMysql],
})
export class DatabaseModule {}
