"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "./Alert";
import Controls from "./Controls";
import LengthSetting from "./LengthSetting";
import {
  DEFAULT_BREAK_LENGTH,
  DEFAULT_FOCUS_LENGTH,
} from "./pomodoro/constants";
import type { RewardType, TimerMode } from "./pomodoro/types";
import { clampLength, getDurationByMode, getModeLabel } from "./pomodoro/utils";
import TimerDisplay from "./TimerDisplay";

/**
 * Main Pomodoro timer container that coordinates session flow,
 * duration settings, reward effects, and accessibility status updates.
 */
export default function PomodoroTimer() {
  const [focusLength, setFocusLength] = useState(DEFAULT_FOCUS_LENGTH);
  const [breakLength, setBreakLength] = useState(DEFAULT_BREAK_LENGTH);
  const [currentMode, setCurrentMode] = useState<TimerMode>("focus");
  const [currentTime, setCurrentTime] = useState(DEFAULT_FOCUS_LENGTH * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Timer ready");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [rewardType, setRewardType] = useState<RewardType | null>(null);

  const currentModeRef = useRef<TimerMode>("focus");
  const rewardTimeoutRef = useRef<number | null>(null);

  const canAnimateRewards = effectsEnabled && !prefersReducedMotion;

  /**
   * Plays a short oscillator tone for reward feedback.
   */
  const playTone = useCallback(
    (frequency: number, duration: number) => {
      if (
        !soundEnabled ||
        typeof window === "undefined" ||
        !window.AudioContext
      ) {
        return;
      }

      const audioContext = new window.AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.12,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);

      oscillator.onended = () => {
        void audioContext.close();
      };
    },
    [soundEnabled],
  );

  /**
   * Triggers audio/visual rewards for timer milestones.
   */
  const triggerReward = useCallback(
    (type: RewardType) => {
      if (rewardTimeoutRef.current !== null) {
        window.clearTimeout(rewardTimeoutRef.current);
        rewardTimeoutRef.current = null;
      }

      if (canAnimateRewards) {
        setRewardType(type);
        rewardTimeoutRef.current = window.setTimeout(() => {
          setRewardType(null);
          rewardTimeoutRef.current = null;
        }, 1200);
      }

      if (type === "start") {
        playTone(720, 0.12);
      } else {
        playTone(640, 0.1);
        window.setTimeout(() => playTone(880, 0.14), 120);
      }
    },
    [canAnimateRewards, playTone],
  );

  /**
   * Updates duration for a mode and syncs active mode time.
   */
  const setDurationForMode = useCallback((mode: TimerMode, value: number) => {
    const next = clampLength(value);

    if (mode === "focus") {
      setFocusLength(next);
    } else {
      setBreakLength(next);
    }

    if (currentModeRef.current === mode) {
      setCurrentTime(next * 60);
    }

    setStatusMessage(`${getModeLabel(mode)} duration set to ${next} minutes`);
  }, []);

  useEffect(() => {
    currentModeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rewardTimeoutRef.current !== null) {
        window.clearTimeout(rewardTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        }

        const previousMode = currentModeRef.current;
        const nextMode: TimerMode =
          previousMode === "focus" ? "break" : "focus";
        currentModeRef.current = nextMode;
        setCurrentMode(nextMode);

        if (previousMode === "focus") {
          triggerReward("complete");
          setAlertMessage("Focus session completed. Time for a break.");
          setStatusMessage("Focus session completed. Break started.");
        }

        if (nextMode === "focus") {
          triggerReward("start");
          setAlertMessage("Focus session started");
          setStatusMessage("Focus session started");
        } else {
          setStatusMessage("Break session started");
        }

        const nextTime =
          getDurationByMode(nextMode, focusLength, breakLength) * 60;
        return nextTime;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [isRunning, focusLength, breakLength, triggerReward]);

  /**
   * Switches between focus and break modes.
   */
  const handleModeSwitch = useCallback(
    (mode: TimerMode) => {
      if (currentModeRef.current === mode) {
        return;
      }

      setIsRunning(false);
      setCurrentMode(mode);
      currentModeRef.current = mode;
      setCurrentTime(getDurationByMode(mode, focusLength, breakLength) * 60);
      setStatusMessage(`${getModeLabel(mode)} mode selected`);
    },
    [focusLength, breakLength],
  );

  /**
   * Starts or pauses the countdown timer.
   */
  const handleStartPause = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        setHasStarted(true);
        if (currentModeRef.current === "focus") {
          triggerReward("start");
          setAlertMessage("Focus session started");
          setStatusMessage("Focus session started");
        } else {
          setStatusMessage("Break session started");
        }
      } else {
        setStatusMessage("Timer paused");
      }
      return next;
    });
  }, [triggerReward]);

  /**
   * Resets timer state to default durations once started.
   */
  const handleReset = useCallback(() => {
    if (!hasStarted) {
      return;
    }

    setIsRunning(false);
    setFocusLength(DEFAULT_FOCUS_LENGTH);
    setBreakLength(DEFAULT_BREAK_LENGTH);
    setCurrentMode("focus");
    currentModeRef.current = "focus";
    setCurrentTime(DEFAULT_FOCUS_LENGTH * 60);
    setAlertMessage("Timer reset");
    setStatusMessage("Timer reset to default durations");
    setRewardType(null);
    setHasStarted(false);
  }, [hasStarted]);

  /**
   * Increases the selected mode duration by one minute.
   */
  const increase = useCallback(
    (mode: TimerMode) => {
      if (isRunning) {
        return;
      }

      const currentValue = mode === "focus" ? focusLength : breakLength;
      setDurationForMode(mode, currentValue + 1);
    },
    [isRunning, focusLength, breakLength, setDurationForMode],
  );

  /**
   * Decreases the selected mode duration by one minute.
   */
  const decrease = useCallback(
    (mode: TimerMode) => {
      if (isRunning) {
        return;
      }

      const currentValue = mode === "focus" ? focusLength : breakLength;
      setDurationForMode(mode, currentValue - 1);
    },
    [isRunning, focusLength, breakLength, setDurationForMode],
  );

  return (
    <section
      className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-6 sm:px-6 sm:py-10"
      aria-label="Pomodoro timer"
    >
      {alertMessage ? (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <div
        className={[
          "reward-glow w-full rounded-xl border border-zinc-300 bg-zinc-50 p-4 sm:p-6",
          canAnimateRewards && rewardType ? `reward-${rewardType}` : "",
        ].join(" ")}
      >
        {canAnimateRewards && rewardType === "complete" ? (
          <div className="reward-confetti" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}

        <fieldset
          className="mx-auto w-full max-w-md"
          aria-label="Session mode selection"
        >
          <legend className="mb-2 text-sm font-semibold text-zinc-800">
            Session Mode
          </legend>
          <div
            className="flex rounded-lg border border-zinc-300 bg-white p-1"
            role="group"
            aria-label="Mode switcher"
          >
            <button
              type="button"
              onClick={() => handleModeSwitch("focus")}
              aria-pressed={currentMode === "focus"}
              className={[
                "w-1/2 rounded-md px-3 py-2 text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                currentMode === "focus"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-900 hover:bg-zinc-100",
              ].join(" ")}
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("break")}
              aria-pressed={currentMode === "break"}
              className={[
                "w-1/2 rounded-md px-3 py-2 text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                currentMode === "break"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-900 hover:bg-zinc-100",
              ].join(" ")}
            >
              Break
            </button>
          </div>
        </fieldset>

        <TimerDisplay time={currentTime} mode={currentMode} />
      </div>

      <div className="mt-6">
        <Controls
          isRunning={isRunning}
          canReset={hasStarted}
          onStartPause={handleStartPause}
          onReset={handleReset}
        />
      </div>

      <fieldset
        className="mt-6 w-full max-w-xl rounded-lg border border-zinc-300 bg-white p-4"
        aria-label="Reward settings"
      >
        <legend className="px-1 text-sm font-semibold text-zinc-800">
          Reward Effects
        </legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-zinc-900">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-400 text-blue-600 focus-visible:ring-blue-600"
            />
            Enable reward sounds
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-900">
            <input
              type="checkbox"
              checked={effectsEnabled}
              onChange={(event) => setEffectsEnabled(event.target.checked)}
              disabled={prefersReducedMotion}
              className="h-4 w-4 rounded border-zinc-400 text-blue-600 focus-visible:ring-blue-600"
            />
            Enable reward animations
          </label>
        </div>
        {prefersReducedMotion ? (
          <p className="mt-3 text-xs text-zinc-700">
            Animations are automatically reduced because your system preference
            requests reduced motion.
          </p>
        ) : null}
      </fieldset>

      <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <LengthSetting
          title="Focus Duration"
          length={focusLength}
          onIncrease={() => increase("focus")}
          onDecrease={() => decrease("focus")}
          onManualChange={(value) => {
            if (isRunning) {
              return;
            }
            setDurationForMode("focus", value);
          }}
          increaseLabel="Increase focus duration"
          decreaseLabel="Decrease focus duration"
          inputLabel="Focus minutes"
          isDisabled={isRunning}
        />
        <LengthSetting
          title="Break Duration"
          length={breakLength}
          onIncrease={() => increase("break")}
          onDecrease={() => decrease("break")}
          onManualChange={(value) => {
            if (isRunning) {
              return;
            }
            setDurationForMode("break", value);
          }}
          increaseLabel="Increase break duration"
          decreaseLabel="Decrease break duration"
          inputLabel="Break minutes"
          isDisabled={isRunning}
        />
      </div>
    </section>
  );
}
