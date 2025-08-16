export interface Vector2D {
  x: number;
  y: number;
}

export const AIDifficulty = {
  EASY: { aiEase: 0.03, errorFactor: 0.35, pauseChance: 0.05, pauseFrames: 10 },
  MEDIUM: { aiEase: 0.05, errorFactor: 0.25, pauseChance: 0.03, pauseFrames: 5 },
  HARD: { aiEase: 0.08, errorFactor: 0.1, pauseChance: 0.01, pauseFrames: 2 },
} as const;



export type AIDifficultyType = keyof typeof AIDifficulty;