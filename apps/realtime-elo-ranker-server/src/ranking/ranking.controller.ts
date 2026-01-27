import { Controller, Get } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { Player } from '../players/player.entity';

@Controller('ranking')
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Get()
  async getRanking(): Promise<Player[]> {
    return this.rankingService.getRanking();
  }
}
