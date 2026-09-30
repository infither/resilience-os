import { useNavigate } from 'react-router-dom'
import { PORTFOLIO, PORTFOLIO_STATS, RISK_ORDER } from '../data/portfolio'
import { money, num } from '../utils/format'
import { CountUp, RiskPill } from '../components/Primitives'
import { ExposureBarChart, RiskDonut } from '../components/Charts'
import { Page } from '../components/Layout'
import { exportSummaryPDF } from '../utils/pdf'

export default function Dashboard() {
  const navigate = useNavigate()
  const rows = [...PORTFOLIO].sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel])

  return (
    <Page>
      {/* HERO — gradient banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5D5FEF] via-[#4F46E5] to-[#1E3A8A] p-8 shadow-card">
        {/* decorative rings */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -right-4 top-10 h-52 w-52 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-0.5 w-6 bg-white/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">
                Portfolio Exposure
              </span>
            </div>
            <div className="text-[64px] font-extrabold leading-none text-white">
              <CountUp value={PORTFOLIO_STATS.undocumentedExposure} format={(v) => money(v, { compact: true })} duration={1800} />
            </div>
            <p className="mt-4 text-lg font-medium leading-snug text-white">
              In business-interruption exposure across your portfolio that isn't currently documented.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              This is what you'd lose in a Cat 3 event that you cannot prove to your carrier.
            </p>
          </div>

          <button
            onClick={exportSummaryPDF}
            className="flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-indigo shadow-sm transition-all hover:brightness-95 active:scale-[0.98]"
          >
            <DownloadIcon />
            Export Summary
          </button>
        </div>
      </section>

      {/* Pastel stat cards */}
      <section className="mt-6 grid grid-cols-4 gap-5">
        <StatCard
          cardBg="#F3E8FF"
          iconBg="#A855F7"
          icon={<BuildingIcon />}
          value={<CountUp value={PORTFOLIO_STATS.totalUnits} format={(v) => num(Math.round(v))} />}
          label="Total Units"
          sub="Across 8 properties"
          subColor="#9333EA"
        />
        <StatCard
          cardBg="#FFE2E5"
          iconBg="#FA5A7D"
          icon={<DollarIcon />}
          value={<CountUp value={PORTFOLIO_STATS.monthlyRentAtRisk} format={(v) => money(v)} />}
          label="Monthly Rent at Risk"
          sub="In Flood Zone AE properties"
          subColor="#E11D48"
        />
        <StatCard
          cardBg="#FFF4DE"
          iconBg="#FF947A"
          icon={<GaugeIcon />}
          value={<><CountUp value={PORTFOLIO_STATS.readinessScore} format={(v) => num(Math.round(v))} /><span className="text-xl text-muted">/100</span></>}
          label="Portfolio Readiness"
          sub="Average pre-loss readiness"
          subColor="#EA580C"
        />
        <StatCard
          cardBg="#FFE2E5"
          iconBg="#EF4444"
          icon={<AlertIcon />}
          value={<CountUp value={PORTFOLIO_STATS.propertiesNeedingAction} format={(v) => num(Math.round(v))} />}
          label="Properties Needing Action"
          sub="Rated High Risk"
          subColor="#DC2626"
        />
      </section>

      {/* Chart row */}
      <section className="mt-6 grid grid-cols-3 gap-5">
        <Card className="col-span-2">
          <CardHeader title="Exposure by Property" subtitle="Business-interruption exposure · 6-month displacement" />
          <div className="mt-2">
            <ExposureBarChart />
          </div>
        </Card>
        <Card>
          <CardHeader title="Risk Distribution" subtitle="Across the portfolio" />
          <div className="mt-6 flex justify-center">
            <RiskDonut />
          </div>
        </Card>
      </section>

      {/* Property table */}
      <section className="mt-6">
        <Card padded={false}>
          <div className="flex items-center justify-between px-6 pb-4 pt-5">
            <CardHeader title="Portfolio" subtitle="Sorted by risk · click any property" />
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-canvas/60 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-right">Units</th>
                  <th className="px-6 py-3">Flood Zone</th>
                  <th className="px-6 py-3">Risk Level</th>
                  <th className="px-6 py-3 text-right">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-indigosoft/60"
                  >
                    <td className="px-6 py-3.5 font-bold text-ink group-hover:text-indigo">{p.name}</td>
                    <td className="px-6 py-3.5 text-body">{p.city}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-body">{p.units}</td>
                    <td className="px-6 py-3.5">
                      <FloodZoneTag zone={p.floodZone} />
                    </td>
                    <td className="px-6 py-3.5">
                      <RiskPill level={p.riskLevel} size="sm" />
                    </td>
                    <td className="px-6 py-3.5">
                      <ReadinessBar value={p.readiness} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </Page>
  )
}

/* --- shared card shells --- */
function Card({ children, className = '', padded = true }) {
  return (
    <div className={`rounded-2xl border border-border bg-white shadow-card ${padded ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
function CardHeader({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-base font-extrabold text-ink">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
    </div>
  )
}

function StatCard({ cardBg, iconBg, icon, value, label, sub, subColor }) {
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

function FloodZoneTag({ zone }) {
  const ae = zone === 'AE'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={ae ? { background: '#FEE2E2', color: '#B91C1C' } : { background: '#F1F5F9', color: '#475569' }}
    >
      Zone {zone}
    </span>
  )
}

function ReadinessBar({ value }) {
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-9 text-right text-xs font-bold tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
  )
}

/* --- icons --- */
function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-4h4v4" />
    </svg>
  )
}
function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function GaugeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14l3-3" />
      <path d="M3.5 18a9 9 0 1 1 17 0" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}
