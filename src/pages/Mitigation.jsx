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
      <p className="mt-4 max-w-2xl text-[15px] text-body">
        Every property ranked by return on hardening investment — highest first. Start at the top.
      </p>

      <div className="mt-8 space-y-4">
        {ranked.map((p, i) => {
          const hasWork = p.totalCapex > 0
          const accent = !hasWork ? '#10B981' : p.highPriorityCount > 0 ? '#EF4444' : '#5D5FEF'
          return (
            <div
              key={p.id}
              onClick={() => navigate(`/mitigation/${p.id}`)}
              className="group flex cursor-pointer overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardhover"
            >
              {/* accent stripe */}
              <div className="w-1.5 shrink-0" style={{ background: accent }} />

              <div className="flex flex-1 items-center gap-5 px-5 py-4">
                {/* rank */}
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-white"
                  style={{ background: accent }}
                >
                  {i + 1}
                </span>

                {/* name + roi bar */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[16px] font-extrabold text-ink group-hover:text-indigo">{p.name}</h3>
                    {hasWork && p.highPriorityCount > 0 && (
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-danger">
                        {p.highPriorityCount} HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted">{p.city}</p>
                  {hasWork && (
                    <div className="mt-2 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(8, (p.roi / maxRoi) * 100)}%`, background: accent }}
                      />
                    </div>
                  )}
                </div>

                {hasWork ? (
                  <>
                    {/* metric columns with dividers */}
                    <div className="hidden items-stretch divide-x divide-border lg:flex">
                      <Metric label="Capex" value={money(p.totalCapex)} />
                      <Metric label="Annual Savings" value={money(p.totalPremiumSavings)} accent="#059669" />
                      <Metric label="Payback" value={payback(p.payback)} />
                      <Metric label="10-yr NPV" value={money(p.totalNpv, { compact: true })} accent="#1E3A8A" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/mitigation/${p.id}`) }}
                      className="shrink-0 rounded-xl bg-indigo px-4 py-2.5 text-sm font-bold text-white shadow-pill transition-all hover:brightness-105 active:scale-[0.98]"
                    >
                      View Roadmap →
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-success">
                      Well-hardened · no actions
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/mitigation/${p.id}`) }}
                      className="shrink-0 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-body transition-colors hover:bg-canvas"
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
    <div className="w-28 px-4 text-right">
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-[15px] font-extrabold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
    </div>
  )
}
