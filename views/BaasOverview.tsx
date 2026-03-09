import { useState } from 'react'
import { Construction } from 'lucide-react'
import PipelineHistoryEnhanced from '../components/baas/PipelineHistoryEnhanced'

export default function BaasOverview() {
  const [refreshKey] = useState(0)

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">BaaS Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Trigger AI-powered e-commerce audits and review key metrics across all pipeline runs.
        </p>
      </div>

      {/* Under construction banner replacing PipelineTrigger */}
      <div className="flex items-center gap-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
        <Construction className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Pipeline trigger is under construction</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Running new audits from the dashboard is coming soon. Existing runs are still viewable below.</p>
        </div>
      </div>

      {/* History with aggregate stats shown inline */}
      <PipelineHistoryEnhanced
        refreshKey={refreshKey}
        showStats
      />
    </>
  )
}
