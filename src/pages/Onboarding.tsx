import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { useProfile } from '../hooks/useProfile'
import type { DominantArm, ExperienceLevel, Profile } from '../types'

export function Onboarding() {
  const { saveProfile } = useProfile()
  const navigate = useNavigate()

  const [dominantArm, setDominantArm] = useState<DominantArm>('right')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner')
  const [knowsMax, setKnowsMax] = useState(false)
  const [maxMinutes, setMaxMinutes] = useState('')
  const [maxSeconds, setMaxSeconds] = useState('')
  const [competitionDate, setCompetitionDate] = useState('')
  const [hasTarget, setHasTarget] = useState(false)
  const [targetMinutes, setTargetMinutes] = useState('')
  const [targetSeconds, setTargetSeconds] = useState('')
  const [hasCompetitionStein, setHasCompetitionStein] = useState(true)

  function toSeconds(min: string, sec: string): number | null {
    const m = Number(min) || 0
    const s = Number(sec) || 0
    if (m === 0 && s === 0) return null
    return m * 60 + s
  }

  function handleSubmit() {
    const profile: Profile = {
      id: crypto.randomUUID(),
      dominantArm,
      experienceLevel,
      hasCompetitionStein,
      competitionDate: competitionDate || null,
      baselineMaxHoldSeconds: knowsMax ? toSeconds(maxMinutes, maxSeconds) : null,
      targetHoldSeconds: hasTarget ? toSeconds(targetMinutes, targetSeconds) : null,
      createdAt: new Date().toISOString(),
    }
    saveProfile(profile)
    navigate('/home')
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-1 font-display text-4xl font-bold text-stein-amber-bright">Stein Hoist Trainer</h1>
      <p className="mb-8 text-stein-cream/70">A few quick questions to build your training plan.</p>

      <Field label="Dominant arm">
        <ChoiceRow
          options={[
            { value: 'right', label: 'Right' },
            { value: 'left', label: 'Left' },
          ]}
          value={dominantArm}
          onChange={(v) => setDominantArm(v as DominantArm)}
        />
      </Field>

      <Field label="Experience level">
        <ChoiceRow
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'competitive', label: 'Competitive' },
          ]}
          value={experienceLevel}
          onChange={(v) => setExperienceLevel(v as ExperienceLevel)}
        />
      </Field>

      <Field label="Do you know your current max legal hold?">
        <ChoiceRow
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: "No, let's test it" },
          ]}
          value={knowsMax ? 'yes' : 'no'}
          onChange={(v) => setKnowsMax(v === 'yes')}
        />
        {knowsMax && (
          <MinSecInput minutes={maxMinutes} seconds={maxSeconds} onMinutes={setMaxMinutes} onSeconds={setMaxSeconds} />
        )}
      </Field>

      <Field label="Competition date (optional)">
        <input
          type="date"
          value={competitionDate}
          onChange={(e) => setCompetitionDate(e.target.value)}
          className="w-full rounded-lg bg-stein-surface px-4 py-3 text-stein-cream outline-none"
        />
      </Field>

      <Field label="Do you have a target hold time?">
        <ChoiceRow
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value={hasTarget ? 'yes' : 'no'}
          onChange={(v) => setHasTarget(v === 'yes')}
        />
        {hasTarget && (
          <MinSecInput
            minutes={targetMinutes}
            seconds={targetSeconds}
            onMinutes={setTargetMinutes}
            onSeconds={setTargetSeconds}
          />
        )}
      </Field>

      <Field label="Do you have an actual 1-liter competition stein?">
        <ChoiceRow
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value={hasCompetitionStein ? 'yes' : 'no'}
          onChange={(v) => setHasCompetitionStein(v === 'yes')}
        />
      </Field>

      <div className="mt-8">
        <BigButton onClick={handleSubmit} className="py-6 text-2xl">
          Let's go
        </BigButton>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-stein-cream/70">{label}</div>
      {children}
    </div>
  )
}

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold ${
            value === opt.value
              ? 'bg-stein-amber text-stein-bg'
              : 'bg-stein-surface text-stein-cream/80 border border-stein-amber/30'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MinSecInput({
  minutes,
  seconds,
  onMinutes,
  onSeconds,
}: {
  minutes: string
  seconds: string
  onMinutes: (v: string) => void
  onSeconds: (v: string) => void
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="min"
        value={minutes}
        onChange={(e) => onMinutes(e.target.value)}
        className="w-20 rounded-lg bg-stein-surface px-3 py-3 text-center text-stein-cream outline-none"
      />
      <span className="text-stein-cream/60">:</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={59}
        placeholder="sec"
        value={seconds}
        onChange={(e) => onSeconds(e.target.value)}
        className="w-20 rounded-lg bg-stein-surface px-3 py-3 text-center text-stein-cream outline-none"
      />
    </div>
  )
}
