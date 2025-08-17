import { useRef } from "react";
import type { RefObject } from "react";
import type { Paddle } from "../core/entities/Paddle";
import type { Ball } from "../core/entities/Ball";
import { AIDifficulty, AIDifficultyType } from "../config/difficulty";

type Settings = {
  canvas: { width: number; height: number };
  paddle: { width: number; height: number };
  ball: { speed: number };
};

export function useAIPaddle(
  rightPaddleRef: RefObject<Paddle | null>,
  ballRef: RefObject<Ball | null>,
  difficulty: AIDifficultyType,
  settings: Settings
) {
  const pauseLeftRef = useRef(0);
  const idlePhaseRef = useRef(Math.random() * Math.PI * 2);

  const P = AIDifficulty[difficulty];

  const clampTop = (y: number) =>
    Math.max(0, Math.min(settings.canvas.height - settings.paddle.height, y));

  const expEase = (gain: number, dt: number) => 1 - Math.pow(1 - gain, dt * 60);

  function idle(dt: number, paddle: Paddle) {
    idlePhaseRef.current += (2 * Math.PI * dt) / P.idlePeriod;
    const amp = P.idleAmpFactor * settings.paddle.height;
    const mid = settings.canvas.height / 2 - settings.paddle.height / 2;
    const target = clampTop(mid + Math.sin(idlePhaseRef.current) * amp);
    const t = expEase(0.06, dt);
    const y = paddle.position.y + (target - paddle.position.y) * t;
    paddle.setPosition({ x: paddle.position.x, y: clampTop(y) });
  }

  function update(dt: number) {
    const paddle = rightPaddleRef.current;
    const ball = ballRef.current;

    if (!paddle) return;  // guard: no paddle yet
    if (!ball) { // guard: idle
      idle(dt, paddle);
      return;
    }

    const gate = (P as any).trackingGateX ?? 0.5;
    const tracking = ball.position.x > settings.canvas.width * gate && ball.velocity.x > 0;

    if (pauseLeftRef.current > 0) {
      pauseLeftRef.current--;
      idle(dt, paddle);
      return;
    }
    if (tracking && Math.random() < P.pauseChance) {
      pauseLeftRef.current = P.pauseFrames;
      idle(dt, paddle);
      return;
    }
    if (!tracking) {
      idle(dt, paddle);
      return;
    }

    const look = (P.lookAheadMs / 1000) * ball.velocity.y;
    const noise = (Math.random() - 0.5) * 2 * (P.noise * settings.paddle.height);
    const targetCenterY = ball.position.y + look + noise;

    const desiredTop = clampTop(targetCenterY - settings.paddle.height / 2);
    const t = expEase(P.follow, dt);
    const smoothTop = paddle.position.y + (desiredTop - paddle.position.y) * t;

    const maxV = P.maxSpeedFactor * settings.paddle.height;
    const maxStep = maxV * dt;
    const dead = (P as any).aimDeadzonePx ?? 0;
    const delta = smoothTop - paddle.position.y;
    if (Math.abs(delta) < dead) return;

    const step = Math.abs(delta) > maxStep ? Math.sign(delta) * maxStep : delta;
    paddle.setPosition({ x: paddle.position.x, y: clampTop(paddle.position.y + step) });
  }

  return { update };
}
