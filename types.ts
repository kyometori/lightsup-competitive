export type BoardState = boolean[][];

export enum GameState {
  IDLE,
  COUNTDOWN,
  PLAYING,
  FINISHED,
  FAILED
}

export interface GameModes {
  isRandom: boolean;
  isHard: boolean;
}

export interface UserPreferences {
  showAnimations: boolean;
  showTimers: boolean;
  showMoveStats: boolean;
  countdownSeconds: number;
}

export interface BestTimeRecord {
  time: number;
  seed: string;
  isUserProvidedSeed: boolean;
}