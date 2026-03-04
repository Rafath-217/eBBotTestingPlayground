import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { getHistory, deleteHistoryItem } from '../../services/baasDataService'
import {
  getRunScore, getRunOpportunity, getRunVertical,
  computeDashboardStats,
} from '../../utils'
import type { BaasPipelineRun, EnrichedPipelineRun } from '../../types'
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui'
import { RunDetailView } from './RunDetail'
import RunCard from './RunCard'
import HistoryToolbar, {
  DEFAULT_FILTERS,
  type HistoryFilters,
  type ViewMode,
  type SortField,
  type SortDir,
} from './HistoryToolbar'
import {
  LoadingSkeleton, FirstRunEmpty, FilteredEmpty, ErrorState,
} from './HistoryEmptyStates'
import RunningPipelineBanner from './RunningPipelineBanner'
import DashboardStatsBar from './DashboardStatsBar'

type AnyRun = BaasPipelineRun | EnrichedPipelineRun

interface Props {
  refreshKey: number
  showStats?: boolean
  onNavigateToTrigger?: () => void
}

function exportCSV(runs: AnyRun[]) {
  const headers = ['ID', 'Domain', 'Type', 'Status', 'Score', 'Opportunity', 'Revenue', 'Orders', 'Vertical', 'Duration (ms)', 'Created At']
  const rows = runs.map((r) => [
    r._id,
    r.shopName,
    r.pipelineType,
    r.status,
    getRunScore(r) ?? '',
    getRunOpportunity(r) ?? '',
    '',
    '',
    getRunVertical(r) ?? '',
    r.durationMs,
    r.createdAt,
  ])
  const csv = [headers, ...rows].map((row) => row.map(String).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pipeline-history-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function sortRuns(runs: AnyRun[], field: SortField, dir: SortDir): AnyRun[] {
  return [...runs].sort((a, b) => {
    let va: number | string = 0
    let vb: number | string = 0

    switch (field) {
      case 'date':
        va = new Date(a.createdAt).getTime()
        vb = new Date(b.createdAt).getTime()
        break
      case 'score':
        va = getRunScore(a) ?? -1
        vb = getRunScore(b) ?? -1
        break
      case 'opportunity':
        va = getRunOpportunity(a) ?? -1
        vb = getRunOpportunity(b) ?? -1
        break
      case 'duration':
        va = a.durationMs ?? 0
        vb = b.durationMs ?? 0
        break
      case 'domain':
        va = a.shopName?.toLowerCase() ?? ''
        vb = b.shopName?.toLowerCase() ?? ''
        break
    }

    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })
}

function applyFilters(runs: AnyRun[], f: HistoryFilters): AnyRun[] {
  return runs.filter((run) => {
    if (f.search) {
      const q = f.search.toLowerCase()
      const domain = run.shopName?.toLowerCase() ?? ''
      const app = (run as EnrichedPipelineRun).appName?.toLowerCase() ?? ''
      if (!domain.includes(q) && !app.includes(q)) return false
    }
    if (f.status !== 'all' && run.status !== f.status) return false
    if (f.type !== 'all' && run.pipelineType !== f.type) return false
    if (f.vertical !== 'all') {
      const v = getRunVertical(run)
      if (v !== f.vertical) return false
    }
    if (f.scoreMin !== '') {
      const s = getRunScore(run)
      if (s == null || s < Number(f.scoreMin)) return false
    }
    if (f.scoreMax !== '') {
      const s = getRunScore(run)
      if (s == null || s > Number(f.scoreMax)) return false
    }
    if (f.dateFrom) {
      if (new Date(run.createdAt) < new Date(f.dateFrom)) return false
    }
    if (f.dateTo) {
      if (new Date(run.createdAt) > new Date(f.dateTo + 'T23:59:59')) return false
    }
    return true
  })
}

export default function PipelineHistoryEnhanced({ refreshKey, showStats = false, onNavigateToTrigger }: Props) {
  const [items, setItems] = useState<AnyRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<AnyRun | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'date', dir: 'desc' })
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const isMounted = useRef(true)
  useEffect(() => { return () => { isMounted.current = false } }, [])

  const fetchHistory = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const { data } = await getHistory(page, 20)
      const historyItems: AnyRun[] = data.data || data.history || data || []
      if (isMounted.current) {
        setItems(Array.isArray(historyItems) ? historyItems : [])
        setTotalPages(data.totalPages || data.pagination?.totalPages || 1)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      if (isMounted.current) {
        setError(axiosErr.response?.data?.message || axiosErr.message || 'Failed to load history')
      }
    } finally {
      if (isMounted.current && !silent) setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchHistory() }, [fetchHistory, refreshKey])

  const runningRuns = useMemo(() => items.filter((r) => r.status === 'running'), [items])

  const availableVerticals = useMemo(() => {
    const set = new Set<string>()
    for (const r of items) {
      const v = getRunVertical(r)
      if (v) set.add(v)
    }
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(() => applyFilters(items, filters), [items, filters])
  const sorted = useMemo(() => sortRuns(filtered, sort.field, sort.dir), [filtered, sort])
  const stats = useMemo(() => computeDashboardStats(items), [items])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this pipeline run?')) return
    try {
      await deleteHistoryItem(id)
      setItems((prev) => prev.filter((item) => item._id !== id))
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
      if (selectedItem?._id === id) setSelectedItem(null)
    } catch {
      // silently fail
    }
  }, [selectedItem])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} pipeline runs?`)) return
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      try { await deleteHistoryItem(id) } catch { /* ignore */ }
    }
    setItems((prev) => prev.filter((item) => !selectedIds.has(item._id)))
    setSelectedIds(new Set())
    if (selectedItem && selectedIds.has(selectedItem._id)) setSelectedItem(null)
  }, [selectedIds, selectedItem])

  const handleBulkExport = useCallback(() => {
    const toExport = selectedIds.size > 0
      ? sorted.filter((r) => selectedIds.has(r._id))
      : sorted
    exportCSV(toExport)
  }, [selectedIds, sorted])

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sorted.map((r) => r._id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleCheck = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  const isEmpty = items.length === 0
  const noResults = !isEmpty && sorted.length === 0

  // When a run is selected, show the detail view instead of the list
  if (selectedItem) {
    return (
      <RunDetailView
        run={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <DashboardStatsBar stats={stats} loading={loading && items.length === 0} />
      )}

      <RunningPipelineBanner
        runningRuns={runningRuns}
        onRefreshNeeded={() => fetchHistory(true)}
      />

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Pipeline History
              {!loading && items.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({sorted.length} of {items.length})
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost" size="icon" onClick={() => fetchHistory()} disabled={loading}
              className="h-8 w-8 shrink-0" title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>

          {!isEmpty && (
            <HistoryToolbar
              filters={filters} onFiltersChange={setFilters}
              sort={sort} onSortChange={setSort}
              viewMode={viewMode} onViewModeChange={setViewMode}
              availableVerticals={availableVerticals}
              selectedCount={selectedIds.size} totalCount={sorted.length}
              onBulkDelete={handleBulkDelete} onBulkExport={handleBulkExport}
            />
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading && items.length === 0 ? (
            <LoadingSkeleton view={viewMode} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchHistory()} />
          ) : isEmpty ? (
            <FirstRunEmpty onTrigger={onNavigateToTrigger} />
          ) : noResults ? (
            <FilteredEmpty onClear={clearFilters} />
          ) : viewMode === 'card' ? (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <input
                  type="checkbox"
                  checked={selectedIds.size === sorted.length && sorted.length > 0}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${sorted.length} runs`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sorted.map((run) => (
                  <RunCard
                    key={run._id} run={run} view="card"
                    selected={selectedItem?._id === run._id}
                    onSelect={() => setSelectedItem(selectedItem?._id === run._id ? null : run)}
                    onDelete={() => handleDelete(run._id)}
                    checked={selectedIds.has(run._id)}
                    onCheck={(c) => handleCheck(run._id, c)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={selectedIds.size === sorted.length && sorted.length > 0}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-primary"
                />
                <span className="w-2.5" />
                <span className="flex-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Shop / Type</span>
                <span className="w-12 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hidden sm:block">Score</span>
                <span className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hidden sm:block">Opp $</span>
                <span className="w-20 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hidden md:block">Vertical</span>
                <span className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold hidden sm:block">Date</span>
                <span className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold text-right">Actions</span>
              </div>
              {sorted.map((run) => (
                <RunCard
                  key={run._id} run={run} view="row"
                  selected={selectedItem?._id === run._id}
                  onSelect={() => setSelectedItem(selectedItem?._id === run._id ? null : run)}
                  onDelete={() => handleDelete(run._id)}
                  checked={selectedIds.has(run._id)}
                  onCheck={(c) => handleCheck(run._id, c)}
                />
              ))}
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
              Next
            </Button>
          </div>
        )}
      </Card>

    </div>
  )
}
