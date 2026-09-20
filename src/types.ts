export type DominantArm = 'left' | 'right'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'competitive'

export interface Profile {
  id: string
  dominantArm: DominantArm
  experienceLevel: ExperienceLevel
  hasCompetitionStein: boolean
  /** ISO date (yyyy-mm-dd), or null if unknown/not set */
  competitionDate: string | null
  /** seconds, or null if the athlete doesn't know their max yet */
  baselineMaxHoldSeconds: number | null
  /** seconds, or null if no explicit goal */
  targetHoldSeconds: number | null
  createdAt: string
}

export type WorkoutType = 'practice' | 'training' | 'competition' | 'strength' | 'rest'

export interface Interval {
  holdSeconds: number
  /** planned rest after this interval; null on the interval that finished the workout */
  restPrescribedSeconds: number | null
  /** actual rest taken; null if the workout ended before this rest completed */
  restActualSeconds: number | null
}

export type SessionStatus = 'completed' | 'abandoned' | 'in_progress'

export interface WorkoutSession {
  id: string
  type: WorkoutType
  /** ISO date (yyyy-mm-dd) */
  date: string
  /** ISO timestamp, for ordering same-day sessions and resume logic */
  startedAt: string
  status: SessionStatus

  // Practice Hold / Competition
  singleHoldSeconds?: number

  // Training Hold
  targetAccumulatedSeconds?: number
  intervals?: Interval[]
  accumulatedSeconds?: number

  /** PR at the moment this session started, so history views don't need to recompute against a moving target */
  prAtTimeOfSession: number | null
  notes?: string
}

export interface ProgramEntry {
  date: string
  type: WorkoutType
  suggestedTargetSeconds?: number
  suggestedRestSeconds?: number
  rationale: string
}

export interface Settings {
  audioCuesEnabled: boolean
  voiceCuesEnabled: boolean
  restIntervalOverrideSeconds: number | null
}
