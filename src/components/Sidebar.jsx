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
    <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col border-r border-border bg-white">
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 px-6 pb-7 pt-7 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo shadow-pill">
          <Shield size={22} color="#FFFFFF" />
        </span>
        <div className="text-[19px] font-extrabold leading-none tracking-tight text-ink">
          Resilience<span className="text-indigo">OS</span>
        </div>
      </button>

      {/* Nav */}
      <nav className="mt-1 flex-1 space-y-1.5 px-4">
        {NAV.map(({ to, label, icon: Icon, layer }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo text-white shadow-pill'
                  : 'text-muted hover:bg-indigosoft hover:text-indigo'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo'}>
                  <Icon />
                </span>
                <span className="flex flex-col">
                  {layer && (
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${
                        isActive ? 'text-white/70' : 'text-slate-300 group-hover:text-indigo/60'
                      }`}
                    >
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
      <div className="mx-4 mb-4 rounded-xl border border-border bg-canvas px-3.5 py-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo" />
          Sample South Florida Portfolio
        </div>
      </div>

      {/* User */}
      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigosoft text-sm font-bold text-indigo">
            IC
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-bold text-ink">Infither Chowdhury</div>
            <div className="text-[11px] text-muted">Founder</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-canvas hover:text-danger"
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  )
}
function RadarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l6-4" strokeLinecap="round" />
    </svg>
  )
}
function WrenchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
    </svg>
  )
}
function LifebuoyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
