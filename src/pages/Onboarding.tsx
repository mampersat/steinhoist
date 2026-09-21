import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { ChoiceRow, Field, MinSecInput } from '../components/FormControls'
import { toSeconds } from '../domain/format'
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
