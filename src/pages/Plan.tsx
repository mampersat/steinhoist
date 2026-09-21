import { formatMMSS } from '../domain/format'
import { previewProgram } from '../domain/program'
import { useProfile } from '../hooks/useProfile'
import { useSessions } from '../hooks/useSessions'
import { useSettings } from '../hooks/useSettings'

const PREVIEW_DAYS = 7

const typeLabel: Record<string, string> = {
  practice: 'Practice Hold',
  training: 'Training Hold',
  competition: 'Competition',
  strength: 'Supplemental Work',
  rest: 'Rest',
}

function dayLabel(iso: string, todayISO: string): string {
  if (iso === todayISO) return 'Today'
  const date = new Date(`${iso}T00:00:00Z`)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })
  const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return `${weekday}, ${monthDay}`
}

export function Plan() {
  const { profile } = useProfile()
  const { sessions } = useSessions()
  const { settings } = useSettings()

  if (!profile) return null

  const today = new Date()
  const todayISO = today.toISOString().slice(0, 10)
  const entries = previewProgram(profile, sessions, PREVIEW_DAYS, today, settings.restIntervalOverrideSeconds)

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-2 font-display text-3xl font-bold text-stein-amber-bright">The week ahead</h1>
      <p className="mb-8 text-stein-cream/70">
        A projection, not a fixed schedule - it assumes every hold goes about as planned. A day that goes better or
        worse than that will shift everything after it.
      </p>

      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <div key={i} className="rounded-xl bg-stein-surface p-4">
            <div className="text-sm font-semibold text-stein-cream/60">{dayLabel(entry.date, todayISO)}</div>
            <div className="mt-1 text-xl font-bold">{typeLabel[entry.type]}</div>
            {entry.type === 'training' && entry.suggestedTargetSeconds && (
              <div className="mt-1 text-sm text-stein-cream/70">
                Target {formatMMSS(entry.suggestedTargetSeconds)}, rest{' '}
                {settings.restIntervalOverrideSeconds ?? entry.suggestedRestSeconds}s between holds.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
