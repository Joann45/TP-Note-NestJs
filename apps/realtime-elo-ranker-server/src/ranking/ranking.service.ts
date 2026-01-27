import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { Repository } from 'typeorm';
import { RankingCacheService } from './ranking-cache.service';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly cacheService: RankingCacheService,
  ) {}

  async getRanking(): Promise<Player[]> {
    // Vérifier si le cache est valide
    const playersInCache = this.cacheService.getPlayersInCache();
    if (playersInCache) {
      return playersInCache;
    }

    const players = await this.playerRepository.find({
      order: { rank: 'DESC' },
    });
    if (!players.length) {
      throw new NotFoundException(
        "Le classement n'est pas disponible car aucun joueur n'existe",
      );
    }

    this.cacheService.setPlayersInCache(players);
    return players;
  }

  viderLeCache(): void {
    this.cacheService.viderCache();
  }
}
