"use client";

import Button from "./Button";

type ControlsProps = {
  /** Indicates whether the timer is currently running. */
  isRunning: boolean;
  /** Enables the reset action after a session has started. */
  canReset: boolean;
  /** Toggles between start and pause states. */
  onStartPause: () => void;
  /** Resets timer state back to defaults. */
  onReset: () => void;
};

/**
 * Primary control group for timer actions.
 */
export default function Controls({
  isRunning,
  canReset,
  onStartPause,
  onReset,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onStartPause}
        variant="primary"
        aria-label={isRunning ? "Pause timer" : "Start timer"}
      >
        {isRunning ? "Pause" : "Start"}
      </Button>
      <Button
        onClick={onReset}
        variant="default"
        aria-label="Reset timer"
        disabled={!canReset}
      >
        Reset
      </Button>
    </div>
  );
}
