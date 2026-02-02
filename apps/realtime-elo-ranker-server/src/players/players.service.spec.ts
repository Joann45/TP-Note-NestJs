import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { CreatePlayerDto } from './createplayer.dto';

describe('PlayersService', () => {
  let service: PlayersService;
  let _repository: Repository<Player>;

  const mockPlayer: Player = {
    id: 'Alice',
    rank: 1000,
  };

  const mockPlayersRepository = {
    findOneBy: jest.fn(),
    average: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayersRepository,
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    _repository = module.get<Repository<Player>>(getRepositoryToken(Player));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPlayer', () => {
    it('devrait créer un nouveau joueur avec le classement moyen', async () => {
      const createPlayerDto: CreatePlayerDto = {
        id: 'newPlayer',
      };

      mockPlayersRepository.findOneBy.mockResolvedValueOnce(null);
      mockPlayersRepository.average.mockResolvedValueOnce(1200);
      mockPlayersRepository.create.mockReturnValueOnce({
        id: createPlayerDto.id,
        rank: 1200,
      });
      mockPlayersRepository.save.mockResolvedValueOnce({
        id: createPlayerDto.id,
        rank: 1200,
      });

      const result = await service.createPlayer(createPlayerDto);

      expect(mockPlayersRepository.findOneBy).toHaveBeenCalledWith({
        id: 'newPlayer',
      });
      expect(mockPlayersRepository.average).toHaveBeenCalledWith('rank');
      expect(mockPlayersRepository.create).toHaveBeenCalledWith({
        id: 'newPlayer',
        rank: 1200,
      });
      expect(mockPlayersRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'newPlayer',
        rank: 1200,
      });
    });

    it("devrait créer un nouveau joueur avec le classement par défaut de 1000 si aucun joueur n'existe", async () => {
      const createPlayerDto: CreatePlayerDto = {
        id: 'Bob',
      };

      mockPlayersRepository.findOneBy.mockResolvedValueOnce(null);
      mockPlayersRepository.average.mockResolvedValueOnce(null);
      mockPlayersRepository.create.mockReturnValueOnce({
        id: createPlayerDto.id,
        rank: 1000,
      });
      mockPlayersRepository.save.mockResolvedValueOnce({
        id: createPlayerDto.id,
        rank: 1000,
      });

      const result = await service.createPlayer(createPlayerDto);

      expect(result.rank).toBe(1000);
    });

    it('devrait lever une ConflictException si le joueur existe déjà', async () => {
      const createPlayerDto: CreatePlayerDto = {
        id: 'Alice',
      };

      mockPlayersRepository.findOneBy.mockResolvedValueOnce(mockPlayer);

      await expect(service.createPlayer(createPlayerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPlayersRepository.findOneBy).toHaveBeenCalledWith({
        id: 'Alice',
      });
    });
  });
});
