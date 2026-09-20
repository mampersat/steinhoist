import type { WorkoutSession } from '../types'

export interface WeeklyVolume {
  weekStartISO: string
  totalSeconds: number
}

/** Sums accumulated/single-hold seconds per ISO week (Mon-start), most recent first. */
export function weeklyTrainingVolume(sessions: WorkoutSession[]): WeeklyVolume[] {
  const byWeek = new Map<string, number>()
  for (const s of sessions) {
    if (s.status === 'in_progress') continue
    const seconds = s.type === 'training' ? s.accumulatedSeconds ?? 0 : s.singleHoldSeconds ?? 0
    if (seconds === 0) continue
    const weekStart = mondayOf(s.date)
    byWeek.set(weekStart, (byWeek.get(weekStart) ?? 0) + seconds)
  }
  return [...byWeek.entries()]
    .map(([weekStartISO, totalSeconds]) => ({ weekStartISO, totalSeconds }))
    .sort((a, b) => b.weekStartISO.localeCompare(a.weekStartISO))
}

function mondayOf(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const dayOfWeek = date.getUTCDay() // 0 = Sunday
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  date.setUTCDate(date.getUTCDate() - diffToMonday)
  return date.toISOString().slice(0, 10)
}

/**
 * The headline "meaningful improvement without a new max test" signal: reaching the
 * same or a higher accumulated target using fewer, longer holds than last time.
 */
export function describeTrainingImprovement(
  previous: WorkoutSession,
  current: WorkoutSession,
): string | null {
  if (previous.type !== 'training' || current.type !== 'training') return null
  const prevIntervals = previous.intervals ?? []
  const currIntervals = current.intervals ?? []
  const prevAccumulated = previous.accumulatedSeconds ?? 0
  const currAccumulated = current.accumulatedSeconds ?? 0
  if (currIntervals.length === 0 || prevIntervals.length === 0) return null

  const reachedAsMuch = currAccumulated >= prevAccumulated
  const fewerHolds = currIntervals.length < prevIntervals.length
  const longestPrev = Math.max(...prevIntervals.map((i) => i.holdSeconds))
  const longestCurr = Math.max(...currIntervals.map((i) => i.holdSeconds))

  if (reachedAsMuch && fewerHolds) {
    return `Needed only ${currIntervals.length} hold${currIntervals.length > 1 ? 's' : ''} to reach ${Math.round(currAccumulated)}s (previously ${prevIntervals.length}).`
  }
  if (longestCurr > longestPrev) {
    return `Longest single hold improved from ${Math.round(longestPrev)}s to ${Math.round(longestCurr)}s.`
  }
  return null
}
