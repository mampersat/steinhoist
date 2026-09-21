import { describe, expect, it } from 'vitest'
import { determinePhase, getNextWorkout, previewProgram } from './program'
import type { Profile, WorkoutSession } from '../types'

const today = new Date('2026-09-20T12:00:00Z')

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    dominantArm: 'right',
    experienceLevel: 'beginner',
    hasCompetitionStein: false,
    competitionDate: null,
    baselineMaxHoldSeconds: 60,
    targetHoldSeconds: null,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeSession(overrides: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: crypto.randomUUID(),
    type: 'practice',
    date: '2026-09-19',
    startedAt: '2026-09-19T18:00:00Z',
    status: 'completed',
    prAtTimeOfSession: 60,
    ...overrides,
  }
}

describe('determinePhase', () => {
  it('is off_season with no competition date', () => {
    expect(determinePhase(null, '2026-09-20')).toBe('off_season')
  })
  it('is peak inside the final two months', () => {
    expect(determinePhase('2026-11-01', '2026-09-20')).toBe('peak')
  })
  it('is build between two and four months out', () => {
    expect(determinePhase('2027-01-15', '2026-09-20')).toBe('build')
  })
  it('falls back to off_season after the competition has passed', () => {
    expect(determinePhase('2026-01-01', '2026-09-20')).toBe('off_season')
  })
})

describe('getNextWorkout', () => {
  it('prescribes a baseline practice hold when max is unknown and no history exists', () => {
    const profile = makeProfile({ baselineMaxHoldSeconds: null })
    const entry = getNextWorkout(profile, [], today)
    expect(entry.type).toBe('practice')
  })

  it('enforces rest the day immediately after a stein session', () => {
    const profile = makeProfile({ competitionDate: '2026-11-01' }) // peak
    const sessions = [makeSession({ date: '2026-09-20', type: 'practice' })]
    const entry = getNextWorkout(profile, sessions, today)
    expect(entry.type).toBe('rest')
  })

  it('alternates practice after a completed training hold once recovered', () => {
    const profile = makeProfile({ competitionDate: '2026-11-01' })
    const sessions = [
      makeSession({
        date: '2026-09-18',
        type: 'training',
        status: 'completed',
        targetAccumulatedSeconds: 600,
        accumulatedSeconds: 600,
        intervals: [{ holdSeconds: 300, restPrescribedSeconds: 60, restActualSeconds: 60 }, { holdSeconds: 300, restPrescribedSeconds: null, restActualSeconds: null }],
      }),
    ]
    const entry = getNextWorkout(profile, sessions, today)
    expect(entry.type).toBe('practice')
  })

  it('defaults off-season to strength work shortly after a practice hold', () => {
    const profile = makeProfile({ competitionDate: null })
    const sessions = [makeSession({ date: '2026-09-18', type: 'practice' })]
    const entry = getNextWorkout(profile, sessions, today)
    expect(entry.type).toBe('strength')
  })
})

describe('previewProgram', () => {
  it('returns one entry per requested day', () => {
    const profile = makeProfile()
    expect(previewProgram(profile, [], 5, today)).toHaveLength(5)
  })

  it('advances simulated state across days instead of repeating day one', () => {
    const profile = makeProfile({ baselineMaxHoldSeconds: null, competitionDate: null })
    const entries = previewProgram(profile, [], 3, today)
    expect(entries[0].type).toBe('practice')
    expect(entries[0].rationale).toContain('baseline')
    // day two already "has" a baseline from the simulated day-one hold, so it must not repeat the same prescription
    expect(entries[1].rationale).not.toContain('baseline')
  })

  it('never projects more stein sessions in a week than the phase allows', () => {
    const profile = makeProfile({ competitionDate: '2026-11-01' }) // peak, cap of 4/week
    const entries = previewProgram(profile, [], 7, today)
    const steinDays = entries.filter((e) => e.type === 'practice' || e.type === 'training').length
    expect(steinDays).toBeLessThanOrEqual(4)
  })
})
