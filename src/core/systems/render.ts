import type { Ball } from "../entities/Ball";
import type { Paddle } from "../entities/Paddle";
import { drawHud } from "../hud/drawHud";
import { drawLives } from "../hud/drawLives";
import { drawGameOver } from "../hud/drawGameOver";
import type { ParticleSystem } from "../effects/ParticleSystem";
import type { ScreenShake } from "../effects/ScreenShake";

export function createRenderSystem(params: {
  settings: any;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ballRef: React.RefObject<Ball | null>;
  playerRef: React.RefObject<Paddle | null>;
  aiRef: React.RefObject<Paddle | null>;
  particles: ParticleSystem;
  shake: ScreenShake;

  isGameOverRef: React.MutableRefObject<boolean>;
  gameOverShakeLeftRef: React.MutableRefObject<number>;

  scoreRef: React.MutableRefObject<number>;
  multiplierRef: React.MutableRefObject<number>;
  livesRef: React.MutableRefObject<number>;
}) {
  const {
    settings, canvasRef, ballRef, playerRef, aiRef, particles, shake,
    isGameOverRef, gameOverShakeLeftRef, scoreRef, multiplierRef, livesRef,
  } = params;

  return function render() {
    const ball = ballRef.current;
    const player = playerRef.current;
    const ai = aiRef.current;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ball || !player || !ai || !ctx) return;

    const isGameOver = isGameOverRef.current;
    const shouldShake = !isGameOver || gameOverShakeLeftRef.current > 0;
    const { x, y } = shouldShake ? shake.getOffset() : { x: 0, y: 0 };

    ctx.save();
    ctx.translate(x, y);
    ctx.clearRect(0, 0, settings.canvas.width, settings.canvas.height);

    if (!isGameOver) {
      ball.draw(ctx, settings);
      player.draw(ctx, settings);
      ai.draw(ctx, settings);
    } else {
      drawGameOver(ctx, scoreRef.current, settings.canvas.width, settings.canvas.height);
    }

    particles.draw(ctx);

    if (!isGameOver) {
      drawHud(
        ctx,
        Math.floor(scoreRef.current),
        multiplierRef.current,
        settings.canvas.width,
        "#6d00cc"
      );
      drawLives(ctx, livesRef.current, 3, { x: 10, y: 10, size: 30, spacing: 5 });
    }

    ctx.restore();
  };
}
