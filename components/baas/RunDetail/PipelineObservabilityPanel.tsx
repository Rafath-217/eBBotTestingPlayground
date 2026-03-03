/**
 * PipelineObservabilityPanel — Pipeline observability data
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Pipeline Flow (horizontal chip timeline)                │
 *  ├──────────────┬───────────────────────────────────────────┤
 *  │  Planner     │  Reflection Status                       │
 *  │  Decisions   │                                          │
 *  ├──────────────┴───────────────────────────────────────────┤
 *  │  Decision Log (terminal style)                          │
 *  └──────────────────────────────────────────────────────────┘
 */

import {
  Activity,
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Brain,
  Zap,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '../../ui'
import { formatDuration } from '../../../utils'
import type { EnrichedPipelineRun, StrategyValidation } from '../../../types'

interface PipelineObservabilityPanelProps {
  run: EnrichedPipelineRun
}

const AGENT_NAME_MAP: Record<string, string> = {
  planner: 'Planner',
  auditor: 'Auditor',
  analyst: 'Analyst',
  crossValidator: 'Cross-Validator',
  metricsEngine: 'Metrics Engine',
  classifier: 'Classifier',
  strategyArchitect: 'Strategy Architect',
  strategyComposer: 'Strategy Composer',
  salesSummaryComposer: 'Sales Summary',
  reflection: 'Reflection',
  reportCompiler: 'Report Compiler',
}

const AGENT_ORDER = [
  'planner',
  'auditor',
  'analyst',
  'crossValidator',
  'metricsEngine',
  'classifier',
  'strategyArchitect',
  'strategyComposer',
  'salesSummaryComposer',
  'reflection',
  'reportCompiler',
]

function getChipBorderColor(durationMs: number): string {
  if (durationMs > 10000) return 'border-amber-300'
  if (durationMs > 5000) return 'border-slate-300'
  return 'border-emerald-300'
}

export default function PipelineObservabilityPanel({ run }: PipelineObservabilityPanelProps) {
  const { plannerDecisions, agentTimings, reflectionResult, decisionLog, reflectionAttempts } = run

  // Empty state
  if (!plannerDecisions && !agentTimings && !reflectionResult && (!decisionLog || decisionLog.length === 0)) {
    return <EmptyPanel message="No observability data available." />
  }

  // Build ordered agent list from timings
  const orderedAgents = agentTimings
    ? AGENT_ORDER.filter(key => key in agentTimings)
    : []

  const isParallel = plannerDecisions?.parallelizable ?? false
  const parallelAgents = new Set(['auditor', 'analyst'])

  return (
    <div className="space-y-4 p-6">
      {/* ── Pipeline Flow ─────────────────────────────────────── */}
      {agentTimings && orderedAgents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-slate-500" />
              Pipeline Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-2">
              {orderedAgents.map((agentKey, i) => {
                const timing = agentTimings[agentKey]
                if (!timing) return null

                // Handle parallel grouping for auditor + analyst
                if (isParallel && agentKey === 'auditor') {
                  const analystTiming = agentTimings['analyst']
                  return (
                    <span key={agentKey} className="contents">
                      {i > 0 && <Separator />}
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="blue" className="text-[9px] w-fit">parallel</Badge>
                          <AgentChip name="Auditor" durationMs={timing.durationMs} />
                          {analystTiming && (
                            <AgentChip name="Analyst" durationMs={analystTiming.durationMs} />
                          )}
                        </div>
                      </div>
                    </span>
                  )
                }

                // Skip analyst if already shown in parallel group
                if (isParallel && agentKey === 'analyst') return null

                return (
                  <span key={agentKey} className="contents">
                    {i > 0 && !(isParallel && agentKey === 'analyst') && <Separator />}
                    <AgentChip
                      name={AGENT_NAME_MAP[agentKey] ?? agentKey}
                      durationMs={timing.durationMs}
                    />
                  </span>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 2-column grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Planner Decisions */}
        {plannerDecisions && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-slate-500" />
                Planner Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={plannerDecisions.parallelizable ? 'success' : 'outline'} className="text-xs">
                  Parallel: {plannerDecisions.parallelizable ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={plannerDecisions.runAuditor ? 'success' : 'outline'} className="text-xs">
                  Run Auditor: {plannerDecisions.runAuditor ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={plannerDecisions.runAnalyst ? 'success' : 'outline'} className="text-xs">
                  Run Analyst: {plannerDecisions.runAnalyst ? 'Yes' : 'No'}
                </Badge>
              </div>

              {plannerDecisions.decisionLog.length > 0 && (
                <div className="space-y-1">
                  {plannerDecisions.decisionLog.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-slate-400 text-xs mt-0.5 shrink-0">&bull;</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{entry}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reflection Status */}
        {reflectionResult && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {reflectionResult.passed
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <XCircle className="w-4 h-4 text-red-500" />
                }
                Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={reflectionResult.passed ? 'success' : 'destructive'}>
                  {reflectionResult.passed ? 'Passed' : 'Failed'}
                </Badge>
                {reflectionAttempts != null && (
                  <span className="text-xs text-muted-foreground">
                    Attempt {reflectionAttempts}
                  </span>
                )}
              </div>

              {reflectionResult.tokenUsage && (
                <p className="text-xs text-muted-foreground">
                  Tokens: {reflectionResult.tokenUsage.inputTokens.toLocaleString()} in / {reflectionResult.tokenUsage.outputTokens.toLocaleString()} out
                </p>
              )}

              {reflectionResult.reflectionLog.length > 0 && (
                <div className="space-y-1">
                  {reflectionResult.reflectionLog.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-slate-400 text-xs mt-0.5 shrink-0">&bull;</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{entry}</span>
                    </div>
                  ))}
                </div>
              )}

              {reflectionResult.constraintsForRetry.length > 0 && (
                <div className="space-y-1.5">
                  {reflectionResult.constraintsForRetry.map((constraint, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20"
                    >
                      <span className="text-xs text-amber-800 dark:text-amber-300">{constraint}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Overall Issues */}
              {reflectionResult.overallIssues && reflectionResult.overallIssues.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Overall Issues</p>
                  {reflectionResult.overallIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Per-Strategy Validation */}
              {reflectionResult.validationResults && reflectionResult.validationResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Strategy Validations</p>
                  {reflectionResult.validationResults.map((v) => (
                    <StrategyValidationRow key={v.strategyIndex} validation={v} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Decision Log ──────────────────────────────────────── */}
      {decisionLog && decisionLog.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4 text-slate-500" />
              Decision Log
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {decisionLog.map((entry, i) => (
                <div key={i} className="text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-slate-500">{'\u25B8'} </span>
                  {entry}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AgentChip({ name, durationMs }: { name: string; durationMs: number }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 border',
        getChipBorderColor(durationMs)
      )}
    >
      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{name}</p>
      <p className="text-[10px] font-mono text-muted-foreground">{formatDuration(durationMs)}</p>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-slate-300 dark:text-slate-600 text-sm select-none">&rarr;</span>
  )
}

function StrategyValidationRow({ validation }: { validation: StrategyValidation }) {
  const checks = [
    { label: 'Exceeds Free Shipping', passed: validation.checks.exceedsFreeShipping },
    { label: 'Improves AOV', passed: validation.checks.improvesAov },
    { label: 'Avoids Margin Destruction', passed: validation.checks.avoidsMarginDestruction },
    { label: 'Aligns with Pain Point', passed: validation.checks.alignsWithPainPoint },
  ]
  const allPassed = checks.every((c) => c.passed)

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
      <div className="flex items-center gap-2">
        {allPassed
          ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        }
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Strategy {validation.strategyIndex + 1}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.passed
              ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              : <XCircle className="w-3 h-3 text-red-400" />
            }
            <span className="text-[11px] text-slate-600 dark:text-slate-400">{c.label}</span>
          </div>
        ))}
      </div>
      {validation.issues.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          {validation.issues.map((issue, i) => (
            <p key={i} className="text-[11px] text-red-600 dark:text-red-400">{issue}</p>
          ))}
        </div>
      )}
    </div>
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
