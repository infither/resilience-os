import { useNavigate } from 'react-router-dom'
import { PORTFOLIO, PORTFOLIO_STATS, RISK_ORDER } from '../data/portfolio'
import { money, num } from '../utils/format'
import { CountUp, RiskPill } from '../components/Primitives'
import { exportSummaryPDF } from '../utils/pdf'

export default function Dashboard() {
  const navigate = useNavigate()
  const rows = [...PORTFOLIO].sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel])

  return (
    <div>
      {/* HERO — dark navy */}
      <section className="bg-navy">
        <div className="mx-auto max-w-content px-10 py-12">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-0.5 w-6 bg-highlight" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-highlight">
                  Portfolio Exposure
                </span>
              </div>
              <div className="text-[64px] font-extrabold leading-none text-highlight">
                <CountUp value={PORTFOLIO_STATS.undocumentedExposure} format={(v) => money(v, { compact: true })} duration={1800} />
              </div>
              <p className="mt-4 text-lg font-medium leading-snug text-white">
                In business-interruption exposure across your portfolio that isn't currently documented.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                This is what you'd lose in a Cat 3 event that you cannot prove to your carrier.
              </p>
            </div>

            <button
              onClick={exportSummaryPDF}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.12] active:scale-[0.98]"
            >
              <DownloadIcon />
              Export Summary
            </button>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="mx-auto max-w-content px-10 py-8">
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Total Units" value={<CountUp value={PORTFOLIO_STATS.totalUnits} format={(v) => num(Math.round(v))} />} sub="Across 8 properties" />
          <KpiCard
            label="Monthly Rent at Risk"
            value={<CountUp value={PORTFOLIO_STATS.monthlyRentAtRisk} format={(v) => money(v)} />}
            sub="In Flood Zone AE properties"
            accent="#EF4444"
          />
          <KpiCard
            label="Portfolio Readiness"
            value={<><CountUp value={PORTFOLIO_STATS.readinessScore} format={(v) => num(Math.round(v))} /><span className="text-2xl text-muted">/100</span></>}
            sub="Average pre-loss readiness"
            accent="#F59E0B"
          />
          <KpiCard
            label="Properties Needing Action"
            value={<CountUp value={PORTFOLIO_STATS.propertiesNeedingAction} format={(v) => num(Math.round(v))} />}
            sub="Rated High Risk"
            accent="#EF4444"
          />
        </div>
      </section>

      {/* Property table */}
      <section className="mx-auto max-w-content px-10 pb-16">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Portfolio</h2>
          <span className="text-xs text-muted">Sorted by risk · click any property</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Property</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-right">Units</th>
                <th className="px-5 py-3">Flood Zone</th>
                <th className="px-5 py-3">Risk Level</th>
                <th className="px-5 py-3 text-right">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-blue-50/40"
                >
                  <td className="px-5 py-3.5 font-semibold text-ink group-hover:text-primary">{p.name}</td>
                  <td className="px-5 py-3.5 text-body">{p.city}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-body">{p.units}</td>
                  <td className="px-5 py-3.5">
                    <FloodZoneTag zone={p.floodZone} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskPill level={p.riskLevel} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <ReadinessBar value={p.readiness} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function KpiCard({ label, value, sub, accent = '#1E3A8A' }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-3xl font-extrabold leading-none" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-2 text-xs text-muted">{sub}</div>
    </div>
  )
}

function FloodZoneTag({ zone }) {
  const ae = zone === 'AE'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
      style={ae ? { background: '#FEE2E2', color: '#B91C1C' } : { background: '#F3F4F6', color: '#374151' }}
    >
      Zone {zone}
    </span>
  )
}

function ReadinessBar({ value }) {
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}
