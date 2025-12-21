import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { join } from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as archiver from 'archiver';

import { Game } from './games.entity';

@Injectable()
export class GamesService {
  private readonly logger = new Logger('app:GamesService');
  private readonly cache = new Map<string, { data: Game[]; expiresAt: number }>();
  private readonly ttlMs = 30 * 60 * 1000;

  constructor(@InjectModel(Game) private readonly model: typeof Game) {}

  async list(supportAppVersion: number): Promise<Game[]> {
    const key = JSON.stringify({ supportAppVersion });
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const result = await this.model.findAll({
      where: { supportAppVersion },
      order: [['updated_at', 'DESC']],
    });
    this.cache.set(key, { data: result, expiresAt: now + this.ttlMs });
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
