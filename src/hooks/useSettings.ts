import { useCallback, useState } from 'react'
import { settingsStore } from '../storage/repository'
import type { Settings } from '../types'

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => settingsStore.get())

  const saveSettings = useCallback((s: Settings) => {
    settingsStore.save(s)
    setSettingsState(s)
  }, [])

  return { settings, saveSettings }
}
