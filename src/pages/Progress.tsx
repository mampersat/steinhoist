import { Stat } from '../components/Stat'
import { formatMMSS } from '../domain/format'
import { computePR } from '../domain/pr'
import { describeTrainingImprovement, weeklyTrainingVolume } from '../domain/progress'
import { useSessions } from '../hooks/useSessions'
import type { WorkoutSession } from '../types'

export function Progress() {
  const { sessions } = useSessions()
  const pr = computePR(sessions)
  const volume = weeklyTrainingVolume(sessions).slice(0, 6)

  const trainingHistory = [...sessions]
    .filter((s) => s.type === 'training' && s.status !== 'in_progress')
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))

  const improvements = pairwiseImprovements(trainingHistory)

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-stein-amber-bright">Progress</h1>

      <div className="mb-8 border-y border-stein-amber/15 py-6">
        <Stat label="Personal record" value={pr !== null ? formatMMSS(pr) : '—'} size="xl" />
      </div>

      <Section title="Weekly training volume">
        {volume.length === 0 && <Empty />}
        {volume.map((w) => (
          <div key={w.weekStartISO} className="flex justify-between rounded-lg bg-stein-surface px-4 py-3">
            <span className="text-stein-cream/70">Week of {w.weekStartISO}</span>
            <span className="font-bold text-stein-amber-bright">{formatMMSS(w.totalSeconds)}</span>
          </div>
        ))}
      </Section>

      <Section title="Training hold improvement">
        {improvements.length === 0 && (
          <p className="text-stein-cream/60">
            Complete a couple of Training Holds and we'll compare how efficiently you accumulate your target time.
          </p>
        )}
        {improvements.map(({ session, note }) => (
          <div key={session.id} className="rounded-lg bg-stein-surface px-4 py-3">
            <div className="text-sm text-stein-cream/60">{session.date}</div>
            <div className="font-semibold text-stein-green">{note}</div>
          </div>
        ))}
      </Section>
    </div>
  )
}

function pairwiseImprovements(history: WorkoutSession[]): { session: WorkoutSession; note: string }[] {
  const results: { session: WorkoutSession; note: string }[] = []
  for (let i = 1; i < history.length; i++) {
    const note = describeTrainingImprovement(history[i - 1], history[i])
    if (note) results.push({ session: history[i], note })
  }
  return results.reverse()
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 border-b border-stein-amber/15 pb-2 text-base font-semibold text-stein-cream/75">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Empty() {
  return <p className="text-stein-cream/60">Nothing logged yet.</p>
}
