interface StatProps {
  label: string
  value: string
  size?: 'lg' | 'xl'
}

export function Stat({ label, value, size = 'lg' }: StatProps) {
  return (
    <div className="flex-1 text-center">
      <div className="text-sm font-semibold text-stein-cream/55">{label}</div>
      <div
        className={`mt-1 font-bold text-stein-amber-bright ${size === 'xl' ? 'text-5xl' : 'text-4xl'}`}
      >
        {value}
      </div>
    </div>
  )
}
