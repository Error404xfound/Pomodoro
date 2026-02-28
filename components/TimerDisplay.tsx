type TimerDisplayProps = {
  /** Remaining time in seconds. */
  time: number;
  /** Active session mode for the timer display. */
  mode: "focus" | "break";
};

/**
 * Visual timer output with accessible mode and time labels.
 */
export default function TimerDisplay({ time, mode }: TimerDisplayProps) {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");
  const modeLabel = mode === "focus" ? "Focus" : "Break";

  return (
    <section className="text-center" aria-label="Current timer">
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
        {minutes}:{seconds}
      </p>
    </section>
  );
}
