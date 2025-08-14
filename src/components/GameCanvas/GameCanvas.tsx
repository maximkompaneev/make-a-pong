import { useRef, useEffect, useState } from "react";
import { Ball } from "../../core/entities/Ball";
import { Paddle } from "../../core/entities/Paddle";
import { gameLoop } from "../../core/gameLoop";
import { checkPaddleCollision } from "../../core/physics/collisions";
import { usePaddleControls } from "../../hooks/usePaddleControls";
import { useGameSettings } from "../../stores/gameSettingsStore";
import { Popup } from "./Popup";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ballRef = useRef<Ball | null>(null);
  const leftPaddleRef = useRef<Paddle | null>(null);
  const rightPaddleRef = useRef<Paddle | null>(null);

  const update = useGameSettings((state) => state.update);
  const getSettings = () => useGameSettings.getState().settings;

  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"Left" | "Right" | null>(null);

  const isGameOverRef = useRef(false);
  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  const initGame = () => {
    const settings = getSettings();

    ballRef.current = new Ball(
      { x: settings.canvas.width / 2, y: settings.canvas.height / 2 },
      { x: settings.ball.speed, y: settings.ball.speed }
    );

    leftPaddleRef.current = new Paddle({
      x: 10,
      y: (settings.canvas.height - settings.paddle.height) / 2,
    });
    rightPaddleRef.current = new Paddle({
      x: settings.canvas.width - settings.paddle.width - 10,
      y: (settings.canvas.height - settings.paddle.height) / 2,
    });
  };

  // Initialize on mount
  useEffect(() => {
    initGame();
  }, []);

  const { movePaddles } = usePaddleControls(leftPaddleRef, rightPaddleRef);

  const handleReset = () => {
  // Reset scores in store
  const settings = getSettings();
  update("score", "left", 0);
  update("score", "right", 0);

  // Reset ball & paddles
  initGame();

  // Hide popup and allow game to continue
  setWinner(null);
  setIsGameOver(false);
  isGameOverRef.current = false;
};

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gameLoop(
      (delta) => {
        const settings = getSettings();
        if (!ballRef.current || !leftPaddleRef.current || !rightPaddleRef.current) return;
        if (isGameOverRef.current) return;

        movePaddles(delta);
        ballRef.current.update(delta);

        checkPaddleCollision(ballRef.current, leftPaddleRef.current, settings);
        checkPaddleCollision(ballRef.current, rightPaddleRef.current, settings);

        if (ballRef.current.position.x - settings.ball.radius < 0) {
          update("score", "right", settings.score.right + 1);
          ballRef.current.reset(settings);
        }
        if (ballRef.current.position.x + settings.ball.radius > settings.canvas.width) {
          update("score", "left", settings.score.left + 1);
          ballRef.current.reset(settings);
        }

        if (settings.score.left >= 5) {
          setWinner("Left");
          setIsGameOver(true);
          isGameOverRef.current = true;
        }
        if (settings.score.right >= 5) {
          setWinner("Right");
          setIsGameOver(true);
          isGameOverRef.current = true;
        }
      },
      () => {
        const settings = getSettings();
        if (!ballRef.current || !leftPaddleRef.current || !rightPaddleRef.current) return;

        ctx.clearRect(0, 0, settings.canvas.width, settings.canvas.height);

        ballRef.current.draw(ctx);
        leftPaddleRef.current.draw(ctx);
        rightPaddleRef.current.draw(ctx);

        ctx.fillStyle = "white";
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${settings.score.left} : ${settings.score.right}`, settings.canvas.width / 2, 50);
      }
    );
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={getSettings().canvas.width}
        height={getSettings().canvas.height}
        style={{ background: "black", display: "block", margin: "0 auto" }}
      />

      <Popup isOpen={isGameOver}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "yellow", fontSize: "30px", marginBottom: "20px" }}>
            {winner} Player Wins!
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
