import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { RankingEventEmitService } from '../ranking/ranking-event-emit.service';
import { CreatePlayerDto } from './createplayer.dto';
import { Player } from './player.entity';

describe('PlayersController', () => {
  let controller: PlayersController;
  let playersService: PlayersService;
  let rankingEventService: RankingEventEmitService;

  const mockPlayer: Player = {
    id: 'player1',
    rank: 1000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: {
            createPlayer: jest.fn().mockResolvedValue(mockPlayer),
            findAllPlayers: jest.fn().mockResolvedValue([mockPlayer]),
            findOnePlayer: jest.fn().mockResolvedValue(mockPlayer),
            updatePlayer: jest.fn().mockResolvedValue(mockPlayer),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RankingEventEmitService,
          useValue: {
            emitRankingUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    playersService = module.get<PlayersService>(PlayersService);
    rankingEventService = module.get<RankingEventEmitService>(
      RankingEventEmitService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('devrait créer un nouveau joueur et émettre une mise à jour du classement', async () => {
      const createPlayerDto: CreatePlayerDto = {
        id: 'player1',
      };

      const result = await controller.create(createPlayerDto);

      expect(playersService.createPlayer).toHaveBeenCalledWith(createPlayerDto);
      expect(rankingEventService.emitRankingUpdate).toHaveBeenCalledWith({
        type: 'RankingUpdate',
        player: mockPlayer,
      });
      expect(result).toEqual(mockPlayer);
    });

    it('devrait retourner le joueur créé', async () => {
      const createPlayerDto: CreatePlayerDto = {
        id: 'newPlayer',
      };

      const result = await controller.create(createPlayerDto);

      expect(result).toEqual(mockPlayer);
    });
  });
});
