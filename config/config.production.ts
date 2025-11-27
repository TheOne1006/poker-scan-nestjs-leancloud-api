import { Dialect } from 'sequelize/types';

/**
 * 开发环境配置
 */
export const config = {
  sequelize: {
    database: process.env.APP_DATABASE,
    dialect: (process.env.DATABASE_DIALECT as Dialect) || 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || null,
    logging: false,
  },
  port: process.env.APP_PORT || process.env.PORT || 3000,
};
