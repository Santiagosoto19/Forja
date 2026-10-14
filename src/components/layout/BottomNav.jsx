import { NavLink } from 'react-router-dom'
import { NAV_ICONS, NAV_ITEMS } from './nav.js'

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-6">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-center text-[9px] font-semibold leading-tight tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'text-primary drop-shadow-[0_0_8px_rgb(0_240_255_/_0.85)]'
                    : 'text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {Icon ? (
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_6px_#00F0FF]' : ''}`}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                  ) : null}
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
