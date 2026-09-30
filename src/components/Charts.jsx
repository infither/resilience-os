import { PORTFOLIO } from '../data/portfolio'
import { money } from '../utils/format'

const SHORT = {
  'palmetto-bay': 'Palmetto',
  'broward-pines': 'Broward',
  'coral-ridge': 'Coral',
  'westside-commons': 'Westside',
  'sunrise-landing': 'Sunrise',
  'deerfield-shores': 'Deerfield',
  'hialeah-gardens': 'Hialeah',
  'boca-terrace': 'Boca',
}

// Vertical bar chart — business-interruption exposure by property.
export function ExposureBarChart() {
  const data = [...PORTFOLIO].sort((a, b) => b.biExposure - a.biExposure)
  const max = Math.max(...data.map((d) => d.biExposure))
  const W = 560
  const H = 240
  const padL = 44
  const padB = 28
  const padT = 10
  const chartW = W - padL - 10
  const chartH = H - padB - padT
  const band = chartW / data.length
  const barW = Math.min(30, band * 0.5)

  const ticks = 4
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Business interruption exposure by property">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A5B4FC" />
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {tickVals.map((v, i) => {
        const y = padT + chartH - (v / max) * chartH
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - 10} y2={y} stroke="#EDF0F5" strokeWidth="1" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#9CA3AF">
              {money(v, { compact: true })}
            </text>
          </g>
        )
      })}

      {/* bars */}
      {data.map((d, i) => {
        const h = (d.biExposure / max) * chartH
        const x = padL + i * band + (band - barW) / 2
        const y = padT + chartH - h
        return (
          <g key={d.id}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill="url(#barGrad)" />
            <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="9" fill="#9CA3AF">
              {SHORT[d.id]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Donut — portfolio risk distribution.
export function RiskDonut() {
  const counts = { High: 0, Medium: 0, Low: 0 }
  PORTFOLIO.forEach((p) => (counts[p.riskLevel] += 1))
  const total = PORTFOLIO.length
  const segments = [
    { label: 'High Risk', value: counts.High, color: '#EF4444' },
    { label: 'Medium Risk', value: counts.Medium, color: '#F59E0B' },
    { label: 'Low Risk', value: counts.Low, color: '#10B981' },
  ]

  const size = 168
  const stroke = 26
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF0F5" strokeWidth={stroke} />
          {segments.map((s, i) => {
            const len = (s.value / total) * c
            const dash = `${len} ${c - len}`
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-ink">{total}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Properties</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-sm font-semibold text-ink">{s.value}</span>
            <span className="text-sm text-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
