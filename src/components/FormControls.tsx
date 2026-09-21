import type { ReactNode } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-semibold text-stein-cream/70">{label}</div>
      {children}
    </div>
  )
}

export function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold ${
            value === opt.value
              ? 'bg-stein-amber text-stein-bg'
              : 'bg-stein-surface text-stein-cream/80 border border-stein-amber/30'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function MinSecInput({
  minutes,
  seconds,
  onMinutes,
  onSeconds,
}: {
  minutes: string
  seconds: string
  onMinutes: (v: string) => void
  onSeconds: (v: string) => void
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="min"
        value={minutes}
        onChange={(e) => onMinutes(e.target.value)}
        className="w-20 rounded-lg bg-stein-surface px-3 py-3 text-center text-stein-cream outline-none"
      />
      <span className="text-stein-cream/60">:</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={59}
        placeholder="sec"
        value={seconds}
        onChange={(e) => onSeconds(e.target.value)}
        className="w-20 rounded-lg bg-stein-surface px-3 py-3 text-center text-stein-cream outline-none"
      />
    </div>
  )
}
