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
