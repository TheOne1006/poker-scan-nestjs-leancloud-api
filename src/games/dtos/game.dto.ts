import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsArray,
  IsObject,
} from 'class-validator';
import {
  GameTypeEnum,
  GameRuleEnum,
  MoveGeneratorEnum,
  AreaTypeEnum,
  DirectionEnum,
} from './game-enums';

export class AreaDto {
  @ApiProperty({ example: 0.2 })
  @IsNumber()
  @IsNotEmpty()
  minX: number;

  @ApiProperty({ example: 0.2 })
  @IsNumber()
  @IsNotEmpty()
  minY: number;

  @ApiProperty({ example: 0.3 })
  @IsNumber()
  @IsNotEmpty()
  width: number;

  @ApiProperty({ example: 0.1 })
  @IsNumber()
  @IsNotEmpty()
  height: number;

  @ApiProperty({ enum: AreaTypeEnum })
  @IsEnum(AreaTypeEnum)
  @IsNotEmpty()
  type: AreaTypeEnum;
}

export class GameDto {
  @Expose()
  id: number;

  @ApiProperty({ example: '示例游戏' })
  @Expose()
  name: string;

  @ApiProperty({ enum: GameTypeEnum })
  @IsEnum(GameTypeEnum)
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

  @ApiProperty({ enum: GameRuleEnum })
  @IsEnum(GameRuleEnum)
  @Expose()
  gameRule: string;

  @ApiProperty({ enum: MoveGeneratorEnum, required: false })
  @IsOptional()
  @IsEnum(MoveGeneratorEnum)
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
  logo?: string;

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
