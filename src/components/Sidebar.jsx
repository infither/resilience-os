import { NavLink, useNavigate } from 'react-router-dom'
import { Shield } from './Primitives'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/intelligence', label: 'Intelligence', icon: RadarIcon, layer: 'Layer 1' },
  { to: '/mitigation', label: 'Mitigation', icon: WrenchIcon, layer: 'Layer 2' },
  { to: '/recovery', label: 'Recovery', icon: LifebuoyIcon, layer: 'Layer 3' },
]

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate()
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col bg-navy text-white">
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2.5 px-6 pb-6 pt-7 text-left"
      >
        <Shield size={30} />
        <div>
          <div className="text-[17px] font-extrabold leading-none tracking-tight">
            Resilience<span className="text-highlight">OS</span>
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
            Protect what matters
          </div>
        </div>
      </button>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, layer }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/55 hover:bg-white/5 hover:text-white/90'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                    isActive ? 'bg-highlight/20 text-highlight' : 'text-white/50 group-hover:text-white/80'
                  }`}
                >
                  <Icon />
                </span>
                <span className="flex flex-col">
                  {layer && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
                      {layer}
                    </span>
                  )}
                  <span>{label}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sample badge */}
      <div className="mx-4 mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-white/55">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-highlight" />
          Sample South Florida Portfolio
        </div>
      </div>

      {/* User */}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-highlight/20 text-sm font-bold text-highlight">
            IC
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-white">Infither Chowdhury</div>
            <div className="text-[11px] text-white/45">Founder</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          className="rounded-md p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogoutIcon />
        </button>
      </div>
    </aside>
  )
}

/* --- icons --- */
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function RadarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l6-4" strokeLinecap="round" />
    </svg>
  )
}
function WrenchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
    </svg>
  )
}
function LifebuoyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M5 5l3.5 3.5M19 5l-3.5 3.5M5 19l3.5-3.5M19 19l-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
