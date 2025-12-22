import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';

export enum GameType {
  STANDARD_DOU_DI_ZHU = 'standardDouDiZhu',
  STANDARD_PAO_DE_KUAI = 'standardPaoDeKuai',
  DOU_DI_ZHU_4_PLAYER = 'douDiZhu4Player',
  STANDARD_GUAN_DAN = 'standardGuanDan',
  STANDARD_ZHENG_SHANG_YOU = 'standardZhengShangYou',
  STANDARD_3_PLAYED_510K = 'standard3Played510K',
  CUSTOM = 'custom',
}

export enum GameRule {
  RULE_STANDARD_DOU_DI_ZHU = 'RuleStandardDouDiZhu',
  RULE_DOU_DI_ZHU_4_PLAYER = 'RuleDouDiZhu4Player',
  RULE_STANDARD_GUAN_DAN = 'RuleStandardGuanDan',
  RULE_STANDARD_PAO_DE_KUAI = 'RuleStandardPaoDeKuai',
  RULE_CUSTOM = 'RuleCustom',
}

export enum MoveGenerator {
  CUSTOM = 'CustomMoveGenerator',
  STANDARD_3_PLAYED_510K = 'Standard3Played510KMoveGenerator',
  DOU_DI_ZHU_4_PLAYED = 'DouDiZhu4PlayedMoveGenerator',
  PAO_DE_KUAI = 'PaoDeKuaiMoveGenerator',
  ANY = 'AnyMoveGenerator',
}

export enum AreaType {
  SELF_HAND = 'selfHand',
  SELF_DISCARD = 'selfDiscard',
  UPPER_PLAYER_DISCARD = 'upperPlayerDiscard',
  LOWER_PLAYER_DISCARD = 'lowerPlayerDiscard',
  OPPOSITE_PLAYER_DISCARD = 'oppositePlayerDiscard',
  FIXED = 'fixed',
  OTHER = 'other',
}

export class AreaDto {
  @ApiProperty({ example: 0.2 })
  @IsInt()
  minX: number;

  @ApiProperty({ example: 0.2 })
  @IsInt()
  minY: number;

  @ApiProperty({ example: 0.3 })
  @IsInt()
  width: number;

  @ApiProperty({ example: 0.1 })
  @IsInt()
  height: number;

  @ApiProperty({ enum: AreaType })
  @IsEnum(AreaType)
  type: AreaType;
}

export class GameDto {
  @Expose()
  id: number;

  @ApiProperty({ example: '示例游戏' })
  @Expose()
  name: string;

  @ApiProperty({ enum: GameType })
  @IsEnum(GameType)
  @Expose()
  type: string;

  @ApiProperty({ example: '描述' })
  @IsOptional()
  @IsString()
  @Expose()
  desc?: string;

  @ApiProperty({ example: 'up' })
  @IsOptional()
  @IsString()
  @Expose()
  direction?: string;

  @ApiProperty({ enum: GameRule })
  @IsEnum(GameRule)
  @Expose()
  gameRule: string;

  @ApiProperty({ enum: MoveGenerator, required: false })
  @IsOptional()
  @IsEnum(MoveGenerator)
  @Expose()
  moveGenerator?: string;

  @ApiProperty({ example: 52 })
  @IsInt()
  @Expose()
  cardNum: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Expose()
  playerNum: number;

  @ApiProperty({
    description: '信息牌计数映射',
    example: { joker: 2, ace: 4 },
  })
  @IsObject()
  @Expose()
  infoCardCounts: Record<string, number>;

  @ApiProperty({ type: [AreaDto] })
  @IsArray()
  @Expose()
  areas: AreaDto[];

  @ApiProperty({ type: [String]})
  @IsArray()
  @Expose()
  backgrounds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Expose()
  logoPath?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  version: number;

  @ApiProperty({ example: 100, description: '支持的 App 版本' })
  @IsInt()
  @IsOptional()
  @Expose()
  supportAppVersion: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

