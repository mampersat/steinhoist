import { useCallback, useState } from 'react'
import { sessionStore } from '../storage/repository'
import type { WorkoutSession } from '../types'

export function useSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => sessionStore.getAll())

  const upsertSession = useCallback((session: WorkoutSession) => {
    sessionStore.upsert(session)
    setSessions(sessionStore.getAll())
  }, [])

  const removeSession = useCallback((id: string) => {
    sessionStore.remove(id)
    setSessions(sessionStore.getAll())
  }, [])

  return { sessions, upsertSession, removeSession }
}
