export function money(n, opts = {}) {
  const { compact = false, decimals = 0 } = opts
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
  }).format(n)
}

export function moneyRange(low, high) {
  const f = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  return `${f(low)}–${f(high)}`
}

export function num(n) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function payback(years) {
  if (years == null) return '—'
  if (years < 1) return `${Math.round(years * 12)} months`
  return `${years.toFixed(1)} yrs`
}

export const RISK_COLORS = {
  High: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444', solid: '#EF4444' },
  Medium: { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B', solid: '#F59E0B' },
  Low: { bg: '#D1FAE5', text: '#047857', dot: '#10B981', solid: '#10B981' },
}

export const GAP_COLORS = {
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#10B981',
}

export const GAP_LABEL = {
  red: 'Critical gaps',
  yellow: 'Partial record',
  green: 'Well documented',
}
