import { ArrowRight, ExternalLink, Clock, Users, BarChart3, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui'
import type { ImplementationPriority, StrategyRecommendation } from '../../types/strategy'

interface Props {
  priorities: ImplementationPriority[]
  strategies: StrategyRecommendation[]
}

const stepColors = [
  {
    num: 'bg-indigo-600 text-white',
    border: 'border-indigo-200 dark:border-indigo-800',
    bg: 'bg-indigo-50 dark:bg-indigo-900/10',
    badge: 'indigo' as const,
    timeText: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    num: 'bg-violet-600 text-white',
    border: 'border-violet-200 dark:border-violet-800',
    bg: 'bg-violet-50 dark:bg-violet-900/10',
    badge: 'purple' as const,
    timeText: 'text-violet-600 dark:text-violet-400',
  },
  {
    num: 'bg-emerald-600 text-white',
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    badge: 'emerald' as const,
    timeText: 'text-emerald-600 dark:text-emerald-400',
  },
]

const immediateActions = [
  {
    icon: <ExternalLink className="w-4 h-4 text-indigo-500" />,
    title: 'Install Fly Bundles',
    description: 'Available on the Shopify App Store. Free trial available.',
    cta: 'Open App Store',
    time: 'Today',
  },
  {
    icon: <Users className="w-4 h-4 text-violet-500" />,
    title: 'Share this report with your team',
    description: 'Download the full report and brief your ops and marketing team.',
    cta: 'Download Report',
    time: 'Today',
  },
  {
    icon: <BarChart3 className="w-4 h-4 text-emerald-500" />,
    title: 'Establish your baseline AOV',
    description: 'Note your current AOV before launching bundles so you can measure lift accurately.',
    cta: 'View Analytics',
    time: 'This week',
  },
]

export default function ActionItems({ priorities, strategies }: Props) {
  const sortedStrategies = [...strategies].sort((a, b) => {
    const pa = priorities.find((p) => p.strategyNumber === a.number)
    const pb = priorities.find((p) => p.strategyNumber === b.number)
    return (pa ? priorities.indexOf(pa) : 99) - (pb ? priorities.indexOf(pb) : 99)
  })

  return (
    <div className="space-y-5">
      {/* Implementation priority order */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Your Implementation Priority Order
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Start with Strategy 1 for fastest impact. Each strategy builds on the last.
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {sortedStrategies.map((strategy, i) => {
              const priorityData = priorities.find(
                (p) => p.strategyNumber === strategy.number
              )
              const colors = stepColors[i % stepColors.length]

              return (
                <div
                  key={strategy.number}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${colors.border} ${colors.bg}`}
                >
                  {/* Step number */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colors.num}`}
                  >
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {strategy.bundleName}
                      </span>
                      <Badge variant={colors.badge} className="text-[10px]">
                        {strategy.pillarName}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {priorityData?.reason ?? strategy.problemSolved}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Expected lift</p>
                    <p className={`text-lg font-bold tabular-nums ${colors.timeText}`}>
                      {strategy.expectedImpact.aovLift}
                    </p>
                    <p className="text-[10px] text-muted-foreground">AOV</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Immediate actions */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />

        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            Immediate Next Steps
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Three actions you can take right now to start moving.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {immediateActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                {action.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {action.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5" />
                    {action.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {action.cta}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary callout */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Ready to increase your AOV by up to 25%?
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              These strategies are tailored to your store's data. The fastest path to results
              is to start with Strategy 1 (Stock Up &amp; Save) this week — your repeat customer
              base is already primed for volume buying.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button size="sm" className="gap-2">
                Get Started with Strategy 1
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Install Fly Bundles
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
