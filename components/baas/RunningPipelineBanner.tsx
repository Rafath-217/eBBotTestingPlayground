import { useEffect, useState } from 'react'
import { Loader2, Bell } from 'lucide-react'
import { cn } from '../ui'
import type { BaasPipelineRun, EnrichedPipelineRun } from '../../types'
import { timeAgo } from '../../utils'

const AGENT_LABELS = [
  'Initialising',
  'Auditing site',
  'Analysing data',
  'Classifying vertical',
  'Building strategy',
]

function pipelineProgress(run: BaasPipelineRun | EnrichedPipelineRun): number {
  const enriched = run as EnrichedPipelineRun
  const agents = enriched.agentsExecuted ?? []
  if (agents.length === 0) return 10
  if (typeof agents[0] === 'string') return 50
  const completed = (agents as { status: string }[]).filter((a) => a.status === 'completed').length
  return Math.min(95, (completed / 5) * 100)
}

function currentPhaseLabel(run: BaasPipelineRun | EnrichedPipelineRun): string {
  const enriched = run as EnrichedPipelineRun
  const agents = enriched.agentsExecuted ?? []
  if (agents.length === 0) return 'Starting up…'
  if (typeof agents[0] === 'string') return 'Processing…'
  const running = (agents as { name: string; status: string }[]).find((a) => a.status === 'running')
  if (running) {
    const idx = AGENT_LABELS.findIndex((_, i) => i === agents.indexOf(running as never))
    return running.name ?? AGENT_LABELS[Math.min(idx, AGENT_LABELS.length - 1)]
  }
  const completed = (agents as { status: string }[]).filter((a) => a.status === 'completed').length
  return AGENT_LABELS[Math.min(completed, AGENT_LABELS.length - 1)] ?? 'Processing…'
}

interface Props {
  runningRuns: (BaasPipelineRun | EnrichedPipelineRun)[]
  onRefreshNeeded?: () => void
}

export default function RunningPipelineBanner({ runningRuns, onRefreshNeeded }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (runningRuns.length === 0) return
    const id = setInterval(() => {
      setTick((t) => t + 1)
      onRefreshNeeded?.()
    }, 5000)
    return () => clearInterval(id)
  }, [runningRuns.length, onRefreshNeeded])

  if (runningRuns.length === 0) return null

  void tick

  return (
    <div className={cn(
      'rounded-xl border border-blue-200 dark:border-blue-800',
      'bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3',
    )}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
        </span>
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
          {runningRuns.length === 1 ? '1 pipeline running' : `${runningRuns.length} pipelines running`}
        </p>
        <Bell className="w-3.5 h-3.5 text-blue-500 ml-auto" />
        <span className="text-xs text-blue-700 dark:text-blue-300">You'll be notified on completion</span>
      </div>

      <div className="space-y-2.5">
        {runningRuns.map((run) => {
          const progress = pipelineProgress(run)
          const phase = currentPhaseLabel(run)
          const elapsed = Math.round((Date.now() - new Date(run.createdAt).getTime()) / 1000)

          return (
            <div key={run._id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  <span className="text-xs font-medium text-blue-900 dark:text-blue-100">{run.shopName}</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 hidden sm:inline">· {phase}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400">
                  <span>{timeAgo(run.createdAt)}</span>
                  {elapsed < 3600 && <span>· {elapsed}s</span>}
                </div>
              </div>
              <div className="h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
