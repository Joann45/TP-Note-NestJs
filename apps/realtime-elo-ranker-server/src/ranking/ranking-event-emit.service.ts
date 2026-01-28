import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { RankingEvent } from './models/ranking-event';

@Injectable()
export class RankingEventEmitService extends EventEmitter {
  constructor() {
    super();
  }

  emitRankingUpdate(event: RankingEvent) {
    this.emit('ranking-update', event);
  }

  onRankingUpdate(callback: (event: RankingEvent) => void) {
    this.on('ranking-update', callback);
  }

  offRankingUpdate(callback: (event: RankingEvent) => void) {
    this.off('ranking-update', callback);
  }
}
