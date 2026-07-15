// ResilienceOS — Sample South Florida Portfolio
// All risk scores, mitigation recommendations, and recovery readiness derive
// from this hardcoded data. No external API calls.

// ----------------------------------------------------------------------------
// Raw portfolio (as provided)
// ----------------------------------------------------------------------------
const RAW = [
  {
    id: 'palmetto-bay',
    name: 'Palmetto Bay Apartments',
    address: '2840 SW 137th Ave',
    city: 'Miami-Dade',
    county: 'Miami-Dade',
    units: 48,
    rent: 1850,
    built: 1987,
    roof: 'Flat',
    floodZone: 'AE',
    protection: 'No hurricane shutters',
    protectionLevel: 'none',
    readiness: 33,
  },
  {
    id: 'broward-pines',
    name: 'Broward Pines',
    address: '6200 NW 31st Ave',
    city: 'Fort Lauderdale',
    county: 'Broward',
    units: 72,
    rent: 1650,
    built: 1994,
    roof: 'Hip',
    floodZone: 'X',
    protection: 'Partial shutters',
    protectionLevel: 'partial',
    readiness: 67,
  },
  {
    id: 'coral-ridge',
    name: 'Coral Ridge Flats',
    address: '3100 NE 16th St',
    city: 'Pompano Beach',
    county: 'Broward',
    units: 36,
    rent: 1750,
    built: 2001,
    roof: 'Hip',
    floodZone: 'AE',
    protection: 'Full impact windows',
    protectionLevel: 'full',
    readiness: 83,
  },
  {
    id: 'westside-commons',
    name: 'Westside Commons',
    address: '11400 W Flagler St',
    city: 'Miami',
    county: 'Miami-Dade',
    units: 120,
    rent: 1550,
    built: 1979,
    roof: 'Flat',
    floodZone: 'AE',
    protection: 'No shutters',
    protectionLevel: 'none',
    readiness: 17,
  },
  {
    id: 'sunrise-landing',
    name: 'Sunrise Landing',
    address: '9800 NW 44th St',
    city: 'Sunrise',
    county: 'Broward',
    units: 60,
    rent: 1700,
    built: 2005,
    roof: 'Gable',
    floodZone: 'X',
    protection: 'Hurricane straps, no shutters',
    protectionLevel: 'none',
    hasStraps: true,
    readiness: 50,
  },
  {
    id: 'deerfield-shores',
    name: 'Deerfield Shores',
    address: '400 SE 20th Ave',
    city: 'Deerfield Beach',
    county: 'Broward',
    units: 44,
    rent: 1800,
    built: 1991,
    roof: 'Hip',
    floodZone: 'AE',
    protection: 'Partial shutters',
    protectionLevel: 'partial',
    readiness: 50,
  },
  {
    id: 'hialeah-gardens',
    name: 'Hialeah Gardens',
    address: '7900 W 36th Ave',
    city: 'Hialeah',
    county: 'Miami-Dade',
    units: 88,
    rent: 1450,
    built: 1983,
    roof: 'Flat',
    floodZone: 'X',
    protection: 'No shutters',
    protectionLevel: 'none',
    readiness: 33,
  },
  {
    id: 'boca-terrace',
    name: 'Boca Terrace',
    address: '2400 NW 19th St',
    city: 'Boca Raton',
    county: 'Palm Beach',
    units: 52,
    rent: 2100,
    built: 2010,
    roof: 'Hip',
    floodZone: 'X',
    protection: 'Full impact windows',
    protectionLevel: 'full',
    readiness: 83,
  },
]

// ----------------------------------------------------------------------------
// Model constants
// ----------------------------------------------------------------------------
const REPLACEMENT_VALUE_PER_UNIT = 150000 // insured structure value per unit
const BI_MONTHS = 6 // months of business interruption exposure
const PREMIUM_PER_UNIT = 1500 // est. annual insurance premium per unit
const CAT3_DAMAGE_RATIO = 0.1 // share of insured value exposed in a major event
const DISCOUNT_RATE = 0.05 // for 10-year NPV
const NPV_YEARS = 10
// Present-value annuity factor for 10 years @ 5%
const PV_ANNUITY = (1 - Math.pow(1 + DISCOUNT_RATE, -NPV_YEARS)) / DISCOUNT_RATE

// Coastal = Miami-Dade / Broward (high wind). Everything else = inland.
const isCoastal = (county) => county === 'Miami-Dade' || county === 'Broward'

// ----------------------------------------------------------------------------
// Core per-property calculations
// ----------------------------------------------------------------------------
function insuredValue(p) {
  return p.units * REPLACEMENT_VALUE_PER_UNIT
}

function floodRate(p) {
  return p.floodZone === 'AE' ? 0.012 : 0.003
}

function windRate(p) {
  return isCoastal(p.county) ? 0.004 : 0.001
}

// Estimated Annual Loss
function eal(p) {
  return Math.round(insuredValue(p) * (floodRate(p) + windRate(p)))
}

// Business interruption exposure (units x rent x 6 months)
function biExposure(p) {
  return p.units * p.rent * BI_MONTHS
}

function monthlyRent(p) {
  return p.units * p.rent
}

function annualPremium(p) {
  return p.units * PREMIUM_PER_UNIT
}

// Single catastrophic-event loss potential, used as the BCA loss basis.
function potentialLoss(p) {
  return Math.round(insuredValue(p) * CAT3_DAMAGE_RATIO)
}

// ----------------------------------------------------------------------------
// Risk scoring -> Risk Level
// ----------------------------------------------------------------------------
function riskScore(p) {
  let s = 0
  s += p.floodZone === 'AE' ? 2 : 0
  s += isCoastal(p.county) ? 1 : 0
  if (p.protectionLevel === 'none') s += 2
  else if (p.protectionLevel === 'partial') s += 1
  if (p.roof === 'Flat' && p.built < 2000) s += 1
  if (p.built < 1994) s += 1
  return s
}

function riskLevel(p) {
  const s = riskScore(p)
  if (s >= 4) return 'High'
  if (s >= 2) return 'Medium'
  return 'Low'
}

function windExposure(p) {
  return isCoastal(p.county) ? 'High' : 'Medium'
}

// Documentation gap traffic-light, keyed off readiness.
function docGap(p) {
  if (p.readiness >= 75) return 'green'
  if (p.readiness >= 50) return 'yellow'
  return 'red'
}

// ----------------------------------------------------------------------------
// Mitigation action catalog (condition -> action template)
// ----------------------------------------------------------------------------
const PERMIT_BY_COUNTY = {
  'Miami-Dade': 'Miami-Dade',
  Broward: 'Broward County',
  'Palm Beach': 'Palm Beach County',
}

function actionsFor(p) {
  const out = []
  const permit = PERMIT_BY_COUNTY[p.county] || 'local'

  // Flat roof + pre-2000 -> Roof deck attachment (STRAP)
  if (p.roof === 'Flat' && p.built < 2000) {
    out.push({
      key: 'roof-deck',
      title: 'Roof deck attachment upgrade (STRAP system)',
      explanation: `${p.name} has a flat roof built in ${p.built} — the deck is almost certainly nailed, not strapped. A secondary water barrier and re-nailing the deck to current code is the single highest-leverage hardening move on this building.`,
      costLow: 18000,
      costHigh: 28000,
      reductionLow: 8,
      reductionHigh: 14,
      priority: 'High',
      grant: 'FEMA BRIC',
      timeline: `5–7 weeks including ${permit} re-roof permitting. Schedule outside hurricane season; deck work cannot be exposed during a named storm.`,
      contractor: {
        type: 'Licensed roofing contractor (CCC license) experienced with FBC High-Velocity Hurricane Zone re-nailing.',
        ask: 'Ask for a bid that itemizes deck re-nail to 8d ring-shank pattern and a peel-and-stick secondary water barrier, with the FBC product approval numbers.',
        redFlags: [
          'A bid that only mentions new shingles/membrane and not deck attachment — that is a re-cover, not a hardening retrofit.',
          'No mention of secondary water barrier or product approval numbers.',
        ],
      },
    })
  }

  // No shutters / impact windows -> Opening protection
  if (p.protectionLevel === 'none' || p.protectionLevel === 'partial') {
    const partial = p.protectionLevel === 'partial'
    out.push({
      key: 'opening-protection',
      title: partial
        ? 'Complete opening protection (close partial coverage)'
        : 'Opening protection (impact windows or accordion shutters)',
      explanation: partial
        ? `${p.name} has partial shutter coverage today — carriers rate the whole building to its weakest opening. Closing the gaps to full coverage is what actually moves the wind premium.`
        : `${p.name} has no opening protection. A single breached window pressurizes the building and is the most common path to a total-roof-loss claim. This is the action a carrier looks for first.`,
      costLow: 12000,
      costHigh: 22000,
      reductionLow: 5,
      reductionHigh: 10,
      priority: 'High',
      grant: 'Florida IBHS',
      timeline: `6–8 weeks including ${permit} permitting. Must begin early enough to complete before June 1 hurricane season.`,
      contractor: {
        type: 'Licensed glazing/impact-window contractor or shutter installer with NOA (Notice of Acceptance) products.',
        ask: 'Ask for Miami-Dade NOA or Florida Product Approval numbers for every opening, and a per-opening schedule so nothing is missed.',
        redFlags: [
          'No NOA / product approval numbers on the bid.',
          'A quote that covers “most” openings — partial coverage gives you almost none of the premium benefit.',
        ],
      },
    })
  }

  // Built pre-1994 -> Hurricane strap inspection + retrofit
  if (p.built < 1994 && !p.hasStraps) {
    out.push({
      key: 'hurricane-straps',
      title: 'Hurricane strap inspection and retrofit',
      explanation: `Built in ${p.built}, ${p.name} predates the post-Andrew code that mandated engineered roof-to-wall connections. Retrofitting clips/straps keeps the roof attached to the walls in a Cat 3 — and it is one of the few retrofits an inspector can verify for a credit.`,
      costLow: 8000,
      costHigh: 15000,
      reductionLow: 4,
      reductionHigh: 7,
      priority: 'High',
      grant: 'Florida IBHS',
      timeline: `3–5 weeks. Requires interior/attic access; coordinate unit notice. ${permit} permit required for structural connectors.`,
      contractor: {
        type: 'Licensed general contractor with a structural engineer for connector specification.',
        ask: 'Ask for an engineer-stamped roof-to-wall connection report and a wind-mitigation (OIR-B1-1802) form on completion.',
        redFlags: [
          'No wind-mitigation inspection form at the end — without it, the carrier gives you no credit.',
          'Straps quoted without attic/access verification of the existing connection.',
        ],
      },
    })
  }

  // Gable roof -> Gable end bracing
  if (p.roof === 'Gable') {
    out.push({
      key: 'gable-bracing',
      title: 'Gable end bracing',
      explanation: `${p.name} has gable ends, which act like sails in high wind and are a known failure point. Bracing the gable ends is inexpensive relative to the loss it prevents.`,
      costLow: 4000,
      costHigh: 8000,
      reductionLow: 2,
      reductionHigh: 4,
      priority: 'Medium',
      grant: 'FEMA BRIC',
      timeline: `2–3 weeks. ${permit} permit; attic access required.`,
      contractor: {
        type: 'Licensed general contractor familiar with FBC gable-end retrofit details.',
        ask: 'Ask for bracing per the FBC prescriptive gable-end method with horizontal and diagonal braces tied into ceiling joists.',
        redFlags: [
          'Bracing only the outer face without tying into the framing.',
          'No engineering detail referenced for spans over 4 feet.',
        ],
      },
    })
  }

  // Flood Zone AE, no backflow valve -> Backflow preventer
  if (p.floodZone === 'AE') {
    out.push({
      key: 'backflow',
      title: 'Backflow preventer installation',
      explanation: `In Flood Zone AE, storm surge pushes sewage back up the sanitary line — backups are a leading cause of uninhabitable units after a flood. A backflow preventer is cheap insurance against a claim carriers love to dispute.`,
      costLow: 3500,
      costHigh: 6000,
      reductionLow: 3,
      reductionHigh: 5,
      priority: 'Medium',
      grant: 'FEMA HMGP',
      timeline: `1–2 weeks per riser. ${permit} plumbing permit required.`,
      contractor: {
        type: 'Licensed plumbing contractor.',
        ask: 'Ask for a backwater valve on each sanitary lateral with an accessible cleanout for maintenance.',
        redFlags: [
          'A single valve proposed for the whole building when there are multiple laterals.',
          'No accessible cleanout — it will silt up and fail when you need it.',
        ],
      },
    })

    // Flood Zone AE -> Flood vent installation
    out.push({
      key: 'flood-vent',
      title: 'Flood vent installation',
      explanation: `Engineered flood vents let surge water flow through enclosed/ground-level areas instead of collapsing the walls under hydrostatic pressure. In AE zones they also directly lower the NFIP flood rate.`,
      costLow: 2500,
      costHigh: 5000,
      reductionLow: 2,
      reductionHigh: 3,
      priority: 'Medium',
      grant: 'FEMA HMGP',
      timeline: `1–2 weeks. ${permit} permit; coordinate with any required FEMA Elevation Certificate update.`,
      contractor: {
        type: 'Licensed general contractor; ICC-ES certified flood vent products.',
        ask: 'Ask for ICC-ES certified vents sized to the enclosed square footage (1 sq in of vent per sq ft of enclosure).',
        redFlags: [
          'Non-engineered “air vents” passed off as flood vents — they earn no NFIP credit.',
          'Vent count not tied to the enclosed area calculation.',
        ],
      },
    })
  }

  return out
}

// ----------------------------------------------------------------------------
// Per-action financial enrichment (BCA, NPV, savings, grants)
// ----------------------------------------------------------------------------
function enrichAction(p, a) {
  const cost = Math.round((a.costLow + a.costHigh) / 2)
  const reductionPct = (a.reductionLow + a.reductionHigh) / 2 / 100

  const annualPremiumSavings = Math.round(annualPremium(p) * reductionPct)
  const damageAvoided = Math.round(potentialLoss(p) * reductionPct)
  const annualDamageReduction = Math.round(eal(p) * reductionPct)

  const bca = damageAvoided / cost
  const annualBenefit = annualPremiumSavings + annualDamageReduction
  const npv10 = Math.round(annualBenefit * PV_ANNUITY - cost)

  // FEMA cost-share: 75% federal / 25% local match on eligible projects.
  const grantEligible = bca > 1.0
  const grantAmount = grantEligible ? Math.round(cost * 0.75) : 0
  const matchAmount = grantEligible ? cost - grantAmount : 0

  return {
    ...a,
    cost,
    reductionPct: a.reductionLow + '–' + a.reductionHigh + '%',
    annualPremiumSavings,
    damageAvoided,
    bca,
    npv10,
    grantEligible,
    grantAmount,
    matchAmount,
    grantLabel: grantEligible ? a.grant : 'Not currently eligible',
  }
}

// ----------------------------------------------------------------------------
// Recovery checklists (pre-loss readiness, varied per property)
// ----------------------------------------------------------------------------
const READINESS_ITEMS = [
  {
    key: 'photos',
    label: 'Timestamped photo documentation (interior + exterior)',
    why: 'Without dated pre-loss photos, the carrier assumes prior damage and discounts your claim. This is the first thing an adjuster asks for.',
  },
  {
    key: 'rentroll',
    label: 'Current rent roll on file',
    why: 'Your business-interruption payout is calculated off the rent roll. No rent roll, no documented loss of income.',
  },
  {
    key: 'schedule',
    label: 'Insurance schedule uploaded',
    why: 'Coverage limits and endorsements determine what you can recover. Reconstructing them after a loss wastes the days that matter most.',
  },
  {
    key: 'systems',
    label: 'Systems inventory (HVAC, electrical, plumbing)',
    why: 'Without a systems inventory, HVAC replacement claims are routinely disputed by carriers.',
  },
  {
    key: 'mitigation',
    label: 'Mitigation history documented',
    why: 'Documented hardening is what earns wind-mitigation credits — and proves the loss was not from deferred maintenance.',
  },
  {
    key: 'contractors',
    label: 'Contractor relationships pre-identified',
    why: 'After a regional event, every contractor is booked for months. Pre-identified relationships move you to the front of the line.',
  },
]

// Deterministically choose which items are complete to match each readiness %.
function readinessChecklist(p) {
  const completeCount = Math.round((p.readiness / 100) * READINESS_ITEMS.length)
  return READINESS_ITEMS.map((item, i) => ({
    ...item,
    complete: i < completeCount,
  }))
}

// ----------------------------------------------------------------------------
// Assemble the enriched portfolio
// ----------------------------------------------------------------------------
export const PORTFOLIO = RAW.map((p) => {
  const actions = actionsFor(p).map((a) => enrichAction(p, a))
  const totalCapex = actions.reduce((s, a) => s + a.cost, 0)
  const totalPremiumSavings = actions.reduce((s, a) => s + a.annualPremiumSavings, 0)
  const totalGrant = actions.reduce((s, a) => s + a.grantAmount, 0)
  const netOutOfPocket = totalCapex - totalGrant
  const totalNpv = actions.reduce((s, a) => s + a.npv10, 0)
  const highPriorityCount = actions.filter((a) => a.priority === 'High').length
  const payback = totalPremiumSavings > 0 ? totalCapex / totalPremiumSavings : null

  return {
    ...p,
    insuredValue: insuredValue(p),
    eal: eal(p),
    biExposure: biExposure(p),
    monthlyRent: monthlyRent(p),
    annualPremium: annualPremium(p),
    potentialLoss: potentialLoss(p),
    riskLevel: riskLevel(p),
    windExposure: windExposure(p),
    coastal: isCoastal(p.county),
    docGap: docGap(p),
    actions,
    totalCapex,
    totalPremiumSavings,
    totalGrant,
    netOutOfPocket,
    totalNpv,
    highPriorityCount,
    payback,
    // ROI metric for ranking: 10-yr value created per $1 of capex.
    roi: totalCapex > 0 ? totalNpv / totalCapex : 0,
    checklist: readinessChecklist(p),
  }
})

export function getProperty(id) {
  return PORTFOLIO.find((p) => p.id === id)
}

// ----------------------------------------------------------------------------
// Portfolio-level rollups
// ----------------------------------------------------------------------------
export const PORTFOLIO_STATS = {
  // Headline: undocumented business-interruption exposure in a Cat 3 event.
  undocumentedExposure: 4100000,
  totalUnits: PORTFOLIO.reduce((s, p) => s + p.units, 0),
  monthlyRentAtRisk: PORTFOLIO.filter((p) => p.floodZone === 'AE').reduce(
    (s, p) => s + p.monthlyRent,
    0
  ),
  readinessScore: Math.round(
    PORTFOLIO.reduce((s, p) => s + p.readiness, 0) / PORTFOLIO.length
  ),
  propertiesNeedingAction: PORTFOLIO.filter((p) => p.riskLevel === 'High').length,
  totalBiExposure: PORTFOLIO.reduce((s, p) => s + p.biExposure, 0),
}

export const MODEL = {
  REPLACEMENT_VALUE_PER_UNIT,
  BI_MONTHS,
  PREMIUM_PER_UNIT,
  CAT3_DAMAGE_RATIO,
  DISCOUNT_RATE,
  NPV_YEARS,
}

export const RISK_ORDER = { High: 0, Medium: 1, Low: 2 }
