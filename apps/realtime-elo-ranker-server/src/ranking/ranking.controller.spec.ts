import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingEventEmitService } from './ranking-event-emit.service';
import { Player } from '../players/player.entity';
import { NotFoundException } from '@nestjs/common';

describe('RankingController', () => {
  let controller: RankingController;
  let rankingService: RankingService;
  let rankingEventService: RankingEventEmitService;

  const mockPlayers: Player[] = [
    { id: 'Alice', rank: 1200 },
    { id: 'Bob', rank: 1100 },
    { id: 'John', rank: 1000 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: {
            getRanking: jest.fn().mockResolvedValue(mockPlayers),
            viderLeCache: jest.fn(),
          },
        },
        {
          provide: RankingEventEmitService,
          useValue: {
            onRankingUpdate: jest.fn(),
            offRankingUpdate: jest.fn(),
            emitRankingUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
    rankingService = module.get<RankingService>(RankingService);
    rankingEventService = module.get<RankingEventEmitService>(
      RankingEventEmitService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRanking', () => {
    it('devrait retourner la liste du classement triée par classement', async () => {
      const result = await controller.getRanking();

      expect(rankingService.getRanking).toHaveBeenCalled();
      expect(result).toEqual(mockPlayers);
      expect(result.length).toBe(3);
    });

    it('devrait appeler rankingService.getRanking()', async () => {
      await controller.getRanking();

      expect(rankingService.getRanking).toHaveBeenCalled();
    });
  });

  describe('abonnementRanking', () => {
    it('devrait définir les bonnes entêtes pour SSE', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback();
          }
        }),
      } as any;

      await controller.abonnementRanking(mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Connection',
        'keep-alive',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*',
      );
    });

    it('devrait enregistrer un écouteur de mise à jour du classement', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback();
          }
        }),
      } as any;

      await controller.abonnementRanking(mockResponse);

      expect(rankingEventService.onRankingUpdate).toHaveBeenCalled();
    });

    it("devrait désenregistrer l'écouteur à la fermeture", async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback();
          }
        }),
      } as any;

      await controller.abonnementRanking(mockResponse);

      expect(rankingEventService.offRankingUpdate).toHaveBeenCalled();
    });

    it("devrait gérer l'erreur lorsqu'aucun joueur n'existe", async () => {
      const errorMessage = 'No players found';
      jest
        .spyOn(rankingService, 'getRanking')
        .mockRejectedValueOnce(new NotFoundException(errorMessage));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      } as any;

      await controller.abonnementRanking(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it("devrait envoyer un événement d'erreur avec le bon format", async () => {
      const errorMessage = 'No players found';
      jest
        .spyOn(rankingService, 'getRanking')
        .mockRejectedValueOnce(new NotFoundException(errorMessage));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      } as any;

      await controller.abonnementRanking(mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"Error"'),
      );
    });
  });
});
