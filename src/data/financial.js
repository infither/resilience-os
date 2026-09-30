// ResilienceOS — Financial Recovery model.
// All numbers hardcoded / derived from the 8 sample properties. No APIs.
// Consistent with Intelligence (risk, flood zone) and Mitigation (grant/capex).

import { PORTFOLIO, getProperty } from './portfolio'

// ----------------------------------------------------------------------------
// Scenario dials
// ----------------------------------------------------------------------------
export const SCENARIOS = {
  cat2: { key: 'cat2', label: 'Cat 2', damage: 0.08, months: 3 },
  cat3: { key: 'cat3', label: 'Cat 3', damage: 0.15, months: 6 },
  cat4: { key: 'cat4', label: 'Cat 4', damage: 0.25, months: 9 },
}

const VULN = { High: 1.4, Medium: 1.0, Low: 0.6 }

// ----------------------------------------------------------------------------
// Document vault
// ----------------------------------------------------------------------------
export const VAULT_CATEGORIES = [
  'Photos',
  'Rent Roll',
  'Insurance Policy',
  'Systems Inventory',
  'Mitigation History',
  'Contractor Scopes & Invoices',
  'Financial Statements',
  'Tax Returns',
  'Other',
]

export const INSURANCE_DOCS = [
  'Photos',
  'Rent Roll',
  'Insurance Policy',
  'Systems Inventory',
  'Mitigation History',
  'Contractor Scopes & Invoices',
]
export const GRANT_DOCS = ['Photos', 'Mitigation History', 'Contractor Scopes & Invoices', 'Systems Inventory']
export const LOAN_DOCS = ['Financial Statements', 'Tax Returns', 'Rent Roll', 'Insurance Policy', 'Photos']

export const INSURANCE_DOC_REASONS = {
  Photos: 'Dated pre- and post-loss photos are the first thing an adjuster asks for; without them, damage is assumed pre-existing.',
  'Rent Roll': 'Your business-interruption payout is calculated off the rent roll — no rent roll, no documented lost income.',
  'Insurance Policy': 'Limits, deductibles and endorsements decide what you can recover; reconstructing them after a loss wastes the days that matter.',
  'Systems Inventory': 'Without a systems inventory, HVAC and electrical replacement claims are routinely disputed by carriers.',
  'Mitigation History': 'Documented hardening earns wind-mitigation credits and proves the loss was not deferred maintenance.',
  'Contractor Scopes & Invoices': 'A priced scope of loss is what converts an estimate into a paid claim.',
}

// Seeded documents per property — reflects each property's existing readiness,
// so weak properties (Westside, Palmetto, Hialeah) start with the biggest gaps.
const SEED = {
  'westside-commons': ['Rent Roll'],
  'palmetto-bay': ['Rent Roll', 'Insurance Policy'],
  'hialeah-gardens': ['Rent Roll', 'Photos'],
  'sunrise-landing': ['Rent Roll', 'Insurance Policy', 'Photos'],
  'deerfield-shores': ['Rent Roll', 'Insurance Policy', 'Systems Inventory'],
  'broward-pines': ['Rent Roll', 'Insurance Policy', 'Photos', 'Systems Inventory'],
  'coral-ridge': ['Rent Roll', 'Insurance Policy', 'Photos', 'Systems Inventory', 'Mitigation History', 'Financial Statements', 'Tax Returns'],
  'boca-terrace': ['Rent Roll', 'Insurance Policy', 'Photos', 'Systems Inventory', 'Mitigation History', 'Contractor Scopes & Invoices', 'Financial Statements'],
}

// Build the initial in-memory vault: { [propertyId]: [ {name, category, date, seeded} ] }
export function initialVault() {
  const vault = {}
  PORTFOLIO.forEach((p) => {
    vault[p.id] = (SEED[p.id] || []).map((cat) => ({
      name: `${cat} — on file`,
      category: cat,
      date: 'Pre-loss',
      seeded: true,
    }))
  })
  return vault
}

export function presentCategories(files) {
  return new Set((files || []).map((f) => f.category))
}

function coverage(present, required) {
  const have = required.filter((d) => present.has(d)).length
  return { have, total: required.length, ratio: required.length ? have / required.length : 0 }
}

// ----------------------------------------------------------------------------
// Rounding — clean numbers, no fake precision
// ----------------------------------------------------------------------------
const r25 = (x) => Math.round(x / 25000) * 25000
const r5 = (x) => Math.round(x / 5000) * 5000
const r10 = (x) => Math.round(x / 10000) * 10000

// ----------------------------------------------------------------------------
// Core per-property financial calc
// ----------------------------------------------------------------------------
export function computeFinancials(property, scenarioKey, files) {
  const p = property
  const s = SCENARIOS[scenarioKey] || SCENARIOS.cat3
  const present = presentCategories(files)

  const insCov = coverage(present, INSURANCE_DOCS)
  const grantCov = coverage(present, GRANT_DOCS)
  const loanCov = coverage(present, LOAN_DOCS)

  const claimReadiness = Math.round(insCov.ratio * 100)

  // Loss
  const structureDamage = p.insuredValue * s.damage * (VULN[p.riskLevel] || 1)
  const bi = p.units * p.rent * s.months
  const grossLoss = r25(structureDamage + bi)

  // Insurance
  const highRisk = p.riskLevel === 'High'
  const deductiblePct = highRisk ? 0.05 : 0.03
  const deductible = r5(p.insuredValue * deductiblePct)
  const insAccess = 0.55 + 0.4 * insCov.ratio
  const structureRecovery = r5(Math.max(0, Math.min(structureDamage, p.insuredValue) - deductible) * insAccess)
  const biRecovery = r5(bi * 0.5 * insAccess)
  const insuranceRecovery = structureRecovery + biRecovery
  const uncoveredStructure = r5(Math.max(0, structureDamage - deductible - structureRecovery))

  // Loans (capacity, doc-gated)
  const loanAccess = 0.15 + 0.75 * loanCov.ratio
  const sbaPhysical = r5(Math.min(2000000, structureDamage) * loanAccess)
  const sbaEidl = r5(Math.min(2000000, bi) * loanAccess)
  const flBridge = 50000
  const loanCapacity = sbaPhysical + sbaEidl + flBridge

  // Grants (accessible, doc-gated)
  const grantAccess = 0.3 + 0.6 * grantCov.ratio
  const hmgpBase = p.totalGrant || 45000
  const grantsBase = hmgpBase + 50000 + 25000 // HMGP + HLMP + county
  const grantsAvailable = r5(grantsBase * grantAccess)

  // Waterfall (order of money: Insurance -> Loans -> Grants)
  const insApplied = Math.min(insuranceRecovery, grossLoss)
  let rem = grossLoss - insApplied
  const loansApplied = Math.min(loanCapacity, rem)
  rem -= loansApplied
  const grantsApplied = Math.min(grantsAvailable, rem)
  rem -= grantsApplied
  const unfundedGap = Math.max(0, r5(rem))
  const fundingApplied = loansApplied + grantsApplied

  return {
    scenario: s,
    structureDamage: r5(structureDamage),
    bi,
    grossLoss,
    deductible,
    policyLimit: p.insuredValue,
    structureRecovery,
    biRecovery,
    insuranceRecovery,
    uncoveredStructure,
    loanCapacity,
    sbaPhysical,
    sbaEidl,
    flBridge,
    grantsAvailable,
    insApplied: r5(insApplied),
    loansApplied: r5(loansApplied),
    grantsApplied: r5(grantsApplied),
    fundingApplied: r5(fundingApplied),
    unfundedGap,
    claimReadiness,
    insCov,
    grantCov,
    loanCov,
  }
}

// Portfolio rollup across all properties (current vault state)
export function portfolioTotals(scenarioKey, vault) {
  return PORTFOLIO.reduce(
    (acc, p) => {
      const f = computeFinancials(p, scenarioKey, vault[p.id])
      acc.grossLoss += f.grossLoss
      acc.insuranceRecovery += f.insApplied
      acc.fundingAvailable += f.fundingApplied
      acc.unfundedGap += f.unfundedGap
      return acc
    },
    { grossLoss: 0, insuranceRecovery: 0, fundingAvailable: 0, unfundedGap: 0 }
  )
}

// ----------------------------------------------------------------------------
// Program definitions
// ----------------------------------------------------------------------------
export function grantPrograms(p, fin) {
  return [
    {
      id: 'hmgp',
      name: 'FEMA Hazard Mitigation Grant Program (HMGP)',
      reason: `Declared-disaster mitigation · Flood Zone ${p.floodZone}, built ${p.built}`,
      amount: fin.grantsAvailable, // accessible portion, doc-gated
      estimate: r5((p.totalGrant || 45000)),
      deadline: 'State-set window (~12 mo post-declaration)',
      flow: 'Flows through Florida DEM → applicant',
      source: 'https://www.fema.gov/grants/mitigation/hazard-mitigation',
      docs: GRANT_DOCS,
      cov: fin.grantCov,
    },
    {
      id: 'hlmp',
      name: 'FL Hurricane Loss Mitigation Program (HLMP)',
      reason: 'Wind retrofit — roof deck / opening protection',
      estimate: 50000,
      deadline: 'Annual state cycle',
      flow: 'Florida DEM',
      source: 'https://www.floridadisaster.org',
      docs: GRANT_DOCS,
      cov: fin.grantCov,
    },
    {
      id: 'county',
      name: `${p.county} County Hazard-Mitigation Cost-Share`,
      reason: 'Local match for hardening work',
      estimate: 25000,
      deadline: 'Varies by county',
      flow: `Flows through ${p.county} County`,
      illustrative: true,
      docs: GRANT_DOCS,
      cov: fin.grantCov,
    },
    {
      id: 'bric',
      name: 'FEMA BRIC (Building Resilient Infrastructure & Communities)',
      reason: 'Pre-disaster resilience',
      underReview: true,
      deadline: '—',
      flow: 'Flows through Florida DEM',
      source: 'https://www.fema.gov/grants/mitigation/building-resilient-infrastructure-communities',
      docs: GRANT_DOCS,
      cov: fin.grantCov,
    },
  ]
}

export function loanPrograms(p, fin) {
  return [
    {
      id: 'sba-physical',
      name: 'SBA Business Physical Disaster Loan',
      reason: 'Repairs to structure & contents beyond insurance',
      max: fin.sbaPhysical > 0 ? Math.min(2000000, fin.structureDamage) : 0,
      cap: 2000000,
      rate: '4% – 8%',
      term: 'Up to 30 years',
      deadline: '~60 days after declaration',
      source: 'https://www.sba.gov/funding-programs/disaster-assistance',
      docs: LOAN_DOCS,
      cov: fin.loanCov,
    },
    {
      id: 'sba-eidl',
      name: 'SBA Economic Injury Disaster Loan (EIDL)',
      reason: 'Working capital for lost rent during displacement',
      max: Math.min(2000000, fin.bi),
      cap: 2000000,
      rate: '~4%',
      term: 'Up to 30 years',
      deadline: '~9 months after declaration',
      source: 'https://www.sba.gov/funding-programs/disaster-assistance',
      docs: LOAN_DOCS,
      cov: fin.loanCov,
    },
    {
      id: 'fl-bridge',
      name: 'Florida Small Business Emergency Bridge Loan',
      reason: 'Short-term bridge until insurance / SBA funds',
      max: 50000,
      cap: 50000,
      rate: '0% (short term)',
      term: '12 months',
      deadline: 'Activated per event',
      illustrative: true,
      source: 'https://www.floridadisaster.biz',
      docs: LOAN_DOCS,
      cov: fin.loanCov,
    },
  ]
}

export { getProperty }
