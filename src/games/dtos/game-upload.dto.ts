import {
  IsString,
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsEnum,
  ValidateNested,
  IsArray,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DirectionEnum, GameRuleEnum, MoveGeneratorEnum, AreaTypeEnum, GameTypeEnum } from './game-enums';

import { AreaDto } from './game.dto';


@ValidatorConstraint({ name: 'uniqueAreaType', async: false })
export class UniqueAreaTypeConstraint implements ValidatorConstraintInterface {
  validate(areas: AreaDto[], args: ValidationArguments) {
    if (!areas || !Array.isArray(areas)) return false;
    const types = areas.map((area) => area.type);
    const uniqueTypes = new Set(types);
    return uniqueTypes.size === types.length;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Areas must have unique types';
  }
}

export class GameUploadDto {
  @ApiProperty({ description: '游戏名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '游戏类型', example: 'custom' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(GameTypeEnum)
  type: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({ description: '方向', enum: DirectionEnum })
  @IsEnum(DirectionEnum)
  direction: string;

  @ApiProperty({ description: '规则', enum: GameRuleEnum })
  @IsEnum(GameRuleEnum)
  gameRule: string;

  @ApiProperty({ description: '出牌生成器', enum: MoveGeneratorEnum })
  @IsEnum(MoveGeneratorEnum)
  moveGenerator: string;

  @ApiProperty({ description: '牌组数', minimum: 1, maximum: 5, example: 1 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  cardNum: number;

  @ApiProperty({ description: '玩家人数', minimum: 2, maximum: 10, example: 3 })
  @IsInt()
  @Min(2)
  @Max(10)
  @Type(() => Number)
  playerNum: number;

  @ApiProperty({ description: '支持的 App 版本', example: 2 })
  @IsInt()
  @Type(() => Number)
  supportAppVersion: number;

  @ApiProperty({ description: '信息牌计数映射', example: { 'A': 4, '2': 4 } })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  infoCardCounts: Record<string, number>;

  @ApiProperty({
    description: '区域列表 JSON (Array of AreaDto)',
    type: AreaDto,
    example: '[{"minX":0,"minY":0,"width":100,"height":100,"type":"selfHand"}]',
  })
  @Transform(({ value }) => {
    console.log('value', value);
    if (typeof value === 'string') {
      console.log('value is string');
      try {
        return JSON.parse(value) as AreaDto[];
      } catch {
        console.log('value is string but not json');
        return [];
      }
    }
    return value;
  })
  @IsArray()
  // @ValidateNested({ each: true }) has error
  @Type(() => AreaDto)
  @Validate(UniqueAreaTypeConstraint)
  areas: AreaDto[];
}

export class GameUploadDtoWithRSA extends GameUploadDto {
  @ApiProperty({ description: 'RSA 数据' })
  @IsString()
  @IsNotEmpty()
  rsaData: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: '背景图片 (max 3, < 512KB, jpg/jpeg/png)',
    required: false,
  })
  @IsOptional()
  backgrounds: any[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Logo图片 (max 1, jpg/jpeg/png)',
    required: false,
  })
  @IsOptional()
  logo: any;
}
