import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Stethoscope,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plug,
  Package,
  ShoppingCart,
  ShieldCheck,
  Users,
  Sparkles,
  Database,
  TrendingUp,
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
  Gift,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, Badge, Button, cn } from '../components/ui'
import { TRACE_TOOLTIPS } from '../constants/traceTooltips'
import React from 'react'

// ─── Safe render helper ───────────────────────────────────────────────────────
// Converts any unknown API value to a safe React node.
// Strings/numbers/booleans/React elements pass through; plain objects are JSON-stringified.
function safeNode(v: unknown): React.ReactNode {
  if (v == null) return '—'
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v as React.ReactNode
  if (React.isValidElement(v)) return v
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

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

// ─── Label Maps ──────────────────────────────────────────────────────────────

const ARCHETYPE_LABELS: Record<string, string> = {
  SMALL_LOW_COMP: 'Small Focused Catalog',
  SMALL_HIGH_COMP: 'Small Diverse Catalog',
  MID_HIGH_COMP: 'Mid-Size Diverse Catalog',
  MID_LARGE_HIGH_COMP: 'Large Diverse Catalog',
  LARGE_LOW_PRICE: 'Large Value Catalog',
}

const STRATEGY_SOURCE_LABELS: Record<string, string> = {
  successful_matches: 'Based on similar successful stores',
  archetype_default: 'Based on catalog archetype',
  starter_bundle: 'Starter bundle (limited data)',
  override_units_signal: 'Based on cart behavior',
  archetype_subrule_premium_curated: 'Premium curated selection',
  archetype_subrule_inventory_tail: 'Inventory discovery play',
  archetype_subrule_cart_builder: 'Cart builder strategy',
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

function tierBadgeVariant(tier: string): 'success' | 'warning' | 'destructive' {
  if (tier === 'strong') return 'success'
  if (tier === 'moderate') return 'warning'
  return 'destructive'
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

// ─── Step Definitions ────────────────────────────────────────────────────────

type StepStatus = 'pending' | 'active' | 'complete' | 'error'

interface StepDef {
  id: number
  title: string
  subtitle: string
  icon: React.ReactNode
}

const STEP_DEFS: StepDef[] = [
  { id: 1, title: 'Connecting to Store',            subtitle: 'Verifying Shopify access and fetching store data',  icon: <Plug className="w-4 h-4" />        },
  { id: 2, title: 'Analyzing Product Catalog',      subtitle: 'Scanning products, prices, and categories',        icon: <Package className="w-4 h-4" />     },
  { id: 3, title: 'Scanning Order History',          subtitle: 'Analyzing 60 days of order data',                  icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 4, title: 'Data Quality Check',              subtitle: 'Validating data reliability',                      icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 5, title: 'Finding Similar Stores',          subtitle: 'Matching against successful reference stores',     icon: <Users className="w-4 h-4" />       },
  { id: 6, title: 'Bundle Strategy Recommendation',  subtitle: 'Building your personalized bundle strategy',       icon: <Sparkles className="w-4 h-4" />    },
]

// ─── SSE Hook (fetch-based, works regardless of MIME type) ──────────────────

interface SSEStepState {
  status: 'start' | 'complete'
  message: string
  data: any
}

function useOnboardSSE() {
  const [steps, setSteps] = useState<Record<number, SSEStepState>>({})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const start = useCallback(async (shopName: string) => {
    if (!shopName) return

    // Abort any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Reset
    setSteps({})
    setResult(null)
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch(
        `/api/ebCalculateSuccessMetrics/onboardStoreSSE?shopName=${encodeURIComponent(shopName)}`,
        {
          headers: { Accept: 'text/event-stream' },
          signal: controller.signal,
        }
      )

      if (!res.ok) {
        const text = await res.text()
        let msg = `Server error ${res.status}`
        try { msg = JSON.parse(text)?.message ?? msg } catch { /* empty */ }
        setError(msg)
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setError('Streaming not supported')
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // SSE lines are separated by \n\n; each event may span multiple lines
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? '' // keep incomplete chunk

        for (const part of parts) {
          // Extract the data: payload from the event block
          const dataLine = part.split('\n').find((l) => l.startsWith('data:'))
          if (!dataLine) continue
          const raw = dataLine.slice(5).trim()
          try {
            const { step, status, message, data } = JSON.parse(raw)

            if (step === 'done') {
              setResult(data)
              setIsLoading(false)
              reader.cancel()
              return
            }

            if (step === 'error') {
              setError(message ?? 'Unknown error')
              setIsLoading(false)
              reader.cancel()
              return
            }

            const stepNum = typeof step === 'string' ? parseInt(step, 10) : step
            setSteps((prev) => ({
              ...prev,
              [stepNum]: { status, message, data },
            }))
          } catch {
            // Ignore unparseable chunks
          }
        }
      }

      // Stream ended without a "done" event — treat as complete
      setIsLoading(false)
    } catch (err: any) {
      if (err?.name === 'AbortError') return // intentional cancel
      setError(err?.message ?? 'Connection failed')
      setIsLoading(false)
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  return { steps, result, error, isLoading, start, stop }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingDiagnosisPage() {
  const [shopName, setShopName] = useState('')
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [hasStarted, setHasStarted] = useState(false)

  const { steps, result, error, isLoading, start, stop } = useOnboardSSE()

  // Derive step statuses from SSE state
  const stepStatuses: StepStatus[] = STEP_DEFS.map((_, idx) => {
    const stepNum = idx + 1
    const sseStep = steps[stepNum]

    if (error) {
      // Find the step that was in progress when error occurred
      if (sseStep?.status === 'complete') return 'complete'
      if (sseStep?.status === 'start') return 'error'
      // If no SSE data for this step, check if a later step has data (shouldn't happen)
      // Otherwise check if the previous step was complete
      const prevComplete = idx === 0 ? true : steps[idx]?.status === 'complete'
      if (!sseStep && prevComplete && !steps[stepNum]) {
        // This is the step that should've started but didn't — could be the error step
        const anyLaterStarted = STEP_DEFS.slice(idx + 1).some((_, i) => steps[stepNum + 1 + i])
        if (!anyLaterStarted) {
          // Check if the previous step is complete and this is the next in line
          const prevStep = steps[idx]
          if (prevStep?.status === 'complete') return 'error'
        }
      }
      return 'pending'
    }

    if (sseStep?.status === 'complete') return 'complete'
    if (sseStep?.status === 'start') return 'active'
    return 'pending'
  })

  // Auto-expand each step as it completes
  useEffect(() => {
    const completedIdxs = stepStatuses.reduce<number[]>((acc, s, i) => { if (s === 'complete') acc.push(i); return acc }, [])
    if (completedIdxs.length > 0) {
      setExpandedSteps(prev => {
        const next = new Set(prev)
        completedIdxs.forEach(i => next.add(i))
        return next.size === prev.size ? prev : next
      })
    }
  }, [stepStatuses.join(',')])

  // Start diagnosis
  const handleSubmit = () => {
    const trimmed = shopName.trim()
    if (!trimmed) return
    setHasStarted(true)
    setExpandedSteps(new Set())
    start(trimmed)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => stop()
  }, [stop])

  const toggleExpand = (idx: number) => {
    if (stepStatuses[idx] !== 'complete') return
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      return next
    })
  }

  const allDone = result != null && !isLoading

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Stethoscope className="w-6 h-6 text-primary" />
          Store Onboarding Diagnosis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Run a full diagnostic on a store to generate a bundle strategy recommendation
        </p>
      </div>

      {/* ── Input Section ────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) handleSubmit() }}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            />
            <Button onClick={handleSubmit} disabled={isLoading || !shopName.trim()} className="gap-2 px-6">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Stethoscope className="w-4 h-4" />
              )}
              {isLoading ? 'Diagnosing...' : 'Diagnose Store'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Vertical Stepper ─────────────────────────────────── */}
      <div className="relative pl-8">
        {/* Vertical connecting line (background) */}
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
        {/* Animated fill */}
        <div
          className="absolute left-[15px] top-0 w-0.5 bg-primary transition-all duration-700 ease-out"
          style={{
            height: (() => {
              const lastComplete = stepStatuses.lastIndexOf('complete')
              const activeIdx = stepStatuses.findIndex((s) => s === 'active')
              const target = lastComplete >= 0 ? lastComplete : (activeIdx >= 0 ? activeIdx - 0.5 : -1)
              if (target < 0) return '0%'
              const pct = ((target + 1) / STEP_DEFS.length) * 100
              return `${Math.min(pct, 100)}%`
            })(),
          }}
        />

        <div className="space-y-0">
          {STEP_DEFS.map((step, idx) => {
            const status = stepStatuses[idx]
            const isExpanded = expandedSteps.has(idx) && status === 'complete'
            const stepNum = idx + 1
            const sseStep = steps[stepNum]
            const uiStep = getUiCopyForStep(result?.uiCopy, idx)

            // Once uiCopy is available, use its title/subtitle
            const title = uiStep?.title ?? step.title
            const subtitle = status === 'active'
              ? (sseStep?.message ?? step.subtitle)
              : (uiStep?.subtitle ?? step.subtitle)

            return (
              <div key={step.id} className="relative pb-6 last:pb-0">
                {/* Step icon */}
                <div className="absolute -left-8 flex items-center justify-center">
                  <div
                    className={cn(
                      'w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      status === 'complete' && 'bg-green-500 border-green-500 text-white',
                      status === 'active' && 'bg-white dark:bg-slate-900 border-primary text-primary',
                      status === 'pending' && 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400',
                      status === 'error' && 'bg-red-500 border-red-500 text-white',
                    )}
                  >
                    {status === 'complete' && <CheckCircle2 className="w-4 h-4" />}
                    {status === 'active' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {status === 'pending' && <Circle className="w-3.5 h-3.5" />}
                    {status === 'error' && <AlertCircle className="w-4 h-4" />}
                  </div>
                </div>

                {/* Step content */}
                <div
                  className={cn(
                    'rounded-lg border transition-all duration-300',
                    status === 'complete' && 'border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-900/10 cursor-pointer',
                    status === 'active' && 'border-primary/30 bg-primary/5',
                    status === 'pending' && 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 opacity-60',
                    status === 'error' && 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10',
                  )}
                  onClick={() => toggleExpand(idx)}
                >
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className={cn(
                      'text-sm',
                      status === 'complete' && 'text-green-600 dark:text-green-400',
                      status === 'active' && 'text-primary',
                      status === 'pending' && 'text-slate-400',
                      status === 'error' && 'text-red-500',
                    )}>
                      {step.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-semibold',
                        status === 'complete' && 'text-green-800 dark:text-green-300',
                        status === 'active' && 'text-slate-900 dark:text-slate-100',
                        status === 'pending' && 'text-slate-500 dark:text-slate-400',
                        status === 'error' && 'text-red-700 dark:text-red-400',
                      )}>
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                    </div>
                    {status === 'complete' && (
                      isExpanded
                        ? <ChevronDown className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                    )}
                  </div>

                  {/* Expanded detail — prefer uiCopy, fall back to raw SSE data */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-green-200/60 dark:border-green-900/30">
                      {uiStep
                        ? <UiCopyDetail step={uiStep} />
                        : sseStep?.data && <StepDetail stepIdx={idx} stepData={sseStep.data} fullResult={result} shopName={shopName} />}
                    </div>
                  )}

                  {/* Error message */}
                  {status === 'error' && error && (
                    <div className="px-4 pb-3 pt-1 border-t border-red-200/60 dark:border-red-900/30">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bundle Ready summary (from uiCopy step 7) ─────────── */}
      {result?.uiCopy && !isLoading && <BundleReadySummary uiCopy={result.uiCopy} products={result.bundleDraft?.products} shopName={shopName} />}

      {/* ── Full Result + Decision Trace ─────────────────────── */}
      {result && !isLoading && <ResultPanel result={result} />}
    </div>
  )
}

// ─── UiCopy types ────────────────────────────────────────────────────────────

interface UiCopyStat { label: string; value: string | number }
interface UiCopyStep {
  stepKey: string
  stepNumber: number
  title: string
  subtitle: string
  detail?: string
  stats?: UiCopyStat[]
  cta?: string
  status: string
}
interface UiCopyData {
  steps: UiCopyStep[]
  summary?: { headline: string; body: string; valueProposition?: string; cta?: string; bundleTypeLabel?: string }
  bundleType?: string
  bundleTypeLabel?: string
}

// Map uiCopy steps (by stepNumber 1-6) to stepper indices (0-5)
function getUiCopyForStep(uiCopy: UiCopyData | undefined, stepIdx: number): UiCopyStep | undefined {
  if (!uiCopy?.steps) return undefined
  return uiCopy.steps.find(s => s.stepNumber === stepIdx + 1)
}

// ─── UiCopy detail renderer (stats + detail text) ────────────────────────────

function UiCopyDetail({ step }: { step: UiCopyStep }) {
  return (
    <div className="space-y-3">
      {step.detail && (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.detail}</p>
      )}
      {step.stats && step.stats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {step.stats.map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 min-w-[80px]">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">{s.label}</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{String(s.value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Bundle Ready summary (uiCopy step 7 + summary) ─────────────────────────

function BundleReadySummary({ uiCopy, products, shopName }: { uiCopy: UiCopyData; products?: { productId: string; title?: string; handle?: string; revenue?: number; grade?: string }[]; shopName?: string }) {
  const bundleStep = uiCopy.steps.find(s => s.stepKey === 'bundle_ready')
  const summary = uiCopy.summary
  if (!bundleStep && !summary) return null

  return (
    <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
          {bundleStep?.title ?? 'Your bundle is ready'}
        </span>
        {uiCopy.bundleTypeLabel && (
          <Badge variant="success" className="text-xs">{uiCopy.bundleTypeLabel}</Badge>
        )}
      </div>
      {(summary?.headline ?? bundleStep?.subtitle) && (
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 leading-snug">
          {summary?.headline ?? bundleStep?.subtitle}
        </p>
      )}
      {(summary?.body ?? bundleStep?.detail) && (
        <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
          {summary?.body ?? bundleStep?.detail}
        </p>
      )}
      {summary?.valueProposition && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">{summary.valueProposition}</p>
      )}
      {products && products.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-1.5">Products ({products.length})</p>
          <div className="space-y-1">
            {products.map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/30 px-3 py-1.5">
                {p.grade && (
                  <Badge variant={p.grade === 'A' ? 'success' : p.grade === 'B' ? 'warning' : 'destructive'} className="text-[10px]">{p.grade}</Badge>
                )}
                {p.handle && shopName ? (
                  <a href={`https://${shopName}/products/${p.handle}`} target="_blank" rel="noopener noreferrer" className="truncate flex-1 text-xs text-emerald-700 dark:text-emerald-300 hover:underline" title={p.productId}>{p.title ?? p.productId}</a>
                ) : (
                  <span className="truncate flex-1 text-xs text-emerald-700 dark:text-emerald-300" title={p.productId}>{p.title ?? p.productId}</span>
                )}
                {p.revenue != null && <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{fmtCurrency(p.revenue)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {bundleStep?.stats && bundleStep.stats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {bundleStep.stats.map((s) => (
            <div key={s.label} className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 px-3 py-2 min-w-[80px]">
              <div className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-500 font-semibold">{s.label}</div>
              <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">{String(s.value)}</div>
            </div>
          ))}
        </div>
      )}
      {(summary?.cta ?? bundleStep?.cta) && (
        <Button className="gap-2 mt-1">
          <ExternalLink className="w-4 h-4" />
          {summary?.cta ?? bundleStep?.cta}
        </Button>
      )}
    </div>
  )
}


// ─── Result Panel ─────────────────────────────────────────────────────────────

function ResultPanel({ result }: { result: any }) {
  const recType = result.recommendedBundleType
  const source = result.strategySource
  const reliability = result.dataReliability?.verdict ?? result.dataReliability
  const flags: string[] = result.dataReliability?.flags ?? result.reliabilityFlags ?? []
  const matchCount = result.matchingStores?.length ?? 0
  const successFilterPassCount = result.successFilterPassCount
  const trace: { step: string; detail: any }[] = result.decisionTrace ?? []

  return (
    <div className="space-y-4">
      {/* ── Summary banner ── */}
      <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Onboarding Result</h2>
          {result.onboardedAt && (
            <span className="ml-auto text-[10px] text-slate-400">
              {new Date(result.onboardedAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="Recommendation"
            value={BUNDLE_TYPE_LABELS[recType] ?? recType ?? '—'}
            highlight
          />
          <SummaryCard
            label="Strategy Source"
            value={STRATEGY_SOURCE_LABELS[source] ?? source ?? '—'}
          />
          <SummaryCard
            label="Data Reliability"
            value={reliability ?? '—'}
            badge={reliability === 'OK' ? 'success' : 'warning'}
          />
          <SummaryCard
            label="Similar Stores"
            value={`${matchCount} found${successFilterPassCount != null ? ` (${successFilterPassCount} high-tier)` : ''}`}
          />
        </div>
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {flags.map((f, i) => (
              <Badge key={i} variant="warning" className="text-[10px] font-normal">{f}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Decision Trace ── */}
      {trace.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Decision Trace
            </h3>
            <span className="text-xs text-slate-400">({trace.length} steps)</span>
          </div>
          <div className="space-y-1.5">
            {trace.map((entry, i) => (
              <TraceRow key={i} index={i} step={entry.step} detail={entry.detail} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, highlight, badge }: { label: string; value: string; highlight?: boolean; badge?: 'success' | 'warning' }) {
  return (
    <div className={cn(
      'rounded-lg p-3 border',
      highlight
        ? 'border-primary/40 bg-white dark:bg-slate-900'
        : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60',
    )}>
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {badge ? (
        <Badge variant={badge} className="text-xs">{value}</Badge>
      ) : (
        <p className={cn('text-xs font-semibold leading-tight', highlight && 'text-primary')}>
          {value}
        </p>
      )}
    </div>
  )
}

// ─── Trace row config ─────────────────────────────────────────────────────────

const TRACE_STEP_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  STRUCTURAL_JOB:        { icon: <Database className="w-3.5 h-3.5" />,    label: 'Structural Analysis',      color: 'text-blue-500' },
  PERFORMANCE_JOB:       { icon: <TrendingUp className="w-3.5 h-3.5" />,  label: 'Performance Metrics',      color: 'text-teal-500' },
  ARCHETYPE_ASSIGNMENT:  { icon: <Target className="w-3.5 h-3.5" />,      label: 'Archetype Assignment',     color: 'text-indigo-500' },
  DATA_RELIABILITY:      { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Data Reliability',         color: 'text-green-500' },
  CANDIDATE_POOL:        { icon: <Users className="w-3.5 h-3.5" />,       label: 'Candidate Pool',           color: 'text-slate-500' },
  SCORING:               { icon: <BarChart2 className="w-3.5 h-3.5" />,   label: 'Store Scoring',            color: 'text-purple-500' },
  SUCCESS_FILTER:        { icon: <Filter className="w-3.5 h-3.5" />,      label: 'Success Filter',           color: 'text-amber-500' },
  FINAL_MATCHES:         { icon: <CheckCircle2 className="w-3.5 h-3.5" />,label: 'Final Matches',            color: 'text-green-600' },
  UNITS_PER_ORDER_CHECK: { icon: <ShoppingCart className="w-3.5 h-3.5" />,label: 'Units Per Order Check',    color: 'text-orange-500' },
  ARCHETYPE_SUBRULES:    { icon: <GitBranch className="w-3.5 h-3.5" />,   label: 'Archetype Subrules',       color: 'text-pink-500' },
  MATCHES_VOTE:          { icon: <ThumbsUp className="w-3.5 h-3.5" />,    label: 'Matches Vote',             color: 'text-violet-500' },
  ABC_ANALYSIS:          { icon: <PieChart className="w-3.5 h-3.5" />,    label: 'ABC Product Analysis',     color: 'text-cyan-500' },
  VIABILITY_CHECK:       { icon: <AlertTriangle className="w-3.5 h-3.5" />,label: 'Viability Check',         color: 'text-yellow-500' },
  PRODUCT_SELECTION:     { icon: <Package className="w-3.5 h-3.5" />,     label: 'Product Selection',        color: 'text-slate-600' },
  PRICING:               { icon: <DollarSign className="w-3.5 h-3.5" />,  label: 'Pricing Logic',            color: 'text-emerald-500' },
  STRATEGY_DECISION:     { icon: <Sparkles className="w-3.5 h-3.5" />,    label: 'Strategy Decision',        color: 'text-primary' },
}

// ─── Trace Row ────────────────────────────────────────────────────────────────

function TraceRow({ index, step, detail }: { index: number; step: string; detail: any }) {
  const [open, setOpen] = useState(false)
  const meta = TRACE_STEP_META[step] ?? { icon: <Tag className="w-3.5 h-3.5" />, label: step, color: 'text-slate-400' }
  const isDecision = step === 'STRATEGY_DECISION'

  return (
    <div className={cn(
      'rounded-lg border transition-colors',
      isDecision
        ? 'border-primary/40 bg-primary/5'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50',
    )}>
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-[10px] font-mono text-slate-400 w-5 shrink-0">{String(index + 1).padStart(2, '0')}</span>
        <span className={cn('shrink-0', meta.color)}>{meta.icon}</span>
        <span className={cn('flex-1 text-xs font-semibold', isDecision ? 'text-primary' : 'text-slate-700 dark:text-slate-300')}>
          {meta.label}
        </span>
        <TraceRowSummary step={step} detail={detail} />
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800">
          <TraceDetail step={step} detail={detail} />
        </div>
      )}
    </div>
  )
}

// ─── Inline summary shown in collapsed row ────────────────────────────────────

function TraceRowSummary({ step, detail }: { step: string; detail: any }) {
  if (!detail) return null
  const cls = 'text-[10px] text-slate-500 dark:text-slate-400 mr-1'

  switch (step) {
    case 'STRUCTURAL_JOB':
      return <span className={cls}>{safeNode(detail.skuCount)} SKUs · {safeNode(detail.industry)}</span>
    case 'PERFORMANCE_JOB':
      return <span className={cls}>{safeNode(detail.totalOrders60 ?? detail.orders)} orders · ${(detail.totalRevenue60 ?? detail.revenue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
    case 'ARCHETYPE_ASSIGNMENT':
      return <span className={cls}>{ARCHETYPE_LABELS[detail.result] ?? safeNode(detail.result)}</span>
    case 'DATA_RELIABILITY':
      return <Badge variant={detail.verdict === 'OK' ? 'success' : 'warning'} className="text-[9px] mr-1">{String(detail.verdict ?? '—')}</Badge>
    case 'CANDIDATE_POOL':
      return <span className={cls}>{safeNode(detail.totalReferenceQueried)} candidates</span>
    case 'SCORING':
      return <span className={cls}>{safeNode(detail.totalCandidatesScored)} scored</span>
    case 'SUCCESS_FILTER':
      return <Badge variant={detail.filterActivated ? 'success' : 'outline'} className="text-[9px] mr-1">{detail.filterActivated ? `${detail.passedCount} passed` : 'not applied'}</Badge>
    case 'FINAL_MATCHES':
      return <span className={cls}>{safeNode(detail.count)} matches from {safeNode(detail.selectedFrom)}</span>
    case 'UNITS_PER_ORDER_CHECK':
      return <Badge variant={detail.triggered ? 'warning' : 'outline'} className="text-[9px] mr-1">{detail.triggered ? 'triggered' : 'not triggered'}</Badge>
    case 'ARCHETYPE_SUBRULES':
      return <span className={cls}>{Object.keys(detail.subRules ?? {}).length} rules checked</span>
    case 'MATCHES_VOTE':
      return <span className={cls}>{BUNDLE_TYPE_LABELS[detail.winner] ?? safeNode(detail.winner)} wins</span>
    case 'ABC_ANALYSIS': {
      const gradeN = (v: unknown): string => String(v != null && typeof v === 'object' ? (v as Record<string, unknown>).count ?? 0 : v ?? 0)
      return <span className={cls}>A:{gradeN(detail.gradeDistribution?.A)} B:{gradeN(detail.gradeDistribution?.B)} C:{gradeN(detail.gradeDistribution?.C)}</span>
    }
    case 'VIABILITY_CHECK':
      return <Badge variant={detail.overridden ? 'warning' : 'success'} className="text-[9px] mr-1">{detail.overridden ? 'overridden' : 'ok'}</Badge>
    case 'PRODUCT_SELECTION':
      return <span className={cls}>{safeNode(detail.totalSelected)} products selected</span>
    case 'PRICING':
      return <span className={cls}>{safeNode(detail.mechanism)} · {safeNode(detail.formula)}</span>
    case 'STRATEGY_DECISION':
      return <Badge variant="success" className="text-[9px] mr-1">{BUNDLE_TYPE_LABELS[detail.recommendedBundleType] ?? safeNode(detail.recommendedBundleType)}</Badge>
    default:
      return null
  }
}

// ─── Expanded trace detail ────────────────────────────────────────────────────

function TraceDetail({ step, detail }: { step: string; detail: any }) {
  if (!detail) return <p className="text-xs text-slate-500 mt-2">No detail available</p>

  const tip = (field: string) => TRACE_TOOLTIPS[`${step}.${field}`]

  const Row = ({ label, value, field }: { label: string; value: React.ReactNode; field?: string }) => (
    <div className="flex items-baseline gap-2 text-xs py-0.5">
      <span className="text-slate-400 dark:text-slate-500 w-40 shrink-0 cursor-help" title={field ? tip(field) : undefined}>{label}</span>
      <span className="text-slate-800 dark:text-slate-200 font-medium">{safeNode(value)}</span>
    </div>
  )

  switch (step) {
    case 'STRUCTURAL_JOB':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="SKU count" field="skuCount" value={detail.skuCount} />
          <Row label="Median price" field="medianProductPrice" value={(detail.medianProductPrice ?? detail.medianPrice) != null ? fmtCurrency(detail.medianProductPrice ?? detail.medianPrice) : '—'} />
          <Row label="Price band" field="priceBand" value={detail.priceBand ?? '—'} />
          <Row label="Industry" field="industry" value={detail.industry ?? '—'} />
          <Row label="Complementarity" field="complementarityScore" value={(detail.complementarityScore ?? detail.comp) != null ? fmtPct(detail.complementarityScore ?? detail.comp) : '—'} />
        </div>
      )

    case 'PERFORMANCE_JOB':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="Method" field="method" value={detail.method ?? '—'} />
          <Row label="Revenue (60d)" field="totalRevenue60" value={(detail.totalRevenue60 ?? detail.revenue) != null ? fmtCurrency(detail.totalRevenue60 ?? detail.revenue) : '—'} />
          <Row label="Orders (60d)" field="totalOrders60" value={detail.totalOrders60 ?? detail.orders ?? '—'} />
          <Row label="AOV" field="aov60" value={(detail.aov60 ?? detail.aov) != null ? '$' + Number(detail.aov60 ?? detail.aov).toFixed(2) : '—'} />
          <Row label="Repeat rate" field="repeatRate60" value={(detail.repeatRate60 ?? detail.repeatRate) != null ? fmtPct(detail.repeatRate60 ?? detail.repeatRate) : '—'} />
          <Row label="Revenue concentration" field="revenueConcentration60" value={(detail.revenueConcentration60 ?? detail.concentration) != null ? fmtPct(detail.revenueConcentration60 ?? detail.concentration) : '—'} />
        </div>
      )

    case 'ARCHETYPE_ASSIGNMENT':
      return (
        <div className="mt-2 space-y-0.5">
          {detail.inputs && (
            <>
              <Row label="Size bucket" field="inputs.sizeBucket" value={detail.inputs.sizeBucket ?? '—'} />
              <Row label="Comp bucket" field="inputs.compBucket" value={detail.inputs.compBucket ?? '—'} />
            </>
          )}
          <Row label="Archetype" field="result" value={ARCHETYPE_LABELS[detail.result] ?? detail.result ?? '—'} />
          {detail.reasoning && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed" title={tip('reasoning')}>{detail.reasoning}</p>
          )}
        </div>
      )

    case 'DATA_RELIABILITY': {
      const flagList: string[] = detail.flags ?? []
      const changed: string[] = Array.isArray(detail.changedMetrics) ? detail.changedMetrics : []
      return (
        <div className="mt-2 space-y-2">
          <Row label="Verdict" field="verdict" value={<Badge variant={detail.verdict === 'OK' ? 'success' : 'warning'}>{detail.verdict}</Badge>} />
          {flagList.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 cursor-help" title={tip('flags')}>Flags</p>
              <div className="flex flex-wrap gap-1">
                {flagList.map((f, i) => <Badge key={i} variant="warning" className="text-[10px] font-normal">{f}</Badge>)}
              </div>
            </div>
          )}
          {detail.cleanedMetrics && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 cursor-help" title={tip('cleanedMetrics')}>Cleaned Metrics</p>
              <Row label="Revenue" value={fmtCurrency(detail.cleanedMetrics.totalRevenue60 ?? 0)} />
              <Row label="Orders" value={detail.cleanedMetrics.totalOrders60 ?? '—'} />
              <Row label="AOV" value={detail.cleanedMetrics.aov60 != null ? '$' + Number(detail.cleanedMetrics.aov60).toFixed(2) : '—'} />
            </div>
          )}
          {changed.length > 0 && (
            <Row label="Changed metrics" field="changedMetrics" value={changed.join(', ')} />
          )}
          {detail.outlierDetails && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Outlier Details</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{JSON.stringify(detail.outlierDetails)}</p>
            </div>
          )}
        </div>
      )
    }

    case 'CANDIDATE_POOL':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="Total queried" field="totalReferenceQueried" value={detail.totalReferenceQueried ?? '—'} />
          <Row label="Same archetype" field="sameArchetypeCount" value={detail.sameArchetypeCount ?? '—'} />
        </div>
      )

    case 'SCORING': {
      const top5: any[] = detail.top5 ?? []
      return (
        <div className="mt-2 space-y-2">
          <Row label="Candidates scored" field="totalCandidatesScored" value={detail.totalCandidatesScored ?? '—'} />
          {top5.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Top {top5.length}</p>
              <div className="space-y-1.5">
                {top5.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <ShopLink name={s.storeName ?? ''} className="font-medium truncate max-w-[160px]" />
                    <Badge variant="outline" className="text-[9px]" title={tip('similarityScore')}>{((s.similarityScore ?? 0) * 100).toFixed(0)}%</Badge>
                    {s.componentScores && (
                      <span className="text-slate-400 text-[10px]">
                        <span title={tip('componentScores.archetype')}>arch:{((s.componentScores.archetype ?? 0) * 100).toFixed(0)}</span>{' '}
                        <span title={tip('componentScores.skuSimilarity')}>sku:{((s.componentScores.skuSimilarity ?? 0) * 100).toFixed(0)}</span>{' '}
                        <span title={tip('componentScores.priceSimilarity')}>price:{((s.componentScores.priceSimilarity ?? 0) * 100).toFixed(0)}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    case 'SUCCESS_FILTER':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="Filter activated" field="filterActivated" value={<Badge variant={detail.filterActivated ? 'success' : 'outline'}>{detail.filterActivated ? 'Yes' : 'No'}</Badge>} />
          <Row label="Passed count" field="passedCount" value={detail.passedCount ?? '—'} />
          {detail.thresholds && (
            <Row label="Thresholds" field="thresholds" value={
              Object.entries(detail.thresholds).map(([k, v]) => `${k}: ${v}`).join(' · ')
            } />
          )}
        </div>
      )

    case 'FINAL_MATCHES': {
      const matches: any[] = detail.matches ?? []
      return (
        <div className="mt-2 space-y-2">
          <Row label="Count" field="count" value={detail.count ?? matches.length} />
          <Row label="Selected from" field="selectedFrom" value={detail.selectedFrom ?? '—'} />
          {matches.length > 0 && (
            <div className="space-y-1.5">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <ShopLink name={m.storeName ?? m.shopName ?? ''} className="font-medium truncate max-w-[160px]" />
                  <Badge variant="outline" className="text-[9px]" title={tip('similarityScore')}>{((m.similarityScore ?? 0) * 100).toFixed(0)}%</Badge>
                  {m.ebSuccessTier && <Badge variant={tierBadgeVariant(m.ebSuccessTier)} className="text-[9px]" title={tip('ebSuccessTier')}>{m.ebSuccessTier}</Badge>}
                  {m.dominantStrategy && (
                    <span className="text-slate-500" title={tip('dominantStrategy')}>{BUNDLE_TYPE_LABELS[m.dominantStrategy] ?? m.dominantStrategy}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'UNITS_PER_ORDER_CHECK':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="3+ item share" field="threePlusShare" value={detail.threePlusShare != null ? fmtPct(detail.threePlusShare) : '—'} />
          <Row label="Threshold" field="threshold" value={detail.threshold != null ? fmtPct(detail.threshold) : '—'} />
          <Row label="Triggered" field="triggered" value={<Badge variant={detail.triggered ? 'warning' : 'outline'}>{detail.triggered ? 'Yes' : 'No'}</Badge>} />
        </div>
      )

    case 'ARCHETYPE_SUBRULES': {
      const subRules = detail.subRules ?? {}
      return (
        <div className="mt-2 space-y-2">
          {Object.entries(subRules).map(([ruleName, rule]: [string, any]) => (
            <div key={ruleName} className="rounded border border-slate-100 dark:border-slate-800 p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">{ruleName.replace(/_/g, ' ')}</span>
                <Badge variant={rule.pass ? 'success' : 'outline'} className="text-[9px]" title={tip('pass')}>{rule.pass ? 'PASS' : 'FAIL'}</Badge>
              </div>
              {rule.conditions && (
                <div className="space-y-0.5">
                  {Object.entries(rule.conditions).map(([k, v]) => (
                    <p key={k} className="text-[10px] text-slate-500" title={tip('conditions')}>{k}: {String(v)}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    case 'MATCHES_VOTE': {
      const tally = detail.voteTally ?? {}
      return (
        <div className="mt-2 space-y-2">
          <Row label="Vote type" field="voteType" value={detail.voteType ?? '—'} />
          <Row label="Winner" field="winner" value={<span className="font-semibold text-primary">{BUNDLE_TYPE_LABELS[detail.winner] ?? detail.winner ?? '—'}</span>} />
          {Object.keys(tally).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 cursor-help" title={tip('voteTally')}>Vote Tally</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(tally).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-1">
                    <Badge variant={type === detail.winner ? 'success' : 'outline'} className="text-[10px]">
                      {BUNDLE_TYPE_LABELS[type] ?? type}
                    </Badge>
                    <span className="text-xs text-slate-500">{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    case 'ABC_ANALYSIS':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="Total products" field="totalProducts" value={detail.totalProducts ?? '—'} />
          {detail.gradeDistribution && (() => {
            const gradeN = (v: unknown) => (v != null && typeof v === 'object' ? (v as Record<string, unknown>).count ?? 0 : v ?? 0)
            return (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="text-[10px] cursor-help" title={tip('gradeDistribution.A')}>A: {String(gradeN(detail.gradeDistribution.A))}</Badge>
                <Badge variant="warning" className="text-[10px] cursor-help" title={tip('gradeDistribution.B')}>B: {String(gradeN(detail.gradeDistribution.B))}</Badge>
                <Badge variant="destructive" className="text-[10px] cursor-help" title={tip('gradeDistribution.C')}>C: {String(gradeN(detail.gradeDistribution.C))}</Badge>
              </div>
            )
          })()}
        </div>
      )

    case 'VIABILITY_CHECK':
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="Valid revenue SKUs" field="validRevenueSKUs" value={detail.validRevenueSKUs ?? '—'} />
          <Row label="Threshold" field="threshold" value={detail.threshold ?? '—'} />
          <Row label="Overridden" field="overridden" value={<Badge variant={detail.overridden ? 'warning' : 'success'}>{detail.overridden ? 'Yes' : 'No'}</Badge>} />
        </div>
      )

    case 'PRODUCT_SELECTION': {
      const prods: any[] = detail.productsSelected ?? []
      return (
        <div className="mt-2 space-y-2">
          <Row label="Rule" field="rule" value={detail.rule ?? '—'} />
          <Row label="Total selected" field="totalSelected" value={detail.totalSelected ?? prods.length} />
          {prods.length > 0 && (
            <div className="space-y-1">
              {prods.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-500 w-24 truncate" title={tip('productId')}>{p.productId}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300" title={tip('revenue')}>{p.revenue != null ? fmtCurrency(p.revenue) : '—'}</span>
                  {p.grade && (
                    <Badge variant={p.grade === 'A' ? 'success' : p.grade === 'B' ? 'warning' : 'destructive'} className="text-[9px]" title={tip('grade')}>
                      {p.grade}
                    </Badge>
                  )}
                </div>
              ))}
              {prods.length > 8 && <p className="text-[10px] text-slate-400">+{prods.length - 8} more</p>}
            </div>
          )}
        </div>
      )
    }

    case 'PRICING': {
      const tiers: any[] = detail.tiers ?? []
      return (
        <div className="mt-2 space-y-0.5">
          <Row label="Mechanism" field="mechanism" value={BUNDLE_TYPE_LABELS[detail.mechanism] ?? detail.mechanism ?? '—'} />
          {detail.formula && <Row label="Formula" field="formula" value={detail.formula} />}
          {detail.suggestedBundlePrice != null && <Row label="Suggested price" field="suggestedBundlePrice" value={fmtCurrency(detail.suggestedBundlePrice)} />}
          {tiers.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tiers</p>
              {tiers.map((t, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-300">
                  <span title={tip('tiers.quantity')}>{t.quantity}+</span> → <span title={tip('tiers.discountPercent')}>{t.discountPercent ?? t.percentOff}% off</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'STRATEGY_DECISION':
      return (
        <div className="mt-2 space-y-1.5">
          <Row label="Recommended type" field="recommendedBundleType" value={
            <span className="font-bold text-primary text-sm">
              {BUNDLE_TYPE_LABELS[detail.recommendedBundleType] ?? detail.recommendedBundleType ?? '—'}
            </span>
          } />
          <Row label="Strategy source" field="strategySource" value={
            <Badge variant="blue" className="text-[10px]">
              {STRATEGY_SOURCE_LABELS[detail.strategySource] ?? detail.strategySource ?? '—'}
            </Badge>
          } />
          <Row label="Mechanism" field="mechanism" value={BUNDLE_TYPE_LABELS[detail.mechanism] ?? detail.mechanism ?? '—'} />
        </div>
      )

    default:
      return (
        <pre className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded p-2 overflow-auto max-h-40">
          {JSON.stringify(detail, null, 2)}
        </pre>
      )
  }
}

// ─── Step Detail Renderers ───────────────────────────────────────────────────

function StepDetail({ stepIdx, stepData, fullResult, shopName }: { stepIdx: number; stepData: any; fullResult: any; shopName?: string }) {
  switch (stepIdx) {
    case 0: return <Step1Detail data={stepData} />
    case 1: return <Step2Detail data={stepData} fullResult={fullResult} />
    case 2: return <Step3Detail data={stepData} />
    case 3: return <Step4Detail data={stepData} />
    case 4: return <Step5Detail data={stepData} />
    case 5: return <Step6Detail data={stepData} fullResult={fullResult} shopName={shopName} />
    default: return null
  }
}

// ─ Step 1: Connecting ───────────────────────────────────────────────────────

function Step1Detail({ data }: { data: any }) {
  return (
    <div className="space-y-1.5">
      <DetailRow label="Store" value={<ShopLink name={data?.shopName ?? ''} />} />
    </div>
  )
}

// ─ Step 2: Catalog ──────────────────────────────────────────────────────────

function Step2Detail({ data, fullResult }: { data: any; fullResult: any }) {
  if (!data) return <p className="text-xs text-slate-500">No catalog data</p>

  // archetype may come from step data or from the ARCHETYPE_ASSIGNMENT trace step in the final result
  const archId = data.archetype?.id
    ?? fullResult?.decisionTrace?.find((t: any) => t.step === 'ARCHETYPE_ASSIGNMENT')?.detail?.result
  const archLabel = archId ? (ARCHETYPE_LABELS[archId] ?? archId) : '—'

  return (
    <div className="space-y-1.5">
      <DetailRow label="Products found" value={data.skuCount?.toLocaleString() ?? '—'} />
      <DetailRow label="Median price" value={data.medianProductPrice != null ? fmtCurrency(data.medianProductPrice) : '—'} />
      <DetailRow label="Industry" value={data.industry ?? '—'} />
      {data.priceBand && <DetailRow label="Price band" value={data.priceBand} />}
      <DetailRow label="Archetype" value={archLabel} />
    </div>
  )
}

// ─ Step 3: Orders ───────────────────────────────────────────────────────────

function Step3Detail({ data }: { data: any }) {
  if (!data) return <p className="text-xs text-slate-500">No order data</p>

  return (
    <div className="space-y-1.5">
      <DetailRow label="Orders analyzed" value={data.totalOrders60?.toLocaleString() ?? '—'} />
      <DetailRow label="Revenue" value={data.totalRevenue60 != null ? fmtCurrency(data.totalRevenue60) : '—'} />
      <DetailRow label="AOV" value={data.aov60 != null ? '$' + data.aov60.toFixed(2) : '—'} />
      <DetailRow label="Repeat rate" value={data.repeatRate60 != null ? fmtPct(data.repeatRate60) : '—'} />
    </div>
  )
}

// ─ Step 4: Data Quality ─────────────────────────────────────────────────────

function Step4Detail({ data }: { data: any }) {
  if (!data) return <p className="text-xs text-slate-500">No quality data</p>

  const reliability = data.dataReliability
  const flags: string[] = data.flags ?? []

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
        <Badge variant={reliability === 'OK' ? 'success' : 'warning'}>
          {String(reliability ?? '—')}
        </Badge>
      </div>
      {flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {flags.map((f, i) => (
            <Badge key={i} variant="warning" className="text-[10px] font-normal">
              {f}
            </Badge>
          ))}
        </div>
      )}
      {reliability === 'LOW_SAMPLE' && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Limited data — recommendation will be catalog-based
        </p>
      )}
      {/* Show cleaned metrics if present */}
      {data.cleanedMetrics && (
        <div className="mt-1.5 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cleaned Metrics</p>
          <DetailRow label="Revenue" value={data.cleanedMetrics.totalRevenue60 != null ? fmtCurrency(data.cleanedMetrics.totalRevenue60) : '—'} />
          <DetailRow label="AOV" value={data.cleanedMetrics.aov60 != null ? '$' + data.cleanedMetrics.aov60.toFixed(2) : '—'} />
        </div>
      )}
    </div>
  )
}

// ─ Step 5: Similar Stores ───────────────────────────────────────────────────

function Step5Detail({ data }: { data: any }) {
  if (!data) return <p className="text-xs text-slate-500">No matching data</p>

  const stores: any[] = data.matchingStores ?? []
  const usedSuccess = data.successfulMatchesUsed

  return (
    <div className="space-y-3">
      <DetailRow label="Similar stores found" value={String(stores.length)} />
      {usedSuccess != null && (
        <DetailRow label="Success filter applied" value={usedSuccess ? 'Yes' : 'No'} />
      )}
      {stores.length > 0 && (
        <div className="space-y-2 mt-2">
          {stores.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap text-xs">
              <ShopLink name={s.storeName ?? s.shopName ?? ''} className="font-medium truncate max-w-[180px]" />
              <Badge variant="outline" className="text-[10px]">
                {((s.similarityScore ?? 0) * 100).toFixed(0)}% match
              </Badge>
              {s.ebSuccessTier && (
                <Badge variant={tierBadgeVariant(s.ebSuccessTier)} className="text-[10px]">
                  {s.ebSuccessTier}
                </Badge>
              )}
              {s.dominantStrategy && (
                <span className="text-slate-500 dark:text-slate-400">
                  {BUNDLE_TYPE_LABELS[s.dominantStrategy] ?? s.dominantStrategy}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─ Step 6: Recommendation ───────────────────────────────────────────────────

function Step6Detail({ data, fullResult, shopName }: { data: any; fullResult: any; shopName?: string }) {
  // Use per-step SSE data, fall back to full result for extras
  const recType = data?.recommendedBundleType ?? fullResult?.recommendedBundleType
  const source = data?.strategySource ?? fullResult?.strategySource
  const draft = data?.bundleDraft ?? fullResult?.bundleDraft
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <div className="space-y-4">
      {/* Highlighted recommendation card */}
      <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recommended: {BUNDLE_TYPE_LABELS[recType] ?? recType ?? '—'}
          </span>
        </div>

        {source && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Source:</span>
            <Badge variant="blue" className="text-[10px]">
              {STRATEGY_SOURCE_LABELS[source] ?? source}
            </Badge>
          </div>
        )}

        {/* Reasoning */}
        {draft?.reasoning && (
          <div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReasoning(!showReasoning) }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {showReasoning ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Reasoning
            </button>
            {showReasoning && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed bg-white/60 dark:bg-slate-800/60 rounded p-2">
                {draft.reasoning}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Products selected */}
      {draft?.products && draft.products.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Products Selected ({draft.products.length})
          </p>
          <div className="space-y-1.5">
            {draft.products.map((prod: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {prod.grade && (
                  <Badge
                    variant={prod.grade === 'A' ? 'success' : prod.grade === 'B' ? 'warning' : 'destructive'}
                    className="text-[10px]"
                  >
                    {prod.grade}
                  </Badge>
                )}
                {prod.handle && shopName ? (
                  <a href={`https://${shopName}/products/${prod.handle}`} target="_blank" rel="noopener noreferrer" className="truncate flex-1 text-blue-600 dark:text-blue-400 hover:underline" title={prod.productId}>{prod.title ?? prod.productId}</a>
                ) : (
                  <span className="truncate flex-1 text-slate-500 dark:text-slate-400" title={prod.productId}>{prod.title ?? prod.productId}</span>
                )}
                <span className="font-mono text-slate-700 dark:text-slate-300 shrink-0">
                  {prod.revenue != null ? fmtCurrency(prod.revenue) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing suggestion */}
      {draft?.pricingLogic && (
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Pricing Suggestion</p>
          <div className="space-y-1.5">
            {draft.pricingLogic.formula && (
              <DetailRow label="Formula" value={draft.pricingLogic.formula} />
            )}
            {draft.pricingLogic.perceivedDiscount && (
              <DetailRow label="Perceived discount" value={draft.pricingLogic.perceivedDiscount} />
            )}
            {draft.pricingLogic.suggestedBundlePrice != null && (
              <DetailRow label="Suggested price" value={fmtCurrency(draft.pricingLogic.suggestedBundlePrice)} />
            )}
            {draft.pricingLogic.tiers && Array.isArray(draft.pricingLogic.tiers) && (
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Tiers:</span>
                <div className="mt-1 space-y-1">
                  {draft.pricingLogic.tiers.map((tier: any, i: number) => (
                    <p key={i} className="text-xs text-slate-700 dark:text-slate-300">
                      {tier.quantity ?? tier.minQuantity}+ → {tier.discount ?? tier.percentOff}% off
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Shared Detail Row ───────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400 shrink-0">{label}:</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{safeNode(value)}</span>
    </div>
  )
}
