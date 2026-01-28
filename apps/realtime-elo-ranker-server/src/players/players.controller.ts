import { Body, Controller, Post } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './createplayer.dto';
import { Player } from './player.entity';
import { RankingEventEmitService } from '../ranking/ranking-event-emit.service';
import { RankingEventType } from '../ranking/models/ranking-event';

@Controller('player')
export class PlayersController {
  constructor(
    private playerService: PlayersService,
    private rankingEventService: RankingEventEmitService,
  ) {}

  @Post()
  async create(@Body() dto: CreatePlayerDto): Promise<Player> {
    const player = await this.playerService.createPlayer(dto);
    this.rankingEventService.emitRankingUpdate({
      type: RankingEventType.RankingUpdate,
      player,
    });
    return player;
  }
}
