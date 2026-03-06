/**
 * OverviewPanel
 *
 * The landing panel shown by default. Surfaces the most decision-critical
 * numbers from ALL five agents into a single scannable dashboard:
 *
 *  ┌────────────────────────────────────────────────────────┐
 *  │  STAT CARDS (4-up grid)                               │
 *  │  Audit Score · Money Left · Vertical · Strategies     │
 *  ├────────────────────────────────────────────────────────┤
 *  │  Critical Findings (from auditor)  │  Recommended      │
 *  │                                    │  Actions (analyst) │
 *  ├────────────────────────────────────────────────────────┤
 *  │  Implementation Priority (from strategy)               │
 *  └────────────────────────────────────────────────────────┘
 */

import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn, InfoTip } from '../../ui'
import { TIPS } from '../../../constants/baasTooltips'
import { getScoreColor } from '../../../utils'
import type { EnrichedPipelineRun } from '../../../types'

interface OverviewPanelProps {
  run: EnrichedPipelineRun
  /** Let the user jump to a specific agent tab from a CTA link */
  onNavigate: (tab: 'auditor' | 'analyst' | 'classifier' | 'strategy' | 'report') => void
}

export default function OverviewPanel({ run, onNavigate }: OverviewPanelProps) {
  const auditor = run.auditorResults
  const analyst = run.analystResults
  const classifier = run.classifierResults
  const strategy = run.strategyResults

  const score = auditor?.overallScore ?? run.result?.audit?.score ?? null

  // moneyLeftOnTable can be a number or an object with totalOpportunity / gradeCLiability
  const rawMoney = analyst?.moneyLeftOnTable
  const money: number | null =
    typeof rawMoney === 'number' ? rawMoney
    : rawMoney && typeof rawMoney === 'object'
      ? (rawMoney as any).totalOpportunity ?? (rawMoney as any).gradeCLiability ?? null
    : null

  const analystHadError = !!(analyst as any)?.error
  const vertical = classifier?.primaryVertical ?? null
  const stratCount = strategy?.strategies?.length ?? 0

  return (
    <div className="space-y-6 p-6">
      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={<>Audit Score<InfoTip text={TIPS.auditScore} /></>}
          value={score !== null ? `${score}/10` : '—'}
          icon={<Target className="w-4 h-4" />}
          valueClass={score !== null ? getScoreColor(score) : ''}
          description={
            score !== null
              ? score >= 8 ? 'Excellent bundling readiness'
              : score >= 6 ? 'Moderate readiness'
              : 'Significant gaps present'
              : 'Not yet scored'
          }
          onClick={() => onNavigate('auditor')}
        />
        <StatCard
          label={<>Revenue Opportunity<InfoTip text={TIPS.revenueOpportunity} /></>}
          value={analystHadError ? 'N/A' : money !== null ? `$${money.toLocaleString()}` : '—'}
          icon={<DollarSign className="w-4 h-4" />}
          valueClass={analystHadError ? 'text-amber-500' : 'text-emerald-700 dark:text-emerald-400'}
          description={analystHadError ? 'No revenue data access' : 'Estimated money left on table'}
          onClick={() => onNavigate('analyst')}
        />
        <StatCard
          label={<>Vertical<InfoTip text={TIPS.vertical} /></>}
          value={vertical ?? '—'}
          icon={<Layers className="w-4 h-4" />}
          valueClass="text-violet-700 dark:text-violet-400"
          description={
            classifier
              ? typeof classifier.confidence === 'string'
                ? `${classifier.confidence} confidence`
                : `${Math.round(classifier.confidence * 100)}% confidence`
              : 'Classification pending'
          }
          onClick={() => onNavigate('classifier')}
        />
        <StatCard
          label={<>Bundle Strategies<InfoTip text={TIPS.bundleStrategies} /></>}
          value={stratCount > 0 ? `${stratCount}` : '—'}
          icon={<TrendingUp className="w-4 h-4" />}
          valueClass="text-blue-700 dark:text-blue-400"
          description={stratCount > 0 ? 'Ready to implement' : 'Awaiting strategy run'}
          onClick={() => onNavigate('strategy')}
        />
      </div>

      {/* ── Two-column detail grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Findings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Findings<InfoTip text={TIPS.criticalFindings} />
              </span>
              <button
                onClick={() => onNavigate('auditor')}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Full audit <ArrowRight className="w-3 h-3" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {auditor?.criticalFindings && auditor.criticalFindings.length > 0 ? (
              auditor.criticalFindings.map((finding, i) => (
                <FindingRow key={i} text={finding} />
              ))
            ) : (
              <EmptyState label="No critical findings recorded" />
            )}
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Recommended Actions<InfoTip text={TIPS.recommendedActions} />
              </span>
              <button
                onClick={() => onNavigate('analyst')}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Full analysis <ArrowRight className="w-3 h-3" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {analyst?.recommendedActions && analyst.recommendedActions.length > 0 ? (
              analyst.recommendedActions.slice(0, 5).map((action, i) => (
                <ActionRow key={i} index={i + 1} text={action} />
              ))
            ) : (
              <EmptyState label="No recommended actions yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Implementation Priority ────────────────────────────── */}
      {strategy?.implementationPriority && strategy.implementationPriority.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Implementation Priority<InfoTip text={TIPS.implementationPriority} />
              </span>
              <button
                onClick={() => onNavigate('strategy')}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View strategies <ArrowRight className="w-3 h-3" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="flex flex-col sm:flex-row flex-wrap gap-2">
              {strategy.implementationPriority.map((item: any, i: number) => {
                const label = typeof item === 'string' ? item : `Strategy ${item.strategyNumber}`
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                        i === 0
                          ? 'bg-primary text-primary-foreground'
                          : i === 1
                          ? 'bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      )}
                    >
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

      {/* ── Run Summary (from auditor) ─────────────────────────── */}
      {(auditor?.summary || run.result?.audit?.summary) && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex gap-3 py-4">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {auditor?.summary ?? run.result?.audit?.summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: React.ReactNode
  value: string
  icon: React.ReactNode
  valueClass?: string
  description?: string
  onClick?: () => void
}

function StatCard({ label, value, icon, valueClass = '', description, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left w-full rounded-xl border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-900 shadow-sm p-4 transition-all',
        onClick && 'hover:shadow-md hover:border-primary/40 cursor-pointer group'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">
          {icon}
        </span>
      </div>
      <p className={cn('text-2xl font-bold leading-none mb-1', valueClass || 'text-slate-900 dark:text-slate-100')}>
        {value}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </button>
  )
}

function FindingRow({ text }: { text: string | { finding?: string; impact?: string; recommendation?: string } }) {
  const label = typeof text === 'string' ? text : text.finding ?? JSON.stringify(text)
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  )
}

function ActionRow({ index, text }: { index: number; text: string | Record<string, unknown> | any }) {
  const label = typeof text === 'string' ? text : (text as any).action ?? (text as any).recommendation ?? JSON.stringify(text)
  return (
    <div className="flex items-start gap-2">
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5">
        {index}
      </Badge>
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground py-2">{label}</p>
  )
}
