import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), RankingModule],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayerModule {}
