import { useSettings } from '../hooks/useSettings'

export function Settings() {
  const { settings, saveSettings } = useSettings()

  function toggle(key: 'audioCuesEnabled' | 'voiceCuesEnabled') {
    saveSettings({ ...settings, [key]: !settings[key] })
  }

  function setRestOverride(raw: string) {
    if (raw === '') {
      saveSettings({ ...settings, restIntervalOverrideSeconds: null })
      return
    }
    const seconds = Math.max(0, Math.round(Number(raw)))
    if (!Number.isFinite(seconds)) return
    saveSettings({ ...settings, restIntervalOverrideSeconds: seconds })
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-stein-amber-bright">Settings</h1>

      <ToggleRow
        label="Audio cues"
        description="Short beeps for countdowns, rest, and raise/rest transitions."
        checked={settings.audioCuesEnabled}
        onToggle={() => toggle('audioCuesEnabled')}
      />
      <ToggleRow
        label="Voice cues"
        description={'Spoken "Raise!", "Rest.", and countdown numbers - useful when your phone is sitting on a table.'}
        checked={settings.voiceCuesEnabled}
        onToggle={() => toggle('voiceCuesEnabled')}
      />

      <div className="border-b border-stein-amber/15 pb-6">
        <div className="mb-1 text-base font-semibold">Rest override</div>
        <p className="mb-3 text-sm text-stein-cream/60">
          Leave blank to let the program set rest between intervals automatically.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Auto"
            value={settings.restIntervalOverrideSeconds ?? ''}
            onChange={(e) => setRestOverride(e.target.value)}
            className="w-24 rounded-lg bg-stein-surface px-4 py-3 text-center text-stein-cream outline-none"
          />
          <span className="text-stein-cream/60">seconds</span>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-6 flex w-full items-start justify-between gap-4 border-b border-stein-amber/15 pb-6 text-left"
    >
      <span>
        <span className="block text-base font-semibold">{label}</span>
        <span className="mt-1 block text-sm text-stein-cream/60">{description}</span>
      </span>
      <span
        className={`mt-1 flex h-7 w-12 flex-shrink-0 items-center rounded-full p-1 transition-colors ${
          checked ? 'bg-stein-amber' : 'bg-stein-surface'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-stein-cream transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
