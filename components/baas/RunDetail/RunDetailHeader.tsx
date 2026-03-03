/**
 * RunDetailHeader
 *
 * Top strip of the detail view. Shows at-a-glance metadata about the run:
 * domain, pipeline type, status badge, audit score ring, duration, and date.
 *
 * Layout (desktop):
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │  [←Back]  shopName · url                    Score  Status  Close  │
 *   │           pipelineType badge  ·  date  ·  duration                  │
 *   └──────────────────────────────────────────────────────────────────────┘
 */

import { ArrowLeft, Clock, Calendar, X } from 'lucide-react'
import { Badge, Button, cn } from '../../ui'
import { getStatusConfig, getPipelineTypeConfig, getScoreColor, timeAgo } from '../../../utils'
import type { EnrichedPipelineRun } from '../../../types'

interface RunDetailHeaderProps {
  run: EnrichedPipelineRun
  onClose: () => void
}

function formatDuration(ms?: number): string {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

export default function RunDetailHeader({ run, onClose }: RunDetailHeaderProps) {
  const status = getStatusConfig(run.status)
  const pType = getPipelineTypeConfig(run.pipelineType)

  // Score comes from auditorResults or legacy result.audit.score
  const score =
    run.auditorResults?.overallScore ??
    run.result?.audit?.score ??
    null

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Primary row */}
      <div className="px-6 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: back + identity */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Back to history"
            className="shrink-0 h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {run.shopName}
              </h1>
              <span className="text-xs text-muted-foreground shrink-0">
                {run.shopName}
              </span>
            </div>

            {/* Secondary meta row */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={cn('text-xs', pType.className)}>
                {pType.label}
              </Badge>
              <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {timeAgo(run.createdAt)}
              </span>
              <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDuration(run.durationMs)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: score + status + close */}
        <div className="flex items-center gap-3 shrink-0">
          {score !== null && (
            <ScoreRing score={score} />
          )}

          <Badge
            variant="outline"
            className={cn('gap-1.5 text-xs font-semibold px-3 py-1', status.className)}
          >
            {status.icon}
            {status.label}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close detail view"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
// A small circular SVG indicator showing the 0-10 score at a glance.

function ScoreRing({ score }: { score: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const colorClass = getScoreColor(score)

  // Extract just the text color for the SVG stroke
  const strokeColor =
    score >= 8 ? '#10b981' :   // emerald-500
    score >= 6 ? '#f59e0b' :   // amber-500
                 '#ef4444'     // red-500

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        {/* Track */}
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-100 dark:text-slate-700"
        />
        {/* Progress */}
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
      <span
        className={cn(
          'absolute text-xs font-bold leading-none',
          colorClass.split(' ').filter(c => c.startsWith('text-')).join(' ')
        )}
      >
        {score}
      </span>
    </div>
  )
}
