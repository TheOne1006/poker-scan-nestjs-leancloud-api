import { Dialect } from 'sequelize/types';
import * as dotenv from 'dotenv';

/**
 * 启动 .env 配置信息
 */
dotenv.config();

/**
 * @ignore
 * 配置项接口
 */
export interface Iconfig {
  sequelize: {
    database?: string;
    dialect: Dialect;
    logging?: boolean;
    timezone?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string | null;
    storage?: string; // sqlite
  };
  logger: {
    appName: string;
    level: string;
    filename?: string;
    timestamp?: boolean;
    uncolorize?: boolean;
  };
  language: string;
  swagger: {
    enable: boolean;
    endPoint: string;
  };
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rsa: {
    enable: boolean;
    publicKeyFile: string;
    privateKeyFile: string;
    publicKey: string;
    privateKey: string;
    passphrase: string;
  };
  flowise: {
    baseUrl: string;
    chatflowId: string;
    token: string;
  };
  dify: {
    baseUrl: string;
    token: string;
  };
  assistant: {
    channel: string;
  };
  apple: {
    clientID: string;
    teamID: string;
    keyID: string;
    authKey: string;
    privateKeyString: string;
    callbackURL: string;
    subscriptionKey: string; // 订阅 key
    sharedSecret: string; // 共享密钥

    iap: {
      keyId: string;
      issuerId: string;
      privateKeyString: string;
    };
  };

  app: {
    freeVipDays: number;
  }

}

/**
 * @ignore
 * 默认配置信息
 */
export const config: Iconfig = {
  sequelize: {
    database: process.env.APP_DATABASE,
    dialect: process.env.DATABASE_DIALECT as Dialect,
    logging: true,
  },
  language: 'zh-cn',
  logger: {
    appName: 'example',
    level: 'info',
    timestamp: true,
    // filename: 'log/all.log',
  },
  swagger: {
    enable: process.env.DOC_SWAGGE === 'true',
    endPoint: 'api',
  },
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  rsa: {
    enable: process.env.RSA_ENABLE === 'true',
    publicKeyFile: process.env.RSA_PUBLIC_KEY_FILE || '',
    privateKeyFile: process.env.RSA_PRIVATE_KEY_FILE || '',
    publicKey: process.env.RSA_PUBLIC_KEY || '',
    privateKey: process.env.RSA_PRIVATE_KEY || '',
    passphrase: process.env.RSA_PASSPHRASE || '123456',
  },
  flowise: {
    baseUrl: process.env.FLOWISE_BASE_URL || '',
    chatflowId: process.env.FLOWISE_CHATFLOW_ID || '',
    token: process.env.FLOWISE_TOKEN || '',
  },
  dify: {
    baseUrl: process.env.DIFY_BASE_URL || '',
    token: process.env.DIFY_TOKEN || '',
  },
  assistant: {
    channel: process.env.ASSISTANT_CHANNEL || 'dify',
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID || '',
    teamID: process.env.APPLE_TEAM_ID || '',
    keyID: process.env.APPLE_KEY_ID || '',
    authKey: process.env.APPLE_AUTH_KEY || '',
    privateKeyString: process.env.APPLE_PRIVATE_KEY_STRING || '',
    callbackURL: process.env.APPLE_CALLBACK_URL || '',
    subscriptionKey: process.env.APPLE_SUBSCRIPTION_KEY || '', // 订阅 key
    sharedSecret: process.env.APPLE_SHARED_SECRET || '', // 共享密钥

    iap: {
      keyId: process.env.APPLE_IAP_KID || '',
      issuerId: process.env.APPLE_IAP_ISSUER_ID || '',
      privateKeyString: process.env.APPLE_IAP_PRIVATE_KEY_STRING || '',
    }
  },
  app: {
    freeVipDays: process.env.FREE_VIP_DAYS ? parseInt(process.env.FREE_VIP_DAYS) : 7,
  }
};
