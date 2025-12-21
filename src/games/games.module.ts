import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Game } from './games.entity';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Game]),
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
