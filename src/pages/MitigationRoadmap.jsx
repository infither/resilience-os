import { useParams, useNavigate } from 'react-router-dom'
import { getProperty } from '../data/portfolio'
import { money, moneyRange, payback, num } from '../utils/format'
import { Page, Breadcrumb } from '../components/Layout'
import { SectionLabel, PriorityPill } from '../components/Primitives'

export default function MitigationRoadmap() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = getProperty(id)

  if (!p) return <Page><p className="text-muted">Property not found.</p></Page>

  return (
    <Page>
      <Breadcrumb label="Back to Mitigation" onClick={() => navigate('/mitigation')} />

      <SectionLabel>Mitigation</SectionLabel>
      <h1 className="headline mt-3 text-3xl">{p.name}</h1>
      <p className="mt-1.5 text-[15px] text-muted">
        {p.address}, {p.city} · {num(p.units)} units · Built {p.built} · {p.roof} roof · Zone {p.floodZone}
      </p>

      {p.actions.length === 0 ? (
        <EmptyState p={p} />
      ) : (
        <>
          <div className="mt-8 space-y-5">
            {p.actions.map((a) => (
              <ActionCard key={a.key} action={a} property={p} />
            ))}
          </div>
          <SummaryCard p={p} />
        </>
      )}
    </Page>
  )
}

function ActionCard({ action: a, property: p }) {
  // Renewal pressure applies to high-priority hardening on coastal / flood-zone buildings.
  const renewalPressure = a.priority === 'High' && (p.coastal || p.floodZone === 'AE')
  const bcaStr = `${a.bca.toFixed(1)}:1`

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* header */}
      <div className="flex items-start justify-between gap-4 border-b border-border bg-gray-50/60 px-5 py-4">
        <div>
          <PriorityPill priority={a.priority} />
          <h3 className="mt-2 text-[17px] font-bold text-ink">{a.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Cost range</div>
          <div className="text-lg font-extrabold text-ink">{moneyRange(a.costLow, a.costHigh)}</div>
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-[14px] leading-relaxed text-body">{a.explanation}</p>

        {/* financial grid */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <MetricBox label="Premium Reduction" value={a.reductionPct} sub="At next renewal" />
          <MetricBox label="Annual Savings" value={money(a.annualPremiumSavings)} sub="On this building" accent="#10B981" />
          <MetricBox label="10-yr NPV" value={money(a.npv10)} sub="Net of upfront cost" accent="#1E3A8A" />
        </div>

        {/* BCA callout */}
        <div
          className="mt-4 flex items-center justify-between rounded-lg border px-4 py-3"
          style={{
            background: a.grantEligible ? '#ECFDF5' : '#F9FAFB',
            borderColor: a.grantEligible ? '#A7F3D0' : '#E5E7EB',
          }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: a.grantEligible ? '#047857' : '#6B7280' }}>
              Benefit-Cost Analysis
            </div>
            <div className="mt-0.5 text-[15px] font-bold text-ink">
              {bcaStr} — {a.bca.toFixed(1)}x return before a storm ever hits
            </div>
            <div className="text-[12px] text-muted">
              {money(a.damageAvoided)} in damage avoided per project · ${a.bca.toFixed(2)} per $1 invested
            </div>
          </div>
          {a.grantEligible && (
            <span className="shrink-0 rounded-full bg-success px-3 py-1 text-[11px] font-bold text-white">
              FEMA GRANT ELIGIBLE
            </span>
          )}
        </div>

        {/* renewal pressure */}
        {renewalPressure && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <ClockIcon />
            <p className="text-[13px] font-medium text-amber-800">
              Your next renewal is in ~90 days. This action needs to start now to impact your premium —
              underwriters credit completed work, not intentions.
            </p>
          </div>
        )}

        {/* detail rows */}
        <div className="mt-5 grid grid-cols-2 gap-5">
          <DetailBlock title="Timeline & permitting" body={a.timeline} />
          <DetailBlock
            title="Grant eligibility"
            body={
              a.grantEligible
                ? `${a.grantLabel} — est. ${money(a.grantAmount)} grant (75% federal share), ${money(a.matchAmount)} local match required.`
                : 'Not currently eligible — benefit-cost ratio below the 1.0 federal grant threshold. Fund directly; premium savings still apply.'
            }
          />
        </div>

        {/* contractor guidance */}
        <div className="mt-5 rounded-lg bg-gray-50 px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">Contractor guidance</div>
          <div className="mt-2 space-y-2 text-[13px] text-body">
            <p><span className="font-semibold text-ink">Who to hire:</span> {a.contractor.type}</p>
            <p><span className="font-semibold text-ink">Ask for in the bid:</span> {a.contractor.ask}</p>
            <div>
              <span className="font-semibold text-ink">Red flags:</span>
              <ul className="mt-1 space-y-1">
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
    </div>
  )
}

function SummaryCard({ p }) {
  return (
    <div className="mt-7 rounded-xl bg-navy p-6 text-white">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-0.5 w-6 bg-highlight" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-highlight">
          Mitigation Summary
        </span>
      </div>
      <div className="grid grid-cols-3 gap-6">
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
    <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 6" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-ink">This property is already well-hardened.</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-body">
        Built {p.built} with a {p.roof.toLowerCase()} roof, {p.protection.toLowerCase()}, in Flood Zone {p.floodZone}.
        No high-priority hardening actions outstanding — keep the pre-loss record current and this stays your strongest asset at renewal.
      </p>
    </div>
  )
}

function MetricBox({ label, value, sub, accent = '#0D1B2A' }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-extrabold" style={{ color: accent }}>{value}</div>
      <div className="text-[11px] text-muted">{sub}</div>
    </div>
  )
}

function DetailBlock({ title, body }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">{title}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-body">{body}</p>
    </div>
  )
}

function SumStat({ label, value, accent = '#FFFFFF' }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color: accent }}>{value}</div>
    </div>
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
