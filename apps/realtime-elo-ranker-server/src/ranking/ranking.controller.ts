import { Controller, Get, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { RankingService } from './ranking.service';
import { RankingEventEmitService } from './ranking-event-emit.service';
import { Player } from '../players/player.entity';
import { RankingEvent, RankingEventType } from './models/ranking-event';

@Controller('ranking')
export class RankingController {
  constructor(
    private rankingService: RankingService,
    private rankingEventService: RankingEventEmitService,
  ) {}

  @Get()
  async getRanking(): Promise<Player[]> {
    return this.rankingService.getRanking();
  }

  @Get('events')
  async abonnementRanking(@Res() res: Response): Promise<void> {
    try {
      await this.rankingService.getRanking();
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404);
        res.write(
          `data: ${JSON.stringify({
            type: RankingEventType.Error,
            code: 404,
            message: error.message,
          })}\n\n`,
        );
        res.end();
        return;
      }
      throw error;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const handleRankingUpdate = (event: RankingEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    this.rankingEventService.onRankingUpdate(handleRankingUpdate);

    res.on('close', () => {
      this.rankingEventService.offRankingUpdate(handleRankingUpdate);
      res.end();
    });
  }
}
