import jsPDF from 'jspdf'
import { PORTFOLIO, PORTFOLIO_STATS } from '../data/portfolio'
import { money, num } from './format'

// Single-page branded leave-behind. Looks like something a CFO forwards to their broker.
export function exportSummaryPDF() {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48

  const NAVY = [13, 27, 42]
  const BLUE = [59, 130, 246]
  const PRIMARY = [30, 58, 138]
  const MUTED = [107, 114, 128]
  const INK = [13, 27, 42]
  const BORDER = [229, 231, 235]

  // ---- Header (dark navy) ----
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 86, 'F')

  // shield mark
  drawShield(doc, M, 30, 26)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('ResilienceOS', M + 36, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(150, 170, 200)
  doc.text('PROTECT WHAT MATTERS', M + 37, 56)

  doc.setTextColor(200, 215, 235)
  doc.setFontSize(9)
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text('Sample South Florida Portfolio', W - M, 40, { align: 'right' })
  doc.text(date, W - M, 54, { align: 'right' })

  let y = 124

  // ---- Hero exposure number ----
  doc.setTextColor(...BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PORTFOLIO EXPOSURE', M, y - 14)

  doc.setFontSize(46)
  doc.setTextColor(...PRIMARY)
  doc.text(money(PORTFOLIO_STATS.undocumentedExposure, { compact: true }), M, y + 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(...INK)
  doc.text(
    'In business-interruption exposure across the portfolio that is not currently documented —',
    M,
    y + 42
  )
  doc.text('what would be lost in a Cat 3 event and cannot be proven to a carrier.', M, y + 56)

  y += 86

  // ---- KPI strip ----
  const kpis = [
    ['Total Units', num(PORTFOLIO_STATS.totalUnits)],
    ['Monthly Rent at Risk', money(PORTFOLIO_STATS.monthlyRentAtRisk)],
    ['Readiness Score', `${PORTFOLIO_STATS.readinessScore}/100`],
    ['Need Action', `${PORTFOLIO_STATS.propertiesNeedingAction} properties`],
  ]
  const kpiW = (W - M * 2) / kpis.length
  kpis.forEach((k, i) => {
    const x = M + i * kpiW
    doc.setDrawColor(...BORDER)
    if (i > 0) doc.line(x, y, x, y + 38)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(k[0].toUpperCase(), x + 10, y + 10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...INK)
    doc.text(k[1], x + 10, y + 30)
  })

  y += 64
  divider(doc, M, y, W - M, BORDER)
  y += 26

  // ---- Top 3 risk findings (highest BI exposure) ----
  const byBi = [...PORTFOLIO].sort((a, b) => b.biExposure - a.biExposure).slice(0, 3)
  sectionTitle(doc, 'TOP RISK FINDINGS', M, y, BLUE)
  y += 18
  byBi.forEach((p, i) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...INK)
    doc.text(`${i + 1}.  ${p.name}`, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`${p.city} · ${p.units} units · Flood Zone ${p.floodZone} · ${p.riskLevel} Risk`, M + 14, y + 13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY)
    doc.text(`${money(p.biExposure)} BI exposure`, W - M, y, { align: 'right' })
    y += 30
  })

  y += 6
  divider(doc, M, y, W - M, BORDER)
  y += 26

  // ---- Top 3 mitigation actions by ROI ----
  const byRoi = [...PORTFOLIO].filter((p) => p.totalCapex > 0).sort((a, b) => b.roi - a.roi).slice(0, 3)
  sectionTitle(doc, 'TOP MITIGATION MOVES BY ROI', M, y, BLUE)
  y += 18
  byRoi.forEach((p, i) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...INK)
    doc.text(`${i + 1}.  ${p.name}`, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    const payback = p.payback ? `${p.payback.toFixed(1)}-yr payback` : '—'
    doc.text(
      `${money(p.totalCapex)} capex · ${money(p.totalPremiumSavings)}/yr saved · ${payback} · ${p.highPriorityCount} high-priority`,
      M + 14,
      y + 13
    )
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY)
    doc.text(`${money(p.totalNpv)} 10-yr NPV`, W - M, y, { align: 'right' })
    y += 30
  })

  // ---- Footer ----
  const fy = H - 54
  divider(doc, M, fy, W - M, BORDER)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...INK)
  doc.text('Prepared by ResilienceOS · resilienceos.com · Infither Chowdhury · infitherc@gmail.com', M, fy + 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(
    'Based on sample South Florida portfolio. Contact us to run this analysis on your actual portfolio.',
    M,
    fy + 32
  )

  doc.save('ResilienceOS-Portfolio-Summary.pdf')
}

function sectionTitle(doc, text, x, y, color) {
  doc.setDrawColor(...color)
  doc.setLineWidth(1.5)
  doc.line(x, y - 12, x + 18, y - 12)
  doc.setLineWidth(0.5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...color)
  doc.text(text, x, y)
}

function divider(doc, x1, y, x2, color) {
  doc.setDrawColor(...color)
  doc.setLineWidth(0.7)
  doc.line(x1, y, x2, y)
}

function drawShield(doc, x, y, s) {
  // simple shield outline with checkmark
  doc.setDrawColor(59, 130, 246)
  doc.setFillColor(59, 130, 246)
  const pts = [
    [x + s / 2, y],
    [x + s, y + s * 0.22],
    [x + s, y + s * 0.55],
    [x + s / 2, y + s],
    [x, y + s * 0.55],
    [x, y + s * 0.22],
  ]
  doc.setLineWidth(1.4)
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    doc.line(a[0], a[1], b[0], b[1])
  }
  doc.setLineWidth(1.6)
  doc.line(x + s * 0.32, y + s * 0.48, x + s * 0.45, y + s * 0.6)
  doc.line(x + s * 0.45, y + s * 0.6, x + s * 0.68, y + s * 0.34)
}
