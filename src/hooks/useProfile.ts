import { useCallback, useState } from 'react'
import { profileStore } from '../storage/repository'
import type { Profile } from '../types'

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(() => profileStore.get())

  const saveProfile = useCallback((p: Profile) => {
    profileStore.save(p)
    setProfileState(p)
  }, [])

  return { profile, saveProfile }
}
