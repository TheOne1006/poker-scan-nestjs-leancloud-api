# iOS 应用配置

## ios-app.json 配置文档

### version - 版本控制

- `current`: 当前应用版本号
- `minimum`: 支持的最低版本号
- `latest`: 最新可用版本号

### app - 应用信息

- `bundleId`: iOS 应用包标识符
- `displayName`: 应用显示名称
- `scheme`: URL Scheme，用于深度链接
- `supportedLanguages`: 支持的语言代码数组

### features - 功能开关

- `forcedUpdate`: 是否强制更新应用
- `maintenance`: 维护模式开关
- `beta`: Beta 测试模式
- `newFeatureIntro`: 新功能介绍开关

### api - API 配置

- `baseUrl`: API 基础地址
- `timeout`: 请求超时时间（毫秒）
- `retryCount`: 重试次数

### urls - 外部链接

- `privacy`: 隐私政策链接
- `terms`: 服务条款链接
- `support`: 客服支持链接
- `appStore`: App Store 下载链接

### limits - 应用限制

- `maxFileSize`: 文件上传最大大小（字节）
- `maxUploadCount`: 最大上传文件数量
- `sessionTimeout`: 会话超时时间（秒）

### ui - 用户界面

- `theme`: 主题模式（light/dark/auto）
- `animations`: 动画开关
- `notifications`: 通知开关

### debug - 调试设置

- `logging`: 调试日志开关
- `crashReporting`: 崩溃报告开关
