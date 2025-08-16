import { useEffect, useRef } from "react";
import type { Paddle } from "../core/entities/Paddle";
import { useGameSettings } from "../stores/gameSettingsStore";
import { debounce } from "../core/utils/debounce";
import { AIDifficulty, AIDifficultyType } from "../core/types";

export function usePaddleControls(
  leftPaddleRef: React.RefObject<Paddle>,
  rightPaddleRef: React.RefObject<Paddle>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  ballRef?: React.RefObject<{ position: { x: number; y: number }; velocity: { x: number; y: number } }>,
  difficulty: AIDifficultyType = "MEDIUM"
) {
  const targetYRef = useRef<number | null>(null);
  const aiPauseRef = useRef(0);
  const { settings } = useGameSettings.getState();
  const aiParams = AIDifficulty[difficulty];

  useEffect(() => {
    function getCanvasY(clientY: number) {
      if (!canvasRef?.current) return 0;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleY = settings.canvas.height / rect.height;
      return (clientY - rect.top) * scaleY - settings.paddle.height / 2;
    }

    const updateTargetY = (y: number) => {
      targetYRef.current = y;
    };

    const handleMouseMove = debounce((e: MouseEvent) => {
      if (!leftPaddleRef.current || !canvasRef.current) return;
      updateTargetY(getCanvasY(e.clientY));
    }, 2);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent mobile scrolling
      if (!leftPaddleRef.current || !canvasRef.current || e.touches.length === 0) return;
      updateTargetY(getCanvasY(e.touches[0].clientY));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [leftPaddleRef, canvasRef, settings.canvas.height, settings.paddle.height]);

  return {
    movePaddles: (delta: number) => {
      // Smooth left paddle movement
      if (leftPaddleRef.current && targetYRef.current !== null) {
        const currentY = leftPaddleRef.current.position.y;
        const targetY = targetYRef.current;
        const ease = 0.3;
        leftPaddleRef.current.setPosition({
          x: leftPaddleRef.current.position.x,
          y: currentY + (targetY - currentY) * ease,
        });
      }

      // Right paddle AI
      if (rightPaddleRef.current && ballRef?.current) {
        const ballX = ballRef.current.position.x;
        const ballY = ballRef.current.position.y;
        const ballVelX = ballRef.current.velocity.x;
        const ballVelY = ballRef.current.velocity.y;
        const currentY = rightPaddleRef.current.position.y;

        // Only move if ball is coming toward AI (moving right)
        if (ballX > settings.canvas.width / 2 && ballVelX > 0) {
          if (aiPauseRef.current > 0) {
            aiPauseRef.current--;
            return;
          }
          if (Math.random() < aiParams.pauseChance) {
            aiPauseRef.current = aiParams.pauseFrames;
            return;
          }

          const paddleCenterY = currentY + settings.paddle.height / 2;
          const diff = ballY - paddleCenterY;
          const randomError = (Math.random() - 0.5) * settings.paddle.height * aiParams.errorFactor;

          // Scale aiEase by ball speed
          const ballSpeed = Math.sqrt(ballVelX ** 2 + ballVelY ** 2);
          const scaledEase = aiParams.aiEase * ballSpeed / settings.ball.speed; 
          // divide by base ball speed so difficulty remains relative

          const newY = currentY + (diff + randomError) * scaledEase;

          rightPaddleRef.current.setPosition({
            x: rightPaddleRef.current.position.x,
            y: newY,
          });
        }
      }
    },
  };
}
