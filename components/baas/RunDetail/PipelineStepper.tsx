/**
 * PipelineStepper
 *
 * Horizontal (desktop) / vertical (mobile) stepper visualising which of the
 * 5 agents ran, in what order, and their individual status.
 *
 * Desktop layout:
 *
 *  [●]───────[●]───────[●]───────[◉]───────[○]
 *  Website   Data     Industry  Strategy  Report
 *  Auditor  Analyst  Classifier Architect Compiler
 *  ✓ 4.2s   ✓ 6.1s   ✓ 1.8s   ⟳ running  —
 *
 * Each node is color-coded:
 *   completed → emerald
 *   running   → blue (pulsing)
 *   failed    → red
 *   pending   → slate (muted)
 *   skipped   → slate/dashed
 */

import { Check, X, Loader2, Clock, SkipForward } from 'lucide-react'
import { cn } from '../../ui'
import type { AgentExecution, AgentName } from '../../../types'

// Canonical agent order - the pipeline always follows this sequence
const AGENT_ORDER: AgentName[] = [
  'Website Auditor',
  'Data Analyst',
  'Industry Classifier',
  'Strategy Architect',
  'Report Compiler',
]

// Short display labels for tight spaces
const AGENT_SHORT: Record<AgentName, string> = {
  'Website Auditor':    'Auditor',
  'Data Analyst':       'Analyst',
  'Industry Classifier':'Classifier',
  'Strategy Architect': 'Strategist',
  'Report Compiler':    'Compiler',
}

interface AgentStepConfig {
  bgClass: string
  borderClass: string
  textClass: string
  connectorClass: string
  icon: React.ReactNode
  label: string
}

function getStepConfig(status: AgentExecution['status'] | 'pending'): AgentStepConfig {
  switch (status) {
    case 'completed':
      return {
        bgClass: 'bg-emerald-500',
        borderClass: 'border-emerald-500',
        textClass: 'text-emerald-700 dark:text-emerald-400',
        connectorClass: 'bg-emerald-400',
        icon: <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />,
        label: 'Completed',
      }
    case 'running':
      return {
        bgClass: 'bg-blue-500 animate-pulse',
        borderClass: 'border-blue-500',
        textClass: 'text-blue-700 dark:text-blue-400',
        connectorClass: 'bg-slate-200 dark:bg-slate-700',
        icon: <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />,
        label: 'Running',
      }
    case 'failed':
      return {
        bgClass: 'bg-red-500',
        borderClass: 'border-red-500',
        textClass: 'text-red-700 dark:text-red-400',
        connectorClass: 'bg-slate-200 dark:bg-slate-700',
        icon: <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />,
        label: 'Failed',
      }
    case 'skipped':
      return {
        bgClass: 'bg-slate-200 dark:bg-slate-700',
        borderClass: 'border-dashed border-slate-300 dark:border-slate-600',
        textClass: 'text-slate-400 dark:text-slate-500',
        connectorClass: 'bg-slate-200 dark:bg-slate-700',
        icon: <SkipForward className="w-3.5 h-3.5 text-slate-400" />,
        label: 'Skipped',
      }
    default: // pending
      return {
        bgClass: 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600',
        borderClass: 'border-slate-300 dark:border-slate-600',
        textClass: 'text-slate-400 dark:text-slate-500',
        connectorClass: 'bg-slate-200 dark:bg-slate-700',
        icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
        label: 'Pending',
      }
  }
}

function formatMs(ms?: number): string {
  if (!ms) return ''
  if (ms < 1000) return `${ms}ms`
  const s = (ms / 1000).toFixed(1)
  return `${s}s`
}

interface PipelineStepperProps {
  agentsExecuted: AgentExecution[]
  /** Which tab is currently active so we can highlight that step */
  activeAgent?: AgentName | null
  onAgentClick?: (name: AgentName) => void
}

export default function PipelineStepper({
  agentsExecuted,
  activeAgent,
  onAgentClick,
}: PipelineStepperProps) {
  // Build a lookup from agent name → execution data
  const executionMap = new Map<AgentName, AgentExecution>()
  for (const ex of agentsExecuted) {
    executionMap.set(ex.name, ex)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-5 shadow-sm">
      {/* Desktop stepper: horizontal */}
      <div className="hidden sm:flex items-start">
        {AGENT_ORDER.map((agentName, idx) => {
          const exec = executionMap.get(agentName)
          const status = exec?.status ?? 'pending'
          const cfg = getStepConfig(status)
          const isLast = idx === AGENT_ORDER.length - 1
          const isActive = activeAgent === agentName

          return (
            <div key={agentName} className="flex items-start flex-1 min-w-0">
              {/* Step node + label */}
              <div className="flex flex-col items-center min-w-0 flex-1">
                {/* Circle */}
                <button
                  onClick={() => onAgentClick?.(agentName)}
                  disabled={status === 'pending' || status === 'skipped'}
                  aria-label={`Go to ${agentName} results`}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    cfg.bgClass,
                    isActive && 'ring-2 ring-offset-2 ring-primary',
                    (status !== 'pending' && status !== 'skipped') && 'cursor-pointer hover:opacity-80',
                    (status === 'pending' || status === 'skipped') && 'cursor-default'
                  )}
                >
                  {cfg.icon}
                </button>

                {/* Agent name */}
                <span
                  className={cn(
                    'mt-2 text-xs font-semibold text-center leading-tight px-1 truncate w-full',
                    cfg.textClass,
                    isActive && 'font-bold'
                  )}
                >
                  {AGENT_SHORT[agentName]}
                </span>

                {/* Duration */}
                {exec?.durationMs && (
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {formatMs(exec.durationMs)}
                  </span>
                )}
                {status === 'running' && (
                  <span className="text-[10px] text-blue-500 mt-0.5">running…</span>
                )}
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div className="flex-none mx-1 mt-4 flex-1 min-w-[16px]">
                  <div className={cn('h-0.5 w-full', cfg.connectorClass)} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile stepper: vertical list */}
      <div className="sm:hidden space-y-0">
        {AGENT_ORDER.map((agentName, idx) => {
          const exec = executionMap.get(agentName)
          const status = exec?.status ?? 'pending'
          const cfg = getStepConfig(status)
          const isLast = idx === AGENT_ORDER.length - 1
          const isActive = activeAgent === agentName

          return (
            <div key={agentName} className="flex gap-3">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onAgentClick?.(agentName)}
                  disabled={status === 'pending' || status === 'skipped'}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                    cfg.bgClass,
                    isActive && 'ring-2 ring-offset-1 ring-primary'
                  )}
                >
                  {cfg.icon}
                </button>
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 min-h-[20px] my-1', cfg.connectorClass)} />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-semibold', cfg.textClass)}>
                    {agentName}
                  </span>
                  {exec?.durationMs && (
                    <span className="text-xs text-muted-foreground">{formatMs(exec.durationMs)}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
