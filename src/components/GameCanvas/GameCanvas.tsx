import { useRef, useEffect, useState } from "react";
import { Ball } from "../../core/entities/Ball";
import { Paddle } from "../../core/entities/Paddle";
import { gameLoop } from "../../core/gameLoop";
import { checkPaddleCollision } from "../../core/physics/collisions";
import { usePaddleControls } from "../../hooks/usePaddleControls";
import { useGameSettings } from "../../stores/gameSettingsStore";
import { Popup } from "./Popup";
import { AIDifficultyType } from "../../core/types";

// Particle class
class Particle {
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public color: string,
    public size: number = 4,
    public life: number = 1
  ) {}
  update(delta: number) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.life -= delta;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<Ball | null>(null);
  const playerPaddleRef = useRef<Paddle>(null as any);
  const aiPaddleRef = useRef<Paddle>(null as any);
  const getSettings = () => useGameSettings.getState().settings;

  const [difficulty, setDifficulty] = useState<AIDifficultyType>("MEDIUM");
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  const pointsRef = useRef(0);
  const livesRef = useRef(3);
  const hitsSinceLifeRef = useRef(0);
  const isGameOverRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const shakeTimeRef = useRef(0);

  // --- New multiplier refs ---
  const hitStreakRef = useRef(0);
  const multiplierRef = useRef(1);

  const pointsPerHit: Record<AIDifficultyType, number> = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 4,
  };

  // Score / particle effects
  const createScoreEffect = (ballX: number, ballY: number, isPlayer: boolean) => {
    const colors = ["#6d00cc", "#337ab7", "#f024f6"];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 300 + 50;
      particlesRef.current.push(
        new Particle(
          ballX,
          ballY,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          colors[Math.floor(Math.random() * colors.length)],
          Math.random() * 4 + 2
        )
      );
    }

    shakeTimeRef.current = 0.3;

    if (isPlayer) {
      for (let i = 0; i < 30; i++) {
        const vx = (Math.random() - 0.5) * 200;
        const vy = -Math.random() * 300;
        particlesRef.current.push(
          new Particle(
            ballX,
            ballY,
            vx,
            vy,
            colors[Math.floor(Math.random() * colors.length)],
            5,
            1.5
          )
        );
      }
    }
  };

  // Draw hearts in top-left
  const drawLives = (ctx: CanvasRenderingContext2D) => {
    const heartSize = 30;
    const spacing = 5;
    for (let i = 0; i < 3; i++) {
      const heart = i < livesRef.current ? "❤️" : "🖤";
      const x = 10 + i * (heartSize + spacing) + heartSize;
      const y = 10;
      ctx.font = `${heartSize}px sans-serif`;
      ctx.fillText(heart, x, y + heartSize);
    }
  };

  const initGame = () => {
    const settings = getSettings();
    ballRef.current = new Ball(
      { x: settings.canvas.width / 2, y: settings.canvas.height / 2 },
      { x: settings.ball.speed, y: settings.ball.speed }
    );
    playerPaddleRef.current = new Paddle({
      x: 10,
      y: (settings.canvas.height - settings.paddle.height) / 2,
    });
    aiPaddleRef.current = new Paddle({
      x: settings.canvas.width - settings.paddle.width - 10,
      y: (settings.canvas.height - settings.paddle.height) / 2,
    });
  };

  const handleReset = () => {
    initGame();
    pointsRef.current = 0;
    livesRef.current = 3;
    hitsSinceLifeRef.current = 0;
    hitStreakRef.current = 0;
    multiplierRef.current = 1;
    setPoints(0);
    setLives(3);
    setIsGameOver(false);
    isGameOverRef.current = false;
    particlesRef.current = [];
  };

  const { movePaddles } = usePaddleControls(
    playerPaddleRef,
    aiPaddleRef,
    canvasRef,
    ballRef,
    difficulty
  );

  useEffect(() => {
    handleReset();
    const canvas = canvasRef.current;
    if (!canvas) return;

    return gameLoop(
      (delta) => {
        const settings = getSettings();
        const ball = ballRef.current;
        const player = playerPaddleRef.current;
        const ai = aiPaddleRef.current;
        if (!ball || !player || !ai || isGameOverRef.current) return;

        movePaddles(delta);
        ball.update(delta);

        // --- PLAYER MISSES (left side) ---
        if (ball.position.x - settings.ball.radius <= 0) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          createScoreEffect(ball.position.x, ball.position.y, false);
          ball.reset(settings);

          // Reset streak & multiplier
          hitStreakRef.current = 0;
          multiplierRef.current = 1;

          if (livesRef.current <= 0) {
            setIsGameOver(true);
            isGameOverRef.current = true;
          }

          return;
        }

        // --- PLAYER SCORES (right side) ---
        if (ball.position.x + settings.ball.radius >= settings.canvas.width) {
          // Increase streak
          hitStreakRef.current += 1;

          // Calculate multiplier based on streak
          if (hitStreakRef.current >= 5) multiplierRef.current = 2;
          else if (hitStreakRef.current >= 3) multiplierRef.current = 1.5;
          else multiplierRef.current = 1;

          // Add points with multiplier
          const pointsEarned = pointsPerHit[difficulty] * multiplierRef.current;
          pointsRef.current += pointsEarned;
          setPoints(pointsRef.current);

          hitsSinceLifeRef.current += 1;
          if (hitsSinceLifeRef.current >= 3 && livesRef.current < 3) {
            livesRef.current += 1;
            setLives(livesRef.current);
            hitsSinceLifeRef.current = 0;
          }

          createScoreEffect(ball.position.x, ball.position.y, true);
          ball.reset(settings);

          return;
        }

        // --- Paddle collisions ---
        checkPaddleCollision(ball, player, settings);
        checkPaddleCollision(ball, ai, settings);
      },
      () => {
        const settings = getSettings();
        const ball = ballRef.current;
        const player = playerPaddleRef.current;
        const ai = aiPaddleRef.current;
        if (!ball || !player || !ai) return;

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        // Screen shake
        let shakeX = 0,
          shakeY = 0;
        if (shakeTimeRef.current > 0) {
          shakeX = (Math.random() - 0.5) * 10;
          shakeY = (Math.random() - 0.5) * 10;
          shakeTimeRef.current -= 0.016;
        }

        ctx.save();
        ctx.translate(shakeX, shakeY);
        ctx.clearRect(0, 0, settings.canvas.width, settings.canvas.height);

        // Draw ball and paddles
        ball.draw(ctx);
        player.draw(ctx);
        ai.draw(ctx);

        // Draw particles
        particlesRef.current.forEach((p) => {
          p.update(0.016);
          p.draw(ctx);
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

        ctx.fillStyle = "#6d00cc";
        ctx.font = "18px sans-serif";
        ctx.textAlign = "right";

        // Score on first line (10px from top)
        ctx.fillText(`Score: ${pointsRef.current}`, settings.canvas.width - 10, 30);

        // StreakBonus on second line (below score)
        ctx.fillText(`Multiplier: ×${multiplierRef.current}`, settings.canvas.width - 10, 60);

        drawLives(ctx);

        ctx.restore();
      }
    );
  }, [difficulty]);

  return (
    <>
      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        {(["EASY", "MEDIUM", "HARD"] as AIDifficultyType[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            style={{
              background: difficulty === level ? "#6d00cc" : "#fff",
              color: difficulty === level ? "#fff" : "#000",
            }}
          >
            {level}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={getSettings().canvas.width}
        height={getSettings().canvas.height}
      />

      <Popup isOpen={isGameOver}>
        <div>
          <div className="game-over-text">
            Amazing! Your Score: {pointsRef.current}
          </div>
          <button onClick={handleReset}>Restart</button>
        </div>
      </Popup>
    </>
  );
}
