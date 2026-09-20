import type { WorkoutSession } from '../types'

/** Personal record is derived from history, never stored redundantly. */
export function computePR(sessions: WorkoutSession[]): number | null {
  const holds = sessions
    .filter((s) => s.status === 'completed' && (s.type === 'practice' || s.type === 'competition'))
    .map((s) => s.singleHoldSeconds)
    .filter((v): v is number => typeof v === 'number')
  if (holds.length === 0) return null
  return Math.max(...holds)
}
