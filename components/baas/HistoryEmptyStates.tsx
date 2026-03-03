import { Rocket, FilterX, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../ui'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`rounded bg-slate-200 dark:bg-slate-700 animate-pulse ${className ?? ''}`} />
  )
}

interface LoadingSkeletonProps {
  view: 'card' | 'row'
  count?: number
}

export function LoadingSkeleton({ view, count = 6 }: LoadingSkeletonProps) {
  if (view === 'row') {
    return (
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <SkeletonBlock className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="w-2.5 h-2.5 rounded-full" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <SkeletonBlock className="h-3.5 w-40" />
              <SkeletonBlock className="h-2.5 w-64" />
            </div>
            <SkeletonBlock className="h-3.5 w-10 hidden sm:block" />
            <SkeletonBlock className="h-3.5 w-12 hidden sm:block" />
            <SkeletonBlock className="h-3.5 w-14 hidden md:block" />
            <SkeletonBlock className="h-3.5 w-10 hidden sm:block" />
            <div className="flex gap-1">
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SkeletonBlock className="w-3.5 h-3.5 rounded" />
              <SkeletonBlock className="w-2.5 h-2.5 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <SkeletonBlock className="w-12 h-7 rounded" />
              <SkeletonBlock className="h-3 w-8" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <SkeletonBlock className="h-2.5 w-12" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
            ))}
          </div>

          <div className="flex gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            {Array.from({ length: 4 }).map((_, j) => (
              <SkeletonBlock key={j} className="h-5 w-14 rounded" />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <SkeletonBlock className="h-3.5 w-24" />
            <div className="flex gap-1">
              <SkeletonBlock className="h-7 w-14 rounded-lg" />
              <SkeletonBlock className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface FirstRunEmptyProps {
  onTrigger?: () => void
}

export function FirstRunEmpty({ onTrigger }: FirstRunEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Rocket className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        No pipeline runs yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Run your first AI-powered audit to analyse an e-commerce store. Results will appear
        here with full metrics, scores, and revenue opportunities.
      </p>
      {onTrigger && (
        <Button onClick={onTrigger} className="gap-2">
          <Rocket className="w-4 h-4" />
          Run your first audit
        </Button>
      )}
    </div>
  )
}

interface FilteredEmptyProps {
  onClear: () => void
}

export function FilteredEmpty({ onClear }: FilteredEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <FilterX className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        No runs match your filters
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Try adjusting or clearing your search and filter criteria.
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="gap-1.5">
        <FilterX className="w-3.5 h-3.5" />
        Clear all filters
      </Button>
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        Failed to load history
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 mb-5 max-w-sm">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </Button>
    </div>
  )
}
