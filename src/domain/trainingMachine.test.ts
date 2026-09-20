import { describe, expect, it } from 'vitest'
import {
  currentHoldSeconds,
  initTrainingState,
  secondsRemaining,
  trainingReducer,
} from './trainingMachine'

const T0 = 1_000_000

describe('trainingMachine', () => {
  it('counts down then starts holding', () => {
    let state = initTrainingState(600, 60, T0)
    expect(state.phase).toBe('countdown')
    expect(secondsRemaining(state, T0 + 1000)).toBeCloseTo(2, 1)

    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now: T0 + 3000 })
    expect(state.phase).toBe('holding')
    expect(currentHoldSeconds(state, T0 + 3000 + 5000)).toBeCloseTo(5, 1)
  })

  it('runs the worked example from the USSA methodology: 4:00 + 3:00 + 2:00 + 1:00 = 10:00', () => {
    let state = initTrainingState(600, 60, T0)
    let now = T0
    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now })

    // hold 4:00
    now += 240_000
    state = trainingReducer(state, { type: 'FAIL', now })
    expect(state.phase).toBe('resting')
    expect(state.accumulatedSeconds).toBeCloseTo(240, 1)
    expect(state.intervals).toHaveLength(1)
    expect(state.intervals[0].restPrescribedSeconds).toBe(60)

    // rest fully elapses
    now += 60_000
    state = trainingReducer(state, { type: 'REST_FINISHED', now })
    expect(state.phase).toBe('holding')
    expect(state.intervals[0].restActualSeconds).toBeCloseTo(60, 1)

    // hold 3:00
    now += 180_000
    state = trainingReducer(state, { type: 'FAIL', now })
    expect(state.accumulatedSeconds).toBeCloseTo(420, 1)
    now += 60_000
    state = trainingReducer(state, { type: 'REST_FINISHED', now })

    // hold 2:00
    now += 120_000
    state = trainingReducer(state, { type: 'FAIL', now })
    expect(state.accumulatedSeconds).toBeCloseTo(540, 1)
    now += 60_000
    state = trainingReducer(state, { type: 'REST_FINISHED', now })

    // final hold 1:00 completes the 10:00 target
    now += 60_000
    state = trainingReducer(state, { type: 'FAIL', now })

    expect(state.phase).toBe('complete')
    expect(state.accumulatedSeconds).toBeCloseTo(600, 1)
    expect(state.intervals).toHaveLength(4)
    // rest never counts toward the target
    expect(state.intervals[3].restPrescribedSeconds).toBeNull()
  })

  it('does not double-count rest toward the accumulated target', () => {
    let state = initTrainingState(60, 60, T0)
    let now = T0
    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now })
    now += 30_000
    state = trainingReducer(state, { type: 'FAIL', now })
    expect(state.phase).toBe('resting')
    now += 60_000
    state = trainingReducer(state, { type: 'REST_FINISHED', now })
    // still short of target - rest time must not have been credited
    expect(state.accumulatedSeconds).toBeCloseTo(30, 1)
    expect(state.phase).toBe('holding')
  })

  it('allows skipping rest early and records the shorter actual rest', () => {
    let state = initTrainingState(600, 60, T0)
    let now = T0
    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now })
    now += 100_000
    state = trainingReducer(state, { type: 'FAIL', now })
    now += 20_000 // athlete feels ready after only 20s of the 60s rest
    state = trainingReducer(state, { type: 'SKIP_REST', now })
    expect(state.phase).toBe('holding')
    expect(state.intervals[0].restActualSeconds).toBeCloseTo(20, 1)
    expect(state.intervals[0].restPrescribedSeconds).toBe(60)
  })

  it('saves partial progress when abandoned mid-hold', () => {
    let state = initTrainingState(600, 60, T0)
    let now = T0
    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now })
    now += 45_000
    state = trainingReducer(state, { type: 'ABANDON', now })
    expect(state.phase).toBe('abandoned')
    expect(state.accumulatedSeconds).toBeCloseTo(45, 1)
    expect(state.intervals).toHaveLength(1)
    expect(state.intervals[0].restPrescribedSeconds).toBeNull()
  })

  it('saves partial progress when abandoned mid-rest, without crediting unfinished rest as a hold', () => {
    let state = initTrainingState(600, 60, T0)
    let now = T0
    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now })
    now += 90_000
    state = trainingReducer(state, { type: 'FAIL', now })
    now += 10_000
    state = trainingReducer(state, { type: 'ABANDON', now })
    expect(state.phase).toBe('abandoned')
    expect(state.intervals).toHaveLength(1)
    expect(state.accumulatedSeconds).toBeCloseTo(90, 1)
    expect(state.intervals[0].restActualSeconds).toBeCloseTo(10, 1)
  })

  it('ignores actions that do not apply to the current phase', () => {
    let state = initTrainingState(600, 60, T0)
    const beforeCountdownFinished = state
    // FAIL during countdown should be a no-op
    state = trainingReducer(state, { type: 'FAIL', now: T0 + 1000 })
    expect(state).toEqual(beforeCountdownFinished)
  })

  it('treats zero-duration holds as legitimate immediate failure, never negative', () => {
    let state = initTrainingState(60, 60, T0)
    state = trainingReducer(state, { type: 'COUNTDOWN_FINISHED', now: T0 })
    // clock somehow reports an earlier "now" than holdStartedAt (should clamp, not go negative)
    state = trainingReducer(state, { type: 'FAIL', now: T0 - 5000 })
    expect(state.intervals[0].holdSeconds).toBe(0)
  })
})
