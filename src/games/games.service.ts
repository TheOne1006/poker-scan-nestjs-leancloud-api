import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { join } from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as archiver from 'archiver';

import { Game } from './games.entity';
import { GameUploadDto } from './dtos';

@Injectable()
export class GamesService {
  private readonly logger = new Logger('app:GamesService');

  constructor(@InjectModel(Game) private readonly model: typeof Game) {}

  async upload(
    dto: GameUploadDto,
    files: { backgrounds?: Express.Multer.File[]; logo?: Express.Multer.File[] },
  ): Promise<Game> {
    // 1. Check Name Uniqueness
    const existing = await this.model.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Game with name ${dto.name} already exists`);
    }

    // 3. Process Files
    const backgrounds = files.backgrounds
      ? files.backgrounds.map((f) => `/uploads/backgrounds/${f.filename}`)
      : [];
    
    const logoPath = files.logo && files.logo.length > 0
      ? `/uploads/logos/${files.logo[0].filename}`
      : null;

    // 4. Create Game
    try {
      const game = await this.model.create({
        name: dto.name,
        type: dto.type,
        desc: dto.desc,
        direction: dto.direction,
        gameRule: dto.gameRule,
        moveGenerator: dto.moveGenerator,
        cardNum: dto.cardNum,
        playerNum: dto.playerNum,
        supportAppVersion: dto.supportAppVersion,
        areas: dto.areas,
        backgrounds: backgrounds,
        logoPath: logoPath,
        version: 1,
      });
      return game;
    } catch (error) {
       this.logger.error(`Failed to create game: ${error.message}`, error.stack);
       throw new BadRequestException(`Failed to create game: ${error.message}`);
    }
  }

  async list(supportAppVersion: number): Promise<Game[]> {
    const result = await this.model.findAll({
      where: { supportAppVersion },
      order: [['updated_at', 'DESC']],
    });
    return result;
  }

  async findByPk(id: string | number): Promise<Game | null> {
    return this.model.findByPk(id as any);
  }

  /**
   * 生成或复用 zip 包，并返回可访问的 URL
   */
  async buildZipAndGetUrl(instance: Game): Promise<string> {
    const root = join(__dirname, '../../..');
    const downloadsDir = join(root, 'public', 'downloads');
    await fse.ensureDir(downloadsDir);

    const zipName = `game-id${instance.id}-version${instance.version}.zip`;
    const zipPath = join(downloadsDir, zipName);

    if (fs.existsSync(zipPath)) {
      return `/downloads/${zipName}`;
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));
      archive.pipe(output);

      // 写入配置 JSON（使用 camelCase 字段）
      const payload = this.toExportJson(instance);
      archive.append(JSON.stringify(payload, null, 2), { name: 'game.json' });

      // 附加资源文件（背景与 logo）
      const assetsBase =
        process.env.GAMES_BASE_DIR || join(root, 'public');

      if (instance.backgrounds && Array.isArray(instance.backgrounds)) {
        for (const rel of instance.backgrounds) {
          const abs = join(assetsBase, rel);
          if (fs.existsSync(abs)) {
            archive.file(abs, { name: rel.replace(/^[\\/]/, '') });
          } else {
            this.logger.warn(`background file missing: ${abs}`);
          }
        }
      }

      if (instance.logoPath) {
        const logoAbs = join(assetsBase, instance.logoPath);
        if (fs.existsSync(logoAbs)) {
          archive.file(logoAbs, { name: instance.logoPath.replace(/^[\\/]/, '') });
        } else {
          this.logger.warn(`logo file missing: ${logoAbs}`);
        }
      }

      archive.finalize();
    });

    return `/downloads/${zipName}`;
  }

  /**
   * 导出 JSON：字段使用 camelCase，省略内部属性
   */
  private toExportJson(instance: Game) {
    const v = instance.toJSON() as any;
    return {
      id: v.id,
      name: v.name,
      type: v.type,
      desc: v.desc,
      direction: v.direction,
      gameRule: v.gameRule,
      moveGenerator: v.moveGenerator,
      cardNum: v.cardNum,
      playerNum: v.playerNum,
      infoCardCounts: v.infoCardCounts || {},
      areas: v.areas || [],
      backgrounds: v.backgrounds || [],
      logoPath: v.logoPath || '',
      version: v.version,
      supportAppVersion: v.supportAppVersion,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }
}
