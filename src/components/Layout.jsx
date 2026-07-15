import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ children, onLogout }) {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-white">
      <Sidebar onLogout={onLogout} />
      <main className="ml-64 min-h-screen bg-white">
        {/* key on pathname so each route fades in */}
        <div key={location.pathname} className="route-enter">
          {children}
        </div>
      </main>
    </div>
  )
}

// Standard page shell with centered max-width content.
export function Page({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-content px-10 py-10 ${className}`}>{children}</div>
  )
}

export function Breadcrumb({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
    >
      <span className="transition-transform group-hover:-translate-x-0.5">←</span>
      {label}
    </button>
  )
}
