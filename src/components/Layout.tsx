import { NavLink, Outlet } from 'react-router-dom'
import { advanceDebugDay, getDebugDayOffset, resetDebugClock } from '../lib/debugClock'

const tabs = [
  { to: '/home', label: 'Home' },
  { to: '/plan', label: 'Plan' },
  { to: '/history', label: 'History' },
  { to: '/progress', label: 'Progress' },
]

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-stein-bg text-stein-cream">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      {import.meta.env.DEV && <DebugDayBar />}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-stein-amber/30 bg-stein-surface">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 py-4 text-center text-sm font-semibold ${
                isActive ? 'text-stein-amber-bright' : 'text-stein-cream/60'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function DebugDayBar() {
  const offset = getDebugDayOffset()

  return (
    <div className="fixed bottom-16 left-0 right-0 z-10 flex items-center justify-center gap-3 bg-fuchsia-950 py-1.5 text-xs text-fuchsia-200">
      <span>DEBUG day {offset >= 0 ? `+${offset}` : offset}</span>
      <button
        type="button"
        onClick={() => {
          advanceDebugDay(1)
          window.location.reload()
        }}
        className="rounded bg-fuchsia-800 px-2 py-0.5 font-semibold"
      >
        +1 day
      </button>
      {offset !== 0 && (
        <button
          type="button"
          onClick={() => {
            resetDebugClock()
            window.location.reload()
          }}
          className="rounded bg-fuchsia-800 px-2 py-0.5 font-semibold"
        >
          Reset
        </button>
      )}
    </div>
  )
}
