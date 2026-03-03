import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  History,
  Store,
  TrendingUp,
  ShieldCheck,
  Users,
  Sparkles,
  Database,
  Tag,
  Filter,
  BarChart2,
  GitBranch,
  ThumbsUp,
  PieChart,
  AlertTriangle,
  DollarSign,
  Target,
  ListChecks,
  ClipboardList,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  ExternalLink,
  Calendar,
  Trash2,
  Loader2,
  MessageSquare,
  Pencil,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
} from 'lucide-react'
import { Card, CardContent, Badge, Button, cn } from '../components/ui'
import { TRACE_TOOLTIPS } from '../constants/traceTooltips'
import { getOnboardingHistory, deleteOnboardingHistory, submitOnboardingFeedback } from '../services/successMetricsService'

// ─── Label Maps ──────────────────────────────────────────────────────────────

const ARCHETYPE_LABELS: Record<string, string> = {
  SMALL_LOW_COMP: 'Small Focused Catalog',
  SMALL_HIGH_COMP: 'Small Diverse Catalog',
  MID_HIGH_COMP: 'Mid-Size Diverse Catalog',
  MID_LARGE_HIGH_COMP: 'Large Diverse Catalog',
  LARGE_LOW_PRICE: 'Large Value Catalog',
}

const STRATEGY_SOURCE_LABELS: Record<string, string> = {
  successful_matches: 'Similar stores',
  archetype_default: 'Archetype default',
  starter_bundle: 'Starter bundle',
  override_units_signal: 'Cart behavior',
  archetype_subrule_premium_curated: 'Premium curated',
  archetype_subrule_inventory_tail: 'Inventory tail',
  archetype_subrule_cart_builder: 'Cart builder',
}

const BUNDLE_TYPE_LABELS: Record<string, string> = {
  classic: 'Classic Bundle',
  mixAndMatch: 'Mix & Match',
  fixedBundlePrice: 'Fixed Price Bundle',
  tieredDiscount: 'Tiered Discount',
  volumeDiscount: 'Volume Discount',
  addonFreeGift: 'Add-on / Free Gift',
  bxgy: 'Buy X Get Y',
  subscription: 'Subscription',
  MIX_AND_MATCH: 'Mix & Match',
  FIXED_BUNDLE_PRICE: 'Fixed Price Bundle',
  TIERED_DISCOUNT: 'Tiered Discount',
  VOLUME_DISCOUNT: 'Volume Discount',
}

const DATA_RELIABILITY_OPTIONS = [
  { value: '', label: 'All Reliability' },
  { value: 'OK', label: 'OK' },
  { value: 'LOW_SAMPLE', label: 'Low Sample' },
]

const STRATEGY_SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'successful_matches', label: 'Similar stores' },
  { value: 'archetype_default', label: 'Archetype default' },
  { value: 'starter_bundle', label: 'Starter bundle' },
  { value: 'override_units_signal', label: 'Cart behavior' },
  { value: 'archetype_subrule_premium_curated', label: 'Premium curated' },
  { value: 'archetype_subrule_inventory_tail', label: 'Inventory tail' },
  { value: 'archetype_subrule_cart_builder', label: 'Cart builder' },
]

const BUNDLE_TYPE_OPTIONS = [
  { value: '', label: 'All Bundle Types' },
  { value: 'classic', label: 'Classic Bundle' },
  { value: 'mixAndMatch', label: 'Mix & Match' },
  { value: 'fixedBundlePrice', label: 'Fixed Price Bundle' },
  { value: 'tieredDiscount', label: 'Tiered Discount' },
  { value: 'volumeDiscount', label: 'Volume Discount' },
  { value: 'addonFreeGift', label: 'Add-on / Free Gift' },
  { value: 'bxgy', label: 'Buy X Get Y' },
  { value: 'subscription', label: 'Subscription' },
]

// ─── Shop link helper ─────────────────────────────────────────────────────────
function ShopLink({ name, className }: { name: string; className?: string }) {
  if (!name) return <span className={className}>—</span>
  if (name.includes('.myshopify.com')) {
    return (
      <a href={`https://${name}`} target="_blank" rel="noopener noreferrer" className={cn('text-blue-600 dark:text-blue-400 hover:underline', className)}>
        {name}
      </a>
    )
  }
  return <span className={className}>{name}</span>
}

// ─── Helper Formatters ────────────────────────────────────────────────────────

/** Safely converts any unknown API value to a renderable string */
const safeStr = (v: unknown): string => {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

const fmt$ = (n: number | undefined) =>
  n != null ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'

const fmtPct = (n: number | undefined) =>
  n != null ? `${(n * 100).toFixed(1)}%` : '—'

const fmtDate = (iso: string | undefined) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function reliabilityVariant(v: string): 'success' | 'warning' | 'destructive' {
  if (v === 'OK') return 'success'
  if (v === 'LOW_SAMPLE') return 'warning'
  return 'destructive'
}

function bundleTypeVariant(t: string): 'default' | 'secondary' | 'outline' {
  if (t === 'mixAndMatch' || t === 'MIX_AND_MATCH') return 'secondary'
  return 'default'
}

function gradeBadge(grade: string) {
  const map: Record<string, string> = { A: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', B: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', C: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' }
  return <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold', map[grade] ?? 'bg-slate-100 text-slate-600')}>{grade}</span>
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataReliability {
  verdict: string
  flags: string[]
  cleanedMetrics?: {
    totalRevenue60?: number
    totalOrders60?: number
    aov60?: number
    revenueConcentration60?: number
    repeatRate60?: number
    firstTimeAOV60?: number
    repeatAOV60?: number
  }
}

interface BundleDraft {
  mechanism?: string
  products?: { productId: string; title?: string; handle?: string; revenue?: number; grade?: string }[]
  pricingLogic?: { type?: string; tiers?: { quantity: number; discountPercent: number }[]; suggestedBundlePrice?: number; formula?: string; perceivedDiscount?: string }
  reasoning?: string
  selectionRuleTriggered?: string | null
}

interface MatchingStore {
  storeName?: string
  archetypeId?: string
  similarityScore?: number
  matchedOn?: { skuDifference?: number; complementarityDifference?: number; priceDifference?: number }
  ebSuccessTier?: string
  bundleRevenueContribution60?: number
  dominantStrategy?: string
}

interface DecisionTraceStep {
  step: string
  detail: Record<string, unknown>
}

interface Feedback {
  rating: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
  remarks?: string
  updatedAt?: string
}

interface HistoryEntry {
  shopName: string
  industry?: string
  priceBand?: string
  skuCount?: number
  archetypeId?: string
  matchingStores?: MatchingStore[]
  successfulMatchesUsed?: boolean
  successFilterPassCount?: number
  strategySource?: string
  recommendedBundleType?: string
  bundleDraft?: BundleDraft
  dataReliability?: DataReliability
  decisionTrace?: DecisionTraceStep[]
  uiCopy?: Record<string, unknown>
  onboardedAt?: string
  feedback?: Feedback
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ─── Decision Trace Row ───────────────────────────────────────────────────────

const STEP_ICONS: Record<string, React.ReactNode> = {
  STRUCTURAL_JOB: <Store className="w-3.5 h-3.5" />,
  PERFORMANCE_JOB: <TrendingUp className="w-3.5 h-3.5" />,
  ARCHETYPE_ASSIGNMENT: <Tag className="w-3.5 h-3.5" />,
  DATA_RELIABILITY: <ShieldCheck className="w-3.5 h-3.5" />,
  CANDIDATE_POOL: <Database className="w-3.5 h-3.5" />,
  SCORING: <BarChart2 className="w-3.5 h-3.5" />,
  SUCCESS_FILTER: <Filter className="w-3.5 h-3.5" />,
  FINAL_MATCHES: <Users className="w-3.5 h-3.5" />,
  UNITS_PER_ORDER_CHECK: <Package className="w-3.5 h-3.5" />,
  ARCHETYPE_SUBRULES: <GitBranch className="w-3.5 h-3.5" />,
  MATCHES_VOTE: <ThumbsUp className="w-3.5 h-3.5" />,
  ABC_ANALYSIS: <PieChart className="w-3.5 h-3.5" />,
  VIABILITY_CHECK: <AlertTriangle className="w-3.5 h-3.5" />,
  PRODUCT_SELECTION: <ListChecks className="w-3.5 h-3.5" />,
  PRICING: <DollarSign className="w-3.5 h-3.5" />,
  STRATEGY_DECISION: <Target className="w-3.5 h-3.5" />,
}

function TipIcon({ text }: { text?: string }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const iconRef = useRef<HTMLSpanElement>(null)

  if (!text) return null

  const handleEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 })
    }
    setShow(true)
  }

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center"
      >
        <Info className="w-3 h-3 ml-0.5 text-slate-400 dark:text-slate-500 shrink-0" />
      </span>
      {show && (
        <div
          className="fixed px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs leading-relaxed max-w-[260px] w-max whitespace-normal shadow-lg pointer-events-none z-[9999]"
          style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
        >
          {text}
        </div>
      )}
    </>
  )
}

function DecisionTraceDetail({ step, detail }: { step: string; detail: Record<string, unknown> }) {
  const d = detail as Record<string, unknown>
  const tip = (field: string) => TRACE_TOOLTIPS[`${step}.${field}`]
  switch (step) {
    case 'STRUCTURAL_JOB': return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {([['SKU Count', d.skuCount, 'skuCount'], ['Median Price', (d.medianProductPrice ?? d.medianPrice) != null ? fmt$((d.medianProductPrice ?? d.medianPrice) as number) : '—', 'medianProductPrice'], ['Price Band', d.priceBand ?? '—', 'priceBand'], ['Industry', d.industry ?? '—', 'industry'], ['Complementarity', (d.complementarityScore ?? d.comp) != null ? (typeof (d.complementarityScore ?? d.comp) === 'number' ? ((d.complementarityScore ?? d.comp) as number).toFixed(2) : safeStr(d.complementarityScore ?? d.comp)) : '—', 'complementarityScore']] as [string, unknown, string][]).map(([k, v, f]) => (
          <div key={k} className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">{k}<TipIcon text={tip(f)} /></span><span className="font-medium text-slate-800 dark:text-slate-200">{safeStr(v)}</span></div>
        ))}
      </div>
    )
    case 'PERFORMANCE_JOB': return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {([['Method', d.method, 'method'], ['Revenue', (d.totalRevenue60 ?? d.revenue) != null ? fmt$((d.totalRevenue60 ?? d.revenue) as number) : '—', 'totalRevenue60'], ['Orders', d.totalOrders60 ?? d.orders, 'totalOrders60'], ['AOV', (d.aov60 ?? d.aov) != null ? fmt$((d.aov60 ?? d.aov) as number) : '—', 'aov60'], ['Repeat Rate', (d.repeatRate60 ?? d.repeatRate) != null ? fmtPct((d.repeatRate60 ?? d.repeatRate) as number) : '—', 'repeatRate60'], ['Concentration', (d.revenueConcentration60 ?? d.concentration) != null ? fmtPct((d.revenueConcentration60 ?? d.concentration) as number) : '—', 'revenueConcentration60']] as [string, unknown, string][]).map(([k, v, f]) => (
          <div key={k} className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">{k}<TipIcon text={tip(f)} /></span><span className="font-medium">{safeStr(v)}</span></div>
        ))}
      </div>
    )
    case 'ARCHETYPE_ASSIGNMENT': return (
      <div className="space-y-1.5 text-xs">
        <div className="flex gap-4"><span className="text-slate-500 dark:text-slate-400 w-28 inline-flex items-center">Size Bucket<TipIcon text={tip('inputs.sizeBucket')} /></span><span>{String((d.inputs as Record<string, unknown>)?.sizeBucket ?? '—')}</span></div>
        <div className="flex gap-4"><span className="text-slate-500 dark:text-slate-400 w-28 inline-flex items-center">Comp Bucket<TipIcon text={tip('inputs.compBucket')} /></span><span>{String((d.inputs as Record<string, unknown>)?.compBucket ?? '—')}</span></div>
        <div className="flex gap-4"><span className="text-slate-500 dark:text-slate-400 w-28 inline-flex items-center">Result<TipIcon text={tip('result')} /></span><span className="font-semibold">{ARCHETYPE_LABELS[d.result as string] ?? String(d.result ?? '—')}</span></div>
        {d.reasoning != null && <div className="pt-1 text-slate-600 dark:text-slate-400 italic inline-flex items-start">{String(d.reasoning)}<TipIcon text={tip('reasoning')} /></div>}
      </div>
    )
    case 'DATA_RELIABILITY': {
      const r = d as { verdict?: string; flags?: string[]; rawMetrics?: Record<string, unknown>; cleanedMetrics?: Record<string, unknown>; changedMetrics?: string[] }
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Verdict<TipIcon text={tip('verdict')} /></span><Badge variant={r.verdict === 'OK' ? 'success' : 'warning'}>{r.verdict}</Badge></div>
          {r.flags && r.flags.length > 0 && <div><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Flags<TipIcon text={tip('flags')} />: </span><span className="inline-flex flex-wrap gap-1">{r.flags.map((f, i) => <span key={i} className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs">{f}</span>)}</span></div>}
          {Array.isArray(r.changedMetrics) && r.changedMetrics.length > 0 && <div><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Changed<TipIcon text={tip('changedMetrics')} />: </span>{r.changedMetrics.join(', ')}</div>}
        </div>
      )
    }
    case 'CANDIDATE_POOL': return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Total Queried<TipIcon text={tip('totalReferenceQueried')} /></span><span className="font-medium">{String(d.totalReferenceQueried ?? '—')}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Same Archetype<TipIcon text={tip('sameArchetypeCount')} /></span><span className="font-medium">{String(d.sameArchetypeCount ?? '—')}</span></div>
      </div>
    )
    case 'SCORING': {
      const top5 = (d.top5 as { storeName?: string; similarityScore?: number; componentScores?: Record<string, number> }[]) ?? []
      return (
        <div className="space-y-2 text-xs">
          <div><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Candidates scored<TipIcon text={tip('totalCandidatesScored')} />: </span><span className="font-medium">{String(d.totalCandidatesScored ?? '—')}</span></div>
          {top5.length > 0 && <div className="space-y-1">{top5.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded bg-slate-50 dark:bg-slate-800 px-2 py-1">
              <ShopLink name={s.storeName ?? ''} className="truncate max-w-[140px]" />
              <span className="font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center">{s.similarityScore != null ? `${(s.similarityScore * 100).toFixed(0)}%` : '—'}<TipIcon text={tip('similarityScore')} /></span>
            </div>
          ))}</div>}
        </div>
      )
    }
    case 'SUCCESS_FILTER': {
      const sf = d as { candidatesPassedFilter?: boolean; passedCount?: number; thresholds?: Record<string, unknown>; filterActivated?: boolean }
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Filter Active<TipIcon text={tip('filterActivated')} /></span><span>{sf.filterActivated ? 'Yes' : 'No'}</span></div>
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Passed<TipIcon text={tip('passedCount')} /></span><span className="font-medium">{String(sf.passedCount ?? '—')}</span></div>
        </div>
      )
    }
    case 'FINAL_MATCHES': return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Count<TipIcon text={tip('count')} /></span><span className="font-medium">{String(d.count ?? '—')}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Selected From<TipIcon text={tip('selectedFrom')} /></span><span>{String(d.selectedFrom ?? '—')}</span></div>
      </div>
    )
    case 'UNITS_PER_ORDER_CHECK': {
      const u = d as { threePlusShare?: number; threshold?: number; triggered?: boolean }
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">3+ Share<TipIcon text={tip('threePlusShare')} /></span><span>{u.threePlusShare != null ? fmtPct(u.threePlusShare) : '—'}</span></div>
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Threshold<TipIcon text={tip('threshold')} /></span><span>{u.threshold != null ? fmtPct(u.threshold) : '—'}</span></div>
          <div className="flex flex-col col-span-2"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Triggered<TipIcon text={tip('triggered')} /></span><span>{u.triggered ? 'Yes' : 'No'}</span></div>
        </div>
      )
    }
    case 'ARCHETYPE_SUBRULES': {
      const rules = (d.subRules ?? {}) as Record<string, { conditions?: unknown; pass?: boolean }>
      return (
        <div className="space-y-1 text-xs">
          {Object.entries(rules).map(([name, r]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 capitalize">{name.replace(/_/g, ' ')}</span>
              <span className={cn('font-semibold inline-flex items-center', r.pass ? 'text-green-600 dark:text-green-400' : 'text-slate-400')}>{r.pass ? '✓ Pass' : '✗ Skip'}<TipIcon text={tip('pass')} /></span>
            </div>
          ))}
        </div>
      )
    }
    case 'MATCHES_VOTE': {
      const mv = d as { voteTally?: Record<string, number>; winner?: string; voteType?: string }
      return (
        <div className="space-y-2 text-xs">
          {mv.voteTally && <div><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Tally<TipIcon text={tip('voteTally')} />: </span><span className="inline-flex flex-wrap gap-2">{Object.entries(mv.voteTally).map(([k, v]) => <span key={k} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{BUNDLE_TYPE_LABELS[k] ?? k}: <strong>{safeStr(v)}</strong></span>)}</span></div>}
          <div className="flex gap-4">
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Winner<TipIcon text={tip('winner')} /></span><span className="font-semibold">{BUNDLE_TYPE_LABELS[mv.winner ?? ''] ?? mv.winner ?? '—'}</span></div>
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Vote Type<TipIcon text={tip('voteType')} /></span><span>{mv.voteType ?? '—'}</span></div>
          </div>
        </div>
      )
    }
    case 'ABC_ANALYSIS': {
      type GradeVal = number | { count?: number; percentage?: number; revenueThreshold?: number } | undefined
      const abc = d as { totalProducts?: number; gradeDistribution?: Record<string, GradeVal> }
      const gradeCount = (v: GradeVal): string => {
        if (v == null) return '—'
        if (typeof v === 'object') return String(v.count ?? '—')
        return String(v)
      }
      return (
        <div className="flex gap-4 text-xs">
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Total<TipIcon text={tip('totalProducts')} /></span><span className="font-medium">{String(abc.totalProducts ?? '—')}</span></div>
          {abc.gradeDistribution && Object.entries(abc.gradeDistribution).map(([g, c]) => (
            <div key={g} className="flex flex-col items-center">
              <span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Grade {g}<TipIcon text={tip(`gradeDistribution.${g}`)} /></span>
              {gradeBadge(g)}
              <span className="mt-0.5">{gradeCount(c)}</span>
              {typeof c === 'object' && c?.percentage != null && (
                <span className="text-slate-400">{(c.percentage * 100).toFixed(0)}%</span>
              )}
            </div>
          ))}
        </div>
      )
    }
    case 'VIABILITY_CHECK': {
      const vc = d as { validRevenueSKUs?: number; threshold?: number; overridden?: boolean }
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Valid SKUs<TipIcon text={tip('validRevenueSKUs')} /></span><span className="font-medium">{String(vc.validRevenueSKUs ?? '—')}</span></div>
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Threshold<TipIcon text={tip('threshold')} /></span><span>{String(vc.threshold ?? '—')}</span></div>
          <div className="flex flex-col col-span-2"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Overridden<TipIcon text={tip('overridden')} /></span><span>{vc.overridden ? 'Yes' : 'No'}</span></div>
        </div>
      )
    }
    case 'PRODUCT_SELECTION': {
      const ps = d as { rule?: string; productsSelected?: { productId?: string; title?: string; revenue?: number; grade?: string }[]; totalSelected?: number }
      return (
        <div className="space-y-2 text-xs">
          <div className="flex gap-4">
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Rule<TipIcon text={tip('rule')} /></span><span>{ps.rule ?? '—'}</span></div>
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Total<TipIcon text={tip('totalSelected')} /></span><span className="font-medium">{String(ps.totalSelected ?? ps.productsSelected?.length ?? '—')}</span></div>
          </div>
          {ps.productsSelected && ps.productsSelected.length > 0 && (
            <div className="space-y-1">{ps.productsSelected.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-slate-50 dark:bg-slate-800 px-2 py-1">
                {p.grade && <span title={tip('grade')}>{gradeBadge(p.grade)}</span>}
                <span className="truncate flex-1 text-slate-600 dark:text-slate-400" title={p.productId}>{p.title ?? p.productId}</span>
                {p.revenue != null && <span className="font-medium" title={tip('revenue')}>{fmt$(p.revenue)}</span>}
              </div>
            ))}{ps.productsSelected.length > 5 && <div className="text-slate-400 text-center">+{ps.productsSelected.length - 5} more</div>}</div>
          )}
        </div>
      )
    }
    case 'PRICING': {
      const pr = d as { mechanism?: string; formula?: string; suggestedBundlePrice?: number; tiers?: { quantity: number; discountPercent: number }[] }
      return (
        <div className="space-y-2 text-xs">
          <div className="flex gap-4">
            <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Mechanism<TipIcon text={tip('mechanism')} /></span><span className="font-medium">{BUNDLE_TYPE_LABELS[pr.mechanism ?? ''] ?? pr.mechanism ?? '—'}</span></div>
            {pr.formula && <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Formula<TipIcon text={tip('formula')} /></span><span>{pr.formula}</span></div>}
            {pr.suggestedBundlePrice != null && <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Price<TipIcon text={tip('suggestedBundlePrice')} /></span><span className="font-semibold text-green-600 dark:text-green-400">{fmt$(pr.suggestedBundlePrice)}</span></div>}
          </div>
          {pr.tiers && pr.tiers.length > 0 && (
            <div className="space-y-1">{pr.tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-slate-50 dark:bg-slate-800 px-2 py-1">
                <span>Buy <strong>{t.quantity}+</strong></span>
                <span className="text-green-600 dark:text-green-400">save <strong>{t.discountPercent}%</strong></span>
              </div>
            ))}</div>
          )}
        </div>
      )
    }
    case 'STRATEGY_DECISION': {
      const sd = d as { strategySource?: string; recommendedBundleType?: string; mechanism?: string }
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Source<TipIcon text={tip('strategySource')} /></span><span>{STRATEGY_SOURCE_LABELS[sd.strategySource ?? ''] ?? sd.strategySource ?? '—'}</span></div>
          <div className="flex flex-col"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Bundle Type<TipIcon text={tip('recommendedBundleType')} /></span><span className="font-semibold">{BUNDLE_TYPE_LABELS[sd.recommendedBundleType ?? ''] ?? sd.recommendedBundleType ?? '—'}</span></div>
          <div className="flex flex-col col-span-2"><span className="text-slate-500 dark:text-slate-400 inline-flex items-center">Mechanism<TipIcon text={tip('mechanism')} /></span><span>{sd.mechanism ?? '—'}</span></div>
        </div>
      )
    }
    default:
      return <pre className="text-xs bg-slate-100 dark:bg-slate-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(detail, null, 2)}</pre>
  }
}

function DecisionTraceRow({ row }: { row: DecisionTraceStep }) {
  const [open, setOpen] = useState(false)
  const STEP_LABELS: Record<string, string> = {
    STRUCTURAL_JOB: 'Structural Analysis',
    PERFORMANCE_JOB: 'Performance Metrics',
    ARCHETYPE_ASSIGNMENT: 'Archetype Assignment',
    DATA_RELIABILITY: 'Data Reliability',
    CANDIDATE_POOL: 'Candidate Pool',
    SCORING: 'Similarity Scoring',
    SUCCESS_FILTER: 'Success Filter',
    FINAL_MATCHES: 'Final Matches',
    UNITS_PER_ORDER_CHECK: 'Units per Order',
    ARCHETYPE_SUBRULES: 'Archetype Sub-Rules',
    MATCHES_VOTE: 'Strategy Vote',
    ABC_ANALYSIS: 'ABC Analysis',
    VIABILITY_CHECK: 'Viability Check',
    PRODUCT_SELECTION: 'Product Selection',
    PRICING: 'Pricing Logic',
    STRATEGY_DECISION: 'Strategy Decision',
  }
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-slate-500 dark:text-slate-400">{STEP_ICONS[row.step] ?? <ClipboardList className="w-3.5 h-3.5" />}</span>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">{STEP_LABELS[row.step] ?? row.step}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700/50">
          <DecisionTraceDetail step={row.step} detail={row.detail} />
        </div>
      )}
    </div>
  )
}

// ─── Detail Slide-over Panel ──────────────────────────────────────────────────

const RATING_OPTIONS: { value: Feedback['rating']; label: string; icon: React.ReactNode; color: string; badgeVariant: 'success' | 'warning' | 'destructive' }[] = [
  { value: 'CORRECT', label: 'Correct', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 dark:border-green-600', badgeVariant: 'success' },
  { value: 'PARTIALLY_CORRECT', label: 'Partially Correct', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600', badgeVariant: 'warning' },
  { value: 'INCORRECT', label: 'Incorrect', icon: <XCircle className="w-3.5 h-3.5" />, color: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-600', badgeVariant: 'destructive' },
]

function DetailPanel({ entry, onClose, onUpdateEntry }: { entry: HistoryEntry; onClose: () => void; onUpdateEntry: (updated: HistoryEntry) => void }) {
  const [traceOpen, setTraceOpen] = useState(false)
  const dr = entry.dataReliability
  const bd = entry.bundleDraft

  // Feedback state
  const [feedbackEditing, setFeedbackEditing] = useState(!entry.feedback)
  const [feedbackRating, setFeedbackRating] = useState<Feedback['rating'] | null>(entry.feedback?.rating ?? null)
  const [feedbackRemarks, setFeedbackRemarks] = useState(entry.feedback?.remarks ?? '')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const handleFeedbackSubmit = async () => {
    if (!feedbackRating) return
    setFeedbackSubmitting(true)
    setFeedbackError(null)
    try {
      await submitOnboardingFeedback(entry.shopName, { rating: feedbackRating, remarks: feedbackRemarks || undefined })
      const updatedFeedback: Feedback = { rating: feedbackRating, remarks: feedbackRemarks || undefined, updatedAt: new Date().toISOString() }
      onUpdateEntry({ ...entry, feedback: updatedFeedback })
      setFeedbackEditing(false)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (e as { message?: string })?.message ?? 'Failed to submit feedback'
      setFeedbackError(msg)
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold truncate text-sm"><ShopLink name={entry.shopName} /></h2>
            {entry.recommendedBundleType && (
              <Badge variant={bundleTypeVariant(entry.recommendedBundleType)}>
                {BUNDLE_TYPE_LABELS[entry.recommendedBundleType] ?? entry.recommendedBundleType}
              </Badge>
            )}
            {dr && <Badge variant={reliabilityVariant(dr.verdict)}>{dr.verdict}</Badge>}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            {entry.industry && <span>{entry.industry}</span>}
            {entry.priceBand && <><span>·</span><span>{entry.priceBand}</span></>}
            {entry.archetypeId && <><span>·</span><span>{ARCHETYPE_LABELS[entry.archetypeId] ?? entry.archetypeId}</span></>}
            {entry.onboardedAt && <><span>·</span><span>{fmtDate(entry.onboardedAt)}</span></>}
          </div>
        </div>
        <button onClick={onClose} className="ml-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Store Overview */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Store Overview</h3>
          <div className="grid grid-cols-3 gap-2">
            {[['SKU Count', entry.skuCount ?? '—'], ['Price Band', entry.priceBand ?? '—'], ['Similar Stores', entry.matchingStores?.length ?? '—']] .map(([label, val]) => (
              <div key={label as string} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">{String(val)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">Bundle Strategy Recommendation</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.recommendedBundleType && (
              <div className="flex flex-col">
                <span className="text-xs text-blue-700 dark:text-blue-400">Bundle Type</span>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{BUNDLE_TYPE_LABELS[entry.recommendedBundleType] ?? entry.recommendedBundleType}</span>
              </div>
            )}
            {entry.strategySource && (
              <div className="flex flex-col ml-4">
                <span className="text-xs text-blue-700 dark:text-blue-400">Source</span>
                <Badge variant="outline" className="mt-0.5 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs">
                  {STRATEGY_SOURCE_LABELS[entry.strategySource] ?? entry.strategySource}
                </Badge>
              </div>
            )}
          </div>
          {bd?.reasoning && (
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed border-t border-blue-200 dark:border-blue-800 pt-2">{bd.reasoning}</p>
          )}
        </div>

        {/* Data Quality */}
        {dr && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Data Quality</h3>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={reliabilityVariant(dr.verdict)}>{dr.verdict}</Badge>
                {entry.successfulMatchesUsed && <span className="text-xs text-slate-500 dark:text-slate-400">· Success filter applied</span>}
                {entry.successFilterPassCount != null && <span className="text-xs text-slate-500 dark:text-slate-400">({entry.successFilterPassCount} passed)</span>}
              </div>
              {dr.flags && dr.flags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dr.flags.map((f, i) => <span key={i} className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{f}</span>)}
                </div>
              )}
              {dr.cleanedMetrics && (
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  {([
                    ['Orders', String(dr.cleanedMetrics.totalOrders60 ?? '—')],
                    ['Revenue', fmt$(dr.cleanedMetrics.totalRevenue60)],
                    ['AOV', fmt$(dr.cleanedMetrics.aov60)],
                    ['Repeat Rate', dr.cleanedMetrics.repeatRate60 != null ? fmtPct(dr.cleanedMetrics.repeatRate60) : '—'],
                    ['Concentration', fmtPct(dr.cleanedMetrics.revenueConcentration60)],
                    ...(dr.cleanedMetrics.firstTimeAOV60 != null ? [['1st AOV', fmt$(dr.cleanedMetrics.firstTimeAOV60)]] : []),
                    ...(dr.cleanedMetrics.repeatAOV60 != null ? [['Repeat AOV', fmt$(dr.cleanedMetrics.repeatAOV60)]] : []),
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex flex-col"><span className="text-xs text-slate-500 dark:text-slate-400">{k}</span><span className="text-xs font-medium text-slate-700 dark:text-slate-300">{v}</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matching Stores */}
        {entry.matchingStores && entry.matchingStores.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Similar Stores ({entry.matchingStores.length})</h3>
            <div className="space-y-2">
              {entry.matchingStores.map((s, i) => (
                <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate"><ShopLink name={s.storeName ?? ''} /></div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{ARCHETYPE_LABELS[s.archetypeId ?? ''] ?? s.archetypeId}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.dominantStrategy && <Badge variant="outline" className="text-xs">{BUNDLE_TYPE_LABELS[s.dominantStrategy] ?? s.dominantStrategy}</Badge>}
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{s.similarityScore != null ? `${(s.similarityScore * 100).toFixed(0)}%` : '—'}</span>
                    {s.ebSuccessTier && <Badge variant={s.ebSuccessTier === 'strong' ? 'success' : s.ebSuccessTier === 'moderate' ? 'warning' : 'secondary'} className="text-xs capitalize">{s.ebSuccessTier}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bundle Draft */}
        {bd?.products && bd.products.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Suggested Products</h3>
            <div className="space-y-1.5">
              {bd.products.map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                  {p.grade && gradeBadge(p.grade)}
                  {p.handle && entry.shopName ? (
                    <a href={`https://${entry.shopName}/products/${p.handle}`} target="_blank" rel="noopener noreferrer" className="truncate flex-1 text-xs text-blue-600 dark:text-blue-400 hover:underline" title={p.productId} onClick={e => e.stopPropagation()}>{p.title ?? p.productId}</a>
                  ) : (
                    <span className="truncate flex-1 text-xs text-slate-600 dark:text-slate-400" title={p.productId}>{p.title ?? p.productId}</span>
                  )}
                  {p.revenue != null && <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fmt$(p.revenue)} <span className="font-normal text-slate-400">(60D)</span></span>}
                </div>
              ))}
            </div>
            {bd.pricingLogic && (
              <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2 space-y-1">
                <div className="text-xs font-semibold text-green-800 dark:text-green-300">Pricing Suggestion</div>
                <div className="flex flex-wrap gap-4 text-xs text-green-700 dark:text-green-400">
                  {bd.pricingLogic.formula && <span>Formula: <strong>{bd.pricingLogic.formula}</strong></span>}
                  {bd.pricingLogic.suggestedBundlePrice != null && <span>Price: <strong>{fmt$(bd.pricingLogic.suggestedBundlePrice)}</strong></span>}
                  {bd.pricingLogic.perceivedDiscount && <span>Discount: <strong>{bd.pricingLogic.perceivedDiscount}</strong></span>}
                </div>
                {bd.pricingLogic.tiers && bd.pricingLogic.tiers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">{bd.pricingLogic.tiers.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs">Buy {t.quantity}+ → save {t.discountPercent}%</span>
                  ))}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Decision Trace */}
        {entry.decisionTrace && entry.decisionTrace.length > 0 && (
          <div>
            <button
              onClick={() => setTraceOpen(o => !o)}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span>Decision Trace ({entry.decisionTrace.length} steps)</span>
              {traceOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {traceOpen && (
              <div className="space-y-1.5">
                {entry.decisionTrace.map((row, i) => <DecisionTraceRow key={i} row={row} />)}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Feedback
          </h3>

          {!feedbackEditing && entry.feedback ? (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={RATING_OPTIONS.find(r => r.value === entry.feedback!.rating)?.badgeVariant ?? 'outline'} className="inline-flex items-center gap-1">
                  {RATING_OPTIONS.find(r => r.value === entry.feedback!.rating)?.icon}
                  {RATING_OPTIONS.find(r => r.value === entry.feedback!.rating)?.label ?? entry.feedback.rating}
                </Badge>
                <button
                  onClick={() => { setFeedbackEditing(true); setFeedbackRating(entry.feedback!.rating); setFeedbackRemarks(entry.feedback!.remarks ?? '') }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title="Edit feedback"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              {entry.feedback.remarks && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{entry.feedback.remarks}</p>
              )}
              {entry.feedback.updatedAt && (
                <p className="text-xs text-slate-400 dark:text-slate-500">{fmtDate(entry.feedback.updatedAt)}</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
              <div className="flex gap-2">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFeedbackRating(opt.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all',
                      feedbackRating === opt.value
                        ? opt.color
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackRemarks}
                onChange={e => setFeedbackRemarks(e.target.value)}
                placeholder="Optional remarks…"
                rows={2}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {feedbackError && (
                <p className="text-xs text-red-600 dark:text-red-400">{feedbackError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!feedbackRating || feedbackSubmitting}
                  onClick={handleFeedbackSubmit}
                  className="text-xs"
                >
                  {feedbackSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Submit
                </Button>
                {entry.feedback && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setFeedbackEditing(false); setFeedbackRating(entry.feedback!.rating); setFeedbackRemarks(entry.feedback!.remarks ?? '') }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sort Button ──────────────────────────────────────────────────────────────

function SortBtn({ field, current, order, onClick }: { field: string; current: string; order: string; onClick: (f: string) => void }) {
  const active = current === field
  return (
    <button onClick={() => onClick(field)} className="inline-flex items-center gap-0.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
      {active ? (order === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [strategySource, setStrategySource] = useState('')
  const [recommendedBundleType, setRecommendedBundleType] = useState('')
  const [dataReliability, setDataReliability] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('onboardingResult.onboardedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchHistory = useCallback(async (params: {
    page: number; search: string; strategySource: string; recommendedBundleType: string; dataReliability: string; sortBy: string; sortOrder: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getOnboardingHistory({
        page: params.page,
        limit: 20,
        search: params.search || undefined,
        strategySource: params.strategySource || undefined,
        recommendedBundleType: params.recommendedBundleType || undefined,
        dataReliability: params.dataReliability || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder as 'asc' | 'desc',
      })
      // Handle both { data: { entries, pagination } } and { entries, pagination } shapes
      type RawShape = { data?: { entries?: HistoryEntry[]; pagination?: Pagination }; entries?: HistoryEntry[]; pagination?: Pagination }
      const raw = res.data as RawShape
      const d = raw?.data ?? raw
      setEntries(d?.entries ?? [])
      setPagination(d?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (e as { message?: string })?.message ?? 'Failed to load onboarding history'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory({ page, search, strategySource, recommendedBundleType, dataReliability, sortBy, sortOrder })
  }, [page, strategySource, recommendedBundleType, dataReliability, sortBy, sortOrder, fetchHistory]) // search handled separately

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      fetchHistory({ page: 1, search: val, strategySource, recommendedBundleType, dataReliability, sortBy, sortOrder })
    }, 350)
  }

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val)
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) { setSortOrder(o => o === 'desc' ? 'asc' : 'desc') }
    else { setSortBy(field); setSortOrder('desc') }
    setPage(1)
  }

  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (e: React.MouseEvent, shopName: string) => {
    e.stopPropagation()
    if (!confirm(`Delete onboarding result for "${shopName}"? The store profile will be preserved.`)) return
    setDeleting(shopName)
    try {
      await deleteOnboardingHistory(shopName)
      // Remove from list and close detail panel if it was selected
      setEntries(prev => prev.filter(entry => entry.shopName !== shopName))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      if (selectedEntry?.shopName === shopName) setSelectedEntry(null)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (e as { message?: string })?.message ?? 'Failed to delete'
      alert(msg)
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = search || strategySource || recommendedBundleType || dataReliability

  const clearFilters = () => {
    setSearch(''); setStrategySource(''); setRecommendedBundleType(''); setDataReliability(''); setPage(1)
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className={cn('flex-1 min-w-0 flex flex-col gap-4 p-6 transition-all', selectedEntry ? 'mr-[480px]' : '')}>
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Onboarding History</h1>
            {!loading && pagination.total > 0 && (
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-2.5 py-0.5 font-medium">{pagination.total}</span>
            )}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
              <X className="w-3 h-3" /> Clear filters
            </Button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by store name…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {[
            { label: 'All Sources', value: strategySource, options: STRATEGY_SOURCE_OPTIONS, setter: setStrategySource },
            { label: 'All Bundle Types', value: recommendedBundleType, options: BUNDLE_TYPE_OPTIONS, setter: setRecommendedBundleType },
            { label: 'All Reliability', value: dataReliability, options: DATA_RELIABILITY_OPTIONS, setter: setDataReliability },
          ].map(({ label, value, options, setter }) => (
            <div key={label} className="relative">
              <select
                value={value}
                onChange={e => handleFilterChange(setter, e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>
        )}

        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                  {[
                    { label: 'Store', field: 'shopName' },
                    { label: 'Industry', field: 'industry' },
                    { label: 'Archetype', field: 'archetypeId' },
                    { label: 'Recommendation', field: 'recommendedBundleType' },
                    { label: 'Source', field: 'strategySource' },
                    { label: 'Data Quality', field: 'dataReliability' },
                    { label: 'Matches', field: null },
                    { label: 'Onboarded', field: 'onboardingResult.onboardedAt' },
                  ].map(col => (
                    <th key={col.label} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.field && <SortBtn field={col.field} current={sortBy} order={sortOrder} onClick={handleSort} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap w-10">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap w-10" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      <span className="text-sm">Loading history…</span>
                    </div>
                  </td></tr>
                )}
                {!loading && entries.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <History className="w-8 h-8 opacity-30" />
                      <span className="text-sm">{hasFilters ? 'No results match your filters.' : 'No onboarding history yet.'}</span>
                    </div>
                  </td></tr>
                )}
                {!loading && entries.map((entry, i) => {
                  const isSelected = selectedEntry?.shopName === entry.shopName && selectedEntry?.onboardedAt === entry.onboardedAt
                  return (
                    <tr
                      key={`${entry.shopName}-${i}`}
                      onClick={() => setSelectedEntry(isSelected ? null : entry)}
                      className={cn(
                        'border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      )}
                    >
                      {/* Store */}
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[180px]">
                        <div className="truncate text-sm"><ShopLink name={entry.shopName} /></div>
                        {entry.priceBand && <div className="text-xs text-slate-400">{entry.priceBand}</div>}
                      </td>
                      {/* Industry */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[140px]">
                        <div className="truncate text-xs">{entry.industry ?? '—'}</div>
                        {entry.skuCount != null && <div className="text-xs text-slate-400">{entry.skuCount} SKUs</div>}
                      </td>
                      {/* Archetype */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {entry.archetypeId ? (ARCHETYPE_LABELS[entry.archetypeId] ?? entry.archetypeId) : '—'}
                        </span>
                      </td>
                      {/* Recommendation */}
                      <td className="px-4 py-3">
                        {entry.recommendedBundleType
                          ? <Badge variant={bundleTypeVariant(entry.recommendedBundleType)} className="text-xs whitespace-nowrap">{BUNDLE_TYPE_LABELS[entry.recommendedBundleType] ?? entry.recommendedBundleType}</Badge>
                          : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      {/* Source */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {entry.strategySource ? (STRATEGY_SOURCE_LABELS[entry.strategySource] ?? entry.strategySource) : '—'}
                        </span>
                      </td>
                      {/* Data Quality */}
                      <td className="px-4 py-3">
                        {entry.dataReliability
                          ? <Badge variant={reliabilityVariant(entry.dataReliability.verdict)} className="text-xs">{entry.dataReliability.verdict}</Badge>
                          : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      {/* Matches */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{entry.matchingStores?.length ?? '—'}</span>
                      </td>
                      {/* Onboarded At */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3 h-3 opacity-60" />
                          {fmtDate(entry.onboardedAt)}
                        </div>
                      </td>
                      {/* Feedback indicator */}
                      <td className="px-4 py-3 text-center">
                        {entry.feedback ? (
                          <Badge variant={RATING_OPTIONS.find(r => r.value === entry.feedback!.rating)?.badgeVariant ?? 'outline'} className="text-xs inline-flex items-center gap-1">
                            {RATING_OPTIONS.find(r => r.value === entry.feedback!.rating)?.icon}
                            {RATING_OPTIONS.find(r => r.value === entry.feedback!.rating)?.label ?? entry.feedback.rating}
                          </Badge>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600"><MessageSquare className="w-3.5 h-3.5" /></span>
                        )}
                      </td>
                      {/* Delete */}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => handleDelete(e, entry.shopName)}
                          disabled={deleting === entry.shopName}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                          title="Delete onboarding result"
                        >
                          {deleting === entry.shopName
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="w-8 text-xs"
                  >{p}</Button>
                )
              })}
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right slide-over panel */}
      {selectedEntry && (
        <div className="fixed top-0 right-0 h-full w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-40 flex flex-col overflow-hidden">
          <DetailPanel
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onUpdateEntry={(updated) => {
              setSelectedEntry(updated)
              setEntries(prev => prev.map(e => e.shopName === updated.shopName && e.onboardedAt === updated.onboardedAt ? updated : e))
            }}
          />
        </div>
      )}
    </div>
  )
}
