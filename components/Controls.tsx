"use client";

import Button from "./Button";

type ControlsProps = {
  /** Indicates whether the timer is currently running. */
  isRunning: boolean;
  /** Indicates whether any session has started in this cycle. */
  hasStarted: boolean;
  /** Indicates whether a completed session is awaiting user action. */
  isCompleted: boolean;
  /** Toggles between start/pause states. */
  onStartPause: () => void;
  /** Deletes/cancels timer state back to defaults. */
  onDelete: () => void;
  /** Dismisses completion state without restarting. */
  onDismiss: () => void;
  /** Resets and immediately restarts the timer. */
  onRestart: () => void;
};

/**
 * Primary control group for timer actions.
 */
export default function Controls({
  isRunning,
  hasStarted,
  isCompleted,
  onStartPause,
  onDelete,
  onDismiss,
  onRestart,
}: ControlsProps) {
  const startButtonClass = "h-11 w-64";
  const secondaryButtonClass = "h-11 w-30.5";

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-3">
      {!hasStarted ? (
        <Button
          onClick={onStartPause}
          variant="primary"
          aria-label="Start timer"
          className={startButtonClass}
        >
          Start Timer
        </Button>
      ) : isCompleted ? (
        <>
          <Button
            onClick={onDismiss}
            variant="default"
            aria-label="Dismiss timer completion"
            className={secondaryButtonClass}
          >
            Dismiss
          </Button>
          <Button
            onClick={onRestart}
            variant="primary"
            aria-label="Restart timer"
            className={secondaryButtonClass}
          >
            Reset
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={onStartPause}
            variant="primary"
            aria-label={isRunning ? "Pause timer" : "Resume timer"}
            className={secondaryButtonClass}
          >
            {isRunning ? "Pause" : "Resume"}
          </Button>
          <Button
            onClick={onDelete}
            variant="danger"
            aria-label="Delete timer"
            className={secondaryButtonClass}
          >
            Delete
          </Button>
        </>
      )}
    </div>
  );
}
