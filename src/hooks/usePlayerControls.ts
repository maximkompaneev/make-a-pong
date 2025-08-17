import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Paddle } from "../core/entities/Paddle";
import { debounce } from "../core/utils/debounce";

type Settings = {
  canvas: { width: number; height: number };
  paddle: { width: number; height: number };
};

export function usePlayerControls(
  paddleRef: RefObject<Paddle>,
  canvasRef: RefObject<HTMLCanvasElement>,
  settings: Settings
) {
  const targetYRef = useRef<number | null>(null);

  useEffect(() => {
    const getCanvasY = (clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return 0;
      const rect = canvas.getBoundingClientRect();
      const scaleY = settings.canvas.height / rect.height;
      return (clientY - rect.top) * scaleY - settings.paddle.height / 2;
    };

    const updateTargetY = (y: number) => { targetYRef.current = y; };

    const handleMouseMove = debounce((e: MouseEvent) => {
      if (!paddleRef.current || !canvasRef.current) return;
      updateTargetY(getCanvasY(e.clientY));
    }, 0.5);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!paddleRef.current || !canvasRef.current || e.touches.length === 0) return;
      updateTargetY(getCanvasY(e.touches[0].clientY));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [paddleRef, canvasRef, settings.canvas.height, settings.paddle.height]);

  function update(dt: number) {
    if (!paddleRef.current || targetYRef.current === null) return;
    const currentY = paddleRef.current.position.y;
    const targetY = targetYRef.current;
    const ease = 0.15;
    paddleRef.current.setPosition({
      x: paddleRef.current.position.x,
      y: currentY + (targetY - currentY) * ease,
    });
  }

  return { update };
}
