import type { CSSProperties } from "react";
import { formatSecondsToClock } from "./pomodoro/utils";

type TimerDisplayProps = {
  /** Remaining time in seconds. */
  time: number;
  /** Current active mode. */
  mode: "focus" | "break";
  /** Progress ratio in [0, 1], mapped to clockwise border fill. */
  progress: number;
};

/**
 * Presentational timer output for active mode and remaining time.
 * Uses CSS variable `--timer-progress` to render conic border progression.
 */
export default function TimerDisplay({ time, mode, progress }: TimerDisplayProps) {
  const clockTime = formatSecondsToClock(time);
  const [minutes, seconds] = clockTime.split(":");
  const modeLabel = mode === "focus" ? "Focus" : "Break";
  const progressDegrees = `${Math.min(360, Math.max(0, progress * 360))}deg`;

  return (
    <div
      className="timer-progress-shell"
      style={{ "--timer-progress": progressDegrees } as CSSProperties}
    >
      <section className="timer-progress-inner text-center" aria-label="Current timer">
        <h2
          id="active-session-mode"
          className="mb-5 text-4xl font-bold text-zinc-900"
        >
          {modeLabel}
        </h2>
        <p
          role="timer"
          aria-live="off"
          aria-label={`Time remaining ${minutes} minutes ${seconds} seconds`}
          className="mb-5 text-6xl text-zinc-900"
        >
          {clockTime}
        </p>
      </section>
    </div>
  );
}
