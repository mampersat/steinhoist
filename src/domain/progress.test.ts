import { describe, expect, it } from 'vitest'
import { describeTrainingImprovement } from './progress'
import type { WorkoutSession } from '../types'

function training(overrides: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    type: 'training',
    date: '2026-09-01',
    startedAt: '2026-09-01T18:00:00Z',
    status: 'completed',
    prAtTimeOfSession: null,
    targetAccumulatedSeconds: 600,
    accumulatedSeconds: 600,
    intervals: [],
    ...overrides,
  }
}

describe('describeTrainingImprovement', () => {
  it('flags fewer holds to reach the same accumulated time as improvement', () => {
    const previous = training({
      intervals: [
        { holdSeconds: 240, restPrescribedSeconds: 60, restActualSeconds: 60 },
        { holdSeconds: 180, restPrescribedSeconds: 60, restActualSeconds: 60 },
        { holdSeconds: 120, restPrescribedSeconds: 60, restActualSeconds: 60 },
        { holdSeconds: 60, restPrescribedSeconds: null, restActualSeconds: null },
      ],
      accumulatedSeconds: 600,
    })
    const current = training({
      intervals: [
        { holdSeconds: 330, restPrescribedSeconds: 60, restActualSeconds: 60 },
        { holdSeconds: 180, restPrescribedSeconds: 60, restActualSeconds: 60 },
        { holdSeconds: 90, restPrescribedSeconds: null, restActualSeconds: null },
      ],
      accumulatedSeconds: 600,
    })
    expect(describeTrainingImprovement(previous, current)).toMatch(/only 3 holds/)
  })

  it('returns null when there is no meaningful signal', () => {
    const previous = training({
      intervals: [{ holdSeconds: 300, restPrescribedSeconds: null, restActualSeconds: null }],
      accumulatedSeconds: 300,
    })
    const current = training({
      intervals: [{ holdSeconds: 250, restPrescribedSeconds: null, restActualSeconds: null }],
      accumulatedSeconds: 250,
    })
    expect(describeTrainingImprovement(previous, current)).toBeNull()
  })
})
