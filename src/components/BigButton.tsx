import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'danger' | 'neutral'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-stein-amber text-stein-bg active:bg-stein-amber-bright',
  danger: 'bg-stein-red text-stein-cream active:bg-red-500',
  neutral: 'bg-stein-surface text-stein-cream border border-stein-amber/40 active:bg-stein-surface/70',
}

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

/** A tap target enormous enough to hit reliably one-handed, exhausted, from arm's length. */
export function BigButton({ variant = 'primary', className = '', children, ...rest }: BigButtonProps) {
  return (
    <button
      className={`no-select w-full rounded-2xl py-8 text-3xl font-bold uppercase tracking-wide shadow-lg transition-colors active:scale-[0.98] ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
