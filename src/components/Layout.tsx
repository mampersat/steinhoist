import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/home', label: 'Home' },
  { to: '/history', label: 'History' },
  { to: '/progress', label: 'Progress' },
]

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-stein-bg text-stein-cream">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
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
