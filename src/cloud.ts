import type { INestApplication } from '@nestjs/common';
import { AV } from './common/leancloud';
// import youJobFactory from './cloud/youJob';
/**
 * 一个简单的云代码方法
 */
// AV.Cloud.define('hello', () => {
//   return new Promise((resolve) => resolve('Hello world!'));
// });


export async function injectToApp(app: INestApplication<any>) {
  // const youJobWithApp = await youJobFactory(app);
  // AV.Cloud.define('youJob', youJobWithApp);
}
