import type { TimerMode } from "./types";

type ModeSwitcherProps = {
  currentMode: TimerMode;
  isFocusSwitchDisabled: boolean;
  isBreakSwitchDisabled: boolean;
  modeLockMessage: string;
  onModeSwitch: (mode: TimerMode) => void;
};

/**
 * Focus/Break segmented control with optional lock hints.
 */
export default function ModeSwitcher({
  currentMode,
  isFocusSwitchDisabled,
  isBreakSwitchDisabled,
  modeLockMessage,
  onModeSwitch,
}: ModeSwitcherProps) {
  return (
    <fieldset
      className="mx-auto w-full max-w-md"
      aria-label="Session mode selection"
    >
      <legend className="sr-only">Session Mode</legend>
      <div
        className="flex rounded-lg border border-zinc-300 bg-white p-1"
        role="group"
        aria-label="Mode switcher"
      >
        <div
          className="w-1/2"
          title={isFocusSwitchDisabled ? modeLockMessage : undefined}
        >
          <button
            type="button"
            onClick={() => onModeSwitch("focus")}
            aria-pressed={currentMode === "focus"}
            aria-disabled={isFocusSwitchDisabled}
            disabled={isFocusSwitchDisabled}
            className={[
              "w-full rounded-md px-3 py-2 text-sm font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              isFocusSwitchDisabled
                ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                : currentMode === "focus"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-900 hover:bg-zinc-100",
            ].join(" ")}
          >
            Focus
          </button>
        </div>

        <div
          className="w-1/2"
          title={isBreakSwitchDisabled ? modeLockMessage : undefined}
        >
          <button
            type="button"
            onClick={() => onModeSwitch("break")}
            aria-pressed={currentMode === "break"}
            aria-disabled={isBreakSwitchDisabled}
            disabled={isBreakSwitchDisabled}
            className={[
              "w-full rounded-md px-3 py-2 text-sm font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
              isBreakSwitchDisabled
                ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                : currentMode === "break"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-900 hover:bg-zinc-100",
            ].join(" ")}
          >
            Break
          </button>
        </div>
      </div>
    </fieldset>
  );
}
