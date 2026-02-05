import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { Repository } from 'typeorm';
import { MatchResultDto } from './match-result.dto';
import { RankingEventEmitService } from '../ranking/ranking-event-emit.service';
import { RankingEventType } from '../ranking/models/ranking-event';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class MatchsService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly rankingEventService: RankingEventEmitService,
    private readonly rankingService: RankingService,
  ) {}

  async publicationResultats(
    dto: MatchResultDto,
  ): Promise<{ winner: Player; loser: Player }> {
    const winner = await this.playerRepository.findOneBy({ id: dto.winner });
    const loser = await this.playerRepository.findOneBy({ id: dto.loser });

    if (!winner || !loser) {
      throw new UnprocessableEntityException(
        "Soit le gagnant, soit le perdant indiqué n'existe pas",
      );
    }

    const k = 32;

    const Wwinner = 1 / (1 + Math.pow(10, (loser.rank - winner.rank) / 400));
    const Wloser = 1 / (1 + Math.pow(10, (winner.rank - loser.rank) / 400));

    const scoreWinner = dto.draw ? 0.5 : 1;
    const scoreLoser = dto.draw ? 0.5 : 0;

    winner.rank = Math.round(winner.rank + k * (scoreWinner - Wwinner));
    loser.rank = Math.round(loser.rank + k * (scoreLoser - Wloser));

    const updatedWinner = await this.playerRepository.save(winner);
    const updatedLoser = await this.playerRepository.save(loser);

    // On vide le cache du classement après chaque mise à jour du classement
    this.rankingService.viderLeCache();

    // On envoie un événement de mise à jour du classement
    this.rankingEventService.emitRankingUpdate({
      type: RankingEventType.RankingUpdate,
      player: {
        id: updatedWinner.id,
        rank: updatedWinner.rank,
      },
    });

    this.rankingEventService.emitRankingUpdate({
      type: RankingEventType.RankingUpdate,
      player: {
        id: updatedLoser.id,
        rank: updatedLoser.rank,
      },
    });

    return { winner: updatedWinner, loser: updatedLoser };
  }
}
