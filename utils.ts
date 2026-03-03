// ─── Currency helpers ────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩', INR: '₹',
  AUD: 'A$', CAD: 'C$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
  NZD: 'NZ$', SGD: 'S$', HKD: 'HK$', MXN: 'MX$', BRL: 'R$', ZAR: 'R',
  TRY: '₺', PLN: 'zł', THB: '฿', IDR: 'Rp', MYR: 'RM', PHP: '₱',
  AED: 'د.إ', SAR: '﷼', ILS: '₪', TWD: 'NT$', CZK: 'Kč', HUF: 'Ft',
  CLP: 'CL$', COP: 'COL$', ARS: 'AR$', VND: '₫', EGP: 'E£', NGN: '₦',
  KES: 'KSh', PKR: '₨', BDT: '৳', UAH: '₴', RON: 'lei', BGN: 'лв',
  HRK: 'kn', ISK: 'kr', RUB: '₽', PEN: 'S/.', QAR: 'QR', KWD: 'KD',
  BHD: 'BD', OMR: 'OMR', JOD: 'JD', LKR: 'Rs',
}

/** Get the symbol for a currency code (defaults to $ if unknown) */
export function currencySymbol(code?: string | null): string {
  if (!code) return '$'
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code
}

/** Human-readable relative time (e.g. "3 hours ago") */
export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── BaaS Utility Functions ─────────────────────────────────────────────────

import type { BaasPipelineRun, EnrichedPipelineRun } from './types'

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`
}

export function formatCurrency(value: number, compact = false, currencyCode?: string): string {
  const sym = currencySymbol(currencyCode)
  if (compact && value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`
  if (compact && value >= 1_000) return `${sym}${(value / 1_000).toFixed(0)}k`
  return `${sym}${value.toLocaleString()}`
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (score >= 6) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export function getScoreTextColor(score: number): string {
  if (score >= 8) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 6) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function getStatusConfig(status: string) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '✅' }
    case 'running':
      return { label: 'Running', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: '⏳' }
    case 'failed':
      return { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '❌' }
    default:
      return { label: status, className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', icon: '—' }
  }
}

export function getPipelineTypeConfig(type: string) {
  switch (type) {
    case 'audit':
      return { label: 'Audit', className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' }
    case 'full-analysis':
    case 'fullAnalysis':
      return { label: 'Full Analysis', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' }
    case 'dataAudit':
      return { label: 'Data Audit', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' }
    default:
      return { label: type, className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' }
  }
}

// ─── Normalised getters that work across both old and new run shapes ──────────

type AnyRun = BaasPipelineRun | EnrichedPipelineRun

export function getRunScore(run: AnyRun): number | null {
  const enriched = run as EnrichedPipelineRun
  return (
    enriched.auditorResults?.overallScore ??
    run.result?.audit?.score ??
    null
  )
}

export function getRunOpportunity(run: AnyRun): number | null {
  const enriched = run as EnrichedPipelineRun
  const v = enriched.analystResults?.moneyLeftOnTable
  if (v == null) return null
  if (typeof v === 'number') return v
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (v as any).totalOpportunity ?? null
}

export function getRunRevenue(run: AnyRun): number | null {
  const enriched = run as EnrichedPipelineRun
  return enriched.analystResults?.dataOverview?.totalRevenue ?? null
}

export function getRunOrderCount(run: AnyRun): number | null {
  const enriched = run as EnrichedPipelineRun
  return enriched.analystResults?.dataOverview?.orderCount ?? null
}

export function getRunVertical(run: AnyRun): string | null {
  const enriched = run as EnrichedPipelineRun
  return enriched.classifierResults?.primaryVertical ?? null
}

export function getRunStrategyCount(run: AnyRun): number | null {
  const enriched = run as EnrichedPipelineRun
  return enriched.strategyResults?.strategies?.length ?? null
}

// ─── Aggregate helpers used by the Dashboard ─────────────────────────────────

export interface DashboardStats {
  totalRuns: number
  completedRuns: number
  failedRuns: number
  runningRuns: number
  successRate: number
  avgScore: number | null
  totalOpportunity: number
  topVertical: string | null
}

export function computeDashboardStats(runs: AnyRun[]): DashboardStats {
  const completed = runs.filter((r) => r.status === 'completed')
  const failed    = runs.filter((r) => r.status === 'failed')
  const running   = runs.filter((r) => r.status === 'running')

  const scores = runs.map(getRunScore).filter((s): s is number => s != null)
  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : null

  const totalOpportunity = runs.reduce((sum, r) => {
    const v = getRunOpportunity(r)
    return sum + (v ?? 0)
  }, 0)

  const verticalCounts: Record<string, number> = {}
  for (const r of runs) {
    const v = getRunVertical(r)
    if (v) verticalCounts[v] = (verticalCounts[v] ?? 0) + 1
  }
  const topVertical = Object.keys(verticalCounts).sort((a, b) => verticalCounts[b] - verticalCounts[a])[0] ?? null

  return {
    totalRuns: runs.length,
    completedRuns: completed.length,
    failedRuns: failed.length,
    runningRuns: running.length,
    successRate: runs.length > 0 ? Math.round((completed.length / runs.length) * 100) : 0,
    avgScore,
    totalOpportunity,
    topVertical,
  }
}
