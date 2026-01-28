import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingEventEmitService } from './ranking-event-emit.service';
import { RankingCacheService } from './ranking-cache.service';
import { Player } from '../players/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  controllers: [RankingController],
  providers: [RankingService, RankingEventEmitService, RankingCacheService],
  exports: [RankingEventEmitService, RankingService],
})
export class RankingModule {}
