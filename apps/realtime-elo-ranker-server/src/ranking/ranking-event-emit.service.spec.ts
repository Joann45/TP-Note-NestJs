import { Test, TestingModule } from '@nestjs/testing';
import { RankingEventEmitService } from './ranking-event-emit.service';
import { RankingEvent, RankingEventType } from './models/ranking-event';

describe('RankingEventEmitService', () => {
  let service: RankingEventEmitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RankingEventEmitService],
    }).compile();

    service = module.get<RankingEventEmitService>(RankingEventEmitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('emitRankingUpdate', () => {
    it('devrait émettre un événement de mise à jour du classement', (done) => {
      const mockEvent: RankingEvent = {
        type: RankingEventType.RankingUpdate,
        player: {
          id: 'Alice',
          rank: 1200,
        },
      };

      const callback = jest.fn();
      service.onRankingUpdate(callback);
      service.emitRankingUpdate(mockEvent);

      setImmediate(() => {
        expect(callback).toHaveBeenCalledWith(mockEvent);
        done();
      });
    });

    it('devrait émettre plusieurs événements', (done) => {
      const event1: RankingEvent = {
        type: RankingEventType.RankingUpdate,
        player: {
          id: 'Alice',
          rank: 1200,
        },
      };

      const event2: RankingEvent = {
        type: RankingEventType.RankingUpdate,
        player: {
          id: 'Bob',
          rank: 1100,
        },
      };

      const callback = jest.fn();
      service.onRankingUpdate(callback);

      service.emitRankingUpdate(event1);
      service.emitRankingUpdate(event2);

      setImmediate(() => {
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenNthCalledWith(1, event1);
        expect(callback).toHaveBeenNthCalledWith(2, event2);
        done();
      });
    });
  });
});
