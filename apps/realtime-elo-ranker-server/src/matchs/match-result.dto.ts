import { IsBoolean, IsString } from 'class-validator';

export class MatchResultDto {
  @IsString()
  winner: string;

  @IsString()
  loser: string;

  @IsBoolean()
  draw: boolean;
}
