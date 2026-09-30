import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import { PORTFOLIO, getProperty } from '../data/portfolio'
import {
  SCENARIOS,
  VAULT_CATEGORIES,
  INSURANCE_DOCS,
  INSURANCE_DOC_REASONS,
  initialVault,
  presentCategories,
  computeFinancials,
  portfolioTotals,
  grantPrograms,
  loanPrograms,
} from '../data/financial'
import { money, num } from '../utils/format'
import { StatCard } from '../components/Primitives'

const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function FinancialRecovery() {
  const navigate = useNavigate()
  const [scenario, setScenario] = useState('cat3')
  const [selectedId, setSelectedId] = useState('westside-commons')
  const [subtab, setSubtab] = useState('insurance')
  const [vault, setVault] = useState(initialVault)

  const p = getProperty(selectedId)
  const files = vault[selectedId] || []
  const fin = useMemo(() => computeFinancials(p, scenario, files), [p, scenario, files])
  const totals = useMemo(() => portfolioTotals(scenario, vault), [scenario, vault])

  const addFiles = (fileList, category) => {
    const added = Array.from(fileList).map((f) => ({ name: f.name, category, date: today }))
    if (!added.length) return
    setVault((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), ...added] }))
  }

  return (
    <div>
      {/* Scenario toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-border bg-white p-1">
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.key}
              onClick={() => setScenario(s.key)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                scenario === s.key ? 'bg-indigo text-white shadow-pill' : 'text-muted hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-muted">
          Storm scenario · {SCENARIOS[scenario].damage * 100}% structure damage · {SCENARIOS[scenario].months}-mo displacement
        </span>
      </div>

      {/* Portfolio KPIs */}
      <div className="mt-5 grid grid-cols-4 gap-5">
        <StatCard cardBg="#F3E8FF" iconBg="#A855F7" icon={<StormIcon />} value={money(totals.grossLoss, { compact: true })} label="Gross Loss" sub="Portfolio · this scenario" subColor="#9333EA" />
        <StatCard cardBg="#DCFCE7" iconBg="#22C55E" icon={<ShieldIcon />} value={money(totals.insuranceRecovery, { compact: true })} label="Insurance Recovery" sub="What carriers pay" subColor="#16A34A" />
        <StatCard cardBg="#EEF0FF" iconBg="#5D5FEF" icon={<BankIcon />} value={money(totals.fundingAvailable, { compact: true })} label="Funding Available" sub="Loans + grants applied" subColor="#4F46E5" />
        <StatCard cardBg="#FFE2E5" iconBg="#EF4444" icon={<GapIcon />} value={money(totals.unfundedGap, { compact: true })} label="Unfunded Gap" sub="Out of your pocket" subColor="#DC2626" />
      </div>

      {/* Order of money */}
      <div className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="subhead mr-2">Order of Money</span>
          <OrderStep n="1" label="Insurance" color="#10B981" />
          <Arrow />
          <OrderStep n="2" label="Loans" color="#3B82F6" />
          <Arrow />
          <OrderStep n="3" label="Grants" color="#A855F7" />
        </div>
        <p className="mt-3 text-[13px] text-body">
          Insurance proceeds reduce what loans and grants will cover, so sequence matters.
        </p>
      </div>

      {/* Property selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {PORTFOLIO.map((prop) => {
          const active = prop.id === selectedId
          return (
            <button
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-bold transition-all ${
                active ? 'border-indigo bg-indigo text-white shadow-pill' : 'border-border bg-white text-body hover:border-indigo/40'
              }`}
            >
              {prop.name}
            </button>
          )
        })}
      </div>

      {/* Selected property header */}
      <div className="mt-5 flex items-baseline justify-between">
        <h2 className="text-2xl font-extrabold text-ink">{p.name}</h2>
        <span className="text-[13px] text-muted">{p.address}, {p.city} · {num(p.units)} units · Zone {p.floodZone}</span>
      </div>

      {/* Vault */}
      <Vault files={files} present={presentCategories(files)} onAdd={addFiles} />

      {/* Sub-tabs */}
      <div className="mt-6 inline-flex rounded-xl border border-border bg-white p-1">
        {[
          ['insurance', 'Insurance'],
          ['grants', 'Government Grants'],
          ['loans', 'Loans'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSubtab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              subtab === key ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {subtab === 'insurance' && <InsuranceTab p={p} fin={fin} files={files} present={presentCategories(files)} />}
        {subtab === 'grants' && <ProgramList programs={grantPrograms(p, fin)} present={presentCategories(files)} type="grant" />}
        {subtab === 'loans' && <ProgramList programs={loanPrograms(p, fin)} present={presentCategories(files)} type="loan" />}
      </div>

      {/* Waterfall */}
      <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-card">
        <div className="subhead mb-1">Recovery Waterfall</div>
        <p className="mb-4 text-xs text-muted">How {p.name}'s {SCENARIOS[scenario].label} loss gets funded</p>
        <Waterfall fin={fin} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-[13px] text-body">
            {fin.unfundedGap > 0 ? (
              <>Hardening cuts this gap: <span className="font-bold text-ink">impact windows + roof-deck retrofit reduce the modeled loss ~40%.</span></>
            ) : (
              <>This property is fully funded at {SCENARIOS[scenario].label}. Hardening keeps it that way at Cat 4.</>
            )}
          </p>
          <button
            onClick={() => navigate(`/mitigation/${p.id}`)}
            className="shrink-0 rounded-xl bg-indigo px-4 py-2.5 text-sm font-bold text-white shadow-pill transition-all hover:brightness-105"
          >
            See what closes this gap →
          </button>
        </div>
      </div>

      <p className="mt-5 text-[11px] text-muted">
        Illustrative estimates. Not a claim, coverage, or eligibility determination.
      </p>
    </div>
  )
}

/* ------------------------------- Vault ------------------------------- */
function Vault({ files, present, onAdd }) {
  const inputRef = useRef(null)
  const [cat, setCat] = useState('Photos')
  const [drag, setDrag] = useState(false)

  return (
    <div className="mt-5 rounded-2xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="subhead">Document Vault</div>
        <span className="text-xs font-semibold text-muted">{files.length} file{files.length !== 1 ? 's' : ''} · upload once, used across all three tracks</span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_260px] gap-5">
        {/* dropzone */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold text-body">Category:</span>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-[13px] font-semibold text-ink outline-none focus:border-indigo/40"
            >
              {VAULT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onAdd(e.dataTransfer.files, cat) }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
              drag ? 'border-indigo bg-indigosoft' : 'border-border bg-canvas hover:border-indigo/50'
            }`}
          >
            <UploadIcon />
            <p className="mt-2 text-sm font-bold text-ink">Drag & drop, or click to upload</p>
            <p className="text-[12px] text-muted">Documents & photos · tagged as “{cat}” · stored in this session only</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { onAdd(e.target.files, cat); e.target.value = '' }}
            />
          </div>
        </div>

        {/* category status */}
        <div className="rounded-xl border border-border bg-canvas p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-body">Categories on file</div>
          <div className="mt-2.5 space-y-1.5">
            {VAULT_CATEGORIES.filter((c) => c !== 'Other').map((c) => (
              <div key={c} className="flex items-center gap-2 text-[12px]">
                {present.has(c) ? <DotCheck /> : <DotMiss />}
                <span className={present.has(c) ? 'font-semibold text-ink' : 'text-muted'}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* file list */}
      {files.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-canvas/70 text-left text-[10px] font-bold uppercase tracking-wide text-muted">
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2 text-right">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-semibold text-ink">{f.name}</td>
                  <td className="px-4 py-2"><span className="rounded-full bg-indigosoft px-2 py-0.5 text-[11px] font-bold text-indigo">{f.category}</span></td>
                  <td className="px-4 py-2 text-right text-muted">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Insurance tab ---------------------------- */
function InsuranceTab({ p, fin, files, present }) {
  const missing = INSURANCE_DOCS.filter((d) => !present.has(d))
  const claimSteps = ['Notice Filed', 'Documented', 'Submitted', 'Under Review', 'Settled']
  const cr = fin.claimReadiness
  const claimIdx = cr < 20 ? 0 : cr < 40 ? 1 : cr < 60 ? 2 : cr < 85 ? 3 : 4

  return (
    <div className="space-y-5">
      {/* claim timeline */}
      <Card>
        <div className="subhead mb-4">Claim Timeline</div>
        <StatusBar steps={claimSteps} current={claimIdx} />
      </Card>

      <div className="grid grid-cols-2 gap-5">
        {/* claim readiness */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="subhead">Claim Readiness</div>
            <span className="text-2xl font-extrabold" style={{ color: cr >= 75 ? '#10B981' : cr >= 50 ? '#F59E0B' : '#EF4444' }}>{cr}/100</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${cr}%`, background: cr >= 75 ? '#10B981' : cr >= 50 ? '#F59E0B' : '#EF4444' }} />
          </div>
          {missing.length === 0 ? (
            <p className="mt-4 text-sm text-body">Complete record — this claim can be substantiated from day one.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {missing.map((m) => (
                <li key={m} className="flex gap-2.5">
                  <DotMiss />
                  <div>
                    <div className="text-[13px] font-bold text-ink">{m}</div>
                    <div className="text-[12px] text-muted">{INSURANCE_DOC_REASONS[m]}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => exportAdjusterPackage(p, fin, files)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo px-4 py-2.5 text-sm font-bold text-white shadow-pill transition-all hover:brightness-105"
          >
            <DownloadIcon /> Export Adjuster Package
          </button>
        </Card>

        <div className="space-y-5">
          {/* BI calculator */}
          <Card>
            <div className="subhead mb-3">Business Interruption</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-canvas px-4 py-3 text-sm">
              <span className="font-bold text-ink">{num(p.units)} units</span><span className="text-muted">×</span>
              <span className="font-bold text-ink">{money(p.rent)}/mo</span><span className="text-muted">×</span>
              <span className="font-bold text-ink">{fin.scenario.months} mo</span><span className="text-muted">=</span>
              <span className="text-lg font-extrabold text-indigo">{money(fin.bi)}</span>
            </div>
            <p className="mt-2 text-[12px] text-muted">Lost rent over the displacement window for this scenario.</p>
          </Card>

          {/* coverage gap */}
          <Card>
            <div className="subhead mb-3">Coverage Gap (structure)</div>
            <CovRow label="Policy limit (replacement)" value={money(fin.policyLimit)} />
            <CovRow label="Hurricane deductible" value={`– ${money(fin.deductible)}`} />
            <CovRow label="Expected recovery" value={money(fin.structureRecovery)} accent="#059669" bold />
            <CovRow label="Uncovered structure" value={money(fin.uncoveredStructure)} accent="#DC2626" bold />
          </Card>
        </div>
      </div>

      {/* deadlines + supplemental */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="subhead mb-3">Deadline Clock</div>
          <div className="flex gap-3">
            <Deadline label="Notice of Loss" days="14 days" tone="#F59E0B" />
            <Deadline label="Proof of Loss" days="60 days" tone="#3B82F6" />
          </div>
          <p className="mt-3 text-[12px] text-muted">Statutory windows from date of loss (illustrative).</p>
        </Card>
        <Card>
          <div className="subhead mb-3">Supplemental Claim</div>
          <p className="text-[13px] text-body">
            Track additional damage found after settlement — hidden water intrusion, mold, code-upgrade costs. Carriers accept supplements when documented.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-muted">Not started</span>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-bold text-indigo hover:bg-indigosoft">+ Log supplemental item</button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function CovRow({ label, value, accent = '#0D1B2A', bold }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={`text-[14px] ${bold ? 'font-extrabold' : 'font-semibold'}`} style={{ color: accent }}>{value}</span>
    </div>
  )
}

function Deadline({ label, days, tone }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-canvas p-3 text-center">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-extrabold" style={{ color: tone }}>{days}</div>
    </div>
  )
}

/* ------------------------- Grants / Loans list ------------------------- */
function ProgramList({ programs, present, type }) {
  const grantSteps = ['Eligible', 'Documents Gathering', 'Sub-application with County / State', 'Under Review', 'Awarded', 'Funded']
  const loanSteps = ['Eligible', 'Documents Gathering', 'Application Submitted', 'Under Review', 'Approved', 'Funded']
  const steps = type === 'grant' ? grantSteps : loanSteps

  return (
    <div className="space-y-5">
      {programs.map((prog) => {
        const ratio = prog.cov ? prog.cov.ratio : 0
        const idx = prog.underReview ? 0 : ratio === 0 ? 0 : ratio < 0.5 ? 1 : ratio < 1 ? 2 : 3
        return (
          <div key={prog.id} className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-extrabold text-ink">{prog.name}</h3>
                  {prog.illustrative && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-muted">ILLUSTRATIVE</span>}
                  {prog.underReview && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">STATUS UNDER REVIEW</span>}
                </div>
                <p className="mt-1 text-[13px] text-muted">{prog.reason}</p>
                {prog.flow && <p className="mt-0.5 text-[12px] text-muted">{prog.flow}</p>}
              </div>
              <div className="shrink-0 text-right">
                {type === 'loan' ? (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted">Max</div>
                    <div className="text-xl font-extrabold text-ink">{money(prog.max)}</div>
                    <div className="text-[11px] text-muted">{prog.rate} · {prog.term}</div>
                  </>
                ) : prog.underReview ? (
                  <div className="text-sm font-bold text-amber-600">Amount TBD</div>
                ) : (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted">Est. accessible</div>
                    <div className="text-xl font-extrabold text-ink">{money(prog.amount ?? prog.estimate)}</div>
                    {prog.estimate != null && <div className="text-[11px] text-muted">of ~{money(prog.estimate)} eligible</div>}
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <StatusBar steps={steps} current={idx} small />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {prog.docs.map((d) => (
                  <span key={d} className="flex items-center gap-1.5 text-[12px]">
                    {present.has(d) ? <DotCheck /> : <DotMiss />}
                    <span className={present.has(d) ? 'font-semibold text-ink' : 'text-muted'}>{d}</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[12px] text-muted">
                <span>Deadline: {prog.deadline}</span>
                {prog.source && <a href={prog.source} target="_blank" rel="noreferrer" className="font-bold text-indigo hover:underline">Source ↗</a>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------ Waterfall ------------------------------ */
function Waterfall({ fin }) {
  const W = 680, H = 240, padT = 24, padB = 44, padL = 8
  const chartH = H - padT - padB
  const max = fin.grossLoss || 1
  const y = (v) => padT + (1 - v / max) * chartH
  const y0 = y(0)

  const cols = []
  cols.push({ label: 'Gross Loss', top: y(fin.grossLoss), bottom: y0, color: '#1E3A8A', value: fin.grossLoss })
  let run = fin.grossLoss
  cols.push({ label: '– Insurance', top: y(run), bottom: y(run - fin.insApplied), color: '#10B981', value: fin.insApplied })
  run -= fin.insApplied
  cols.push({ label: '– Loans', top: y(run), bottom: y(run - fin.loansApplied), color: '#3B82F6', value: fin.loansApplied })
  run -= fin.loansApplied
  cols.push({ label: '– Grants', top: y(run), bottom: y(run - fin.grantsApplied), color: '#A855F7', value: fin.grantsApplied })
  run -= fin.grantsApplied
  cols.push({ label: 'Unfunded Gap', top: y(fin.unfundedGap), bottom: y0, color: fin.unfundedGap > 0 ? '#EF4444' : '#10B981', value: fin.unfundedGap })

  const n = cols.length
  const bandW = (W - padL * 2) / n
  const barW = 76

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {cols.map((c, i) => {
        const x = padL + i * bandW + (bandW - barW) / 2
        const h = Math.max(2, c.bottom - c.top)
        return (
          <g key={i}>
            <rect x={x} y={c.top} width={barW} height={h} rx="5" fill={c.color} />
            <text x={x + barW / 2} y={c.top - 7} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0D1B2A">
              {money(c.value, { compact: true })}
            </text>
            <text x={x + barW / 2} y={H - 24} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0D1B2A">
              {c.label}
            </text>
            {i < n - 1 && (
              <line x1={x + barW} y1={cols[i + 1].top} x2={x + bandW} y2={cols[i + 1].top} stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------ Shared bits ------------------------------ */
function Card({ children }) {
  return <div className="rounded-2xl border border-border bg-white p-6 shadow-card">{children}</div>
}

function StatusBar({ steps, current, small }) {
  return (
    <div className="flex items-start">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        const color = done ? '#10B981' : active ? '#5D5FEF' : '#CBD5E1'
        return (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className="h-0.5 flex-1" style={{ background: i === 0 ? 'transparent' : (done || active ? '#93C5FD' : '#E3E8F0') }} />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: color }}>
                {done ? '✓' : i + 1}
              </span>
              <div className="h-0.5 flex-1" style={{ background: i === steps.length - 1 ? 'transparent' : (i < current ? '#93C5FD' : '#E3E8F0') }} />
            </div>
            <span className={`mt-1.5 text-center ${small ? 'text-[9.5px]' : 'text-[10.5px]'} font-semibold leading-tight ${active ? 'text-ink' : 'text-muted'}`}>
              {s}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function OrderStep({ n, label, color }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-3 py-1.5">
      <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white" style={{ background: color }}>{n}</span>
      <span className="text-[13px] font-bold text-ink">{label}</span>
    </span>
  )
}
function Arrow() {
  return <span className="text-slate-400">→</span>
}
function DotCheck() {
  return <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-[9px] font-bold text-white">✓</span>
}
function DotMiss() {
  return <span className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-danger/40" />
}

/* ------------------------------ Export PDF ------------------------------ */
function exportAdjusterPackage(p, fin, files) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const M = 48
  let y = 60

  doc.setFillColor(13, 27, 42)
  doc.rect(0, 0, W, 84, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('ResilienceOS — Adjuster Package', M, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(160, 180, 210)
  doc.text(`${p.name} · ${p.address}, ${p.city} · ${today}`, M, 60)

  y = 116
  doc.setTextColor(13, 27, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Business Interruption', M, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 18
  doc.text(`${p.units} units × ${money(p.rent)}/mo × ${fin.scenario.months} months = ${money(fin.bi)}`, M, y)

  y += 30
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Coverage Summary', M, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  const rows = [
    ['Policy limit (replacement)', money(fin.policyLimit)],
    ['Hurricane deductible', money(fin.deductible)],
    ['Estimated structure recovery', money(fin.structureRecovery)],
    ['Uncovered structure', money(fin.uncoveredStructure)],
    ['Claim readiness', `${fin.claimReadiness}/100`],
  ]
  rows.forEach((r) => { y += 16; doc.text(r[0], M, y); doc.text(r[1], W - M, y, { align: 'right' }) })

  y += 32
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(`Vault Contents (${files.length})`, M, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  if (!files.length) { y += 16; doc.text('No documents on file.', M, y) }
  files.forEach((f) => { y += 16; doc.text(`• ${f.category}: ${f.name}`, M, y) })

  y += 34
  doc.setFontSize(8); doc.setTextColor(107, 114, 128)
  doc.text('Illustrative estimates. Not a claim, coverage, or eligibility determination.', M, y)
  doc.save(`Adjuster-Package-${p.id}.pdf`)
}

/* -------------------------------- icons -------------------------------- */
const sw = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
function StormIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...sw}><path d="M4 8a4 4 0 1 1 4 6H4M2 12h13a3 3 0 1 0-3-4" /><path d="M13 16l-2 4h4l-2 4" /></svg> }
function ShieldIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...sw}><path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z" /><path d="M9 12l2 2 4-4" /></svg> }
function BankIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...sw}><path d="M3 10l9-6 9 6M5 10v8m14-8v8M9 10v8m6-8v8M3 20h18" /></svg> }
function GapIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...sw}><path d="M10.3 4 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg> }
function UploadIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" className="text-indigo" {...sw}><path d="M12 15V3M7 8l5-5 5 5" /><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" /></svg> }
function DownloadIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" {...sw}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg> }
