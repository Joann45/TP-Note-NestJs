import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { RankingCacheService } from './ranking-cache.service';
import { Player } from '../players/player.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('RankingService', () => {
  let service: RankingService;
  let _playerRepository: Repository<Player>;
  let cacheService: RankingCacheService;

  const mockPlayers: Player[] = [
    { id: 'Alice', rank: 1200 },
    { id: 'Bob', rank: 1100 },
    { id: 'John', rank: 1000 },
  ];

  const mockPlayerRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        RankingCacheService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepository,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    _playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    cacheService = module.get<RankingCacheService>(RankingCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRanking', () => {
    it('devrait retourner le classement de la base de données trié par classement décroissant', async () => {
      mockPlayerRepository.find.mockResolvedValueOnce(mockPlayers);

      const result = await service.getRanking();

      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        order: { rank: 'DESC' },
      });
      expect(result).toEqual(mockPlayers);
    });

    it("devrait retourner le classement à partir du cache s'il est disponible", async () => {
      jest
        .spyOn(cacheService, 'getPlayersInCache')
        .mockReturnValueOnce(mockPlayers);

      const result = await service.getRanking();

      expect(cacheService.getPlayersInCache).toHaveBeenCalled();
      expect(mockPlayerRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual(mockPlayers);
    });

    it('devrait mettre en cache le classement après avoir récupéré à partir de la base de données', async () => {
      jest.spyOn(cacheService, 'getPlayersInCache').mockReturnValueOnce(null);
      jest.spyOn(cacheService, 'setPlayersInCache');

      mockPlayerRepository.find.mockResolvedValueOnce(mockPlayers);

      const result = await service.getRanking();

      expect(cacheService.setPlayersInCache).toHaveBeenCalledWith(mockPlayers);
      expect(result).toEqual(mockPlayers);
    });

    it("devrait lever une NotFoundException si aucun joueur n'existe", async () => {
      jest.spyOn(cacheService, 'getPlayersInCache').mockReturnValueOnce(null);
      mockPlayerRepository.find.mockResolvedValueOnce([]);

      await expect(service.getRanking()).rejects.toThrow(NotFoundException);
    });

    it('devrait lever une NotFoundException avec le message approprié', async () => {
      jest.spyOn(cacheService, 'getPlayersInCache').mockReturnValueOnce(null);
      mockPlayerRepository.find.mockResolvedValueOnce([]);

      await expect(service.getRanking()).rejects.toThrow(
        "Le classement n'est pas disponible car aucun joueur n'existe",
      );
    });
  });

  describe('viderLeCache', () => {
    it('devrait effacer le cache du classement', () => {
      jest.spyOn(cacheService, 'viderCache');

      service.viderLeCache();

      expect(cacheService.viderCache).toHaveBeenCalled();
    });
  });
});
