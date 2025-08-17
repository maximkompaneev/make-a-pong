import type { RefObject } from "react";
import type { Paddle } from "../core/entities/Paddle";
import type { Ball } from "../core/entities/Ball";
import type { AIDifficultyType } from "../config/difficulty";
import { useAIPaddle } from "./useAIPaddle";
import { usePlayerControls } from "./usePlayerControls"; //TODO: wtf error? 

type Settings = {
  canvas: { width: number; height: number };
  paddle: { width: number; height: number; speed: number; backgroundColor: string };
  ball: { radius: number; speed: number };
};

export function usePaddleControls(
  leftPaddleRef: RefObject<Paddle | null>,
  rightPaddleRef: RefObject<Paddle | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  ballRef: RefObject<Ball | null>,
  difficulty: AIDifficultyType,
  settings: Settings
) {
  const player = usePlayerControls(leftPaddleRef, canvasRef, settings);
  const ai = useAIPaddle(rightPaddleRef, ballRef, difficulty, settings);

  function movePaddles(dt: number) {
    player.update(dt);
    ai.update(dt);
  }

  return { movePaddles };
}
