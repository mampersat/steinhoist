import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../../components/BigButton'
import { formatMMSS } from '../../domain/format'
import { computePR } from '../../domain/pr'
import { useSessions } from '../../hooks/useSessions'
import type { WorkoutSession } from '../../types'

type Phase = 'ready' | 'holding' | 'complete'

/**
 * Deliberately has none of Practice/Training Hold's resume-on-reload machinery -
 * a real competition attempt is a single continuous action you're actively watching,
 * not something the app needs to survive a background/reload for.
 */
export function Competition() {
  const navigate = useNavigate()
  const { sessions, upsertSession } = useSessions()
  const priorPR = computePR(sessions)

  const [phase, setPhase] = useState<Phase>('ready')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [resultSeconds, setResultSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (phase !== 'holding') return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [phase])

  function handleStart() {
    setStartedAt(Date.now())
    setNow(Date.now())
    setPhase('holding')
  }

  function handleStop() {
    if (startedAt === null) return
    setResultSeconds(Math.max(0, (Date.now() - startedAt) / 1000))
    setPhase('complete')
  }

  function handleSave() {
    if (resultSeconds === null) return
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      type: 'competition',
      date: new Date().toISOString().slice(0, 10),
      startedAt: new Date(Date.now() - resultSeconds * 1000).toISOString(),
      status: 'completed',
      singleHoldSeconds: resultSeconds,
      prAtTimeOfSession: priorPR,
    }
    upsertSession(session)
    navigate('/home')
  }

  if (phase === 'ready') {
    return (
      <Screen>
        <p className="mb-10 text-center text-xl text-stein-cream/80">
          Competition timer. Tap Start the instant the official calls go.
        </p>
        <BigButton onClick={handleStart}>Start</BigButton>
      </Screen>
    )
  }

  if (phase === 'holding') {
    const elapsed = startedAt !== null ? (now - startedAt) / 1000 : 0
    return (
      <Screen>
        <div className="mb-12 text-8xl font-black tabular-nums text-stein-amber-bright">{formatMMSS(elapsed)}</div>
        <BigButton variant="danger" onClick={handleStop}>
          Stop
        </BigButton>
      </Screen>
    )
  }

  const isPR = resultSeconds !== null && (priorPR === null || resultSeconds > priorPR)
  return (
    <Screen>
      <div className="mb-2 text-sm font-semibold text-stein-cream/60">Result</div>
      <div className="mb-4 text-7xl font-black text-stein-amber-bright">
        {resultSeconds !== null ? formatMMSS(resultSeconds) : '--'}
      </div>
      {isPR && <div className="mb-8 text-2xl font-bold text-stein-green">New PR!</div>}
      <div className="flex w-full flex-col gap-4">
        <BigButton onClick={handleSave}>Save result</BigButton>
        <BigButton variant="neutral" onClick={() => navigate('/home')}>
          Discard
        </BigButton>
      </div>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">{children}</div>
  )
}
