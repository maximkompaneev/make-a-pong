import { useRef, useEffect, useState } from "react";
import { Ball } from "../../core/entities/Ball";
import { Paddle } from "../../core/entities/Paddle";
import { gameLoop } from "../../core/gameLoop";
import { checkPaddleCollision } from "../../core/physics/collisions";
import { usePaddleControls } from "../../hooks/usePaddleControls";
import { useGameSettings } from "../../stores/gameSettingsStore";
import { Popup } from "./Popup";
import { AIDifficultyType } from "../../core/types";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef<Ball | null>(null);
  const playerPaddleRef = useRef<Paddle>(null as any);
  const aiPaddleRef = useRef<Paddle>(null as any);

  const update = useGameSettings((state) => state.update);
  const getSettings = () => useGameSettings.getState().settings;

  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"Player" | "AI" | null>(null);
  const [difficulty, setDifficulty] = useState<AIDifficultyType>("MEDIUM"); // new

  const isGameOverRef = useRef(false);

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
    const settings = getSettings();
    update("score", "left", 0);
    update("score", "right", 0);

    initGame();

    setWinner(null);
    setIsGameOver(false);
    isGameOverRef.current = false;
  };

  // Pass canvasRef to make the left paddle track mouse/touch correctly
  const { movePaddles } = usePaddleControls(
    playerPaddleRef,
    aiPaddleRef,
    canvasRef,
    ballRef,
    difficulty // pass current difficulty
  );

  useEffect(() => {
    initGame();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    return gameLoop(
      (delta) => {
        const settings = getSettings();
        const ball = ballRef.current;
        const player = playerPaddleRef.current;
        const ai = aiPaddleRef.current;
        if (!ball || !player || !ai || isGameOverRef.current) return;

        movePaddles(delta);
        ball.update(delta);

        checkPaddleCollision(ball, player, settings);
        checkPaddleCollision(ball, ai, settings);

        // Score handling
        if (ball.position.x - settings.ball.radius < 0) {
          update("score", "right", settings.score.right + 1); // AI scores
          ball.reset(settings);
        }
        if (ball.position.x + settings.ball.radius > settings.canvas.width) {
          update("score", "left", settings.score.left + 1); // Player scores
          ball.reset(settings);
        }

        // Check game over
        if (settings.score.left >= 5) {
          setWinner("Player");
          setIsGameOver(true);
          isGameOverRef.current = true;
        }
        if (settings.score.right >= 5) {
          setWinner("AI");
          setIsGameOver(true);
          isGameOverRef.current = true;
        }
      },
      () => {
        const settings = getSettings();
        const ball = ballRef.current;
        const player = playerPaddleRef.current;
        const ai = aiPaddleRef.current;
        if (!ball || !player || !ai) return;

        ctx.clearRect(0, 0, settings.canvas.width, settings.canvas.height);

        ball.draw(ctx);
        player.draw(ctx);
        ai.draw(ctx);

        ctx.fillStyle = "#6d00cc";
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `${settings.score.left} : ${settings.score.right}`,
          settings.canvas.width / 2,
          50
        );
      }
    );
  }, [difficulty]); // add difficulty to dependency so AI updates if it changes

  return (
    <>
      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        {/* Difficulty buttons */}
        {(["EASY", "MEDIUM", "HARD"] as AIDifficultyType[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            style={{
              margin: "0 5px",
              padding: "5px 15px",
              cursor: "pointer",
              background: difficulty === level ? "#6d00cc" : "#fff",
              color: difficulty === level ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              marginBlockEnd: "16px",
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
          <div style={{ color: "yellow", fontSize: "30px", marginBottom: "20px" }}>
            {winner} Wins!
          </div>
          <button
            onClick={handleReset}
            style={{ fontSize: "20px", padding: "10px 20px", cursor: "pointer" }}
          >
            Restart Game
          </button>
        </div>
      </Popup>
    </>
  );
}
