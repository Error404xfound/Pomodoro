"use client";

import Button from "./Button";

type ControlsProps = {
    isRunning: boolean;
    canReset: boolean;
    onStartPause: () => void;
    onReset: () => void;
};

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
