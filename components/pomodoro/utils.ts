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
