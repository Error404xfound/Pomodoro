import { MAX_LENGTH, MIN_LENGTH } from "./constants";
import type { TimerMode } from "./types";

export function clampLength(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_LENGTH;
  }

  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(value)));
}

export function getModeLabel(mode: TimerMode): string {
  return mode === "focus" ? "Focus" : "Break";
}

export function getDurationByMode(mode: TimerMode, focusLength: number, breakLength: number): number {
  return mode === "focus" ? focusLength : breakLength;
}
