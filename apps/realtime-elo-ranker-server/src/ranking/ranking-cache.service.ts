import { Injectable } from '@nestjs/common';
import { Player } from '../players/player.entity';

@Injectable()
export class RankingCacheService {
  private playersInCache: Player[] | null = null;
  private derniereMAJ: Date | null = null;

  getPlayersInCache(): Player[] | null {
    return this.playersInCache;
  }

  setPlayersInCache(players: Player[]): void {
    this.playersInCache = players;
    this.derniereMAJ = new Date();
  }

  viderCache(): void {
    this.playersInCache = null;
    this.derniereMAJ = null;
  }

  isCacheValid(): boolean {
    return this.playersInCache !== null;
  }

  getderniereMAJ(): Date | null {
    return this.derniereMAJ;
  }
}
