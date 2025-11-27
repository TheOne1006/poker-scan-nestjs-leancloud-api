import { join } from 'path';

/**
 * 测试环境配置
 */
export const config = {
  logger: {
    appName: 'example',
    level: 'info',
    timestamp: true,
    // filename: 'log/all.log',
  },
  sequelize: {
    dialect: 'sqlite' as any,
    logging: false,
    // 内存库，测试更轻量；若需持久化可改为 join(process.cwd(), 'data/test.sqlite')
    storage: ':memory:',
    timezone: '+08:00',
  },
};
