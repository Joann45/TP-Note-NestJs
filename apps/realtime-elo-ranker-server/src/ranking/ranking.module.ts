import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingCacheService } from './ranking-cache.service';
import { Player } from '../players/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  controllers: [RankingController],
  providers: [RankingService, RankingCacheService],
  exports: [RankingService],
})
export class RankingModule {}
