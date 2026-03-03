import { useState } from 'react'
import {
  BarChart3,
  Brain,
  Clock,
  FileText,
  Grid3x3,
  Layers,
  ListChecks,
  Sparkles,
} from 'lucide-react'
import { cn } from '../components/ui'
import IndustryClassificationCard from '../components/strategy/IndustryClassificationCard'
import StrategyCard from '../components/strategy/StrategyCard'
import PillarFramework from '../components/strategy/PillarFramework'
import ImplementationRoadmap from '../components/strategy/ImplementationRoadmap'
import FullReportView from '../components/strategy/FullReportView'
import ActionItems from '../components/strategy/ActionItems'
import { mockStrategyReport } from '../data/strategyMockData'

type SectionId =
  | 'overview'
  | 'strategies'
  | 'pillars'
  | 'roadmap'
  | 'report'
  | 'actions'

interface NavSection {
  id: SectionId
  label: string
  icon: React.ReactNode
}

const sections: NavSection[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'strategies', label: 'Strategies', icon: <Layers className="w-4 h-4" /> },
  { id: 'pillars', label: '8 Pillars', icon: <Grid3x3 className="w-4 h-4" /> },
  { id: 'roadmap', label: 'Roadmap', icon: <Clock className="w-4 h-4" /> },
  { id: 'report', label: 'Full Report', icon: <FileText className="w-4 h-4" /> },
  { id: 'actions', label: 'Next Steps', icon: <ListChecks className="w-4 h-4" /> },
]

const { industryClassification, strategies, implementationPriority, roadmapPhases, fullReportMarkdown } =
  mockStrategyReport

export default function StrategyView() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Strategy &amp; Report
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-generated bundle strategy tailored to your store's vertical and sales data.
          </p>
        </div>

        {/* Store indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">example-store.myshopify.com</span>
        </div>
      </div>

      {/* Section tab nav */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
              activeSection === section.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div>
        {/* Overview — classification + strategies summary */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <IndustryClassificationCard data={industryClassification} />

            {/* Quick summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Strategies"
                value={strategies.length.toString()}
                sub="recommended"
                icon="💡"
              />
              <StatCard
                label="Max AOV Lift"
                value={strategies.reduce((max, s) => {
                  const n = parseInt(s.expectedImpact.aovLift)
                  return n > max ? n : max
                }, 0) + '%'}
                sub="expected range"
                icon="📈"
              />
              <StatCard
                label="Timeline"
                value="90"
                sub="days to full rollout"
                icon="🗓️"
              />
              <StatCard
                label="Confidence"
                value={industryClassification.confidence}
                sub="classification score"
                icon="✅"
              />
            </div>

            {/* Strategies preview */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Recommended Strategies
                </h3>
                <span className="text-xs text-muted-foreground">(click Strategies tab for full detail)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {strategies.map((strategy) => {
                  const priority = implementationPriority.find(
                    (p) => p.strategyNumber === strategy.number
                  )
                  const priorityIndex = priority
                    ? implementationPriority.indexOf(priority) + 1
                    : undefined

                  return (
                    <StrategyMiniCard
                      key={strategy.number}
                      strategy={strategy}
                      priorityIndex={priorityIndex}
                      onClick={() => setActiveSection('strategies')}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Strategies — full cards */}
        {activeSection === 'strategies' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground">
                Strategies are ordered by{' '}
                <span className="font-medium text-foreground">recommended implementation priority.</span>
              </p>
            </div>

            {/* Render in priority order */}
            {[...strategies]
              .sort((a, b) => {
                const pa = implementationPriority.find((p) => p.strategyNumber === a.number)
                const pb = implementationPriority.find((p) => p.strategyNumber === b.number)
                return (
                  (pa ? implementationPriority.indexOf(pa) : 99) -
                  (pb ? implementationPriority.indexOf(pb) : 99)
                )
              })
              .map((strategy, i) => (
                <StrategyCard
                  key={strategy.number}
                  strategy={strategy}
                  priority={i + 1}
                  isPrimary={i === 0}
                />
              ))}
          </div>
        )}

        {/* Pillar framework */}
        {activeSection === 'pillars' && (
          <PillarFramework recommendedPillars={industryClassification.recommendedPillars} />
        )}

        {/* Roadmap */}
        {activeSection === 'roadmap' && (
          <ImplementationRoadmap phases={roadmapPhases} />
        )}

        {/* Full report */}
        {activeSection === 'report' && (
          <FullReportView markdown={fullReportMarkdown} />
        )}

        {/* Action items */}
        {activeSection === 'actions' && (
          <ActionItems
            priorities={implementationPriority}
            strategies={strategies}
          />
        )}
      </div>
    </div>
  )
}

// ─── Mini components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub: string
  icon: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

function StrategyMiniCard({
  strategy,
  priorityIndex,
  onClick,
}: {
  strategy: { number: number; bundleName: string; pillarName: string; expectedImpact: { aovLift: string } }
  priorityIndex?: number
  onClick: () => void
}) {
  const colors = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ]
  const gradient = colors[(strategy.number - 1) % colors.length]
  const aovColors = [
    'text-indigo-700 dark:text-indigo-300',
    'text-emerald-700 dark:text-emerald-300',
    'text-amber-700 dark:text-amber-300',
  ]
  const aovColor = aovColors[(strategy.number - 1) % aovColors.length]

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-4">
        {priorityIndex && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Priority {priorityIndex}
          </p>
        )}
        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-0.5">
          {strategy.bundleName}
        </p>
        <p className="text-xs text-muted-foreground mb-3">{strategy.pillarName}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold tabular-nums ${aovColor}`}>
            {strategy.expectedImpact.aovLift}
          </span>
          <span className="text-xs text-muted-foreground">AOV lift</span>
        </div>
      </div>
    </button>
  )
}
