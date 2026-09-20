import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../../components/BigButton'
import { COUNTDOWN_SECONDS } from '../../domain/trainingMachine'
import { formatMMSS } from '../../domain/format'
import { computePR } from '../../domain/pr'
import { cueCountdownTick, cueWorkoutComplete } from '../../lib/cues'
import { useSessions } from '../../hooks/useSessions'
import { useSettings } from '../../hooks/useSettings'
import { sessionStore } from '../../storage/repository'
import type { WorkoutSession } from '../../types'

type Phase = 'ready' | 'countdown' | 'holding' | 'complete'

export function PracticeHold() {
  const navigate = useNavigate()
  const { sessions, upsertSession } = useSessions()
  const { settings } = useSettings()
  const priorPR = computePR(sessions)

  const existing = sessionStore.getInProgress()
  const [session, setSession] = useState<WorkoutSession | null>(
    existing && existing.type === 'practice' ? existing : null,
  )
  const [phase, setPhase] = useState<Phase>(existing && existing.type === 'practice' ? 'holding' : 'ready')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [now, setNow] = useState(() => Date.now())
  const [resultSeconds, setResultSeconds] = useState<number | null>(null)
  const lastTick = useRef(-1)

  useEffect(() => {
    if (phase !== 'holding' && phase !== 'countdown') return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'countdown') return
    const remaining = Math.ceil(countdown)
    if (remaining !== lastTick.current) {
      lastTick.current = remaining
      cueCountdownTick(settings, remaining > 0 ? remaining : 0)
    }
    if (countdown <= 0) {
      startHolding()
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 0.1), 100)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown])

  function beginCountdown() {
    lastTick.current = -1
    setCountdown(COUNTDOWN_SECONDS)
    setPhase('countdown')
  }

  function startHolding() {
    const s: WorkoutSession = {
      id: crypto.randomUUID(),
      type: 'practice',
      date: new Date().toISOString().slice(0, 10),
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      prAtTimeOfSession: priorPR,
    }
    sessionStore.upsert(s)
    setSession(s)
    setNow(Date.now())
    setPhase('holding')
  }

  function handleFail() {
    if (!session) return
    const holdSeconds = Math.max(0, (Date.now() - Date.parse(session.startedAt)) / 1000)
    const completed: WorkoutSession = { ...session, status: 'completed', singleHoldSeconds: holdSeconds }
    upsertSession(completed)
    setResultSeconds(holdSeconds)
    cueWorkoutComplete(settings)
    setPhase('complete')
  }

  if (phase === 'ready') {
    return (
      <Screen>
        <p className="mb-10 text-center text-xl text-stein-cream/80">
          Hold the stein straight out in front of you with one arm, in legal competition form, for as long as you
          can.
        </p>
        <BigButton onClick={beginCountdown}>Start</BigButton>
      </Screen>
    )
  }

  if (phase === 'countdown') {
    const display = Math.max(0, Math.ceil(countdown))
    return (
      <Screen>
        <div className="text-[9rem] font-black leading-none text-stein-amber-bright">
          {display > 0 ? display : 'GO'}
        </div>
      </Screen>
    )
  }

  if (phase === 'holding') {
    const elapsed = session ? (now - Date.parse(session.startedAt)) / 1000 : 0
    return (
      <Screen>
        <div className="mb-12 text-8xl font-black tabular-nums text-stein-amber-bright">{formatMMSS(elapsed)}</div>
        <BigButton variant="danger" onClick={handleFail}>
          Fail / Stop
        </BigButton>
      </Screen>
    )
  }

  const isPR = resultSeconds !== null && (priorPR === null || resultSeconds > priorPR)
  return (
    <Screen>
      <div className="mb-2 text-sm uppercase tracking-wide text-stein-cream/60">Hold time</div>
      <div className="mb-4 text-7xl font-black text-stein-amber-bright">
        {resultSeconds !== null ? formatMMSS(resultSeconds) : '--'}
      </div>
      {isPR && <div className="mb-8 text-2xl font-bold text-stein-green">New PR!</div>}
      <BigButton onClick={() => navigate('/home')}>Done</BigButton>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">{children}</div>
  )
}
