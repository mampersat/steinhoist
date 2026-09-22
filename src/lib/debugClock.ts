/**
 * Dev-only "skip to next day" tool for testing the adaptive program's day-based logic
 * (rest-day gating, weekly session caps, phase transitions) without waiting real days.
 * The offset is ignored outside dev builds, so it can never affect production.
 */
const KEY = 'steinhoist:debugDayOffsetMs'
const DAY_MS = 86_400_000

function getOffsetMs(): number {
  if (!import.meta.env.DEV) return 0
  return Number(localStorage.getItem(KEY)) || 0
}

export function debugNow(): Date {
  return new Date(Date.now() + getOffsetMs())
}

export function getDebugDayOffset(): number {
  return Math.round(getOffsetMs() / DAY_MS)
}

export function advanceDebugDay(days = 1): void {
  localStorage.setItem(KEY, String(getOffsetMs() + days * DAY_MS))
}

export function resetDebugClock(): void {
  localStorage.removeItem(KEY)
}
