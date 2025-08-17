import type { GameState } from "./GameState";
import { pointsPerHit } from "./GameState";
import type { AIDifficultyType } from "../types";

export function applyScore(s: GameState, difficulty: AIDifficultyType) {
  s.hitStreak += 1;
  s.multiplier = s.hitStreak >= 5 ? 2 : s.hitStreak >= 3 ? 1.5 : 1;
  s.points += pointsPerHit[difficulty] * s.multiplier;

  // every 3 scores: 1 life (max 3)
  if ((s.hitStreak % 3) === 0 && s.lives < 3) s.lives += 1;
}

export function applyMiss(s: GameState) {
  s.lives -= 1;
  s.hitStreak = 0;
  s.multiplier = 1;
  if (s.lives <= 0) s.gameOver = true;
}
