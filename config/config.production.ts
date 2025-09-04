
/**
 * 开发环境配置
 */
export const config = {
  leancloud: {
    appId: process.env.LEANCLOUD_APP_ID || '',
    appKey: process.env.LEANCLOUD_APP_KEY || '',
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || '',
    serverURL: process.env.LEANCLOUD_APP_SERVERURL || '',
  },
  port: process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000,
};
