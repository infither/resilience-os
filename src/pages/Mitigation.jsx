import { useNavigate } from 'react-router-dom'
import { PORTFOLIO } from '../data/portfolio'
import { money, payback } from '../utils/format'
import { Page } from '../components/Layout'
import { SectionLabel } from '../components/Primitives'

export default function Mitigation() {
  const navigate = useNavigate()
  // Rank by ROI (10-yr value per $1 capex). Well-hardened properties sink to the bottom.
  const ranked = [...PORTFOLIO].sort((a, b) => b.roi - a.roi)
  const maxRoi = Math.max(...ranked.map((p) => p.roi))

  return (
    <Page>
      <SectionLabel>Mitigation</SectionLabel>
      <h1 className="headline mt-3 text-3xl">A hardening roadmap that earns its keep at renewal.</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-body">
        Every property ranked by return on hardening investment — highest first. Start at the top.
      </p>

      <div className="mt-8 space-y-3">
        {ranked.map((p, i) => {
          const hasWork = p.totalCapex > 0
          return (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-bold text-ink">{p.name}</h3>
                    {hasWork && p.highPriorityCount > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-danger">
                        {p.highPriorityCount} HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{p.city}</p>
                  {hasWork && (
                    <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-highlight"
                        style={{ width: `${Math.max(8, (p.roi / maxRoi) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {hasWork ? (
                  <>
                    <Metric label="Capex" value={money(p.totalCapex)} />
                    <Metric label="Annual Savings" value={money(p.totalPremiumSavings)} accent="#10B981" />
                    <Metric label="Payback" value={payback(p.payback)} />
                    <Metric label="10-yr NPV" value={money(p.totalNpv, { compact: true })} accent="#1E3A8A" />
                    <button
                      onClick={() => navigate(`/mitigation/${p.id}`)}
                      className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      View Roadmap →
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-success">
                      Well-hardened · no actions
                    </span>
                    <button
                      onClick={() => navigate(`/mitigation/${p.id}`)}
                      className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body transition-colors hover:bg-gray-50"
                    >
                      View →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Page>
  )
}

function Metric({ label, value, accent = '#0D1B2A' }) {
  return (
    <div className="hidden w-24 shrink-0 text-right lg:block">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
    </div>
  )
}
