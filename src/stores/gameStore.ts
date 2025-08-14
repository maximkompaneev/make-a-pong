import { create } from "zustand";
import { Ball } from "../core/entities/Ball";
import { Paddle } from "../core/entities/Paddle";

interface GameState {
  ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  score: { left: number; right: number };
}

export const useGameStore = create<GameState>(() => ({
  ball: null as any,
  leftPaddle: null as any,
  rightPaddle: null as any,
  score: { left: 0, right: 0 }
}));
