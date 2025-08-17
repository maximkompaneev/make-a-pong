import type { Ball } from "../entities/Ball";
import type { Paddle } from "../entities/Paddle";
import { checkPaddleCollision } from "../physics/collisions";
import type { ParticleSystem } from "../effects/ParticleSystem";
import type { ScreenShake } from "../effects/ScreenShake";
import type { AIDifficultyType } from "../types";

type Settings = {
  canvas:{width:number;height:number};
  ball:{radius:number};
};

export function createUpdateSystem(params: {
  settings: any;
  ballRef: React.RefObject<Ball | null>;
  playerRef: React.RefObject<Paddle | null>;
  aiRef: React.RefObject<Paddle | null>;
  movePaddles: (dt:number)=>void;
  particles: ParticleSystem;
  shake: ScreenShake;

  // session stae
  difficulty: AIDifficultyType;
  pointsPerHit: Record<AIDifficultyType, number>;
  pointsRef: React.MutableRefObject<number>;
  livesRef: React.MutableRefObject<number>;
  hitsSinceLifeRef: React.MutableRefObject<number>;
  hitStreakRef: React.MutableRefObject<number>;
  multiplierRef: React.MutableRefObject<number>;
  isGameOverRef: React.MutableRefObject<boolean>;
  setPoints: (n:number)=>void;
  setLives: (n:number)=>void;
  setIsGameOver: (b:boolean)=>void;

  // game-over effects
  onGameOverBurst: ()=>void;
  gameOverShakeLeftRef: React.MutableRefObject<number>;
}) {
  const {
    settings, ballRef, playerRef, aiRef, movePaddles, particles, shake,
    difficulty, pointsPerHit, pointsRef, livesRef, hitsSinceLifeRef,
    hitStreakRef, multiplierRef, isGameOverRef, setPoints, setLives, setIsGameOver,
    onGameOverBurst, gameOverShakeLeftRef,
  } = params;

  return function update(dt: number) {
    const ball = ballRef.current;
    const player = playerRef.current;
    const ai = aiRef.current;
    if (!ball || !player || !ai) return;

    if (isGameOverRef.current) {
      shake.update(dt);
      if (gameOverShakeLeftRef.current > 0) {
        gameOverShakeLeftRef.current = Math.max(0, gameOverShakeLeftRef.current - dt);
      }
      particles.update(dt);
      return;
    }

    movePaddles(dt);
    ball.update(dt, settings);

    // miss (left wall)
    if (ball.position.x - settings.ball.radius <= 0) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      particles.burst(ball.position.x, ball.position.y);
      shake.start(0.3);
      ball.reset(settings);

      hitStreakRef.current = 0;
      multiplierRef.current = 1;

      if (livesRef.current <= 0) {
        setIsGameOver(true);
        isGameOverRef.current = true;

        shake.start(0.4);
        gameOverShakeLeftRef.current = 0.4;
        onGameOverBurst();
      }
      return;
    }

    // score (right wall)
    if (ball.position.x + settings.ball.radius >= settings.canvas.width) {
      hitStreakRef.current += 1;
      multiplierRef.current =
        hitStreakRef.current >= 5 ? 2 :
        hitStreakRef.current >= 3 ? 1.5 : 1;

      const earned = pointsPerHit[difficulty] * multiplierRef.current;
      pointsRef.current += earned;
      setPoints(pointsRef.current);

      hitsSinceLifeRef.current += 1;
      if (hitsSinceLifeRef.current >= 3 && livesRef.current < 3) {
        livesRef.current += 1;
        setLives(livesRef.current);
        hitsSinceLifeRef.current = 0;
      }

      particles.confetti(ball.position.x, ball.position.y);
      shake.start(0.3);
      ball.reset(settings);
      return;
    }

    // collisions
    checkPaddleCollision(ball, player, settings);
    checkPaddleCollision(ball, ai, settings);

    // systems
    shake.update(dt);
    particles.update(dt);
  };
}
