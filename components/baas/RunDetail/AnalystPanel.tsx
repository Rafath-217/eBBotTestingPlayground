/**
 * AnalystPanel — Data Analyst results
 *
 * Layout:
 *  ┌────────────────────────────────────────────────────────┐
 *  │  3-stat strip: Orders · Products · Revenue            │
 *  ├───────────────────────┬────────────────────────────────┤
 *  │  AOV Histogram        │  Return Rate Analysis          │
 *  │  (bar chart)          │  single vs multi-item          │
 *  ├───────────────────────┼────────────────────────────────┤
 *  │  Retention Economics  │  ABC Analysis                  │
 *  │  new vs repeat AOV    │  Grade A · C · Deadstock       │
 *  ├───────────────────────┴────────────────────────────────┤
 *  │  Affinity Pairs table                                  │
 *  ├────────────────────────────────────────────────────────┤
 *  │  Money Left on Table banner                           │
 *  └────────────────────────────────────────────────────────┘
 */

import { useState } from 'react'
import {
  ShoppingCart,
  Package,
  DollarSign,
  RefreshCw,
  Users,
  BarChart2,
  Link,
  TrendingUp,
  MinusCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '../../ui'
import { currencySymbol } from '../../../utils'
import type { EnrichedPipelineRun, AnalystResults } from '../../../types'

interface AnalystPanelProps {
  run: EnrichedPipelineRun
}

export default function AnalystPanel({ run }: AnalystPanelProps) {
  const cs = currencySymbol(run.currency)
  const data: AnalystResults | undefined = run.analystResults

  if (!data) {
    return <EmptyPanel message="No analyst data available for this run." />
  }

  const dataOverview = data.dataOverview
  const aovHistogram = data.aovHistogram
  const abcAnalysis = data.abcAnalysis
  const returnRateAnalysis = data.returnRateAnalysis
  const retentionEconomics = data.retentionEconomics
  const affinityAnalysis = data.affinityAnalysis
  const moneyLeftOnTable = data.moneyLeftOnTable
  const recommendedActions = data.recommendedActions

  return (
    <div className="space-y-4 p-6">
      {/* ── Money Left on Table banner ─────────────────────────── */}
      {moneyLeftOnTable != null && moneyLeftOnTable > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 flex items-center justify-between text-white">
          <div>
            <p className="text-sm font-medium opacity-80">Estimated Revenue Opportunity</p>
            <p className="text-3xl font-black mt-1">{cs}{moneyLeftOnTable.toLocaleString()}</p>
            <p className="text-xs opacity-70 mt-1">money left on table — capturable through bundling</p>
          </div>
          <TrendingUp className="w-12 h-12 opacity-30" />
        </div>
      )}

      {/* ── Overview stat strip ────────────────────────────────── */}
      {dataOverview && (
      <div className="grid grid-cols-3 gap-4">
        <MiniStat
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Orders"
          value={(dataOverview.orderCount ?? 0).toLocaleString()}
        />
        <MiniStat
          icon={<Package className="w-4 h-4" />}
          label="Products"
          value={(dataOverview.productCount ?? 0).toLocaleString()}
        />
        <MiniStat
          icon={<DollarSign className="w-4 h-4" />}
          label="Revenue"
          value={`${cs}${(dataOverview.totalRevenue ?? 0).toLocaleString()}`}
          valueClass="text-emerald-700 dark:text-emerald-400"
        />
      </div>
      )}

      {/* ── 2-col row: AOV Histogram + Return Rate ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* AOV Histogram — show top 15 buckets, collapse the rest */}
        {Array.isArray(aovHistogram) && aovHistogram.length > 0 && (
          <AovHistogramCard aovHistogram={aovHistogram} />
        )}

        {/* Return Rate */}
        {returnRateAnalysis ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                Return Rate Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <ReturnRateBar
                label="Single-item orders"
                rate={returnRateAnalysis.singleItemReturnRate}
                colorClass="bg-amber-500"
              />
              <ReturnRateBar
                label="Multi-item orders"
                rate={returnRateAnalysis.multiItemReturnRate}
                colorClass="bg-emerald-500"
              />
              <p className="text-xs text-muted-foreground pt-1">
                Multi-item orders typically have lower return rates — a key bundle argument.
              </p>
            </CardContent>
          </Card>
        ) : (
          <NotCollected title="Return Rate Analysis" />
        )}
      </div>

      {/* ── 2-col row: Retention Economics + ABC Analysis ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Retention Economics */}
        {retentionEconomics ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-slate-500" />
                Retention Economics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <AovBox label="New Customer AOV" value={retentionEconomics.newCustomerAov} symbol={cs} />
                <AovBox label="Repeat Customer AOV" value={retentionEconomics.repeatCustomerAov} symbol={cs} highlight />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    AOV Gap: {cs}{(retentionEconomics.aovGap ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Opportunity to close with retention bundles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <NotCollected title="Retention Economics" />
        )}

        {/* ABC Analysis */}
        {abcAnalysis ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-slate-500" />
              ABC Product Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <ProductGrade
              grade="A"
              label="Top performers"
              products={abcAnalysis.gradeAProducts ?? []}
              colorClass="text-emerald-700 dark:text-emerald-400"
              bgClass="bg-emerald-100 dark:bg-emerald-900/20"
            />
            <ProductGrade
              grade="C"
              label="Underperformers"
              products={abcAnalysis.gradeCProducts ?? []}
              colorClass="text-amber-700 dark:text-amber-400"
              bgClass="bg-amber-100 dark:bg-amber-900/20"
            />
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-muted-foreground">Deadstock items</span>
              <Badge variant="warning">{abcAnalysis.deadstockCount ?? 0}</Badge>
            </div>
          </CardContent>
        </Card>
        ) : (
          <NotCollected title="ABC Product Analysis" />
        )}
      </div>

      {/* ── Affinity Pairs ─────────────────────────────────────── */}
      {affinityAnalysis == null ? (
        <NotCollected title="Co-Purchase Affinity Pairs" />
      ) : affinityAnalysis.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link className="w-4 h-4 text-slate-500" />
              Co-Purchase Affinity Pairs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {affinityAnalysis.map((pair, i) => (
                <AffinityRow
                  key={i}
                  rank={i + 1}
                  productA={pair.productA}
                  productB={pair.productB}
                  rate={pair.coPurchaseRate}
                  lift={pair.liftScore}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recommended Actions ────────────────────────────────── */}
      {Array.isArray(recommendedActions) && recommendedActions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              Analyst Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-2">
              {recommendedActions.map((action, i) => {
                const label = typeof action === 'string' ? action : (action as Record<string, string>).action ?? (action as Record<string, string>).recommendation ?? JSON.stringify(action)
                return (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── AOV Histogram (top 15 + expandable) ─────────────────────────────────────

function AovHistogramCard({ aovHistogram }: { aovHistogram: { label: string; count: number; percentage: number }[] }) {
  const [expanded, setExpanded] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Sort by count descending, take top 15
  const sorted = [...aovHistogram].sort((a, b) => b.count - a.count)
  const top = sorted.slice(0, 15)
  const rest = sorted.slice(15)
  const restTotal = rest.reduce((s, b) => s + b.count, 0)

  const visible = expanded ? sorted : top
  const maxCount = Math.max(...visible.map(b => b.count))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-500" />
            AOV Distribution
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {aovHistogram.length} buckets
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Bar chart area */}
        <div className="flex items-end gap-px" style={{ height: 200 }}>
          {visible.map((bucket, i) => {
            const pct = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0
            const isHovered = hoveredIndex === i
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full relative"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Count label — visible on hover */}
                <span
                  className={cn(
                    'text-[9px] font-medium text-slate-600 dark:text-slate-300 mb-0.5 transition-opacity',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {bucket.count}
                </span>
                {/* Bar */}
                <div
                  className={cn(
                    'w-full rounded-t transition-all',
                    isHovered ? 'bg-blue-600' : 'bg-blue-500'
                  )}
                  style={{ height: `${pct}%`, minHeight: pct > 0 ? 2 : 0 }}
                />
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] px-2 py-1 shadow-lg pointer-events-none">
                    {bucket.label}: {bucket.count} ({bucket.percentage}%)
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {/* X-axis labels */}
        <div className="flex gap-px mt-1 border-t border-slate-200 dark:border-slate-700 pt-1">
          {visible.map((bucket, i) => (
            <div key={i} className="flex-1 overflow-hidden">
              <span
                className="block text-[8px] text-muted-foreground font-mono leading-tight text-center truncate"
                title={bucket.label}
                style={{ writingMode: visible.length > 8 ? 'vertical-rl' : undefined, height: visible.length > 8 ? 48 : undefined }}
              >
                {bucket.label}
              </span>
            </div>
          ))}
        </div>
        {rest.length > 0 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Show {rest.length} more buckets ({restTotal} orders)
          </button>
        )}
        {expanded && rest.length > 0 && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Show less
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniStat({ icon, label, value, valueClass = '' }: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <p className={cn('text-xl font-bold', valueClass || 'text-slate-900 dark:text-slate-100')}>
        {value}
      </p>
    </div>
  )
}

function ReturnRateBar({ label, rate, colorClass }: {
  label: string
  rate: number
  colorClass: string
}) {
  const pct = Math.round(rate * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function AovBox({ label, value, symbol = '$', highlight = false }: {
  label: string
  value: number
  symbol?: string
  highlight?: boolean
}) {
  return (
    <div className={cn(
      'rounded-lg p-3 text-center border',
      highlight
        ? 'bg-primary/5 border-primary/20'
        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
    )}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={cn('text-lg font-bold', highlight ? 'text-primary' : 'text-slate-900 dark:text-slate-100')}>
        {symbol}{(value ?? 0).toLocaleString()}
      </p>
    </div>
  )
}

function ProductGrade({ grade, label, products, colorClass, bgClass }: {
  grade: string
  label: string
  products: string[]
  colorClass: string
  bgClass: string
}) {
  return (
    <div className={cn('rounded-lg p-3', bgClass)}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('text-xs font-bold uppercase tracking-wide', colorClass)}>
          Grade {grade}
        </span>
        <span className="text-xs text-muted-foreground">— {label} ({products.length})</span>
      </div>
      {products.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {products.slice(0, 6).map((p, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
              {p}
            </span>
          ))}
          {products.length > 6 && (
            <span className="text-xs text-muted-foreground px-1 py-0.5">+{products.length - 6} more</span>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">None identified</span>
      )}
    </div>
  )
}

function AffinityRow({ rank, productA, productB, rate, lift }: {
  rank: number
  productA: string
  productB: string
  rate: number
  lift?: number
}) {
  const pct = Math.round(rate * 100)
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{productA}</span>
          <span className="text-muted-foreground text-xs">+</span>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{productB}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="blue" className="text-xs">{pct}% co-purchase</Badge>
        {lift && (
          <Badge variant="success" className="text-xs">{lift.toFixed(1)}x lift</Badge>
        )}
      </div>
    </div>
  )
}

function NotCollected({ title }: { title: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-3 py-6">
        <MinusCircle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Data not collected for this run</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      <BarChart2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  )
}
