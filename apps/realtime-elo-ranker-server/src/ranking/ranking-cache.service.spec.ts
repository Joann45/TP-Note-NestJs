import { Test, TestingModule } from '@nestjs/testing';
import { RankingCacheService } from './ranking-cache.service';
import { Player } from '../players/player.entity';

describe('RankingCacheService', () => {
  let service: RankingCacheService;

  const mockPlayers: Player[] = [
    { id: 'Alice', rank: 1200 },
    { id: 'Bob', rank: 1100 },
    { id: 'John', rank: 1000 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RankingCacheService],
    }).compile();

    service = module.get<RankingCacheService>(RankingCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlayersInCache', () => {
    it('devrait retourner null initialement', () => {
      const result = service.getPlayersInCache();
      expect(result).toBeNull();
    });

    it("devrait retourner les joueurs mis en cache s'ils sont définis", () => {
      service.setPlayersInCache(mockPlayers);
      const result = service.getPlayersInCache();
      expect(result).toEqual(mockPlayers);
    });
  });

  describe('setPlayersInCache', () => {
    it('devrait mettre en cache les joueurs', () => {
      service.setPlayersInCache(mockPlayers);

      const result = service.getPlayersInCache();
      expect(result).toEqual(mockPlayers);
    });

    it("devrait mettre à jour l'horodatage du cache", () => {
      service.setPlayersInCache(mockPlayers);

      const timestamp = service.getderniereMAJ();
      expect(timestamp).toBeTruthy();
      expect(timestamp).toBeInstanceOf(Date);
    });

    it("devrait mettre à jour l'horodatage à chaque appel", (done) => {
      service.setPlayersInCache(mockPlayers);
      const firstTimestamp = service.getderniereMAJ();

      setTimeout(() => {
        service.setPlayersInCache(mockPlayers);
        const secondTimestamp = service.getderniereMAJ();

        expect(secondTimestamp!.getTime()).toBeGreaterThanOrEqual(
          firstTimestamp!.getTime(),
        );
        done();
      }, 10);
    });
  });

  describe('viderCache', () => {
    it('devrait effacer les joueurs mis en cache', () => {
      service.setPlayersInCache(mockPlayers);
      service.viderCache();

      const result = service.getPlayersInCache();
      expect(result).toBeNull();
    });

    it("devrait effacer l'horodatage du cache", () => {
      service.setPlayersInCache(mockPlayers);
      service.viderCache();

      const timestamp = service.getderniereMAJ();
      expect(timestamp).toBeNull();
    });

    it('devrait invalider le cache', () => {
      service.setPlayersInCache(mockPlayers);
      service.viderCache();

      const isValid = service.isCacheValid();
      expect(isValid).toBeFalsy();
    });
  });

  describe('isCacheValid', () => {
    it('devrait retourner false quand le cache est vide', () => {
      const result = service.isCacheValid();
      expect(result).toBeFalsy();
    });

    it('devrait retourner true quand le cache contient des données', () => {
      service.setPlayersInCache(mockPlayers);

      const result = service.isCacheValid();
      expect(result).toBeTruthy();
    });

    it('devrait retourner false après que le cache soit vidé', () => {
      service.setPlayersInCache(mockPlayers);
      service.viderCache();

      const result = service.isCacheValid();
      expect(result).toBeFalsy();
    });
  });

  describe('getderniereMAJ', () => {
    it('devrait retourner null initialement', () => {
      const result = service.getderniereMAJ();
      expect(result).toBeNull();
    });

    it('devrait retourner une Date quand le cache est défini', () => {
      service.setPlayersInCache(mockPlayers);

      const result = service.getderniereMAJ();
      expect(result).toBeInstanceOf(Date);
    });

    it('devrait retourner null après que le cache soit vidé', () => {
      service.setPlayersInCache(mockPlayers);
      service.viderCache();

      const result = service.getderniereMAJ();
      expect(result).toBeNull();
    });
  });
});
