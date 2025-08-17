import type { AIDifficultyType } from "../types";

export type GameState = {
  points: number;
  lives: number;
  hitStreak: number;
  multiplier: number;
  gameOver: boolean;
};

export function createInitialState(): GameState {
  return { points: 0, lives: 3, hitStreak: 0, multiplier: 1, gameOver: false };
}

export function resetState(s: GameState) {
  s.points = 0; s.lives = 3; s.hitStreak = 0; s.multiplier = 1; s.gameOver = false;
}

export const pointsPerHit: Record<AIDifficultyType, number> = {
  EASY: 1, MEDIUM: 2, HARD: 4,
};
