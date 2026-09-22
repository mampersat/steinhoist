import { Link, useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { Stat } from '../components/Stat'
import { daysBetween, toISODate } from '../domain/date'
import { formatDaysRemaining, formatMMSS } from '../domain/format'
import { computePR } from '../domain/pr'
import { getNextWorkout } from '../domain/program'
import { useProfile } from '../hooks/useProfile'
import { useSessions } from '../hooks/useSessions'
import { useSettings } from '../hooks/useSettings'
import { debugNow } from '../lib/debugClock'
import { sessionStore } from '../storage/repository'

const typeLabel: Record<string, string> = {
  practice: 'Practice Hold',
  training: 'Training Hold',
  competition: 'Competition',
  strength: 'Strength / Supplemental Work',
  rest: "Today's work is done",
}

export function Home() {
  const { profile } = useProfile()
  const { sessions } = useSessions()
  const { settings } = useSettings()
  const navigate = useNavigate()

  if (!profile) return null

  const pr = computePR(sessions)
  const inProgress = sessionStore.getInProgress()
  const nextWorkout = getNextWorkout(profile, sessions, debugNow())
  const daysToComp = profile.competitionDate ? daysBetween(toISODate(debugNow()), profile.competitionDate) : null

  function handleStart() {
    if (inProgress) {
      navigate(inProgress.type === 'training' ? '/workout/training' : '/workout/practice')
      return
    }
    if (nextWorkout.type === 'practice' || nextWorkout.type === 'competition') {
      navigate('/workout/practice')
    } else if (nextWorkout.type === 'training') {
      navigate('/workout/training', {
        state: {
          targetAccumulatedSeconds: nextWorkout.suggestedTargetSeconds,
          restSeconds: settings.restIntervalOverrideSeconds ?? nextWorkout.suggestedRestSeconds,
        },
      })
    } else if (nextWorkout.type === 'strength') {
      navigate('/workout/strength')
    }
    // rest days have no action - recovery, not a task
  }

  const startable =
    nextWorkout.type === 'practice' ||
    nextWorkout.type === 'training' ||
    nextWorkout.type === 'strength' ||
    !!inProgress

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-stein-amber-bright">Stein Hoist Trainer</h1>

      <div className="mb-8 flex divide-x divide-stein-amber/20 border-y border-stein-amber/15 py-5">
        <Stat label="Current PR" value={pr !== null ? formatMMSS(pr) : '—'} />
        <Stat
          label="Target"
          value={profile.targetHoldSeconds !== null ? formatMMSS(profile.targetHoldSeconds) : '—'}
        />
        {profile.competitionDate && daysToComp !== null && (
          <Stat label="Competition" value={formatDaysRemaining(daysToComp)} />
        )}
      </div>

      <div className="mb-8 rounded-xl border border-stein-amber/30 bg-stein-surface p-5">
        <div className="text-sm font-semibold text-stein-cream/60">
          {inProgress ? 'Resume workout' : nextWorkout.type === 'rest' ? 'Status' : "Today's workout"}
        </div>
        <div className="mt-1 text-2xl font-bold">{typeLabel[inProgress?.type ?? nextWorkout.type]}</div>
        {!inProgress && <p className="mt-2 text-sm text-stein-cream/70">{nextWorkout.rationale}</p>}
        {!inProgress && nextWorkout.type === 'training' && nextWorkout.suggestedTargetSeconds && (
          <p className="mt-2 text-sm text-stein-cream/70">
            Target {formatMMSS(nextWorkout.suggestedTargetSeconds)}, rest{' '}
            {settings.restIntervalOverrideSeconds ?? nextWorkout.suggestedRestSeconds}s between holds.
          </p>
        )}
      </div>

      <BigButton onClick={handleStart} disabled={!startable} className={!startable ? 'opacity-40' : ''}>
        {inProgress ? 'Resume Workout' : 'Start Workout'}
      </BigButton>

      <div className="mt-6 flex items-center justify-center text-sm font-semibold text-stein-cream/50">
        <Link to="/rules" className="px-3">
          Form &amp; rules
        </Link>
        <span className="h-4 w-px bg-stein-cream/20" />
        <Link to="/workout/competition" className="px-3">
          Log competition
        </Link>
        <span className="h-4 w-px bg-stein-cream/20" />
        <Link to="/settings" className="px-3">
          Settings
        </Link>
        <span className="h-4 w-px bg-stein-cream/20" />
        <Link to="/about" className="px-3">
          About
        </Link>
      </div>
    </div>
  )
}
