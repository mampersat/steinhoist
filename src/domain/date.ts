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
