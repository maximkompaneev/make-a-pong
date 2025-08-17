import { useRef, useState } from "react";
import type { AIDifficultyType } from "../../core/types";

export function useGameSession() {
  const [difficulty, setDifficulty] = useState<AIDifficultyType>(
    () => (localStorage.getItem("pong:difficulty") as AIDifficultyType) || "MEDIUM"
  );
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  const pointsRef = useRef(0);
  const livesRef = useRef(3);
  const hitsSinceLifeRef = useRef(0);
  const isGameOverRef = useRef(false);

  const hitStreakRef = useRef(0);
  const multiplierRef = useRef(1);

  function persistDifficulty(d: AIDifficultyType) {
    setDifficulty(d);
    try { localStorage.setItem("pong:difficulty", d); } catch {}
  }

  function resetSession() {
    pointsRef.current = 0;
    livesRef.current = 3;
    hitsSinceLifeRef.current = 0;
    hitStreakRef.current = 0;
    multiplierRef.current = 1;
    isGameOverRef.current = false;

    setPoints(0);
    setLives(3);
    setIsGameOver(false);
  }

  return {
    difficulty, setDifficulty: persistDifficulty,
    pointsRef, livesRef, hitsSinceLifeRef, isGameOverRef,
    hitStreakRef, multiplierRef,
    setPoints, setLives, setIsGameOver,
    resetSession,
  };
}
