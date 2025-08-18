export type AIDifficultyType = "EASY" | "MEDIUM" | "HARD";

export const AIDifficulty: Record<
  AIDifficultyType,
  {
    follow: number;
    lookAheadMs: number;
    noise: number;
    pauseChance: number;
    pauseFrames: number;
    maxSpeedFactor: number;
    idleAmpFactor: number;
    idlePeriod: number;
    trackingGateX?: number;
    aimDeadzonePx?: number;
  }
> = {
  EASY: {
    // How strongly the paddle eases toward the target each frame (0..1).
    // Lower = smoother/slower reactions (easier). Raise in tiny steps (+0.02) if it feels too sluggish.
    follow: 0.12,

    // Predict a bit ahead along the ball’s Y (ms). Higher = steadier aim (less twitch).
    // If it starts arriving *too* accurately, reduce this (e.g., 80).
    lookAheadMs: 100,

    // Random offset as a fraction of paddle height, sampled once per approach.
    // Lower to reduce wobble; raise slightly to induce human-like imprecision.
    noise: 0.06,

    // Per–update chance to hesitate (adds small, believable misses).
    // Keep small (≤0.05). If AI feels robotic, bump slightly.
    pauseChance: 0.035,
    pauseFrames: 12, // How many frames the hesitation lasts.

    // Max vertical speed in “paddle-heights per second”.
    // Bigger paddles = proportionally faster movement. Lower to make it miss more often.
    maxSpeedFactor: 8.5,

    // Idle sway (cosmetic) amplitude as paddle-height fraction. Raise for more visible breathing.
    idleAmpFactor: 0.20,
    // Seconds per idle cycle. Higher = slower sway.
    idlePeriod: 2.0,

    // Start tracking when ball crosses this fraction of canvas width.
    // Higher = reacts later (easier); lower = earlier (harder).
    trackingGateX: 0.55,

    // Ignore tiny target deltas to kill micro-jitter. Increase if you still see shimmer.
    aimDeadzonePx: 8,
  },

  MEDIUM: {
    follow: 0.14,
    lookAheadMs: 85,
    noise: 0.035,
    pauseChance: 0.02,
    pauseFrames: 9,
    maxSpeedFactor: 9.5,
    idleAmpFactor: 0.12,
    idlePeriod: 1.8,
    trackingGateX: 0.58,
    aimDeadzonePx: 6,
  },

  HARD: {
    follow: 0.16,
    lookAheadMs: 70,
    noise: 0.015,
    pauseChance: 0.015,
    pauseFrames: 7,
    maxSpeedFactor: 10.0,
    idleAmpFactor: 0.08,
    idlePeriod: 1.7,
    trackingGateX: 0.62,
    aimDeadzonePx: 5,
  },
};
