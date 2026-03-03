import { useState } from 'react'
import PipelineTrigger from '../components/baas/PipelineTrigger'
import PipelineHistoryEnhanced from '../components/baas/PipelineHistoryEnhanced'

export default function BaasOverview() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">BaaS Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Trigger AI-powered e-commerce audits and review key metrics across all pipeline runs.
        </p>
      </div>

      {/* Stats bar + quick-launch trigger */}
      <PipelineTrigger onPipelineComplete={() => setRefreshKey((k) => k + 1)} />

      {/* History with aggregate stats shown inline */}
      <PipelineHistoryEnhanced
        refreshKey={refreshKey}
        showStats
      />
    </>
  )
}
