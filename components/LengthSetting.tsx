import Button from "./Button";
import { MAX_LENGTH, MIN_LENGTH } from "./pomodoro/constants";

type LengthSettingProps = {
  /** Section title displayed for this setting. */
  title: string;
  /** Current duration in minutes. */
  length: number;
  /** Handler for incrementing duration. */
  onIncrease: () => void;
  /** Handler for decrementing duration. */
  onDecrease: () => void;
  /** Handler for manual numeric input updates. */
  onManualChange: (value: number) => void;
  /** Disables controls while timer is running. */
  isDisabled: boolean;
  /** Accessible label for the increment button. */
  increaseLabel: string;
  /** Accessible label for the decrement button. */
  decreaseLabel: string;
  /** Accessible label for the numeric input. */
  inputLabel: string;
};

/**
 * Duration editor for a single session type.
 */
export default function LengthSetting({
  title,
  length,
  onIncrease,
  onDecrease,
  onManualChange,
  isDisabled,
  increaseLabel,
  decreaseLabel,
  inputLabel,
}: LengthSettingProps) {
  const inputId = `${title.toLowerCase().replace(/\s+/g, "-")}-input`;
  const rangeId = `${title.toLowerCase().replace(/\s+/g, "-")}-range`;

  return (
    <section
      className="rounded-lg border border-zinc-300 bg-white p-4 text-center"
      aria-label={title}
    >
      <p className="mb-3 text-lg font-semibold text-zinc-900">{title}</p>
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={onDecrease}
          disabled={isDisabled}
          variant="default"
          aria-label={decreaseLabel}
          className="min-w-10 px-3"
        >
          −
        </Button>

        <div className="flex min-w-24 flex-col items-center gap-2">
          <label htmlFor={inputId} className="text-sm text-zinc-700">
            {inputLabel}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            step={1}
            value={length}
            disabled={isDisabled}
            aria-describedby={rangeId}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (Number.isNaN(nextValue)) {
                return;
              }
              onManualChange(nextValue);
            }}
            className="mx-auto block w-24 appearance-none rounded-md border border-zinc-400 px-2 py-1 text-center text-zinc-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
          <p id={rangeId} className="text-xs text-zinc-700">
            {MIN_LENGTH}–{MAX_LENGTH} minutes
          </p>
        </div>

        <Button
          onClick={onIncrease}
          disabled={isDisabled}
          variant="default"
          aria-label={increaseLabel}
          className="min-w-10 px-3"
        >
          +
        </Button>
      </div>
    </section>
  );
}
