import { Body, Controller, Post } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './createplayer.dto';
import { Player } from './player.entity';

@Controller('player')
export class PlayersController {
  constructor(private playerService: PlayersService) {}

  @Post()
  async create(@Body() dto: CreatePlayerDto): Promise<Player> {
    return await this.playerService.createPlayer(dto);
  }
}
