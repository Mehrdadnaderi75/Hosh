
export enum GameStep {
  LOADING = 'LOADING',
  SELECTION = 'SELECTION',
  START = 'START',
  STEP_PROCESS = 'STEP_PROCESS',
  REVEAL = 'REVEAL'
}

export type GameType = 'CLASSIC' | 'MULTIPLIER' | 'TRIPLE' | 'NINE_MAGIC' | 'LUCKY_SEVEN' | 'EASY_THREE';

export interface GameStepDetail {
  text: string;
  subText?: string;
  highlight?: string | number;
  color?: string;
}

export interface GameMetadata {
  id: GameType;
  title: string;
  description: string;
  icon: string;
  calculateResult: (add: number, sub: number) => number;
  getSteps: (add: number, sub: number) => GameStepDetail[];
}

export interface GameState {
  step: GameStep;
  currentGame: GameType | null;
  currentStepIndex: number;
  addValue: number;
  subValue: number;
}
