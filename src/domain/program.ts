import { daysBetween, toISODate } from './date'
import type { Profile, ProgramEntry, WorkoutSession } from '../types'

export type TrainingPhase = 'off_season' | 'build' | 'peak'

/**
 * Phase boundaries follow USSA's rough guidance: general strength off-season,
 * introduce 1-2 stein sessions/week starting ~4 months out, then more frequent
 * sport-specific work in the final ~2 months.
 */
export function determinePhase(competitionDate: string | null, todayISO: string): TrainingPhase {
  if (!competitionDate) return 'off_season'
  const daysOut = daysBetween(todayISO, competitionDate)
  if (daysOut < 0) return 'off_season' // competition has passed
  if (daysOut > 120) return 'off_season'
  if (daysOut > 60) return 'build'
  return 'peak'
}

const MAX_STEIN_SESSIONS_PER_WEEK: Record<TrainingPhase, number> = {
  off_season: 1,
  build: 2,
  peak: 4,
}

function isSteinSession(s: WorkoutSession): boolean {
  return s.type === 'practice' || s.type === 'training'
}

function sortByDateDesc(sessions: WorkoutSession[]): WorkoutSession[] {
  return [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

/** Rest-and-recovery-adjusted next training target/rest, based on how the last training session went. */
function nextTrainingParams(
  profile: Profile,
  lastTraining: WorkoutSession | undefined,
): { targetAccumulatedSeconds: number; restSeconds: number } {
  if (!lastTraining || lastTraining.targetAccumulatedSeconds === undefined) {
    const baseline = profile.baselineMaxHoldSeconds ?? 60
    const initialTarget = Math.max(300, Math.round((baseline * 2) / 30) * 30)
    return { targetAccumulatedSeconds: initialTarget, restSeconds: 60 }
  }

  const priorTarget = lastTraining.targetAccumulatedSeconds
  const priorRest = lastTraining.intervals?.[0]?.restPrescribedSeconds ?? 60
  const intervalCount = lastTraining.intervals?.length ?? 99

  if (lastTraining.status === 'abandoned') {
    // didn't hit target last time - hold steady rather than pile on more
    return { targetAccumulatedSeconds: priorTarget, restSeconds: priorRest }
  }

  const wentEasily = intervalCount <= 2
  const restSeconds = wentEasily ? Math.max(15, priorRest - 5) : priorRest
  const targetAccumulatedSeconds = wentEasily ? priorTarget + 30 : priorTarget

  return { targetAccumulatedSeconds, restSeconds }
}

export function getNextWorkout(
  profile: Profile,
  sessions: WorkoutSession[],
  today: Date = new Date(),
): ProgramEntry {
  const todayISO = toISODate(today)
  const hasAnyMaxReading =
    profile.baselineMaxHoldSeconds !== null ||
    sessions.some((s) => s.status === 'completed' && (s.type === 'practice' || s.type === 'competition'))

  if (!hasAnyMaxReading) {
    return {
      date: todayISO,
      type: 'practice',
      rationale: "Establish your baseline: hold as long as you can in legal form.",
    }
  }

  const relevant = sessions.filter((s) => s.status !== 'in_progress')
  const byDateDesc = sortByDateDesc(relevant)
  const last = byDateDesc[0]
  const phase = determinePhase(profile.competitionDate, todayISO)

  if (last) {
    const daysSinceLast = daysBetween(last.date, todayISO)
    if (isSteinSession(last) && daysSinceLast < 1) {
      return {
        date: todayISO,
        type: 'rest',
        rationale: 'Stein sessions need recovery - train again tomorrow at the earliest.',
      }
    }
  }

  const sevenDaysAgoISO = toISODate(new Date(today.getTime() - 7 * 86_400_000))
  const steinSessionsThisWeek = byDateDesc.filter(
    (s) => isSteinSession(s) && s.status === 'completed' && daysBetween(sevenDaysAgoISO, s.date) >= 0,
  ).length

  if (steinSessionsThisWeek >= MAX_STEIN_SESSIONS_PER_WEEK[phase]) {
    return {
      date: todayISO,
      type: phase === 'off_season' ? 'strength' : 'rest',
      rationale: `Already at ${steinSessionsThisWeek} stein session(s) this week for the ${phase.replace('_', ' ')} phase.`,
    }
  }

  const lastStein = byDateDesc.find((s) => isSteinSession(s) && s.status === 'completed')

  if (phase === 'off_season') {
    // Mostly general strength, with an occasional practice hold to keep the skill fresh.
    if (!lastStein || daysBetween(lastStein.date, todayISO) >= 7) {
      return {
        date: todayISO,
        type: 'practice',
        rationale: 'Off-season: a periodic practice hold keeps your form and baseline honest.',
      }
    }
    return {
      date: todayISO,
      type: 'strength',
      rationale: 'Off-season: general strength and muscle development.',
    }
  }

  // build / peak: alternate practice and training holds.
  if (!lastStein || lastStein.type === 'training') {
    return {
      date: todayISO,
      type: 'practice',
      rationale: 'Alternating in a practice hold to check current form and max.',
    }
  }

  const lastTraining = byDateDesc.find((s) => s.type === 'training' && s.status !== 'in_progress')
  const { targetAccumulatedSeconds, restSeconds } = nextTrainingParams(profile, lastTraining)

  return {
    date: todayISO,
    type: 'training',
    suggestedTargetSeconds: targetAccumulatedSeconds,
    suggestedRestSeconds: restSeconds,
    rationale:
      lastTraining?.status === 'abandoned'
        ? 'Repeating the same target - the last training hold ended short.'
        : 'Progressing target time / trimming rest based on your last training hold.',
  }
}
