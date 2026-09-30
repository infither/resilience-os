import { useEffect, useRef, useState } from 'react'
import { RISK_COLORS } from '../utils/format'

// Section label with the 24px rule above it.
export function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>
}

// Pastel stat card with a colored icon tile — the shared dashboard/summary format.
export function StatCard({ cardBg, iconBg, icon, value, label, sub, subColor }) {
  return (
    <div
      className="rounded-2xl p-5 shadow-card transition-transform hover:-translate-y-0.5"
      style={{ background: cardBg }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ background: iconBg }}
      >
        {icon}
      </span>
      <div className="mt-4 text-[28px] font-extrabold leading-none text-ink">{value}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{label}</div>
      <div className="mt-0.5 text-[11px] font-medium" style={{ color: subColor }}>
        {sub}
      </div>
    </div>
  )
}

// Color-coded risk pill.
export function RiskPill({ level, size = 'md' }) {
  const c = RISK_COLORS[level] || RISK_COLORS.Medium
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{ background: c.bg, color: c.text }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: c.dot }}
      />
      {level} Risk
    </span>
  )
}

// Priority pill for mitigation actions.
export function PriorityPill({ priority }) {
  const map = {
    High: { bg: '#FEE2E2', text: '#B91C1C' },
    Medium: { bg: '#FEF3C7', text: '#B45309' },
    Low: { bg: '#E5E7EB', text: '#374151' },
  }
  const c = map[priority] || map.Medium
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: c.bg, color: c.text }}
    >
      {priority} priority
    </span>
  )
}

// Generic status pill for recovery workflow.
export function StatusPill({ status }) {
  const map = {
    'Not Started': { bg: '#F3F4F6', text: '#6B7280' },
    'In Progress': { bg: '#DBEAFE', text: '#1D4ED8' },
    Complete: { bg: '#D1FAE5', text: '#047857' },
  }
  const c = map[status] || map['Not Started']
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {status}
    </span>
  )
}

// Animated count-up number. Respects the demo "first load" feel.
export function CountUp({ value, prefix = '', suffix = '', duration = 1400, decimals = 0, format }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef()

  useEffect(() => {
    let cancelled = false
    const start = performance.now()
    const animate = (now) => {
      if (cancelled) return
      const t = Math.min((now - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf.current = requestAnimationFrame(animate)
      else setDisplay(value)
    }
    raf.current = requestAnimationFrame(animate)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  const shown = format
    ? format(display)
    : `${prefix}${Number(display).toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}${suffix}`

  return <span>{shown}</span>
}

// Circular progress ring (readiness score).
export function CircularProgress({ value, size = 120, stroke = 10, label = 'Readiness' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(circ - (value / 100) * circ))
    return () => cancelAnimationFrame(id)
  }, [value, circ])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink">{value}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      </div>
    </div>
  )
}

// Documentation gap traffic light dot.
export function GapDot({ gap, label }) {
  const colors = { red: '#EF4444', yellow: '#F59E0B', green: '#10B981' }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: colors[gap] }} />
      {label && <span className="text-sm text-body">{label}</span>}
    </span>
  )
}

// Shield logo mark.
export function Shield({ size = 28, color = '#3B82F6' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z"
        fill={color}
        opacity="0.18"
      />
      <path
        d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 11.5l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
