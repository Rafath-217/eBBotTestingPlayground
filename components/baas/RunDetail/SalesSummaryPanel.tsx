import { Target, DollarSign, TrendingUp, Package, Circle } from 'lucide-react'
import { Badge, cn } from '../../ui'
import type { EnrichedPipelineRun, SalesSummary } from '../../../types'

interface SalesSummaryPanelProps {
  run: EnrichedPipelineRun
}

function confidenceBadgeVariant(confidence: string) {
  const c = confidence.toLowerCase()
  if (c === 'high') return 'success' as const
  if (c === 'medium') return 'warning' as const
  return 'destructive' as const
}

export default function SalesSummaryPanel({ run }: SalesSummaryPanelProps) {
  const data = run.salesSummary

  if (!data) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        <Circle className="w-8 h-8 mx-auto mb-3 opacity-30" />
        No executive summary available for this run.
      </div>
    )
  }

  const impact = data['90DayImpact']

  return (
    <div className="space-y-6 p-6">
      {/* 1. Hero Card */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold leading-tight">{data.headlineRevenueOpportunity}</h2>
        <p className="text-base opacity-70 mt-2">{data.urgencyStatement}</p>
      </div>

      {/* 2. Root Causes */}
      {data.rootCauses && data.rootCauses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Root Causes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.rootCauses.map((cause, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 border-l-2 border-l-amber-400 bg-white dark:bg-slate-900"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{cause}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Priority Move */}
      {data.priorityMove && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Priority Move
            </h3>
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100">
            {data.priorityMove.format}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {data.priorityMove.revenueRange}
            </span>
            <Badge variant={confidenceBadgeVariant(data.priorityMove.confidence)}>
              {data.priorityMove.confidence} confidence
            </Badge>
          </div>
        </div>
      )}

      {/* 4. 90-Day Projection Strip */}
      {impact && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            90-Day Projections
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              icon={DollarSign}
              label="Projected Revenue"
              value={impact.projectedRevenue}
            />
            <StatCard
              icon={TrendingUp}
              label="Projected AOV Lift"
              value={impact.projectedAOVLift}
            />
            <StatCard
              icon={Package}
              label="Inventory Impact"
              value={impact.inventoryImpact}
            />
          </div>
        </div>
      )}

      {/* 5. Credibility Footer */}
      {data.credibility && (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-5 py-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{data.credibility.ordersAnalyzed}</strong>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{data.credibility.revenueAnalyzed}</strong>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{data.credibility.confidence}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  )
}
