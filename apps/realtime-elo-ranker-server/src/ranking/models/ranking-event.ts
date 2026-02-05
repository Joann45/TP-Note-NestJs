export enum RankingEventType {
  RankingUpdate = 'RankingUpdate',
  Error = 'Error',
}

export type RankingEvent =
  | RankingUpdate
  | {
      type: RankingEventType.Error;
      code: number;
      message?: string;
    };

export type RankingUpdate = {
  type: RankingEventType.RankingUpdate;
  player: {
    id: string;
    rank: number;
  };
};
