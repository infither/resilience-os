import { useState } from 'react'
import { PORTFOLIO } from '../data/portfolio'
import { money, num } from '../utils/format'
import { Page } from '../components/Layout'
import { SectionLabel, CircularProgress, StatusPill } from '../components/Primitives'

export default function Recovery() {
  const [tab, setTab] = useState('pre')

  return (
    <Page>
      <SectionLabel>Recovery</SectionLabel>

      {/* Tabs */}
      <div className="mt-5 inline-flex rounded-lg border border-border bg-gray-50 p-1">
        <TabButton active={tab === 'pre'} onClick={() => setTab('pre')}>
          Pre-Loss Readiness
        </TabButton>
        <TabButton active={tab === 'post'} onClick={() => setTab('post')}>
          Post-Loss Workflow
        </TabButton>
      </div>

      <div className="mt-7">
        {tab === 'pre' ? <PreLoss /> : <PostLoss />}
      </div>
    </Page>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
        active ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/* ----------------------------- Pre-Loss tab ----------------------------- */
function PreLoss() {
  // Default to the worst-prepared property to surface the problem.
  const sorted = [...PORTFOLIO].sort((a, b) => a.readiness - b.readiness)
  const [selectedId, setSelectedId] = useState(sorted[0].id)
  const selected = PORTFOLIO.find((p) => p.id === selectedId)
  const done = selected.checklist.filter((c) => c.complete).length

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6">
      {/* property rail */}
      <div className="space-y-2">
        {sorted.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
              p.id === selectedId
                ? 'border-highlight/50 bg-blue-50/50 shadow-sm'
                : 'border-border bg-white hover:bg-gray-50'
            }`}
          >
            <MiniRing value={p.readiness} />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink">{p.name}</div>
              <div className="text-[11px] text-muted">{p.readiness}/100 ready</div>
            </div>
          </button>
        ))}
      </div>

      {/* detail */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center gap-6 border-b border-border pb-6">
          <CircularProgress value={selected.readiness} />
          <div>
            <h3 className="text-xl font-bold text-ink">{selected.name}</h3>
            <p className="text-sm text-muted">{selected.address}, {selected.city}</p>
            <p className="mt-2 text-sm text-body">
              <span className="font-semibold text-ink">{done} of {selected.checklist.length}</span> pre-loss
              records complete.{' '}
              {selected.readiness < 50
                ? 'Your carrier will dispute this claim. Here’s why.'
                : selected.readiness < 75
                ? 'Partial record — close the gaps before season.'
                : 'Strong record. A claim here can be substantiated from day one.'}
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-3.5">
          {selected.checklist.map((c) => (
            <li key={c.key} className="flex gap-3">
              {c.complete ? (
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                  <Check />
                </span>
              ) : (
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-danger/40" />
              )}
              <div>
                <div className={`text-sm font-semibold ${c.complete ? 'text-muted line-through' : 'text-ink'}`}>
                  {c.label}
                </div>
                {!c.complete && <div className="text-[13px] text-muted">{c.why}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function MiniRing({ value }) {
  const size = 34
  const stroke = 4
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (value / 100) * circ}
      />
    </svg>
  )
}

/* ----------------------------- Post-Loss tab ----------------------------- */
function PostLoss() {
  const [track, setTrack] = useState('insurance')
  // BI calc demo uses the highest-exposure property.
  const biProperty = [...PORTFOLIO].sort((a, b) => b.biExposure - a.biExposure)[0]
  const displacementMonths = 6

  const insuranceSteps = [
    {
      title: 'File notice of loss',
      status: 'Complete',
      body: 'Notify your carrier within the policy window. ResilienceOS pre-fills the carrier contact template with your policy numbers and loss date.',
      action: 'Open carrier template',
    },
    {
      title: 'Document all damage',
      status: 'In Progress',
      body: 'Work the photo checklist and scope-of-loss template room by room. Pair each photo against your pre-loss record so nothing reads as “prior damage.”',
      action: 'Open photo checklist',
    },
    {
      title: 'Calculate Business Interruption',
      status: 'In Progress',
      body: 'bi',
      action: null,
    },
    {
      title: 'Compile claims package',
      status: 'Not Started',
      body: 'ResilienceOS has already built this from your pre-loss record — rent roll, insurance schedule, systems inventory, mitigation history, and dated photos in one package.',
      action: 'Preview package',
    },
    {
      title: 'Submit to broker / public adjuster',
      status: 'Not Started',
      body: 'Send the compiled package to your broker or public adjuster. A complete package is what moves a claim from “under review” to paid.',
      action: 'Share package',
    },
    {
      title: 'Track claim status',
      status: 'Not Started',
      body: 'Log carrier touchpoints, supplements, and payments in one timeline so nothing stalls silently.',
      action: 'Open tracker',
    },
  ]

  const govSteps = [
    {
      title: 'Register with FEMA Individual Assistance',
      status: 'Not Started',
      body: 'Register as soon as a federal disaster is declared for your county. Registration opens the door to every downstream program.',
      action: 'fema.gov/disaster',
      link: 'https://www.fema.gov/disaster',
    },
    {
      title: 'Apply for SBA Disaster Loan',
      status: 'Not Started',
      body: 'Low-interest loans up to $2M for physical damage and economic injury — often the largest single source of recovery capital for an operator.',
      action: 'sba.gov/disaster',
      link: 'https://www.sba.gov/funding-programs/disaster-assistance',
    },
    {
      title: 'Check FEMA HMGP eligibility',
      status: 'Not Started',
      body: 'Hazard Mitigation Grant Program funds post-disaster hardening — rebuild stronger than before with federal cost-share, not just back to baseline.',
      action: 'Check eligibility',
      link: 'https://www.fema.gov/grants/mitigation/hazard-mitigation',
    },
    {
      title: 'Florida Division of Emergency Management',
      status: 'Not Started',
      body: 'State programs layer on top of federal aid. FDEM coordinates state mitigation and recovery funding for Florida property owners.',
      action: 'floridadisaster.org',
      link: 'https://www.floridadisaster.org',
    },
    {
      title: 'Document all out-of-pocket costs',
      status: 'In Progress',
      body: 'Keep every receipt — temporary repairs, debris removal, generator fuel, tenant relocation. These are reimbursable but only if documented as they happen.',
      action: 'Open expense log',
    },
    {
      title: 'Track application status',
      status: 'Not Started',
      body: 'Federal and state timelines run in parallel with different deadlines. Track each application so you never miss a window.',
      action: 'Open tracker',
    },
  ]

  const steps = track === 'insurance' ? insuranceSteps : govSteps

  return (
    <div>
      {/* track toggle */}
      <div className="inline-flex rounded-lg border border-border bg-white p-1">
        <TrackButton active={track === 'insurance'} onClick={() => setTrack('insurance')}>
          Insurance Track
        </TrackButton>
        <TrackButton active={track === 'government'} onClick={() => setTrack('government')}>
          Government Funding Track
        </TrackButton>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border bg-white p-5">
            <div className="flex shrink-0 flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-[15px] font-bold text-ink">{s.title}</h4>
                <StatusPill status={s.status} />
              </div>

              {s.body === 'bi' ? (
                <BICalc property={biProperty} months={displacementMonths} />
              ) : (
                <p className="mt-1.5 text-[13px] leading-relaxed text-body">{s.body}</p>
              )}

              {s.action && (
                s.link ? (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-blue-50"
                  >
                    {s.action} ↗
                  </a>
                ) : (
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-blue-50">
                    {s.action} →
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BICalc({ property: p, months }) {
  const total = p.units * p.rent * months
  return (
    <div className="mt-2">
      <p className="text-[13px] leading-relaxed text-body">
        Auto-calculated from your rent roll for <span className="font-semibold text-ink">{p.name}</span>{' '}
        (highest-exposure property):
      </p>
      <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-gray-50 px-4 py-3 text-sm">
        <span className="font-semibold text-ink">{num(p.units)} units</span>
        <span className="text-muted">×</span>
        <span className="font-semibold text-ink">{money(p.rent)}/mo</span>
        <span className="text-muted">×</span>
        <span className="font-semibold text-ink">{months} mo displacement</span>
        <span className="text-muted">=</span>
        <span className="text-lg font-extrabold text-primary">{money(total)}</span>
      </div>
    </div>
  )
}

function TrackButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
        active ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 6" />
    </svg>
  )
}
