import { useNavigate } from 'react-router-dom'
import { PORTFOLIO } from '../data/portfolio'
import { money } from '../utils/format'
import { Page } from '../components/Layout'
import { SectionLabel, RiskPill, GapDot } from '../components/Primitives'
import { GAP_LABEL } from '../utils/format'

export default function Intelligence() {
  const navigate = useNavigate()
  const cards = [...PORTFOLIO].sort((a, b) => b.biExposure - a.biExposure)

  return (
    <Page>
      <SectionLabel>Risk Intelligence</SectionLabel>
      <h1 className="headline mt-3 text-3xl">Every property scored by its real disaster exposure.</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-body">
        Each building is rated on flood zone, wind exposure, and how much of its income — and its
        pre-loss record — is actually at risk. Ranked by business-interruption exposure.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-5">
        {cards.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/property/${p.id}`)}
            className="group rounded-xl border border-border bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-highlight/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-ink group-hover:text-primary">{p.name}</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {p.address}, {p.city}
                </p>
              </div>
              <RiskPill level={p.riskLevel} size="sm" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Flood Zone" value={`${p.floodZone}`} hint={p.floodZone === 'AE' ? 'High flood risk' : 'Lower flood risk'} danger={p.floodZone === 'AE'} />
              <Field label="Wind Exposure" value={p.windExposure} hint={p.coastal ? 'Coastal' : 'Inland'} danger={p.windExposure === 'High'} />
              <Field label="Est. Annual Loss" value={money(p.eal)} hint="EAL · flood + wind" />
              <Field label="BI Exposure" value={money(p.biExposure)} hint="Units × rent × 6 mo" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Documentation
              </span>
              <GapDot gap={p.docGap} label={GAP_LABEL[p.docGap]} />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-[11px] leading-relaxed text-muted">
        Risk scores derived from FEMA National Flood Hazard Layer, NOAA storm track data, NFIP
        historical claims, and Florida Building Code wind zone classifications.
      </p>
    </Page>
  )
}

function Field({ label, value, hint, danger }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-[15px] font-bold" style={{ color: danger ? '#B91C1C' : '#0D1B2A' }}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-muted">{hint}</div>}
    </div>
  )
}
