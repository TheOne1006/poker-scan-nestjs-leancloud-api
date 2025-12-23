import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { AreaTypeEnum } from './dtos/game-enums';

@Table({
  tableName: 'games',
})
export class Game extends Model<Game> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'id',
  })
  id: number;

  @Index({ name: 'games_name_unique', unique: true })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '游戏名称',
  })
  name: string;

  @Index({ name: 'games_type_index' })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment:
      '游戏类型: standardDouDiZhu, standardPaoDeKuai, douDiZhu4Player, standardGuanDan, standardZhengShangYou, standard3Played510K, custom',
  })
  type: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    comment: '描述',
  })
  desc: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: '方向: up/left/right 等',
  })
  direction: string;

  @Column({
    field: 'game_rule',
    type: DataType.STRING(100),
    allowNull: false,
    comment:
      '规则: RuleStandardDouDiZhu, RuleDouDiZhu4Player, RuleStandardGuanDan, RuleStandardPaoDeKuai, RuleCustom',
  })
  gameRule: string;

  @Column({
    field: 'move_generator',
    type: DataType.STRING(100),
    allowNull: true,
    comment:
      '出牌生成器: CustomMoveGenerator, Standard3Played510KMoveGenerator, DouDiZhu4PlayedMoveGenerator, PaoDeKuaiMoveGenerator, AnyMoveGenerator',
  })
  moveGenerator: string;

  @Column({
    field: 'card_num',
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 52,
    comment: '牌数',
  })
  cardNum: number;

  @Column({
    field: 'player_num',
    type: DataType.INTEGER,
    allowNull: false,
    comment: '玩家人数',
  })
  playerNum: number;

  @Column({
    field: 'info_card_counts',
    type: DataType.JSONB,
    allowNull: true,
    comment: '信息牌计数映射: { "<string>": <int> }',
  })
  infoCardCounts: Record<string, number>;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment:
      '区域数组: [{ minX, minY, width, height, type }], type: selfHand/selfDiscard/upperPlayerDiscard/lowerPlayerDiscard/oppositePlayerDiscard/fixed/other',
  })
  areas: Array<{
    minX: number;
    minY: number;
    width: number;
    height: number;
    type: AreaTypeEnum;
  }>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '背景相对路径数组',
  })
  backgrounds: string[];

  @Column({
    field: 'logo_path',
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'logo 相对路径',
  })
  logoPath: string;

  @Index({ name: 'games_version_index' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '版本号',
  })
  version: number;

  @Column({
    field: 'support_app_version',
    type: DataType.INTEGER,
    allowNull: true,
    comment: '支持的 App 版本',
  })
  supportAppVersion: number;

  @CreatedAt
  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;
}

