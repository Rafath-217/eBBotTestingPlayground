import { useState } from 'react'
import {
  ChevronDown,
  Brain,
  Wrench,
  TrendingUp,
  Target,
} from 'lucide-react'
import { Card, Badge, cn } from '../ui'
import OfferMathVisual from './OfferMathVisual'
import type { StrategyRecommendation } from '../../types/strategy'

interface Props {
  strategy: StrategyRecommendation
  priority?: number
  isPrimary?: boolean
}

const cardAccents = [
  {
    gradient: 'from-indigo-500 to-violet-500',
    numberBg: 'bg-indigo-600',
    labelColor: 'text-indigo-600 dark:text-indigo-400',
    headerBg: 'bg-indigo-50 dark:bg-indigo-900/10',
    headerBorder: 'border-indigo-100 dark:border-indigo-800/30',
    impactBg: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30',
    impactText: 'text-indigo-700 dark:text-indigo-300',
    mathAccent: 'indigo',
  },
  {
    gradient: 'from-emerald-500 to-teal-500',
    numberBg: 'bg-emerald-600',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/10',
    headerBorder: 'border-emerald-100 dark:border-emerald-800/30',
    impactBg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30',
    impactText: 'text-emerald-700 dark:text-emerald-300',
    mathAccent: 'emerald',
  },
  {
    gradient: 'from-amber-500 to-orange-500',
    numberBg: 'bg-amber-600',
    labelColor: 'text-amber-600 dark:text-amber-400',
    headerBg: 'bg-amber-50 dark:bg-amber-900/10',
    headerBorder: 'border-amber-100 dark:border-amber-800/30',
    impactBg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30',
    impactText: 'text-amber-700 dark:text-amber-300',
    mathAccent: 'amber',
  },
]

export default function StrategyCard({ strategy, priority, isPrimary }: Props) {
  const [expanded, setExpanded] = useState(false)
  const accent = cardAccents[(strategy.number - 1) % cardAccents.length]

  return (
    <Card className="overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent.gradient}`} />

      {/* Header */}
      <div className={`p-5 border-b ${accent.headerBorder} ${accent.headerBg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Strategy number badge */}
            <div
              className={`w-8 h-8 rounded-lg ${accent.numberBg} text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5`}
            >
              {strategy.number}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-xs font-semibold uppercase tracking-wider ${accent.labelColor}`}>
                  {strategy.pillarName}
                </span>
                {isPrimary && priority === 1 && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
                    Start Here
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {strategy.bundleName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{strategy.problemSolved}</p>
            </div>
          </div>

          {/* Expected impact summary — always visible */}
          <div className={`shrink-0 text-right border rounded-lg p-2.5 ${accent.impactBg}`}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              AOV Lift
            </p>
            <p className={`text-xl font-bold tabular-nums ${accent.impactText}`}>
              {strategy.expectedImpact.aovLift}
            </p>
          </div>
        </div>

        {/* Target metric pill */}
        <div className="mt-3 flex items-center gap-1.5">
          <Target className={`w-3.5 h-3.5 ${accent.labelColor}`} />
          <span className="text-xs text-muted-foreground">
            Target:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {strategy.expectedImpact.targetMetric}
            </span>
          </span>
        </div>
      </div>

      {/* Concept */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {strategy.concept}
        </p>
      </div>

      {/* Offer math — always shown */}
      <div className="px-5 pb-4">
        <OfferMathVisual data={strategy.offerMathematics} accentColor={accent.mathAccent} />
      </div>

      {/* Expandable details */}
      <div className="border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span>Execution Details</span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>

        {expanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            {/* Psychological trigger */}
            <DetailRow
              icon={<Brain className="w-4 h-4 text-violet-500" />}
              label="Psychological Trigger"
              value={strategy.psychologicalTrigger}
            />

            {/* Execution tool */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <Wrench className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Execution Tool
                  </span>
                  <Badge variant="blue" className="text-[10px]">
                    {strategy.executionTool}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {strategy.executionReason}
                </p>
              </div>
            </div>

            {/* Expected impact detail */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <TrendingUp className={`w-4 h-4 mt-0.5 shrink-0 ${accent.labelColor}`} />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Expected Impact
                </span>
                <div className="flex gap-3">
                  <Pill label="AOV Lift" value={strategy.expectedImpact.aovLift} />
                  <Pill label="Key Metric" value={strategy.expectedImpact.targetMetric} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
      </div>
    </div>
  )
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  )
}


