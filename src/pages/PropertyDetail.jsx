import { useParams, useNavigate } from 'react-router-dom'
import { getProperty } from '../data/portfolio'
import { money, num, GAP_LABEL } from '../utils/format'
import { Page, Breadcrumb } from '../components/Layout'
import { SectionLabel, RiskPill, GapDot } from '../components/Primitives'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getProperty(id)

  if (!p) {
    return (
      <Page>
        <p className="text-muted">Property not found.</p>
      </Page>
    )
  }

  const missing = p.checklist.filter((c) => !c.complete)

  return (
    <Page>
      <Breadcrumb label="Back to Dashboard" onClick={() => navigate('/dashboard')} />

      <div className="flex items-start justify-between gap-6">
        <div>
          <SectionLabel>Risk Intelligence</SectionLabel>
          <h1 className="headline mt-3 text-3xl">{p.name}</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {p.address}, {p.city} · {num(p.units)} units · Avg rent {money(p.rent)}
          </p>
        </div>
        <RiskPill level={p.riskLevel} />
      </div>

      {/* Exposure stat row */}
      <div className="mt-7 grid grid-cols-4 gap-4">
        <Stat label="Est. Annual Loss" value={money(p.eal)} sub="Flood + wind" />
        <Stat label="BI Exposure" value={money(p.biExposure)} sub="6-month displacement" danger />
        <Stat label="Insured Value" value={money(p.insuredValue, { compact: true })} sub={`${num(p.units)} × $150K/unit`} />
        <Stat label="Monthly Rent" value={money(p.monthlyRent)} sub="Income at risk" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* Risk profile */}
        <Card title="Risk Profile">
          <Row label="Flood Zone" value={`Zone ${p.floodZone}`} hint={p.floodZone === 'AE' ? 'FEMA high-risk Special Flood Hazard Area' : 'Reduced-risk zone'} danger={p.floodZone === 'AE'} />
          <Row label="Wind Exposure" value={p.windExposure} hint={p.coastal ? `Coastal — ${p.county}` : `Inland — ${p.county}`} danger={p.windExposure === 'High'} />
          <Row label="Risk Level" value={p.riskLevel} danger={p.riskLevel === 'High'} warn={p.riskLevel === 'Medium'} />
        </Card>

        {/* Building characteristics */}
        <Card title="Building Characteristics">
          <Row label="Roof Type" value={p.roof} hint={p.roof === 'Flat' ? 'Highest wind-uplift vulnerability' : p.roof === 'Gable' ? 'Gable ends are a wind failure point' : 'Hip roof — best wind geometry'} />
          <Row label="Construction Year" value={p.built} hint={p.built < 1994 ? 'Predates post-Andrew building code' : p.built < 2002 ? 'Pre-2002 code' : 'Modern code era'} />
          <Row label="Opening Protection" value={p.protection} danger={p.protectionLevel === 'none'} warn={p.protectionLevel === 'partial'} />
        </Card>
      </div>

      {/* Documentation gap breakdown */}
      <div className="mt-6">
        <Card
          title="Documentation Gap"
          right={<GapDot gap={p.docGap} label={GAP_LABEL[p.docGap]} />}
        >
          <p className="mb-4 text-sm text-body">
            {missing.length === 0
              ? 'This property has a complete pre-loss record. A claim here can be substantiated from day one.'
              : `${missing.length} of ${p.checklist.length} records are missing. Here's what's incomplete and why your carrier will use it against you:`}
          </p>
          <ul className="space-y-3">
            {missing.map((m) => (
              <li key={m.key} className="flex gap-3">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-danger" />
                <div>
                  <div className="text-sm font-semibold text-ink">{m.label}</div>
                  <div className="text-[13px] text-muted">{m.why}</div>
                </div>
              </li>
            ))}
            {p.checklist.filter((c) => c.complete).map((m) => (
              <li key={m.key} className="flex items-center gap-3 opacity-50">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-white">
                  <CheckTiny />
                </span>
                <span className="text-sm text-body line-through">{m.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Cross-links */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <LinkCard
          title="Mitigation roadmap"
          sub={p.highPriorityCount > 0 ? `${p.highPriorityCount} high-priority actions · ${money(p.totalCapex)} capex` : 'Well-hardened — no high-priority actions'}
          onClick={() => navigate(`/mitigation/${p.id}`)}
        />
        <LinkCard
          title="Recovery readiness"
          sub={`${p.readiness}/100 readiness score`}
          onClick={() => navigate('/recovery')}
        />
      </div>
    </Page>
  )
}

function Stat({ label, value, sub, danger }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1.5 text-2xl font-extrabold" style={{ color: danger ? '#B91C1C' : '#1E3A8A' }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted">{sub}</div>
    </div>
  )
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{title}</h3>
        {right}
      </div>
      <div className="space-y-3.5">{children}</div>
    </div>
  )
}

function Row({ label, value, hint, danger, warn }) {
  const color = danger ? '#B91C1C' : warn ? '#B45309' : '#0D1B2A'
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3.5 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <div className="text-right">
        <div className="text-sm font-semibold" style={{ color }}>
          {value}
        </div>
        {hint && <div className="text-[11px] text-muted">{hint}</div>}
      </div>
    </div>
  )
}

function LinkCard({ title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl border border-border bg-white p-4 text-left transition-all hover:border-highlight/50 hover:shadow-sm"
    >
      <div>
        <div className="text-sm font-bold text-ink group-hover:text-primary">{title}</div>
        <div className="text-[13px] text-muted">{sub}</div>
      </div>
      <span className="text-highlight transition-transform group-hover:translate-x-1">→</span>
    </button>
  )
}

function CheckTiny() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 6" />
    </svg>
  )
}
