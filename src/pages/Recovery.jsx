import { useState } from 'react'
import { PORTFOLIO } from '../data/portfolio'
import { Page } from '../components/Layout'
import { SectionLabel, CircularProgress } from '../components/Primitives'
import FinancialRecovery from './FinancialRecovery'

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
        <TabButton active={tab === 'financial'} onClick={() => setTab('financial')}>
          Financial Recovery
        </TabButton>
      </div>

      <div className="mt-7">
        {tab === 'pre' && <PreLoss />}
        {tab === 'financial' && <FinancialRecovery />}
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

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 6" />
    </svg>
  )
}
