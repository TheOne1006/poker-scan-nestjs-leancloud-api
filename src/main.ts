/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from '../config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // 配置跨域
  app.enableCors({
    origin: [
      'https://poker-scan-web.theone.io',  // 生产环境域名
      'https://poker.ai-scan.top',  // 生产环境域名
      /^http:\/\/localhost(:\d+)?$/,       // 匹配 localhost 及任意端口（开发环境）
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: false, // 不允许携带cookie
  });

  const options = new DocumentBuilder()
    .setTitle('nest-api-startkit')
    .setDescription('pass-sentry API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // 可选，指定令牌格式为JWT
        name: 'Authorization',
        in: 'header',
      },
      'access-token' // 认证名称，可在控制器中使用@ApiBearerAuth()引用
    )
    // .addApiKey({
    //   type: 'apiKey',
    //   name: 'token',
    //   in: 'header'
    // })
    .build();

  if (config.swagger.enable) {
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  const port = config.port || 3000;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
