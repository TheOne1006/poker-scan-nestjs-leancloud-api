## 目标
- 新增数据库与后端接口，支持多版本游戏配置的预览与下载打包
- 公开“预览列表”接口（无鉴权），带 30 分钟缓存
- “下载管理”接口按需打包单个游戏配置为压缩文件并返回可访问链接（若已存在则直接返回）

## 数据库设计（Sequelize / Postgres）
- 表：`games`
  - `id` INTEGER PK AI
  - `name` STRING(100) not null
  - `type` STRING(50) not null 可选  "standardDouDiZhu"，"standardPaoDeKuai"，"douDiZhu4Player"，"standardGuanDan"， "standardZhengShangYou"，"standard3Played510K"， "custom"
  - `desc` STRING(200) 可选
  - `direction` STRING(20) 可选（如 up、left、right 等，按字符串存储）
  - `game_rule` STRING(100) not null  case  "RuleStandardDouDiZhu","RuleDouDiZhu4Player","RuleStandardGuanDan", "RuleStandardPaoDeKuai","RuleCustom"  
  - `move_generator` STRING(100) not null  可选 case "CustomMoveGenerator", "Standard3Played510KMoveGenerator","DouDiZhu4PlayedMoveGenerator", "PaoDeKuaiMoveGenerator", "AnyMoveGenerator"
  - `card_num` INTEGER not null default 52
  - `player_num` INTEGER 必填 2,3,4,5,6
  - `info_card_counts` JSONB 映射结构：`{"<string>": <int>}`
  - `areas` JSONB 数组：`[{ minX, minY, width, height, type }]`
    - `areas.type` 可选  "selfHand" ,"selfDiscard" , "upperPlayerDiscard" // 上家出牌区
        case lowerPlayerDiscard = "lowerPlayerDiscard" // 下家出牌区
        case oppositePlayerDiscard = "oppositePlayerDiscard" // 对家出牌区
        case fixed = "fixed" // 固定牌区 (类似斗地主的 3 张底牌)
        case other = "other" // 其他牌区
  - `backgrounds` JSON 字符串数组：相对路径列表
  - `logo_path` STRING(255)：相对路径
  - 时间戳：`created_at`（默认 now）、`updated_at`
  - `version` int not null default 1
- 索引：
  - `name` unique
  - `type`
  - `version`
- 说明：文件相关字段均存储相对路径，后续通过配置计算绝对路径

## Migration 计划
- 新增 `databases/migrations/XXXXXXXXXXXXXX-games.js`
  - `up`: `createTable('games', {...})` + 添加索引
  - `down`: `dropTable('games')`
- 字段类型与上文一致，`charset/collate` 与现有迁移保持一致

## 模型与目录结构
- 新增目录：`src/games`
  - `games.entity.ts`：`@Table({ tableName: 'games' })`
    - 使用 `DataType.JSONB`（areas、infoCardCounts）和 `DataType.JSON`（backgrounds）
    - `CreatedAt`/`UpdatedAt`、必要的 `@Index`
  - `games.module.ts`：注册 Sequelize 模型与依赖模块
  - `games.service.ts`：
    - 列表查询（支持按 `type`、`version` 简单过滤）
    - 单条查询与打包逻辑（生成 zip 或复用已存在文件）
  - `dtos/`：
    - `game.dto.ts`（详细字段输出）
    - `game-preview.dto.ts`（预览字段：`id/name/type/version/logo_path` 等）
  - 控制器：
    - `games.controller.ts`：`GET /api/games` 公开预览列表
    - `games-download.controller.ts`：`GET /api/games/:id/download` 下载管理

## 预览列表接口（公开 + 缓存）
- 路由：`GET /api/games`
- 无鉴权、无角色限制
- 缓存：使用 Nest 缓存拦截器，`CacheTTL(1800)`（30 分钟）；`CacheKey('games:list')`
- 查询参数（可选）：`type`、`version`
- 返回：`GamePreviewDto[]`，走现有 `SerializerInterceptor`

## 下载管理接口（打包与链接返回）
- 路由：`GET /api/games/:id/download`
- 鉴权：默认走现有 `RolesGuard` + `ROLE_USER`（若需公开可改）
- 逻辑：
  - 读取 `games` 记录，构造 `game.json`（完整模型 instance）
  - 将 `backgrounds`、`logo_path` 从相对路径解析为绝对路径，打包进 zip
  - 生成目标文件：`public/downloads/games/game-<id>-<version>.zip`（无 version 则 `game-<id>.zip`）
  - 已存在则直接返回链接；不存在则创建并返回
- 响应：`{ url: '/downloads/games/game-<id>-<version>.zip' }`

## 静态文件与路径规范
- 启用 `ServeStaticModule` 指向 `public/` 目录（当前在 `app.module.ts` 注释，计划启用）
- 压缩包目录：`public/downloads/games/`
- 基础资源目录（背景与 logo 源文件）：由配置指定基准目录

## 配置项与路径转换
- 新增环境变量：`GAMES_BASE_DIR`（示例：`/data/games-assets`）
- 在 `config` 中新增 `app.gamesBaseDir`，默认 `public/games/assets`（若未配置）
- 提供工具方法：
  - `toRelativePath(absPath, baseDir)`：保存前转换为相对路径
  - `toAbsolutePath(relative, baseDir)`：打包/读取时转换为绝对路径

## 依赖与模块
- 依赖：
  - `@nestjs/cache-manager`（缓存）
  - `archiver`（zip 打包）
- 模块：在 `GamesModule` 中导入 `CacheModule.register({ ttl: 1800 })`，并在列表接口使用拦截器

## 迁移与验证
- 迁移：
  - `npm run migrate:new --name games`
  - 补充生成内容并执行：`npm run migrate:up`
- 验证：
  - 本地创建 1~2 条 `games` 数据（含背景与 logo 路径），访问 `/api/games` 验证缓存与输出
  - 访问 `/api/games/:id/download` 验证 zip 生成与二次访问直接复用链接

## Swagger 与文档
- 为两个控制器添加 `@ApiTags('games')`、`@ApiOperation` 等
- 在 README 增补示例请求（列表与下载）

## 调整点与假设
- 假设数据库使用 Postgres（已有 `JSONB` 字段），如需 MySQL 可改为 `JSON`
- 下载接口默认需登录（`ROLE_USER`），若需公开可去除 `RolesGuard`
- `version` 字段用于区分不同版本；若需更复杂的版本化（如历史快照），可后续扩展独立版本表
