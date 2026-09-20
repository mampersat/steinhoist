import { useEffect, useReducer, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BigButton } from '../../components/BigButton'
import { Stat } from '../../components/Stat'
import {
  currentHoldSeconds,
  initTrainingState,
  secondsRemaining,
  trainingReducer,
  type TrainingState,
} from '../../domain/trainingMachine'
import { formatMMSS } from '../../domain/format'
import { computePR } from '../../domain/pr'
import { cueCountdownTick, cueRaiseStein, cueRestStarted, cueWorkoutComplete } from '../../lib/cues'
import { useSessions } from '../../hooks/useSessions'
import { useSettings } from '../../hooks/useSettings'
import { sessionStore, trainingRuntimeStore } from '../../storage/repository'
import type { WorkoutSession } from '../../types'

const DEFAULT_TARGET = 600
const DEFAULT_REST = 60

interface NavState {
  targetAccumulatedSeconds?: number
  restSeconds?: number
}

function persist(session: WorkoutSession, state: TrainingState): WorkoutSession {
  const updated: WorkoutSession = {
    ...session,
    status: state.phase === 'complete' ? 'completed' : state.phase === 'abandoned' ? 'abandoned' : 'in_progress',
    targetAccumulatedSeconds: state.targetAccumulatedSeconds,
    intervals: state.intervals,
    accumulatedSeconds: state.accumulatedSeconds,
  }
  sessionStore.upsert(updated)
  if (state.phase === 'holding' || state.phase === 'resting') {
    trainingRuntimeStore.save({
      sessionId: updated.id,
      phase: state.phase,
      restPrescribedSeconds: state.restPrescribedSeconds,
      holdStartedAt: state.holdStartedAt,
      restStartedAt: state.restStartedAt,
    })
  } else {
    trainingRuntimeStore.clear()
  }
  return updated
}

export function TrainingHold() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessions, upsertSession } = useSessions()
  const { settings } = useSettings()
  const priorPR = computePR(sessions)

  const init = useRef(() => {
    const navState = (location.state as NavState | null) ?? {}
    const existingSession = sessionStore.getInProgress()
    const runtime = trainingRuntimeStore.get()

    if (existingSession?.type === 'training' && runtime?.sessionId === existingSession.id) {
      const state: TrainingState = {
        phase: runtime.phase,
        targetAccumulatedSeconds: existingSession.targetAccumulatedSeconds ?? DEFAULT_TARGET,
        restPrescribedSeconds: runtime.restPrescribedSeconds,
        intervals: existingSession.intervals ?? [],
        accumulatedSeconds: existingSession.accumulatedSeconds ?? 0,
        countdownStartedAt: null,
        holdStartedAt: runtime.holdStartedAt,
        restStartedAt: runtime.restStartedAt,
      }
      return {
        session: existingSession,
        state,
        needsResumeConfirmation: runtime.phase === 'holding',
      }
    }

    // Stale/orphaned in-progress session with no matching runtime info: preserve
    // whatever partial progress it has rather than silently overwriting it.
    if (existingSession?.type === 'training') {
      sessionStore.upsert({ ...existingSession, status: 'abandoned' })
      trainingRuntimeStore.clear()
    }

    const target = navState.targetAccumulatedSeconds ?? DEFAULT_TARGET
    const rest = navState.restSeconds ?? DEFAULT_REST
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      type: 'training',
      date: new Date().toISOString().slice(0, 10),
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      prAtTimeOfSession: priorPR,
      targetAccumulatedSeconds: target,
      intervals: [],
      accumulatedSeconds: 0,
    }
    return {
      session,
      state: initTrainingState(target, rest, Date.now()),
      needsResumeConfirmation: false,
    }
  })

  const [{ session: initialSession, state: initialState, needsResumeConfirmation }] = useState(init.current)
  const [session, setSession] = useState(initialSession)
  const [state, dispatch] = useReducer(trainingReducer, initialState)
  const [resumeConfirmed, setResumeConfirmed] = useState(!needsResumeConfirmation)
  const [now, setNow] = useState(() => Date.now())
  const [confirmingAbandon, setConfirmingAbandon] = useState(false)
  const prevPhase = useRef(state.phase)
  const countdownTickRef = useRef(-1)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])

  // Persist to storage on every phase transition (not every tick).
  useEffect(() => {
    if (!resumeConfirmed) return
    setSession((s) => persist(s, state))
    if (state.phase !== prevPhase.current) {
      if (state.phase === 'holding') cueRaiseStein(settings)
      if (state.phase === 'resting') cueRestStarted(settings)
      if (state.phase === 'complete') {
        cueWorkoutComplete(settings)
        upsertSession(persist(session, state))
      }
      if (state.phase === 'abandoned') upsertSession(persist(session, state))
      prevPhase.current = state.phase
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, resumeConfirmed])

  useEffect(() => {
    if (state.phase !== 'countdown' || !resumeConfirmed) return
    const remaining = Math.ceil(secondsRemaining(state, now))
    if (remaining !== countdownTickRef.current) {
      countdownTickRef.current = remaining
      cueCountdownTick(settings, remaining)
    }
    if (remaining <= 0) dispatch({ type: 'COUNTDOWN_FINISHED', now: Date.now() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, now, resumeConfirmed])

  useEffect(() => {
    if (state.phase !== 'resting' || !resumeConfirmed) return
    if (secondsRemaining(state, now) <= 0) dispatch({ type: 'REST_FINISHED', now: Date.now() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, now, resumeConfirmed])

  function handleFail() {
    dispatch({ type: 'FAIL', now: Date.now() })
  }

  function handleAbandonTap() {
    if (confirmingAbandon) {
      dispatch({ type: 'ABANDON', now: Date.now() })
      setConfirmingAbandon(false)
      return
    }
    setConfirmingAbandon(true)
    setTimeout(() => setConfirmingAbandon(false), 3000)
  }

  if (needsResumeConfirmation && !resumeConfirmed) {
    return (
      <Screen>
        <p className="mb-8 text-2xl font-bold">Still holding the stein?</p>
        <p className="mb-10 text-stein-cream/70">
          The app was reloaded while you were mid-hold. Let's confirm where you left off before continuing.
        </p>
        <div className="flex w-full flex-col gap-4">
          <BigButton
            onClick={() => {
              setResumeConfirmed(true)
            }}
          >
            Still holding
          </BigButton>
          <BigButton
            variant="danger"
            onClick={() => {
              setResumeConfirmed(true)
              dispatch({ type: 'FAIL', now: Date.now() })
            }}
          >
            No, I failed
          </BigButton>
        </div>
      </Screen>
    )
  }

  if (state.phase === 'countdown') {
    const display = Math.max(0, Math.ceil(secondsRemaining(state, now)))
    return (
      <Screen>
        <div className="text-[9rem] font-black leading-none text-stein-amber-bright">
          {display > 0 ? display : 'GO'}
        </div>
      </Screen>
    )
  }

  if (state.phase === 'complete') {
    return (
      <Screen>
        <div className="mb-2 text-sm font-semibold text-stein-cream/60">Workout complete</div>
        <div className="mb-4 text-6xl font-black text-stein-amber-bright">
          {formatMMSS(state.accumulatedSeconds)} / {formatMMSS(state.targetAccumulatedSeconds)}
        </div>
        <IntervalSummary state={state} />
        <div className="mt-10 w-full">
          <BigButton onClick={() => navigate('/home')}>Done</BigButton>
        </div>
      </Screen>
    )
  }

  if (state.phase === 'abandoned') {
    return (
      <Screen>
        <div className="mb-2 text-sm font-semibold text-stein-cream/60">Workout ended early</div>
        <div className="mb-4 text-5xl font-black text-stein-amber-bright">
          {formatMMSS(state.accumulatedSeconds)} / {formatMMSS(state.targetAccumulatedSeconds)}
        </div>
        <p className="mb-6 text-stein-cream/70">Your progress up to this point has been saved.</p>
        <IntervalSummary state={state} />
        <div className="mt-10 w-full">
          <BigButton onClick={() => navigate('/home')}>Done</BigButton>
        </div>
      </Screen>
    )
  }

  // holding or resting
  return (
    <Screen>
      <div className="mb-8 flex w-full divide-x divide-stein-amber/20 border-y border-stein-amber/15 py-4">
        <Stat label="Target" value={formatMMSS(state.targetAccumulatedSeconds)} />
        <Stat label="Accumulated" value={formatMMSS(state.accumulatedSeconds)} />
      </div>

      {state.phase === 'holding' ? (
        <>
          <div className="mb-2 text-sm font-semibold text-stein-cream/60">Current hold</div>
          <div className="mb-10 text-7xl font-black tabular-nums text-stein-amber-bright">
            {formatMMSS(currentHoldSeconds(state, now))}
          </div>
          <BigButton variant="danger" onClick={handleFail}>
            Fail
          </BigButton>
        </>
      ) : (
        <>
          <div className="mb-2 text-sm font-semibold text-stein-cream/60">Rest</div>
          <div className="mb-10 text-7xl font-black tabular-nums text-stein-cream">
            {formatMMSS(secondsRemaining(state, now))}
          </div>
          <BigButton onClick={() => dispatch({ type: 'SKIP_REST', now: Date.now() })}>Ready - Go Now</BigButton>
        </>
      )}

      <button
        onClick={handleAbandonTap}
        className="no-select mt-10 text-sm font-semibold text-stein-cream/50"
      >
        {confirmingAbandon ? 'Tap again to end workout' : 'End workout'}
      </button>
    </Screen>
  )
}

function IntervalSummary({ state }: { state: TrainingState }) {
  if (state.intervals.length === 0) return null
  return (
    <div className="text-stein-cream/70">
      {state.intervals.map((i) => formatMMSS(i.holdSeconds)).join(' + ')} in {state.intervals.length} hold
      {state.intervals.length > 1 ? 's' : ''}
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">{children}</div>
  )
}
