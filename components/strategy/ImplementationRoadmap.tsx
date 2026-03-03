import { useState } from 'react'
import { CheckCircle2, Clock, ChevronDown, Flag } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, cn } from '../ui'
import type { RoadmapPhase } from '../../types/strategy'

interface Props {
  phases: RoadmapPhase[]
}

const phaseAccents = [
  {
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-100 dark:bg-indigo-900/30',
    fill: 'bg-indigo-500',
    border: 'border-indigo-200 dark:border-indigo-700',
    label: 'text-indigo-700 dark:text-indigo-300',
    milestoneBg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/40',
    milestoneText: 'text-indigo-700 dark:text-indigo-300',
    headerBg: 'bg-indigo-50 dark:bg-indigo-900/10',
    taskCheck: 'text-indigo-500',
  },
  {
    dot: 'bg-violet-500',
    bar: 'bg-violet-100 dark:bg-violet-900/30',
    fill: 'bg-violet-500',
    border: 'border-violet-200 dark:border-violet-700',
    label: 'text-violet-700 dark:text-violet-300',
    milestoneBg: 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/40',
    milestoneText: 'text-violet-700 dark:text-violet-300',
    headerBg: 'bg-violet-50 dark:bg-violet-900/10',
    taskCheck: 'text-violet-500',
  },
  {
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-100 dark:bg-emerald-900/30',
    fill: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-700',
    label: 'text-emerald-700 dark:text-emerald-300',
    milestoneBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40',
    milestoneText: 'text-emerald-700 dark:text-emerald-300',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/10',
    taskCheck: 'text-emerald-500',
  },
  {
    dot: 'bg-amber-500',
    bar: 'bg-amber-100 dark:bg-amber-900/30',
    fill: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-700',
    label: 'text-amber-700 dark:text-amber-300',
    milestoneBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40',
    milestoneText: 'text-amber-700 dark:text-amber-300',
    headerBg: 'bg-amber-50 dark:bg-amber-900/10',
    taskCheck: 'text-amber-500',
  },
]

export default function ImplementationRoadmap({ phases }: Props) {
  const totalDays = 90
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          90-Day Implementation Roadmap
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          A phased rollout plan to maximize impact while minimizing operational risk.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline bar */}
        <div>
          <div className="flex gap-1 h-8 rounded-xl overflow-hidden">
            {phases.map((phase, i) => {
              const accent = phaseAccents[i % phaseAccents.length]
              const width = ((phase.days[1] - phase.days[0] + 1) / totalDays) * 100
              return (
                <button
                  key={phase.phase}
                  onClick={() =>
                    setExpandedPhase(expandedPhase === phase.phase ? null : phase.phase)
                  }
                  style={{ width: `${width}%` }}
                  className={cn(
                    'relative group flex items-center justify-center text-xs font-semibold transition-all',
                    accent.fill,
                    'text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                  )}
                  title={`Phase ${phase.phase}: ${phase.label} (${phase.duration})`}
                >
                  <span className="hidden sm:block truncate px-1">P{phase.phase}</span>
                  {/* Hover tooltip */}
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {phase.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Day markers */}
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Day 1</span>
            <span className="text-[10px] text-muted-foreground">Day 30</span>
            <span className="text-[10px] text-muted-foreground">Day 60</span>
            <span className="text-[10px] text-muted-foreground">Day 90</span>
          </div>
        </div>

        {/* Phase cards */}
        <div className="space-y-3">
          {phases.map((phase, i) => {
            const accent = phaseAccents[i % phaseAccents.length]
            const isExpanded = expandedPhase === phase.phase

            return (
              <div
                key={phase.phase}
                className={cn(
                  'rounded-xl border overflow-hidden transition-all',
                  accent.border
                )}
              >
                {/* Phase header — clickable */}
                <button
                  onClick={() =>
                    setExpandedPhase(isExpanded ? null : phase.phase)
                  }
                  className={cn(
                    'w-full flex items-center gap-4 p-4 text-left hover:opacity-90 transition-opacity',
                    accent.headerBg
                  )}
                >
                  {/* Phase number */}
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0',
                      accent.dot
                    )}
                  >
                    {phase.phase}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('font-semibold text-sm', accent.label)}>
                        {phase.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{phase.duration}</span>
                      <span className="text-xs text-muted-foreground">
                        · Days {phase.days[0]}–{phase.days[1]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {phase.tasks.length} tasks · Milestone: {phase.milestone}
                    </p>
                  </div>

                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground shrink-0 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Expanded tasks */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 space-y-3 border-t border-slate-100 dark:border-slate-800">
                    <ul className="space-y-2">
                      {phase.tasks.map((task, ti) => (
                        <li key={ti} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={cn('w-4 h-4 mt-0.5 shrink-0', accent.taskCheck)}
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {task}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Milestone chip */}
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold',
                        accent.milestoneBg,
                        accent.milestoneText
                      )}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Milestone: {phase.milestone}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
