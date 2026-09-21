import { ChoiceRow, Field, MinSecInput } from '../components/FormControls'
import { splitSeconds, toSeconds } from '../domain/format'
import { useProfile } from '../hooks/useProfile'
import { useSettings } from '../hooks/useSettings'
import type { DominantArm, ExperienceLevel, Profile } from '../types'

export function Settings() {
  const { profile, saveProfile } = useProfile()
  const { settings, saveSettings } = useSettings()

  if (!profile) return null

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    saveProfile({ ...profile, [key]: value } as Profile)
  }

  const baseline = splitSeconds(profile.baselineMaxHoldSeconds)
  const target = splitSeconds(profile.targetHoldSeconds)

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

      <h2 className="mb-4 text-base font-semibold text-stein-cream/75">Training profile</h2>

      <Field label="Competition date">
        <input
          type="date"
          value={profile.competitionDate ?? ''}
          onChange={(e) => updateProfile('competitionDate', e.target.value || null)}
          className="w-full rounded-lg bg-stein-surface px-4 py-3 text-stein-cream outline-none"
        />
        <p className="mt-2 text-sm text-stein-cream/60">
          Drives the training phase - no date keeps the program in off-season mode indefinitely.
        </p>
      </Field>

      <Field label="Target hold time">
        <MinSecInput
          minutes={target.minutes}
          seconds={target.seconds}
          onMinutes={(v) => updateProfile('targetHoldSeconds', toSeconds(v, target.seconds))}
          onSeconds={(v) => updateProfile('targetHoldSeconds', toSeconds(target.minutes, v))}
        />
      </Field>

      <Field label="Baseline max hold">
        <MinSecInput
          minutes={baseline.minutes}
          seconds={baseline.seconds}
          onMinutes={(v) => updateProfile('baselineMaxHoldSeconds', toSeconds(v, baseline.seconds))}
          onSeconds={(v) => updateProfile('baselineMaxHoldSeconds', toSeconds(baseline.minutes, v))}
        />
      </Field>

      <Field label="Dominant arm">
        <ChoiceRow
          options={[
            { value: 'right', label: 'Right' },
            { value: 'left', label: 'Left' },
          ]}
          value={profile.dominantArm}
          onChange={(v) => updateProfile('dominantArm', v as DominantArm)}
        />
      </Field>

      <Field label="Experience level">
        <ChoiceRow
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'competitive', label: 'Competitive' },
          ]}
          value={profile.experienceLevel}
          onChange={(v) => updateProfile('experienceLevel', v as ExperienceLevel)}
        />
      </Field>

      <Field label="Have a real 1-liter competition stein?">
        <ChoiceRow
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value={profile.hasCompetitionStein ? 'yes' : 'no'}
          onChange={(v) => updateProfile('hasCompetitionStein', v === 'yes')}
        />
      </Field>

      <div className="mb-8 border-b border-stein-amber/15" />

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
