import { formatMMSS } from '../domain/format'
import { useSessions } from '../hooks/useSessions'
import type { WorkoutSession } from '../types'

const typeLabel: Record<string, string> = {
  practice: 'Practice Hold',
  training: 'Training Hold',
  competition: 'Competition',
  strength: 'Strength',
  rest: 'Rest',
}

const statusLabel: Record<string, string> = {
  completed: 'Completed',
  abandoned: 'Ended early',
  in_progress: 'In progress',
}

export function History() {
  const { sessions } = useSessions()
  const sorted = [...sessions]
    .filter((s) => s.status !== 'in_progress')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-stein-amber-bright">History</h1>
      {sorted.length === 0 && <p className="text-stein-cream/60">No workouts logged yet.</p>}
      <div className="flex flex-col gap-3">
        {sorted.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </div>
    </div>
  )
}

function SessionRow({ session }: { session: WorkoutSession }) {
  return (
    <div className="rounded-xl bg-stein-surface p-4">
      <div className="flex items-center justify-between">
        <div className="font-bold">{typeLabel[session.type]}</div>
        <div className="text-sm text-stein-cream/60">{session.date}</div>
      </div>

      {session.type === 'practice' || session.type === 'competition' ? (
        <div className="mt-1 text-2xl font-bold text-stein-amber-bright">
          {session.singleHoldSeconds !== undefined ? formatMMSS(session.singleHoldSeconds) : '--'}
        </div>
      ) : session.type === 'training' ? (
        <>
          <div className="mt-1 text-xl font-bold text-stein-amber-bright">
            {formatMMSS(session.accumulatedSeconds ?? 0)} / {formatMMSS(session.targetAccumulatedSeconds ?? 0)}
          </div>
          {session.intervals && session.intervals.length > 0 && (
            <div className="mt-1 text-sm text-stein-cream/70">
              {session.intervals.map((i) => formatMMSS(i.holdSeconds)).join(' + ')} ({session.intervals.length} hold
              {session.intervals.length > 1 ? 's' : ''})
            </div>
          )}
        </>
      ) : null}

      {session.status === 'abandoned' && (
        <div className="mt-1 text-xs font-semibold text-stein-red">{statusLabel[session.status]}</div>
      )}
    </div>
  )
}
