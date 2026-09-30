import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const TITLES = [
  { match: (p) => p === '/dashboard', title: 'Dashboard' },
  { match: (p) => p.startsWith('/intelligence') || p.startsWith('/property'), title: 'Risk Intelligence' },
  { match: (p) => p.startsWith('/mitigation'), title: 'Mitigation' },
  { match: (p) => p.startsWith('/recovery'), title: 'Recovery' },
]

function titleFor(pathname) {
  return TITLES.find((t) => t.match(pathname))?.title || 'Dashboard'
}

export default function Layout({ children, onLogout }) {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar onLogout={onLogout} />
      <main className="ml-64 min-h-screen bg-canvas">
        <Topbar title={titleFor(location.pathname)} />
        {/* key on pathname so each route fades in */}
        <div key={location.pathname} className="route-enter">
          {children}
        </div>
      </main>
    </div>
  )
}

function Topbar({ title }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-6 border-b border-border bg-canvas/80 px-10 py-5 backdrop-blur">
      <h1 className="shrink-0 text-2xl font-extrabold tracking-tight text-ink">{title}</h1>

      {/* Search */}
      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search properties, actions…"
          className="w-full rounded-full border border-border bg-white py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-indigo/40 focus:ring-2 focus:ring-indigo/15"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Region pill */}
        <div className="hidden items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-body lg:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
          South Florida
        </div>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-slate-500 transition-colors hover:text-indigo">
          <BellIcon />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-danger" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-white py-1.5 pl-1.5 pr-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo text-xs font-bold text-white">
            IC
          </span>
          <div className="hidden leading-tight sm:block">
            <div className="text-[13px] font-bold text-ink">Infither Chowdhury</div>
            <div className="text-[11px] text-muted">Founder</div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Standard page shell with centered max-width content.
export function Page({ children, className = '' }) {
  return <div className={`mx-auto max-w-content px-10 py-8 ${className}`}>{children}</div>
}

export function Breadcrumb({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-indigo"
    >
      <span className="transition-transform group-hover:-translate-x-0.5">←</span>
      {label}
    </button>
  )
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}
