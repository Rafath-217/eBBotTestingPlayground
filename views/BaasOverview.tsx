import { Construction } from 'lucide-react'

export default function BaasOverview() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">BaaS Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Trigger AI-powered e-commerce audits and review key metrics across all pipeline runs.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Under Construction</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          The BaaS pipeline dashboard is currently being built. This page will let you trigger audits and view pipeline run history. Coming soon.
        </p>
      </div>
    </>
  )
}
