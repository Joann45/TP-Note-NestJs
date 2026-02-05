import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from 'src/players/player.entity';
import { MatchsController } from './matchs.controller';
import { MatchsService } from './matchs.service';
import { RankingModule } from 'src/ranking/ranking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), RankingModule],
  controllers: [MatchsController],
  providers: [MatchsService],
})
export class MatchsModule {}
