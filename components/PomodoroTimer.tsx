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
import {
  clampLength,
  getDurationByMode,
  getModeLabel,
  getSessionProgress,
} from "./pomodoro/utils";
import ModeSwitcher from "./pomodoro/ModeSwitcher";
import SettingsPanel from "./pomodoro/SettingsPanel";
import TimerDisplay from "./TimerDisplay";

const ALARM_SOURCE = "/AlarmSound.mp3";
const MODE_LOCK_MESSAGE =
  "Mode cannot be switched until the current timer finishes or is cancelled.";

type TimerPhase = "idle" | "running" | "paused" | "completed";

/**
 * Pomodoro timer container component.
 *
 * Responsibilities:
 * - Owns timer state machine (idle, running/paused, completion pending acknowledgement)
 * - Coordinates mode locking and duration editing rules
 * - Handles audio/effects toggles and reward signals
 * - Controls completion alarm loop lifecycle
 * - Publishes alert and status messages for UX/accessibility
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
  const [isCompletionPendingAck, setIsCompletionPendingAck] = useState(false);

  const currentModeRef = useRef<TimerMode>("focus");
  const rewardTimeoutRef = useRef<number | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  const canAnimateRewards = effectsEnabled && !prefersReducedMotion;
  const timerPhase: TimerPhase = isCompletionPendingAck
    ? "completed"
    : hasStarted
      ? isRunning
        ? "running"
        : "paused"
      : "idle";
  const isModeSwitchLocked = timerPhase === "running" || timerPhase === "paused";
  const isFocusSwitchDisabled = isModeSwitchLocked && currentMode !== "focus";
  const isBreakSwitchDisabled = isModeSwitchLocked && currentMode !== "break";

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
   * Ensures a reusable alarm audio instance exists.
   */
  const ensureAlarmAudio = useCallback(() => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      return null;
    }

    if (alarmAudioRef.current !== null) {
      return alarmAudioRef.current;
    }

    const alarm = new Audio(ALARM_SOURCE);
    alarm.loop = true;
    alarm.preload = "auto";
    alarmAudioRef.current = alarm;
    return alarm;
  }, []);

  /**
   * Starts looping completion alarm playback.
   */
  const startAlarmLoop = useCallback(() => {
    if (!soundEnabled || process.env.NODE_ENV === "test") {
      return;
    }

    const alarm = ensureAlarmAudio();
    if (!alarm) {
      return;
    }

    alarm.currentTime = 0;

    try {
      const playResult = alarm.play();
      if (playResult && typeof playResult.catch === "function") {
        void playResult.catch(() => {
          setStatusMessage("Unable to play alarm sound.");
        });
      }
    } catch {
      setStatusMessage("Unable to play alarm sound.");
    }
  }, [ensureAlarmAudio, soundEnabled]);

  /**
   * Stops and rewinds completion alarm playback.
   */
  const stopAlarmLoop = useCallback(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    const alarm = alarmAudioRef.current;
    if (!alarm) {
      return;
    }

    try {
      alarm.pause();
    } catch {
      return;
    }

    alarm.currentTime = 0;
  }, []);

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

  const getCurrentModeDurationSeconds = useCallback(
    () => getDurationByMode(currentModeRef.current, focusLength, breakLength) * 60,
    [focusLength, breakLength],
  );

  const setModeStartedStatus = useCallback((mode: TimerMode) => {
    if (mode === "focus") {
      setAlertMessage("Focus session started");
      setStatusMessage("Focus session started");
      return;
    }

    setAlertMessage("Break session started");
    setStatusMessage("Break session started");
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
    if (soundEnabled) {
      return;
    }

    stopAlarmLoop();
  }, [soundEnabled, stopAlarmLoop]);

  useEffect(() => {
    return () => {
      if (rewardTimeoutRef.current !== null) {
        window.clearTimeout(rewardTimeoutRef.current);
      }

      stopAlarmLoop();

      if (alarmAudioRef.current !== null) {
        alarmAudioRef.current.src = "";
        alarmAudioRef.current = null;
      }
    };
  }, [stopAlarmLoop]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        }

        startAlarmLoop();
        setIsRunning(false);
        setIsCompletionPendingAck(true);
        triggerReward("complete");

        const completedModeLabel = getModeLabel(currentModeRef.current);
        setAlertMessage(`${completedModeLabel} session completed.`);
        setStatusMessage(
          `${completedModeLabel} session completed. Choose dismiss or reset.`,
        );

        return 0;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isRunning, startAlarmLoop, triggerReward]);

  /**
   * Dismisses completion state and restores configured duration without auto-start.
   */
  const acknowledgeCompletion = useCallback(() => {
    stopAlarmLoop();
    setAlertMessage(null);

    if (!isCompletionPendingAck) {
      return;
    }

    setIsCompletionPendingAck(false);
    const mode = currentModeRef.current;
    setCurrentTime(getDurationByMode(mode, focusLength, breakLength) * 60);
    setHasStarted(false);
    setStatusMessage(`${getModeLabel(mode)} timer reset and ready`);
  }, [isCompletionPendingAck, focusLength, breakLength, stopAlarmLoop]);

  /**
   * Switches between focus and break modes.
   */
  const handleModeSwitch = useCallback(
    (mode: TimerMode) => {
      if (currentModeRef.current === mode) {
        return;
      }

      if (isModeSwitchLocked) {
        setStatusMessage(MODE_LOCK_MESSAGE);
        return;
      }

      setIsRunning(false);
      setCurrentMode(mode);
      currentModeRef.current = mode;
      setCurrentTime(getDurationByMode(mode, focusLength, breakLength) * 60);
      setStatusMessage(`${getModeLabel(mode)} mode selected`);
    },
    [focusLength, breakLength, isModeSwitchLocked],
  );

  const handleStartPause = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;

      if (next) {
        setHasStarted(true);
        triggerReward("start");
        setModeStartedStatus(currentModeRef.current);
      } else {
        triggerReward("start");
        setAlertMessage("Timer paused");
        setStatusMessage("Timer paused");
      }

      return next;
    });
  }, [setModeStartedStatus, triggerReward]);

  /**
   * Resets and immediately restarts the current mode duration.
   */
  const handleRestart = useCallback(() => {
    stopAlarmLoop();
    const mode = currentModeRef.current;
    const durationInSeconds = getCurrentModeDurationSeconds();

    setAlertMessage(null);
    setIsCompletionPendingAck(false);
    setCurrentTime(durationInSeconds);
    setHasStarted(true);
    setIsRunning(true);
    triggerReward("start");
    setStatusMessage(`${getModeLabel(mode)} session restarted`);
  }, [getCurrentModeDurationSeconds, stopAlarmLoop, triggerReward]);

  const handleReset = useCallback(() => {
    if (!hasStarted) {
      return;
    }

    stopAlarmLoop();
    setIsCompletionPendingAck(false);
    setIsRunning(false);
    setFocusLength(DEFAULT_FOCUS_LENGTH);
    setBreakLength(DEFAULT_BREAK_LENGTH);
    setCurrentMode("focus");
    currentModeRef.current = "focus";
    setCurrentTime(DEFAULT_FOCUS_LENGTH * 60);
    setAlertMessage(null);
    setStatusMessage("Timer deleted and reset to default durations");
    setRewardType(null);
    setHasStarted(false);
  }, [hasStarted, stopAlarmLoop]);

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

  const currentModeDurationSeconds =
    getDurationByMode(currentMode, focusLength, breakLength) * 60;

  const timerProgress = getSessionProgress(
    currentTime,
    currentModeDurationSeconds,
    hasStarted,
  );

  return (
    <section
      className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-6 sm:px-6 sm:py-10"
      aria-label="Pomodoro timer"
    >
      {alertMessage ? (
        <Alert message={alertMessage} onClose={acknowledgeCompletion} />
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

        <ModeSwitcher
          currentMode={currentMode}
          isFocusSwitchDisabled={isFocusSwitchDisabled}
          isBreakSwitchDisabled={isBreakSwitchDisabled}
          modeLockMessage={MODE_LOCK_MESSAGE}
          onModeSwitch={handleModeSwitch}
        />

        <div className="mt-6">
          <TimerDisplay
            time={currentTime}
            mode={currentMode}
            progress={timerProgress}
          />
        </div>
      </div>

      <div className="mt-6">
        <Controls
          isRunning={isRunning}
          hasStarted={hasStarted}
          isCompleted={isCompletionPendingAck}
          onStartPause={handleStartPause}
          onDelete={handleReset}
          onDismiss={acknowledgeCompletion}
          onRestart={handleRestart}
        />
      </div>

      <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <LengthSetting
          title="Focus Duration"
          length={focusLength}
          onIncrease={() => increase("focus")}
          onDecrease={() => decrease("focus")}
          onManualChange={(value) => {
            if (isRunning) return;
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
            if (isRunning) return;
            setDurationForMode("break", value);
          }}
          increaseLabel="Increase break duration"
          decreaseLabel="Decrease break duration"
          inputLabel="Break minutes"
          isDisabled={isRunning}
        />
      </div>

      <SettingsPanel
        soundEnabled={soundEnabled}
        effectsEnabled={effectsEnabled}
        prefersReducedMotion={prefersReducedMotion}
        onSoundEnabledChange={setSoundEnabled}
        onEffectsEnabledChange={setEffectsEnabled}
      />

  
    </section>
  );
}
