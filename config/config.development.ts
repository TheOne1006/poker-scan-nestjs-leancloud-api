// import { join } from 'path';
import { join } from 'path';

/**
 * 开发环境配置
 */
export const config = {
  logger: {
    appName: 'example',
    level: 'info',
    timestamp: true,
    // filename: 'log/all.log',
  },
  sequelize: {
    dialect: (process.env.DATABASE_DIALECT as any) || 'sqlite',
    logging: true,
    storage: process.env.SQLITE_STORAGE || join(process.cwd(), 'data/dev.sqlite'),
  },
};
