type SettingsPanelProps = {
  soundEnabled: boolean;
  effectsEnabled: boolean;
  prefersReducedMotion: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  onEffectsEnabledChange: (enabled: boolean) => void;
};

/**
 * User preferences for audio and animation effects.
 */
export default function SettingsPanel({
  soundEnabled,
  effectsEnabled,
  prefersReducedMotion,
  onSoundEnabledChange,
  onEffectsEnabledChange,
}: SettingsPanelProps) {
  return (
    <fieldset
      className="mt-6 w-full max-w-xl rounded-lg border border-zinc-300 bg-white p-4"
      aria-label="Reward settings"
    >
      <legend className="px-1 text-sm font-semibold text-zinc-800">
        Control Settings
      </legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-900">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) => onSoundEnabledChange(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-400 text-blue-600 focus-visible:ring-blue-600"
          />
          Enable sounds
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-900">
          <input
            type="checkbox"
            checked={effectsEnabled}
            onChange={(event) => onEffectsEnabledChange(event.target.checked)}
            disabled={prefersReducedMotion}
            className="h-4 w-4 rounded border-zinc-400 text-blue-600 focus-visible:ring-blue-600"
          />
          Enable animations
        </label>
      </div>
      {prefersReducedMotion ? (
        <p className="mt-3 text-xs text-zinc-700">
          Animations are automatically reduced because your system preference
          requests reduced motion.
        </p>
      ) : null}
    </fieldset>
  );
}
