import { useNavigate } from 'react-router-dom'
import { BigButton } from '../../components/BigButton'
import { toISODate } from '../../domain/date'
import { determinePhase } from '../../domain/program'
import { computePR } from '../../domain/pr'
import { useProfile } from '../../hooks/useProfile'
import { useSessions } from '../../hooks/useSessions'
import { debugNow } from '../../lib/debugClock'
import type { WorkoutSession } from '../../types'

interface Exercise {
  name: string
  detail: string
}

const OFF_SEASON_WORK: Exercise[] = [
  { name: "Farmer's carries", detail: 'Heavy dumbbell or kettlebell, 30-40m per set, 4 sets' },
  { name: 'Static plate or pinch holds', detail: 'Near-max weight, hold to grip failure, 3 sets, rest 90s' },
  { name: 'Straight-arm front raises', detail: 'Light plate, arm locked, hold 15-20s at shoulder height, 3 sets' },
  { name: 'Wrist curls & reverse wrist curls', detail: '3 sets of 12-15 reps each direction' },
]

const ENDURANCE_WORK: Exercise[] = [
  {
    name: 'Straight-arm front raise holds',
    detail: 'Lighter weight, longer holds (30-45s), 4-5 sets - the closest gym analog to the competition position',
  },
  { name: "Farmer's carries", detail: 'Lighter load, longer distance (60m+), 3-4 sets' },
  { name: 'Submaximal dead-hangs or pinch holds', detail: 'Comfortable weight, hold as long as possible, 2-3 sets' },
  { name: 'Forearm endurance work', detail: 'Wrist curls, light weight, 20+ reps, 2-3 sets' },
]

export function Strength() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { sessions, upsertSession } = useSessions()

  if (!profile) return null

  const phase = determinePhase(profile.competitionDate, toISODate(debugNow()))
  const exercises = phase === 'off_season' ? OFF_SEASON_WORK : ENDURANCE_WORK
  const intro =
    phase === 'off_season'
      ? 'Off-season: build general strength and muscle before stein-specific work ramps up.'
      : 'Competition getting closer: lighter weight, higher reps, more grip- and shoulder-specific endurance work.'

  function handleComplete() {
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      type: 'strength',
      date: toISODate(debugNow()),
      startedAt: new Date().toISOString(),
      status: 'completed',
      prAtTimeOfSession: computePR(sessions),
    }
    upsertSession(session)
    navigate('/home')
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-2 font-display text-3xl font-bold text-stein-amber-bright">Supplemental work</h1>
      <p className="mb-8 text-stein-cream/70">{intro}</p>

      <div className="mb-8 flex flex-col gap-3">
        {exercises.map((exercise) => (
          <div key={exercise.name} className="rounded-xl bg-stein-surface p-4">
            <div className="font-semibold">{exercise.name}</div>
            <div className="mt-1 text-sm text-stein-cream/70">{exercise.detail}</div>
          </div>
        ))}
      </div>

      <BigButton onClick={handleComplete}>Mark complete</BigButton>
    </div>
  )
}
