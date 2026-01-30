import { Body, Controller, Post } from '@nestjs/common';
import { Player } from 'src/players/player.entity';
import { MatchResultDto } from './match-result.dto';
import { MatchsService } from './matchs.service';

@Controller('match')
export class MatchsController {
  constructor(private readonly matchsService: MatchsService) {}

  @Post()
  async publishResults(
    @Body() dto: MatchResultDto,
  ): Promise<{ winner: Player; loser: Player }> {
    return await this.matchsService.publicationResultats(dto);
  }
}
