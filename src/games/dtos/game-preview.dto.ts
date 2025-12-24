import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { GameTypeEnum } from './game-enums';

export class GamePreviewDto {
  @Expose()
  id: number;

  @ApiProperty({ example: '示例游戏', description: '游戏名称' })
  @Expose()
  name: string;

  @ApiProperty({
    example: GameTypeEnum.StandardDouDiZhu,
    enum: GameTypeEnum,
    description: '游戏类型',
  })
  @Expose()
  type: string;

  @ApiProperty({ example: 1, description: '版本号' })
  @IsInt()
  @Expose()
  version: number;

  @ApiProperty({ example: 100, description: '支持的 App 版本' })
  @IsInt()
  @IsOptional()
  @Expose()
  supportAppVersion: number;

  @ApiProperty({
    example: 'assets/logos/game-logo.png',
    description: 'logo 相对路径',
  })
  @IsOptional()
  @IsString()
  @Expose()
  logo?: string;
}
