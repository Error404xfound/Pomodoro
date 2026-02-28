import { MAX_LENGTH, MIN_LENGTH } from "./constants";
import type { TimerMode } from "./types";

/**
 * Clamps a session length to the supported range.
 */
export function clampLength(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_LENGTH;
  }

  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(value)));
}

/**
 * Maps a timer mode to a human-friendly label.
 */
export function getModeLabel(mode: TimerMode): string {
  return mode === "focus" ? "Focus" : "Break";
}

/**
 * Returns the configured duration for the provided mode.
 */
export function getDurationByMode(
  mode: TimerMode,
  focusLength: number,
  breakLength: number,
): number {
  return mode === "focus" ? focusLength : breakLength;
}

/**
 * Formats seconds into mm:ss clock text.
 */
export function formatSecondsToClock(totalSeconds: number): string {
  const safeTotal = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeTotal / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeTotal % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

/**
 * Computes normalized progress for an active timer session.
 */
export function getSessionProgress(
  currentTimeSeconds: number,
  totalDurationSeconds: number,
  hasStarted: boolean,
): number {
  if (!hasStarted) {
    return 0;
  }

  const safeTotal = Math.max(1, totalDurationSeconds);
  const elapsed = safeTotal - Math.max(0, currentTimeSeconds);
  return Math.min(1, Math.max(0, elapsed / safeTotal));
}
