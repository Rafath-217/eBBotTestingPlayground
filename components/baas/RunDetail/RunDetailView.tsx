/**
 * RunDetailView — Main orchestrator component
 *
 * Full-screen overlay that replaces the history list when a user clicks
 * "View" on a pipeline run. Manages which tab is active and wires
 * the Stepper click → tab navigation.
 *
 * Renders inside the existing Layout's content area (the scrollable div).
 *
 * Component tree:
 *
 *  RunDetailView
 *  ├── RunDetailHeader          (sticky top bar: back, meta, score, close)
 *  ├── PipelineStepper          (agent progress visualization)
 *  ├── AgentTabs                (sticky tab nav)
 *  └── <panel>                  (switched on activeTab)
 *      ├── OverviewPanel
 *      ├── AuditorPanel
 *      ├── AnalystPanel
 *      ├── ClassifierPanel
 *      ├── StrategyPanel
 *      └── ReportPanel
 *
 * The component accepts either an EnrichedPipelineRun (if the backend
 * returns the full enriched shape) or a plain PipelineRun (legacy),
 * which gets wrapped into an EnrichedPipelineRun with a best-effort
 * adapter so legacy data still renders correctly.
 */

import { useState, useCallback } from 'react'
import RunDetailHeader from './RunDetailHeader'
import PipelineStepper from './PipelineStepper'
import AgentTabs, { type TabId } from './AgentTabs'
import OverviewPanel from './OverviewPanel'
import AuditorPanel from './AuditorPanel'
import AnalystPanel from './AnalystPanel'
import ClassifierPanel from './ClassifierPanel'
import StrategyPanel from './StrategyPanel'
import ReportPanel from './ReportPanel'
import type { BaasPipelineRun, EnrichedPipelineRun, AgentName } from '../../../types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RunDetailViewProps {
  /** Can accept a plain PipelineRun or the full EnrichedPipelineRun */
  run: BaasPipelineRun | EnrichedPipelineRun
  onClose: () => void
}

// ─── Tab → AgentName mapping ──────────────────────────────────────────────────

const TAB_TO_AGENT: Partial<Record<TabId, AgentName>> = {
  auditor:    'Website Auditor',
  analyst:    'Data Analyst',
  classifier: 'Industry Classifier',
  strategy:   'Strategy Architect',
  report:     'Report Compiler',
}

const AGENT_TO_TAB: Partial<Record<AgentName, TabId>> = {
  'Website Auditor':    'auditor',
  'Data Analyst':       'analyst',
  'Industry Classifier':'classifier',
  'Strategy Architect': 'strategy',
  'Report Compiler':    'report',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RunDetailView({ run, onClose }: RunDetailViewProps) {
  const enriched = toEnriched(run)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // When the user clicks a step node in the Stepper, jump to that tab
  const handleAgentClick = useCallback((agentName: AgentName) => {
    const tab = AGENT_TO_TAB[agentName]
    if (tab) setActiveTab(tab)
  }, [])

  // Navigate from overview CTAs
  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab)
    // Scroll back to top of the detail view so tabs are visible
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // The active agent for the stepper highlight
  const activeAgent = TAB_TO_AGENT[activeTab] ?? null

  return (
    <div className="flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 -mx-6 -mt-8 md:-mx-8">
      {/* Sticky header */}
      <RunDetailHeader run={enriched} onClose={onClose} />

      {/* Pipeline Stepper (scrolls with content, but sits visually above tabs) */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950">
        <PipelineStepper
          agentsExecuted={enriched.agentsExecuted}
          activeAgent={activeAgent}
          onAgentClick={handleAgentClick}
        />
      </div>

      {/* Sticky tab bar */}
      <AgentTabs
        run={enriched}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Panel content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'overview'    && <OverviewPanel    run={enriched} onNavigate={handleNavigate} />}
        {activeTab === 'auditor'     && <AuditorPanel     run={enriched} />}
        {activeTab === 'analyst'     && <AnalystPanel     run={enriched} />}
        {activeTab === 'classifier'  && <ClassifierPanel  run={enriched} />}
        {activeTab === 'strategy'    && <StrategyPanel    run={enriched} />}
        {activeTab === 'report'      && <ReportPanel      run={enriched} />}
      </div>
    </div>
  )
}

// ─── Legacy → Enriched adapter ────────────────────────────────────────────────
// Ensures plain PipelineRun objects (which have no agentsExecuted or
// individual agent result fields) still render gracefully.

function toEnriched(run: BaasPipelineRun | EnrichedPipelineRun): EnrichedPipelineRun {
  const isDone = run.status === 'completed'
  const isFailed = run.status === 'failed'
  const isFullAnalysis = run.pipelineType === 'full-analysis' || (run as any).pipelineType === 'fullAnalysis'

  // Backend returns agentsExecuted as string[], frontend needs AgentExecution[]
  const agentNames: AgentName[] = [
    'Website Auditor', 'Data Analyst', 'Industry Classifier', 'Strategy Architect', 'Report Compiler',
  ]

  let agentsExecuted: { name: AgentName; status: 'completed' | 'running' | 'failed' | 'skipped' | 'pending' }[]

  if ('agentsExecuted' in run && Array.isArray(run.agentsExecuted) && run.agentsExecuted.length > 0) {
    // Could be string[] from backend or AgentExecution[] if already enriched
    const first = run.agentsExecuted[0]
    if (typeof first === 'string') {
      // Backend sends string[] — normalize to AgentExecution[]
      const executedNames: string[] = run.agentsExecuted as unknown as string[]
      agentsExecuted = agentNames.map((name) => ({
        name,
        status: executedNames.includes(name)
          ? (isFailed ? 'failed' as const : isDone ? 'completed' as const : 'running' as const)
          : (isFullAnalysis ? 'pending' as const : 'skipped' as const),
      }))
    } else {
      // Already AgentExecution[]
      agentsExecuted = run.agentsExecuted as typeof agentsExecuted
    }
  } else {
    // No agentsExecuted — infer from legacy fields
    const makeAgent = (name: AgentName, include: boolean) => ({
      name,
      status: !include
        ? 'skipped' as const
        : isFailed
        ? 'failed' as const
        : isDone
        ? 'completed' as const
        : 'running' as const,
    })

    agentsExecuted = [
      makeAgent('Website Auditor',     true),
      makeAgent('Data Analyst',        isFullAnalysis),
      makeAgent('Industry Classifier', isFullAnalysis),
      makeAgent('Strategy Architect',  isFullAnalysis),
      makeAgent('Report Compiler',     isFullAnalysis && !!(run as any).result?.strategy),
    ]
  }

  return {
    ...(run as any),
    agentsExecuted,
    auditorResults: (run as any).auditorResults ?? undefined,
    analystResults: (run as any).analystResults ?? undefined,
    classifierResults: (run as any).classifierResults ?? undefined,
    strategyResults: (run as any).strategyResults ?? undefined,
    reportResults: (run as any).reportResults
      ?? ((run as any).result?.strategy ? { markdownContent: (run as any).result.strategy } : undefined),
  }
}
