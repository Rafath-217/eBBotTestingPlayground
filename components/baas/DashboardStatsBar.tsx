import { Activity, CheckCircle2, Star, DollarSign, Tag } from 'lucide-react'
import { cn } from '../ui'
import type { DashboardStats } from '../../utils'
import { formatCurrency, getScoreTextColor } from '../../utils'

interface Props {
  stats: DashboardStats
  loading?: boolean
}

export default function DashboardStatsBar({ stats, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 animate-pulse"
          >
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const tiles: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
    sub?: string
    accent?: string
  }[] = [
    {
      icon: <Activity className="w-4 h-4" />,
      label: 'Total Runs',
      value: stats.totalRuns,
      sub: stats.runningRuns > 0 ? `${stats.runningRuns} running` : undefined,
      accent: 'text-slate-900 dark:text-slate-100',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      sub: `${stats.completedRuns} completed · ${stats.failedRuns} failed`,
      accent:
        stats.successRate >= 80
          ? 'text-emerald-600 dark:text-emerald-400'
          : stats.successRate >= 60
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-600 dark:text-red-400',
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'Avg Score',
      value:
        stats.avgScore != null ? (
          <span className={getScoreTextColor(stats.avgScore)}>{stats.avgScore} / 10</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">—</span>
        ),
      sub: stats.avgScore != null ? scoreLabel(stats.avgScore) : 'No scores yet',
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Total Opportunity',
      value:
        stats.totalOpportunity > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.totalOpportunity, true)}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">—</span>
        ),
      sub: stats.totalOpportunity > 0 ? 'Money left on table' : 'Run Full Analysis to see',
    },
    {
      icon: <Tag className="w-4 h-4" />,
      label: 'Top Vertical',
      value: stats.topVertical ?? (
        <span className="text-slate-400 dark:text-slate-500">—</span>
      ),
      sub: stats.topVertical ? 'Most audited industry' : 'Run classifier to detect',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn(
            'rounded-xl border border-slate-200 dark:border-slate-700',
            'bg-white dark:bg-slate-900 shadow-sm p-4 flex flex-col gap-1.5',
            'transition-shadow hover:shadow-md'
          )}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {tile.icon}
            <span className="text-xs font-medium uppercase tracking-wider">{tile.label}</span>
          </div>
          <p className={cn('text-2xl font-bold leading-none', tile.accent ?? 'text-slate-900 dark:text-slate-100')}>
            {tile.value}
          </p>
          {tile.sub && (
            <p className="text-[11px] text-muted-foreground leading-tight">{tile.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function scoreLabel(score: number): string {
  if (score >= 8) return 'Strong performance'
  if (score >= 6) return 'Moderate — room to grow'
  return 'Needs attention'
}
