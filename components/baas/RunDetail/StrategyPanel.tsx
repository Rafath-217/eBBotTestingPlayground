/**
 * StrategyPanel — Strategy Architect results
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Implementation Priority strip                          │
 *  ├──────────────────────────────────────────────────────────┤
 *  │  Strategy Cards (vertical stack, each expandable)       │
 *  │  ┌──────────────────────────────────────────────────┐   │
 *  │  │ #1 [Pillar Badge]  Bundle Name                  │   │
 *  │  │    Problem Solved · Concept                     │   │
 *  │  │    [Expand ▼]                                  │   │
 *  │  │    ─── expanded: ────────────────────────────  │   │
 *  │  │    Offer Math table  |  Trigger · Tool · Impact│   │
 *  │  └──────────────────────────────────────────────────┘   │
 *  └──────────────────────────────────────────────────────────┘
 */

import { useState } from 'react'
import {
  Lightbulb,
  ChevronDown,
  DollarSign,
  Zap,
  Target,
  TrendingUp,
  Package,
} from 'lucide-react'
import { Card, CardHeader, CardContent, Badge, Button, cn } from '../../ui'
import { currencySymbol } from '../../../utils'
import type { EnrichedPipelineRun, BundleStrategy } from '../../../types'

// Pillar → badge color mapping
const PILLAR_COLORS: Record<string, string> = {
  'starter':      'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
  'value':        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
  'premium':      'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
  'replenishment':'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
  'gift':         'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
  'cross-sell':   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  'upsell':       'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
}

function getPillarColor(pillarName: string): string {
  const key = Object.keys(PILLAR_COLORS).find(k =>
    pillarName.toLowerCase().includes(k)
  )
  return key ? PILLAR_COLORS[key] : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
}

interface StrategyPanelProps {
  run: EnrichedPipelineRun
}

export default function StrategyPanel({ run }: StrategyPanelProps) {
  const cs = currencySymbol(run.currency)
  const data = run.strategyResults
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  if (!data || data.strategies.length === 0) {
    return <EmptyPanel message="No strategy data available for this run." />
  }

  const { strategies, implementationPriority } = data

  // Sort strategies by implementation priority order if provided
  const sorted = implementationPriority.length > 0
    ? [...strategies].sort((a, b) => {
        const ia = implementationPriority.indexOf(a.bundleName)
        const ib = implementationPriority.indexOf(b.bundleName)
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
      })
    : strategies

  return (
    <div className="space-y-4 p-6">
      {/* ── Priority Strip ─────────────────────────────────────── */}
      {implementationPriority.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
              Launch order:
            </span>
            {implementationPriority.map((name, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
                    i === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300">{name}</span>
                {i < implementationPriority.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Strategy Cards ─────────────────────────────────────── */}
      <div className="space-y-3">
        {sorted.map((strategy, i) => (
          <StrategyCard
            key={strategy.bundleName}
            strategy={strategy}
            rank={i + 1}
            currencySymbol={cs}
            isExpanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Strategy Card ────────────────────────────────────────────────────────────

interface StrategyCardProps {
  strategy: BundleStrategy
  rank: number
  currencySymbol: string
  isExpanded: boolean
  onToggle: () => void
}

function StrategyCard({ strategy, rank, currencySymbol: cs, isExpanded, onToggle }: StrategyCardProps) {
  const pillarColor = getPillarColor(strategy.pillarName)
  const math = strategy.offerMathematics
  const savingsPct = math.discount

  return (
    <Card className={cn(
      'overflow-hidden transition-all',
      isExpanded && 'ring-1 ring-primary/30 shadow-md'
    )}>
      {/* ── Collapsed header (always visible) ─────────────────── */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        aria-expanded={isExpanded}
      >
        {/* Rank badge */}
        <span
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
            rank === 1
              ? 'bg-primary text-primary-foreground'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          )}
        >
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', pillarColor)}>
              {strategy.pillarName}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {strategy.bundleName}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="font-medium text-slate-600 dark:text-slate-400">Solves: </span>
            {strategy.problemSolved}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="success" className="text-xs font-bold">
            -{savingsPct}% off
          </Badge>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* ── Expanded content ──────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">

            {/* Left: Offer Mathematics */}
            <div className="p-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Offer Mathematics
              </h4>

              {/* Concept */}
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {strategy.concept}
              </p>

              {/* Products list */}
              <div className="space-y-1.5">
                {math.products.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{prod.name}</span>
                    </div>
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      {cs}{prod.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing summary */}
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Original Total</span>
                  <span className="font-mono line-through text-muted-foreground">
                    {cs}{math.originalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-xs border-t border-slate-200 dark:border-slate-700">
                  <span className="text-muted-foreground">Savings</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    -{cs}{math.savingsAmount.toLocaleString()} ({math.discount}%)
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 bg-primary/5 border-t border-primary/20">
                  <span className="text-sm font-semibold text-primary">Bundle Price</span>
                  <span className="text-sm font-black font-mono text-primary">
                    {cs}{math.bundlePrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Execution details */}
            <div className="p-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Execution Details
              </h4>

              <DetailRow
                icon={<Target className="w-3.5 h-3.5 text-violet-500" />}
                label="Psychological Trigger"
                value={strategy.psychologicalTrigger}
              />

              <DetailRow
                icon={<Zap className="w-3.5 h-3.5 text-blue-500" />}
                label="Execution Tool"
                value={strategy.executionTool}
              />

              <DetailRow
                icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                label="Expected Impact"
                value={strategy.expectedImpact}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function DetailRow({ icon, label, value }: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{value}</p>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  )
}
