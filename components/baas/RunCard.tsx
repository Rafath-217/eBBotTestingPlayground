import { Trash2, Eye, Clock, Building2, Loader2, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { cn, Badge, Button } from '../ui'
import {
  timeAgo,
  formatDuration,
  formatCurrency,
  getScoreTextColor,
  getPipelineTypeConfig,
  getRunScore,
  getRunOpportunity,
  getRunRevenue,
  getRunOrderCount,
  getRunVertical,
  getRunStrategyCount,
} from '../../utils'
import type { BaasPipelineRun, EnrichedPipelineRun, AgentExecution } from '../../types'

type AnyRun = BaasPipelineRun | EnrichedPipelineRun

interface RunCardProps {
  run: AnyRun
  view: 'card' | 'row'
  selected?: boolean
  onSelect?: () => void
  onDelete?: () => void
  checked?: boolean
  onCheck?: (checked: boolean) => void
}

function ScoreGauge({ score }: { score: number }) {
  const r = 20
  const circumference = Math.PI * r
  const fillLength = (score / 10) * circumference
  const colorClass = getScoreTextColor(score)
  const strokeColor =
    score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex flex-col items-center" title={`Score: ${score}/10`}>
      <svg width="52" height="30" viewBox="0 0 52 30" aria-hidden>
        <path
          d="M 4 28 A 22 22 0 0 1 48 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-700"
        />
        <path
          d="M 4 28 A 22 22 0 0 1 48 28"
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${fillLength} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span className={cn('text-sm font-bold leading-none -mt-1', colorClass)}>{score}</span>
      <span className="text-[9px] text-muted-foreground">/ 10</span>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  if (status === 'running') {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
      </span>
    )
  }
  if (status === 'completed') {
    return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
  }
  return <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'running') return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
  if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
  return <AlertCircle className="w-3.5 h-3.5 text-red-500" />
}

const AGENT_LABELS: Record<string, string> = {
  'Website Auditor': 'Auditor',
  'Data Analyst': 'Analyst',
  'Industry Classifier': 'Classifier',
  'Strategy Architect': 'Strategy',
  'Report Compiler': 'Report',
}

function AgentChips({ agents }: { agents: (AgentExecution | string)[] }) {
  const normalised = agents.map((a) =>
    typeof a === 'string'
      ? { name: a, status: 'completed' as const }
      : a
  )

  return (
    <div className="flex flex-wrap gap-1">
      {normalised.map((ag) => {
        const label = AGENT_LABELS[ag.name] ?? ag.name
        const isDone = ag.status === 'completed'
        const isRunning = ag.status === 'running'
        const isFailed = ag.status === 'failed'
        return (
          <span
            key={ag.name}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border',
              isDone && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
              isRunning && 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
              isFailed && 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400',
              !isDone && !isRunning && !isFailed && 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
            )}
          >
            {isRunning && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {label}
          </span>
        )
      })}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  )
}

export default function RunCard({ run, view, selected, onSelect, onDelete, checked, onCheck }: RunCardProps) {
  const enriched = run as EnrichedPipelineRun
  const score = getRunScore(run)
  const opportunity = getRunOpportunity(run)
  const revenue = getRunRevenue(run)
  const orderCount = getRunOrderCount(run)
  const vertical = getRunVertical(run)
  const strategyCount = getRunStrategyCount(run)
  const pType = getPipelineTypeConfig(run.pipelineType)
  const agents: (AgentExecution | string)[] = enriched.agentsExecuted ?? []
  const hasAgents = agents.length > 0

  if (view === 'row') {
    return (
      <div
        onClick={onSelect}
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800',
          'cursor-pointer transition-colors',
          selected
            ? 'bg-primary/5 dark:bg-primary/10'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => { e.stopPropagation(); onCheck?.(e.target.checked) }}
          onClick={(e) => e.stopPropagation()}
          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-primary shrink-0"
        />
        <StatusDot status={run.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
              {run.shopName}
            </span>
            <Badge variant="outline" className={cn('text-[10px] shrink-0', pType.className)}>
              {pType.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{run.shopName}</p>
        </div>
        {score != null ? (
          <span className={cn('text-sm font-bold shrink-0', getScoreTextColor(score))}>{score}/10</span>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">—</span>
        )}
        {opportunity != null ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:block">
            {formatCurrency(opportunity, true)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">—</span>
        )}
        {vertical ? (
          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 hidden md:block">{vertical}</span>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0 hidden md:block">—</span>
        )}
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{timeAgo(run.createdAt)}</span>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={onSelect} className="h-7 w-7 p-0" title="View details">
            <ChevronRight className={cn('w-4 h-4 transition-transform', selected && 'rotate-90')} />
          </Button>
          <Button
            variant="ghost" size="sm" onClick={onDelete}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete run"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-xl border bg-white dark:bg-slate-900 shadow-sm cursor-pointer',
        'transition-all duration-200 flex flex-col',
        selected
          ? 'border-primary ring-2 ring-primary/30 shadow-md'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md',
        run.status === 'running' && 'border-blue-300 dark:border-blue-700',
        run.status === 'failed' && 'border-red-200 dark:border-red-800',
      )}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <input
            type="checkbox" checked={checked}
            onChange={(e) => { e.stopPropagation(); onCheck?.(e.target.checked) }}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-primary shrink-0"
          />
          <StatusDot status={run.status} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{run.shopName}</p>
              <Badge variant="outline" className={cn('text-[10px]', pType.className)}>{pType.label}</Badge>
            </div>
            {(run as EnrichedPipelineRun).appName && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                {(run as EnrichedPipelineRun).appName}
              </p>
            )}
          </div>
        </div>
        {score != null && <ScoreGauge score={score} />}
        {score == null && run.status === 'running' && (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
        )}
      </div>

      {run.status !== 'failed' && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-x-4 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          {opportunity != null && (
            <Metric label="Opportunity" value={<span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(opportunity, true)}</span>} />
          )}
          {revenue != null && <Metric label="Revenue" value={formatCurrency(revenue, true)} />}
          {orderCount != null && <Metric label="Orders" value={orderCount.toLocaleString()} />}
          {vertical && <Metric label="Vertical" value={vertical} />}
          {strategyCount != null && <Metric label="Strategies" value={strategyCount} />}
          {run.durationMs > 0 && (
            <Metric label="Duration" value={<span className="flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" />{formatDuration(run.durationMs)}</span>} />
          )}
        </div>
      )}

      {run.status === 'failed' && run.error && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400 line-clamp-2">{run.error}</p>
        </div>
      )}

      {hasAgents && (
        <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          <AgentChips agents={agents} />
        </div>
      )}

      <div
        className="px-4 py-2.5 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <StatusIcon status={run.status} />
          <span>{timeAgo(run.createdAt)}</span>
          {run.durationMs > 0 && (<><span>·</span><span>{formatDuration(run.durationMs)}</span></>)}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onSelect} className="h-7 px-2 text-xs gap-1">
            <Eye className="w-3.5 h-3.5" />{selected ? 'Close' : 'View'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 px-2 text-xs gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-3.5 h-3.5" />Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
