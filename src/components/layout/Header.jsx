import { NavLink } from 'react-router-dom'
import { NAV_ICONS, NAV_ITEMS } from './nav.js'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-surface/90 backdrop-blur-xl md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-lg font-bold text-title">Forja</p>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-[0_0_16px_rgb(0_240_255_/_0.18)]'
                      : 'text-secondary hover:bg-surface-2 hover:text-title'
                  }`
                }
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
