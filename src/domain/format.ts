/** Formats seconds (possibly fractional) as m:ss for display. */
export function formatMMSS(totalSeconds: number): string {
  const rounded = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(rounded / 60)
  const s = rounded % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return 'past'
  if (days === 0) return 'today'
  if (days === 1) return '1 day'
  return `${days} days`
}

/** Parses a minutes/seconds pair of text-input strings into total seconds, or null if both are empty/zero. */
export function toSeconds(min: string, sec: string): number | null {
  const m = Number(min) || 0
  const s = Number(sec) || 0
  if (m === 0 && s === 0) return null
  return m * 60 + s
}

export function splitSeconds(totalSeconds: number | null): { minutes: string; seconds: string } {
  if (totalSeconds === null) return { minutes: '', seconds: '' }
  return { minutes: String(Math.floor(totalSeconds / 60)), seconds: String(Math.round(totalSeconds % 60)) }
}
