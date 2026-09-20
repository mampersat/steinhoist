import type { Profile, Settings, WorkoutSession } from '../types'

const KEYS = {
  profile: 'steinhoist:profile',
  sessions: 'steinhoist:sessions',
  settings: 'steinhoist:settings',
  trainingRuntime: 'steinhoist:trainingRuntime',
} as const

function read<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const profileStore = {
  get(): Profile | null {
    return read<Profile>(KEYS.profile)
  },
  save(profile: Profile): void {
    write(KEYS.profile, profile)
  },
  clear(): void {
    localStorage.removeItem(KEYS.profile)
  },
}

export const sessionStore = {
  getAll(): WorkoutSession[] {
    return read<WorkoutSession[]>(KEYS.sessions) ?? []
  },
  /** The single in-progress session, if one exists (there should only ever be at most one). */
  getInProgress(): WorkoutSession | null {
    return this.getAll().find((s) => s.status === 'in_progress') ?? null
  },
  upsert(session: WorkoutSession): void {
    const all = this.getAll()
    const idx = all.findIndex((s) => s.id === session.id)
    if (idx >= 0) {
      all[idx] = session
    } else {
      all.push(session)
    }
    write(KEYS.sessions, all)
  },
  remove(id: string): void {
    write(KEYS.sessions, this.getAll().filter((s) => s.id !== id))
  },
}

const defaultSettings: Settings = {
  audioCuesEnabled: true,
  voiceCuesEnabled: true,
  restIntervalOverrideSeconds: null,
}

export const settingsStore = {
  get(): Settings {
    return read<Settings>(KEYS.settings) ?? defaultSettings
  },
  save(settings: Settings): void {
    write(KEYS.settings, settings)
  },
}

/**
 * Ephemeral, resume-only bookkeeping for an in-progress Training Hold. NOT part of
 * WorkoutSession history - it exists purely so a reload/crash mid-hold or mid-rest
 * can be reconstructed, and is cleared as soon as the workout completes or is abandoned.
 */
export interface TrainingRuntime {
  sessionId: string
  phase: 'holding' | 'resting'
  restPrescribedSeconds: number
  holdStartedAt: number | null
  restStartedAt: number | null
}

export const trainingRuntimeStore = {
  get(): TrainingRuntime | null {
    return read<TrainingRuntime>(KEYS.trainingRuntime)
  },
  save(runtime: TrainingRuntime): void {
    write(KEYS.trainingRuntime, runtime)
  },
  clear(): void {
    localStorage.removeItem(KEYS.trainingRuntime)
  },
}
