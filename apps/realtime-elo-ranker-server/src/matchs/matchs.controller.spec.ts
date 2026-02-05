import { Test, TestingModule } from '@nestjs/testing';
import { MatchsController } from './matchs.controller';
import { MatchsService } from './matchs.service';
import { Player } from '../players/player.entity';
import { MatchResultDto } from './match-result.dto';

describe('MatchsController', () => {
  let controller: MatchsController;
  let matchsService: MatchsService;

  const mockWinner: Player = {
    id: 'Alice',
    rank: 1100,
  };

  const mockLoser: Player = {
    id: 'Bob',
    rank: 900,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchsController],
      providers: [
        {
          provide: MatchsService,
          useValue: {
            publicationResultats: jest.fn().mockResolvedValue({
              winner: mockWinner,
              loser: mockLoser,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<MatchsController>(MatchsController);
    matchsService = module.get<MatchsService>(MatchsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('publishResults', () => {
    it('devrait publier les résultats du match', async () => {
      const matchResultDto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: false,
      };

      const result = await controller.publishResults(matchResultDto);

      expect(matchsService.publicationResultats).toHaveBeenCalledWith(
        matchResultDto,
      );
      expect(result.winner).toEqual(mockWinner);
      expect(result.loser).toEqual(mockLoser);
    });

    it('devrait gérer un match nul', async () => {
      const matchResultDto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: true,
      };

      await controller.publishResults(matchResultDto);

      expect(matchsService.publicationResultats).toHaveBeenCalledWith(
        matchResultDto,
      );
    });

    it('devrait retourner les données du gagnant et du perdant', async () => {
      const matchResultDto: MatchResultDto = {
        winner: 'Alice',
        loser: 'Bob',
        draw: false,
      };

      const result = await controller.publishResults(matchResultDto);

      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('loser');
    });
  });
});
