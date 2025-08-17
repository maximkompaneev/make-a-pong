// components/GameCanvas.tsx
import { useRef, useEffect } from "react";
import gameConfig from "../../config/gameConfig";
import { Ball } from "../../core/entities/Ball";
import { Paddle } from "../../core/entities/Paddle";
import { gameLoop } from "../../core/gameLoop";
import { usePaddleControls } from "../../hooks/usePaddleControls";
import { ParticleSystem } from "../../core/effects/ParticleSystem";
import { ScreenShake } from "../../core/effects/ScreenShake";
import { useGameSession } from "../../core/session/useGameSession";
import { createUpdateSystem } from "../../core/systems/update";
import { createRenderSystem } from "../../core/systems/render";
import type { AIDifficultyType } from "../../core/types";

const settings = gameConfig;
const POINTS_PER_HIT: Record<AIDifficultyType, number> = { EASY: 1, MEDIUM: 2, HARD: 4 };

export default function GameCanvas() {
  // canvas & entities
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballRef = useRef<Ball | null>(null);
  const playerRef = useRef<Paddle | null>(null);
  const aiRef = useRef<Paddle | null>(null);

  // systems
  const particlesRef = useRef(new ParticleSystem());
  const shakeRef = useRef(new ScreenShake());
  const gameOverShakeLeftRef = useRef(0);
  const gameOverBurstDoneRef = useRef(false);

  // session
  const {
    difficulty, setDifficulty,
    pointsRef, livesRef, hitsSinceLifeRef,
    isGameOverRef, hitStreakRef, multiplierRef,
    setPoints, setLives, setIsGameOver, resetSession,
  } = useGameSession();

  // init entities
  function initGame() {
    ballRef.current = new Ball(
      { x: settings.canvas.width / 2, y: settings.canvas.height / 2 },
      { x: settings.ball.speed, y: settings.ball.speed }
    );
    playerRef.current = new Paddle({
      x: 10,
      y: (settings.canvas.height - settings.paddle.height) / 2,
    });
    aiRef.current = new Paddle({
      x: settings.canvas.width - settings.paddle.width - 10,
      y: (settings.canvas.height - settings.paddle.height) / 2,
    });
  }

  // reset
  function handleReset() {
    initGame();
    particlesRef.current.clear();
    shakeRef.current.reset?.();
    resetSession();
    gameOverBurstDoneRef.current = false;
  }

  // restart controls (click / space / enter)
  useEffect(() => {
    const maybeRestart = () => { if (isGameOverRef.current) handleReset(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); maybeRestart(); }
    };
    const onClick = () => maybeRestart();
    const c = canvasRef.current;
    c?.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      c?.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // input (player + AI)
  const { movePaddles } = usePaddleControls(
    playerRef, aiRef, canvasRef, ballRef, difficulty, settings
  );

  // build update/render functions
  const update = createUpdateSystem({
    settings,
    ballRef,
    playerRef,
    aiRef,
    movePaddles,
    particles: particlesRef.current,
    shake: shakeRef.current,
    difficulty,
    pointsPerHit: POINTS_PER_HIT,
    pointsRef, livesRef, hitsSinceLifeRef, hitStreakRef, multiplierRef,
    isGameOverRef, setPoints, setLives, setIsGameOver,
    onGameOverBurst: () => {
      if (!gameOverBurstDoneRef.current) {
        particlesRef.current.mega(settings.canvas.width / 2, settings.canvas.height / 2);
        gameOverBurstDoneRef.current = true;
      }
    },
    gameOverShakeLeftRef,
  });

  const render = createRenderSystem({
    settings,
    canvasRef,
    ballRef,
    playerRef,
    aiRef,
    particles: particlesRef.current,
    shake: shakeRef.current,
    isGameOverRef,
    gameOverShakeLeftRef,
    scoreRef: pointsRef,
    multiplierRef,
    livesRef,
  });

  // main loop
  useEffect(() => {
    handleReset();
    return gameLoop(update, render);
  }, [difficulty]); // changing difficulty restarts loop

  return (
    <>
      <div className="controls">
        {(["EASY","MEDIUM","HARD"] as AIDifficultyType[]).map(level => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            style={{ background: difficulty === level ? "#6d00cc" : "#fff", color: difficulty === level ? "#fff" : "#000" }}
          >
            {level}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={settings.canvas.width}
        height={settings.canvas.height}
      />
    </>
  );
}
