export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Whole-day difference between two ISO dates (b - a), ignoring time-of-day. */
export function daysBetween(aISO: string, bISO: string): number {
  const a = Date.UTC(...parseISO(aISO))
  const b = Date.UTC(...parseISO(bISO))
  return Math.round((b - a) / 86_400_000)
}

function parseISO(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number)
  return [y, m - 1, d]
}

/** The next occurrence (this year or next) of an annually-recurring month/day, as an ISO date. */
export function nextAnnualDate(month: number, day: number, fromISO: string = toISODate(new Date())): string {
  const year = Number(fromISO.slice(0, 4))
  const pad = (n: number) => String(n).padStart(2, '0')
  const candidate = `${year}-${pad(month)}-${pad(day)}`
  return candidate >= fromISO ? candidate : `${year + 1}-${pad(month)}-${pad(day)}`
}
