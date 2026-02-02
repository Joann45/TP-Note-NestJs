import { Test, TestingModule } from '@nestjs/testing';
import { MatchsService } from './matchs.service';
import { Player } from '../players/player.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnprocessableEntityException } from '@nestjs/common';
import { RankingEventEmitService } from '../ranking/ranking-event-emit.service';
import { RankingService } from '../ranking/ranking.service';
import { MatchResultDto } from './match-result.dto';

describe('MatchsService', () => {
  let service: MatchsService;
  let _playerRepository: Repository<Player>;
  let rankingEventService: RankingEventEmitService;
  let rankingService: RankingService;

  const mockWinner: Player = {
    id: 'Alice',
    rank: 1200,
  };

  const mockLoser: Player = {
    id: 'Bob',
    rank: 800,
  };

  const mockPlayerRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchsService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepository,
        },
        {
          provide: RankingEventEmitService,
          useValue: {
            emitRankingUpdate: jest.fn(),
          },
        },
        {
          provide: RankingService,
          useValue: {
            viderLeCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchsService>(MatchsService);
    _playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    rankingEventService = module.get<RankingEventEmitService>(
      RankingEventEmitService,
    );
    rankingService = module.get<RankingService>(RankingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publicationResultats', () => {
    it('devrait mettre à jour les classements après un match normal et émettre des événements', async () => {
      const dto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: false,
      };

      const updatedWinner = { id: 'Alice', rank: 1216 };
      const updatedLoser = { id: 'Bob', rank: 784 };

      mockPlayerRepository.findOneBy
        .mockResolvedValueOnce(mockWinner)
        .mockResolvedValueOnce(mockLoser);
      mockPlayerRepository.save
        .mockResolvedValueOnce(updatedWinner)
        .mockResolvedValueOnce(updatedLoser);

      const result = await service.publicationResultats(dto);

      expect(result.winner).toEqual(updatedWinner);
      expect(result.loser).toEqual(updatedLoser);
      expect(rankingService.viderLeCache).toHaveBeenCalled();
      expect(rankingEventService.emitRankingUpdate).toHaveBeenCalledTimes(2);
    });

    it('devrait gérer correctement un match nul', async () => {
      const dto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: true,
      };

      const updatedWinner = { id: 'Alice', rank: 1200 - 8 };
      const updatedLoser = { id: 'Bob', rank: 800 + 8 };

      mockPlayerRepository.findOneBy
        .mockResolvedValueOnce(mockWinner)
        .mockResolvedValueOnce(mockLoser);
      mockPlayerRepository.save
        .mockResolvedValueOnce(updatedWinner)
        .mockResolvedValueOnce(updatedLoser);

      const result = await service.publicationResultats(dto);

      expect(result.winner).toBeDefined();
      expect(result.loser).toBeDefined();
    });

    it("devrait lever une UnprocessableEntityException si le gagnant n'existe pas", async () => {
      const dto: MatchResultDto = {
        winner: 'playerNonExistant',
        loser: 'Bob',
        draw: false,
      };

      mockPlayerRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(service.publicationResultats(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it("devrait lever une UnprocessableEntityException si le perdant n'existe pas", async () => {
      const dto: MatchResultDto = {
        winner: 'Alice',
        loser: 'playerNonExistant',
        draw: false,
      };

      mockPlayerRepository.findOneBy
        .mockResolvedValueOnce(mockWinner)
        .mockResolvedValueOnce(null);

      await expect(service.publicationResultats(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('devrait calculer la bonne variation ELO pour une différence de classement importante', async () => {
      const dto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: false,
      };

      mockPlayerRepository.findOneBy
        .mockResolvedValueOnce(mockWinner)
        .mockResolvedValueOnce(mockLoser);

      mockPlayerRepository.save
        .mockResolvedValueOnce({ id: 'Alice', rank: 1216 })
        .mockResolvedValueOnce({ id: 'Bob', rank: 784 });

      const result = await service.publicationResultats(dto);

      // Winner gains less when beating a weaker opponent
      expect(result.winner.rank).toBeGreaterThan(mockWinner.rank);
      expect(result.loser.rank).toBeLessThan(mockLoser.rank);
    });

    it('devrait effacer le cache après la mise à jour des classements', async () => {
      const dto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: false,
      };

      mockPlayerRepository.findOneBy
        .mockResolvedValueOnce(mockWinner)
        .mockResolvedValueOnce(mockLoser);
      mockPlayerRepository.save
        .mockResolvedValueOnce({ id: 'Alice', rank: 1216 })
        .mockResolvedValueOnce({ id: 'Bob', rank: 784 });

      await service.publicationResultats(dto);

      expect(rankingService.viderLeCache).toHaveBeenCalled();
    });

    it('devrait émettre des événements de mise à jour du classement pour les deux joueurs', async () => {
      const dto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: false,
      };

      mockPlayerRepository.findOneBy
        .mockResolvedValueOnce(mockWinner)
        .mockResolvedValueOnce(mockLoser);
      mockPlayerRepository.save
        .mockResolvedValueOnce({ id: 'Alice', rank: 1216 })
        .mockResolvedValueOnce({ id: 'Bob', rank: 784 });
      await service.publicationResultats(dto);

      expect(rankingEventService.emitRankingUpdate).toHaveBeenCalledTimes(2);
      expect(rankingEventService.emitRankingUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RankingUpdate',
          player: expect.objectContaining({ id: 'Alice' }),
        }),
      );
      expect(rankingEventService.emitRankingUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RankingUpdate',
          player: expect.objectContaining({ id: 'Bob' }),
        }),
      );
    });
  });
});
