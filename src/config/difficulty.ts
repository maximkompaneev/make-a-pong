export type AIDifficultyType = "EASY" | "MEDIUM" | "HARD";

export const AIDifficulty: Record<
  AIDifficultyType,
  {
    follow: number;            // 0..1: how strongly it follows target each frame
    lookAheadMs: number;       // tiny fair look-ahead on Y (no wall prediction)
    noise: number;             // ±fraction of paddle height added to aim
    pauseChance: number;       // chance per update to hesitate
    pauseFrames: number;       // how many frames to pause when it hesitates
    maxSpeedFactor: number;    // max vertical speed in units of paddle.height per second
    idleAmpFactor: number;     // idle sway amplitude (fraction of paddle height)
    idlePeriod: number;        // seconds per idle cycle
    trackingGateX?: number;  // fraction of width after which AI starts tracking
    aimDeadzonePx?: number;  // ignore tiny target deltas (prevents laser jitter)
  }
> = {
  EASY: {
    follow: 0.14,
    lookAheadMs: 80,
    noise: 0.22,
    pauseChance: 0.05,
    pauseFrames: 12,
    maxSpeedFactor: 8.5,
    idleAmpFactor: 0.20,
    idlePeriod: 2.0,
  },
  MEDIUM: {
    follow: 0.20,
    lookAheadMs: 60,
    noise: 0.12,
    pauseChance: 0.025,
    pauseFrames: 9,
    maxSpeedFactor: 9.5,
    idleAmpFactor: 0.12,
    idlePeriod: 1.8,
  },
  HARD: {
    follow: 0.22, 
    lookAheadMs: 50, 
    noise: 0.10,  
    pauseChance: 0.02,  
    pauseFrames: 7,
    maxSpeedFactor: 10.0,
    idleAmpFactor: 0.08,
    idlePeriod: 1.7,
    trackingGateX: 0.65,
    aimDeadzonePx: 6, 
  },
};