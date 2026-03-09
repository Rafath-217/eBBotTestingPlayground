import { Construction, Sparkles } from 'lucide-react'
import { Badge } from '../components/ui'

const AGENT_LABELS = [
  'Website Audit',
  'Data Analyst',
  'Industry Classifier',
  'Strategy Architect',
  'Report Compiler',
]

export default function StrategyView() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create Full Strategy
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Run all 5 agents — Website Audit, Data Analyst, Industry Classifier, Strategy Architect, Report Compiler
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {AGENT_LABELS.map((label) => (
            <Badge key={label} variant="purple" className="text-[10px]">
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Under Construction</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          The full strategy pipeline runner is currently being built. You'll be able to trigger all 5 agents from here and view the assembled report. Coming soon.
        </p>
      </div>
    </div>
  )
}
