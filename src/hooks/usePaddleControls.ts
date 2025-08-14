import { useEffect } from "react";
import type { Paddle } from "../core/entities/Paddle";

export function usePaddleControls(
  leftPaddleRef: React.RefObject<Paddle | null>,
  rightPaddleRef: React.RefObject<Paddle | null>
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (leftPaddleRef.current) {
        if (e.key === "w" || e.key === "W") leftPaddleRef.current.move(-1, 1);
        if (e.key === "s" || e.key === "S") leftPaddleRef.current.move(1, 1);
      }

      if (rightPaddleRef.current) {
        if (e.key === "ArrowUp") rightPaddleRef.current.move(-1, 1);
        if (e.key === "ArrowDown") rightPaddleRef.current.move(1, 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leftPaddleRef, rightPaddleRef]);

  return {
    movePaddles: (delta: number) => {
      if (leftPaddleRef.current) leftPaddleRef.current.move(0, delta);
      if (rightPaddleRef.current) rightPaddleRef.current.move(0, delta);
    },
  };
}
