import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from './players/players.module';
import { RankingModule } from './ranking/ranking.module';
import { MatchsModule } from './matchs/matchs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Uniquement en dev
    }),
    PlayerModule,
    RankingModule,
    MatchsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
