/**
 * AgentTabs
 *
 * Sticky horizontal tab bar that lets the user switch between agent result panels.
 * Each tab only appears when data for that agent is available.
 *
 * Tabs:
 *   Overview | Auditor | Analyst | Classifier | Strategy | Report
 *
 * "Overview" is always present and shows the run summary + key metrics.
 * Agent tabs are shown/hidden based on which results exist on the run object.
 *
 * Visual:
 *   ┌─────────┬──────────┬──────────┬─────────────┬──────────┬────────┐
 *   │Overview │ Auditor  │ Analyst  │ Classifier  │ Strategy │ Report │
 *   └─────────┴──────────┴──────────┴─────────────┴──────────┴────────┘
 *   active tab gets a bottom border in primary color + bold text
 */

import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Tag,
  Lightbulb,
  FileText,
  Activity,
  TrendingUp,
  Gauge,
} from 'lucide-react'
import { cn } from '../../ui'
import type { EnrichedPipelineRun } from '../../../types'

export type TabId =
  | 'overview'
  | 'auditor'
  | 'analyst'
  | 'classifier'
  | 'strategy'
  | 'metrics'
  | 'salesSummary'
  | 'report'
  | 'observability'

interface TabConfig {
  id: TabId
  label: string
  icon: React.ReactNode
  /** If true, this tab is always present regardless of data */
  alwaysShow?: boolean
  /** Key on EnrichedPipelineRun that must be truthy for the tab to appear */
  dataKey?: keyof EnrichedPipelineRun
}

const TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    alwaysShow: true,
  },
  {
    id: 'auditor',
    label: 'Auditor',
    icon: <Globe className="w-3.5 h-3.5" />,
    dataKey: 'auditorResults',
  },
  {
    id: 'analyst',
    label: 'Analyst',
    icon: <BarChart3 className="w-3.5 h-3.5" />,
    dataKey: 'analystResults',
  },
  {
    id: 'classifier',
    label: 'Classifier',
    icon: <Tag className="w-3.5 h-3.5" />,
    dataKey: 'classifierResults',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    dataKey: 'strategyResults',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: <Gauge className="w-3.5 h-3.5" />,
    dataKey: 'metricsResult',
  },
  {
    id: 'salesSummary',
    label: 'Sales Summary',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    dataKey: 'salesSummary',
  },
  {
    id: 'report',
    label: 'Report',
    icon: <FileText className="w-3.5 h-3.5" />,
    dataKey: 'reportResults',
  },
  {
    id: 'observability',
    label: 'Pipeline',
    icon: <Activity className="w-3.5 h-3.5" />,
    dataKey: 'decisionLog',
  },
]

interface AgentTabsProps {
  run: EnrichedPipelineRun
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function AgentTabs({ run, activeTab, onTabChange }: AgentTabsProps) {
  const visibleTabs = TABS.filter(
    (t) => t.alwaysShow || (t.dataKey && run[t.dataKey] != null)
  )

  return (
    <div className="sticky top-[73px] z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      {/* Scrollable on mobile */}
      <div className="flex overflow-x-auto scrollbar-none px-6 gap-0">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap',
                'border-b-2 transition-colors focus-visible:outline-none',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600'
              )}
              aria-selected={isActive}
              role="tab"
            >
              <span className={cn(isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500')}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
