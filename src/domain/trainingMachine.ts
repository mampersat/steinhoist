import type { Interval } from '../types'

export type TrainingPhase = 'countdown' | 'holding' | 'resting' | 'complete' | 'abandoned'

export interface TrainingState {
  phase: TrainingPhase
  targetAccumulatedSeconds: number
  /** rest prescribed between intervals, in seconds; fixed for the duration of one workout */
  restPrescribedSeconds: number
  /** completed intervals only - the in-flight hold/rest is derived from *StartedAt timestamps, not stored here */
  intervals: Interval[]
  accumulatedSeconds: number
  countdownStartedAt: number | null
  holdStartedAt: number | null
  restStartedAt: number | null
}

export type TrainingAction =
  | { type: 'COUNTDOWN_FINISHED'; now: number }
  | { type: 'FAIL'; now: number }
  | { type: 'REST_FINISHED'; now: number }
  | { type: 'SKIP_REST'; now: number }
  | { type: 'ABANDON'; now: number }

const COUNTDOWN_SECONDS = 3

export function initTrainingState(
  targetAccumulatedSeconds: number,
  restPrescribedSeconds: number,
  now: number,
): TrainingState {
  return {
    phase: 'countdown',
    targetAccumulatedSeconds,
    restPrescribedSeconds,
    intervals: [],
    accumulatedSeconds: 0,
    countdownStartedAt: now,
    holdStartedAt: null,
    restStartedAt: null,
  }
}

function sumHolds(intervals: Interval[]): number {
  return intervals.reduce((sum, i) => sum + i.holdSeconds, 0)
}

export function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'COUNTDOWN_FINISHED': {
      if (state.phase !== 'countdown') return state
      return { ...state, phase: 'holding', holdStartedAt: action.now, countdownStartedAt: null }
    }

    case 'FAIL': {
      if (state.phase !== 'holding' || state.holdStartedAt === null) return state
      const holdSeconds = Math.max(0, (action.now - state.holdStartedAt) / 1000)
      const accumulatedSeconds = state.accumulatedSeconds + holdSeconds
      const finished = accumulatedSeconds >= state.targetAccumulatedSeconds

      const interval: Interval = {
        holdSeconds,
        restPrescribedSeconds: finished ? null : state.restPrescribedSeconds,
        restActualSeconds: null,
      }
      const intervals = [...state.intervals, interval]

      if (finished) {
        return {
          ...state,
          phase: 'complete',
          intervals,
          accumulatedSeconds,
          holdStartedAt: null,
        }
      }

      return {
        ...state,
        phase: 'resting',
        intervals,
        accumulatedSeconds,
        holdStartedAt: null,
        restStartedAt: action.now,
      }
    }

    case 'REST_FINISHED': {
      if (state.phase !== 'resting' || state.restStartedAt === null) return state
      return {
        ...state,
        phase: 'holding',
        intervals: fillRestActual(state.intervals, state.restPrescribedSeconds),
        holdStartedAt: action.now,
        restStartedAt: null,
      }
    }

    case 'SKIP_REST': {
      if (state.phase !== 'resting' || state.restStartedAt === null) return state
      const restActualSeconds = Math.max(0, (action.now - state.restStartedAt) / 1000)
      return {
        ...state,
        phase: 'holding',
        intervals: fillRestActual(state.intervals, restActualSeconds),
        holdStartedAt: action.now,
        restStartedAt: null,
      }
    }

    case 'ABANDON': {
      if (state.phase === 'holding' && state.holdStartedAt !== null) {
        const holdSeconds = Math.max(0, (action.now - state.holdStartedAt) / 1000)
        const intervals = [
          ...state.intervals,
          { holdSeconds, restPrescribedSeconds: null, restActualSeconds: null },
        ]
        return {
          ...state,
          phase: 'abandoned',
          intervals,
          accumulatedSeconds: sumHolds(intervals),
          holdStartedAt: null,
        }
      }
      if (state.phase === 'resting' && state.restStartedAt !== null) {
        const restActualSeconds = Math.max(0, (action.now - state.restStartedAt) / 1000)
        return {
          ...state,
          phase: 'abandoned',
          intervals: fillRestActual(state.intervals, restActualSeconds),
          restStartedAt: null,
        }
      }
      return { ...state, phase: 'abandoned' }
    }

    default:
      return state
  }
}

function fillRestActual(intervals: Interval[], restActualSeconds: number): Interval[] {
  if (intervals.length === 0) return intervals
  const last = intervals[intervals.length - 1]
  return [...intervals.slice(0, -1), { ...last, restActualSeconds }]
}

/** Seconds remaining in the current phase's countdown/rest, clamped to zero. Pure function of `now`. */
export function secondsRemaining(state: TrainingState, now: number): number {
  if (state.phase === 'countdown' && state.countdownStartedAt !== null) {
    return Math.max(0, COUNTDOWN_SECONDS - (now - state.countdownStartedAt) / 1000)
  }
  if (state.phase === 'resting' && state.restStartedAt !== null) {
    return Math.max(0, state.restPrescribedSeconds - (now - state.restStartedAt) / 1000)
  }
  return 0
}

export function currentHoldSeconds(state: TrainingState, now: number): number {
  if (state.phase !== 'holding' || state.holdStartedAt === null) return 0
  return Math.max(0, (now - state.holdStartedAt) / 1000)
}

export { COUNTDOWN_SECONDS }
