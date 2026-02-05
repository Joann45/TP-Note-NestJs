import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './createplayer.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async createPlayer(dto: CreatePlayerDto): Promise<Player> {
    const playerExist = await this.playersRepository.findOneBy({ id: dto.id });
    if (playerExist) {
      throw new ConflictException(`Player with id ${dto.id} already exists`);
    }
    const moyenne = await this.playersRepository.average('rank');

    const newPlayer = this.playersRepository.create({
      id: dto.id,
      rank: moyenne ?? 1000,
    });
    return this.playersRepository.save(newPlayer) as Promise<Player>;
  }
}
