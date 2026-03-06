/**
 * MetricsPanel — Metrics Engine results
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Top Pain Point banner (amber gradient)                  │
 *  ├──────────────────────────────────────────────────────────┤
 *  │  Opportunity flags row (4 badges)                        │
 *  ├──────────────────────────────────────────────────────────┤
 *  │  Key Metrics grid (2x3)                                  │
 *  │  AOV · Threshold · Bridge · Concentration · Uplift · C%  │
 *  ├──────────────────────────────────────────────────────────┤
 *  │  Risk Gauges (Inventory · Retention) side-by-side        │
 *  ├──────────────────────────────────────────────────────────┤
 *  │  Recommended Pillars (pill badges)                       │
 *  └──────────────────────────────────────────────────────────┘
 */

import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Package,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn, InfoTip } from '../../ui'
import { TIPS } from '../../../constants/baasTooltips'
import { currencySymbol } from '../../../utils'
import type { EnrichedPipelineRun } from '../../../types'

interface MetricsPanelProps {
  run: EnrichedPipelineRun
}

export default function MetricsPanel({ run }: MetricsPanelProps) {
  const data = run.metricsResult

  if (!data) {
    return <EmptyPanel message="No metrics data available for this run." />
  }

  const cs = currencySymbol(data.currency ?? run.currency)
  const rawMetrics = data.rawMetrics
  const derivedMetrics = data.derivedMetrics
  const opportunities = data.opportunities

  console.log('[DEBUG MetricsPanel] rawMetrics:', rawMetrics, 'derivedMetrics:', derivedMetrics, 'opportunities:', opportunities)

  if (!rawMetrics && !derivedMetrics && !opportunities) {
    return <EmptyPanel message="No metrics data available for this run." />
  }

  return (
    <div className="space-y-4 p-6">
      {/* ── Top Pain Point Banner ──────────────────────────────── */}
      {opportunities?.topPainPoint && (
        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {opportunities.topPainPoint}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Opportunity Flags ──────────────────────────────────── */}
      {opportunities && (
      <div className="flex flex-wrap gap-2">
        <OpportunityFlag label={<>Free Shipping Gap<InfoTip text={TIPS.freeShippingGap} /></>} active={opportunities.freeShippingGap ?? false} />
        <OpportunityFlag label={<>Liquidation<InfoTip text={TIPS.liquidationOpportunity} /></>} active={opportunities.hasLiquidationOpportunity ?? false} />
        <OpportunityFlag label={<>Retention Problem<InfoTip text={TIPS.retentionProblem} /></>} active={opportunities.hasRetentionProblem ?? false} />
        <OpportunityFlag label={<>AOV Bridge<InfoTip text={TIPS.aovBridgeOpportunity} /></>} active={opportunities.hasAovBridgeOpportunity ?? false} />
      </div>
      )}

      {/* ── Key Metrics Grid ───────────────────────────────────── */}
      {(rawMetrics || derivedMetrics) && (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          icon={<DollarSign className="w-3.5 h-3.5 text-slate-400" />}
          label={<>AOV<InfoTip text={TIPS.aov} /></>}
          value={rawMetrics?.aov ?? null}
          unit={cs}
          isCurrency
        />
        <MetricCard
          icon={<Package className="w-3.5 h-3.5 text-slate-400" />}
          label={<>Free Shipping Threshold<InfoTip text={TIPS.freeShippingThreshold} /></>}
          value={rawMetrics?.freeShippingThreshold ?? null}
          unit={cs}
          isCurrency
        />
        <MetricCard
          icon={<TrendingUp className="w-3.5 h-3.5 text-slate-400" />}
          label={<>AOV Bridge Amount<InfoTip text={TIPS.aovBridgeAmount} /></>}
          value={derivedMetrics?.aovBridgeAmount ?? null}
          unit={cs}
          isCurrency
        />
        <MetricCard
          icon={<Target className="w-3.5 h-3.5 text-slate-400" />}
          label={<>Revenue Concentration<InfoTip text={TIPS.revenueConcentration} /></>}
          value={derivedMetrics?.revenueConcentrationIndex ?? null}
        />
        <MetricCard
          icon={<TrendingUp className="w-3.5 h-3.5 text-slate-400" />}
          label={<>Potential Bundle Uplift<InfoTip text={TIPS.potentialBundleUplift} /></>}
          value={derivedMetrics?.potentialBundleUplift ?? null}
          unit="%"
          isPercentage
        />
        <MetricCard
          icon={<Activity className="w-3.5 h-3.5 text-slate-400" />}
          label={<>Grade C Revenue %<InfoTip text={TIPS.gradeCRevenuePercent} /></>}
          value={derivedMetrics?.gradeCRevenuePercent ?? null}
          unit="%"
          isPercentage
        />
      </div>
      )}

      {/* ── Risk Gauges ────────────────────────────────────────── */}
      {derivedMetrics && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskGauge label={<>Inventory Risk Score<InfoTip text={TIPS.inventoryRiskScore} /></>} score={derivedMetrics.inventoryRiskScore ?? null} />
        <RiskGauge label={<>Retention Risk Score<InfoTip text={TIPS.retentionRiskScore} /></>} score={derivedMetrics.retentionRiskScore ?? null} />
      </div>
      )}

      {/* ── Recommended Pillars ────────────────────────────────── */}
      {Array.isArray(opportunities?.recommendedPillars) && opportunities.recommendedPillars.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-slate-500" />
              Recommended Pillars<InfoTip text={TIPS.recommendedPillars} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {opportunities.recommendedPillars.map((pillar, i) => (
                <Badge key={i} variant="blue" className="text-xs">
                  {pillar}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OpportunityFlag({ label, active }: { label: React.ReactNode; active: boolean }) {
  return (
    <Badge
      variant={active ? 'success' : 'outline'}
      className={cn(!active && 'text-muted-foreground')}
    >
      {label}
    </Badge>
  )
}

function MetricCard({ icon, label, value, unit, isCurrency = false, isPercentage = false }: {
  icon: React.ReactNode
  label: React.ReactNode
  value: number | null
  unit?: string
  isCurrency?: boolean
  isPercentage?: boolean
}) {
  const formatted = value != null
    ? isCurrency
      ? `${unit}${value.toLocaleString()}`
      : isPercentage
        ? `${value.toFixed(1)}${unit}`
        : value.toLocaleString()
    : '\u2014'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {formatted}
      </p>
    </div>
  )
}

function RiskGauge({ label, score }: { label: React.ReactNode; score: number | null }) {
  const safeScore = score ?? 0
  const barColor =
    safeScore >= 70 ? 'bg-red-500' :
    safeScore >= 40 ? 'bg-amber-500' :
                      'bg-emerald-500'

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className={cn(
            'text-sm font-bold',
            score == null ? 'text-muted-foreground' :
            safeScore >= 70 ? 'text-red-600 dark:text-red-400' :
            safeScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
                              'text-emerald-600 dark:text-emerald-400'
          )}>
            {score != null ? safeScore : '\u2014'}
          </span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          {score != null && (
            <div
              className={cn('h-full rounded-full transition-all', barColor)}
              style={{ width: `${safeScore}%` }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  )
}
