import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty } from '../data/portfolio'
import { money, moneyRange, payback, num } from '../utils/format'
import { Page, Breadcrumb } from '../components/Layout'
import { SectionLabel, PriorityPill } from '../components/Primitives'

const PRIORITY_ACCENT = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' }

export default function MitigationRoadmap() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getProperty(id)

  if (!p) return <Page><p className="text-muted">Property not found.</p></Page>

  return (
    <Page>
      <Breadcrumb label="Back to Mitigation" onClick={() => navigate('/mitigation')} />

      <SectionLabel>Mitigation Roadmap</SectionLabel>
      <h1 className="headline mt-3 text-3xl">{p.name}</h1>
      <p className="mt-2 text-[15px] text-muted">
        {p.address}, {p.city} · {num(p.units)} units · Built {p.built} · {p.roof} roof · Zone {p.floodZone}
      </p>

      {p.actions.length === 0 ? (
        <EmptyState p={p} />
      ) : (
        <>
          {/* At-a-glance summary first */}
          <SummaryCard p={p} />

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink">
              {p.actions.length} recommended action{p.actions.length > 1 ? 's' : ''}
            </h2>
            <span className="text-xs font-semibold text-muted">Tap a row to expand · ordered by priority</span>
          </div>

          <div className="mt-4 space-y-3">
            {p.actions.map((a, i) => (
              <ActionRow key={a.key} action={a} property={p} index={i + 1} defaultOpen={i === 0} />
            ))}
          </div>
        </>
      )}
    </Page>
  )
}

function ActionRow({ action: a, property: p, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const renewalPressure = a.priority === 'High' && (p.coastal || p.floodZone === 'AE')
  const accent = PRIORITY_ACCENT[a.priority] || '#5D5FEF'

  return (
    <div className="flex overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      {/* priority accent stripe */}
      <div className="w-1.5 shrink-0" style={{ background: accent }} />

      <div className="min-w-0 flex-1">
        {/* clickable summary row */}
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-canvas/50"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
            style={{ background: accent }}
          >
            {index}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <PriorityPill priority={a.priority} />
              {a.grantEligible && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-success">
                  GRANT ELIGIBLE
                </span>
              )}
            </div>
            <h3 className="mt-1.5 truncate text-[16px] font-extrabold leading-tight text-ink">{a.title}</h3>
          </div>

          {/* compact key stats */}
          <div className="hidden items-stretch divide-x divide-border xl:flex">
            <HeadStat label="Cost" value={moneyRange(a.costLow, a.costHigh)} />
            <HeadStat label="Saves / yr" value={money(a.annualPremiumSavings)} accent="#059669" />
            <HeadStat label="Return" value={`${a.bca.toFixed(1)}x`} accent="#5D5FEF" />
          </div>

          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-slate-400 transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          >
            <ChevronIcon />
          </span>
        </button>

        {/* expandable body */}
        {open && (
          <div className="border-t-2 border-border px-5 py-5">
            <p className="text-[14px] leading-relaxed text-body">{a.explanation}</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MetricBox label="Premium Reduction" value={a.reductionPct} sub="At next renewal" />
              <MetricBox label="Annual Savings" value={money(a.annualPremiumSavings)} sub="On this building" accent="#059669" />
              <MetricBox label="10-yr NPV" value={money(a.npv10)} sub="Net of upfront cost" accent="#1E3A8A" />
            </div>

            {/* BCA */}
            <div
              className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3.5"
              style={{
                background: a.grantEligible ? '#ECFDF5' : '#F8FAFC',
                borderColor: a.grantEligible ? '#A7F3D0' : '#E3E8F0',
              }}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: a.grantEligible ? '#047857' : '#6B7280' }}>
                  Benefit-Cost Analysis
                </div>
                <div className="mt-0.5 text-[16px] font-extrabold text-ink">
                  {a.bca.toFixed(1)}x return before a storm ever hits
                </div>
                <div className="text-[12px] text-muted">
                  {money(a.damageAvoided)} in damage avoided per project · ${a.bca.toFixed(2)} back per $1 invested
                </div>
              </div>
              {a.grantEligible && (
                <span className="shrink-0 rounded-full bg-success px-3 py-1.5 text-[11px] font-extrabold text-white">
                  FEMA GRANT ELIGIBLE
                </span>
              )}
            </div>

            {renewalPressure && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                <ClockIcon />
                <p className="text-[13px] font-semibold text-amber-800">
                  Your next renewal is in ~90 days. This action needs to start now to impact your premium —
                  underwriters credit completed work, not intentions.
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-6 border-t-2 border-border pt-5">
              <DetailBlock title="Timeline & Permitting" body={a.timeline} />
              <DetailBlock
                title="Grant Eligibility"
                body={
                  a.grantEligible
                    ? `${a.grantLabel} — est. ${money(a.grantAmount)} grant (75% federal share), ${money(a.matchAmount)} local match required.`
                    : 'Not currently eligible — benefit-cost ratio below the 1.0 federal grant threshold. Fund directly; premium savings still apply.'
                }
              />
            </div>

            <div className="mt-5 rounded-xl border border-border bg-canvas px-5 py-4">
              <div className="subhead">Contractor Guidance</div>
              <div className="mt-3 space-y-2.5 text-[13px] text-body">
                <p><span className="font-bold text-ink">Who to hire:</span> {a.contractor.type}</p>
                <p><span className="font-bold text-ink">Ask for in the bid:</span> {a.contractor.ask}</p>
                <div>
                  <span className="font-bold text-ink">Red flags:</span>
                  <ul className="mt-1.5 space-y-1.5">
                    {a.contractor.redFlags.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HeadStat({ label, value, accent = '#0D1B2A' }) {
  return (
    <div className="px-4 text-right">
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold tabular-nums" style={{ color: accent }}>{value}</div>
    </div>
  )
}

function SummaryCard({ p }) {
  return (
    <div className="mt-7 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#0D1B2A] p-7 shadow-card">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-highlight" />
        <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-highlight">
          Roadmap Summary
        </span>
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-6">
        <SumStat label="Total capex" value={money(p.totalCapex)} />
        <SumStat label="Annual premium savings" value={money(p.totalPremiumSavings)} accent="#34D399" />
        <SumStat label="Payback period" value={payback(p.payback)} />
        <SumStat label="10-year NPV" value={money(p.totalNpv)} accent="#60A5FA" />
        <SumStat label="Grant funding available" value={money(p.totalGrant)} accent="#34D399" />
        <SumStat label="Net out-of-pocket after grants" value={money(p.netOutOfPocket)} />
      </div>
    </div>
  )
}

function EmptyState({ p }) {
  return (
    <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 6" />
        </svg>
      </div>
      <h3 className="text-lg font-extrabold text-ink">This property is already well-hardened.</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-body">
        Built {p.built} with a {p.roof.toLowerCase()} roof, {p.protection.toLowerCase()}, in Flood Zone {p.floodZone}.
        No high-priority hardening actions outstanding — keep the pre-loss record current and this stays your strongest asset at renewal.
      </p>
    </div>
  )
}

function MetricBox({ label, value, sub, accent = '#0D1B2A' }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-body">{label}</div>
      <div className="mt-1 text-xl font-extrabold" style={{ color: accent }}>{value}</div>
      <div className="text-[11px] text-muted">{sub}</div>
    </div>
  )
}

function DetailBlock({ title, body }) {
  return (
    <div>
      <div className="subhead">{title}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-body">{body}</p>
    </div>
  )
}

function SumStat({ label, value, accent = '#FFFFFF' }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/55">{label}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color: accent }}>{value}</div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="mt-0.5 shrink-0 text-amber-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
