import { useState } from 'react'
import {
  Search, SlidersHorizontal, LayoutGrid, LayoutList,
  X, ChevronDown, ArrowUpDown, Download, Trash2
} from 'lucide-react'
import { cn, Button, Badge } from '../ui'

export type ViewMode = 'card' | 'row'
export type SortField = 'date' | 'score' | 'opportunity' | 'duration' | 'domain'
export type SortDir = 'asc' | 'desc'

export interface HistoryFilters {
  search: string
  status: 'all' | 'completed' | 'running' | 'failed'
  type: string
  vertical: string
  scoreMin: number | ''
  scoreMax: number | ''
  dateFrom: string
  dateTo: string
}

export const DEFAULT_FILTERS: HistoryFilters = {
  search: '',
  status: 'all',
  type: 'all',
  vertical: 'all',
  scoreMin: '',
  scoreMax: '',
  dateFrom: '',
  dateTo: '',
}

interface Props {
  filters: HistoryFilters
  onFiltersChange: (f: HistoryFilters) => void
  sort: { field: SortField; dir: SortDir }
  onSortChange: (s: { field: SortField; dir: SortDir }) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  availableVerticals: string[]
  selectedCount: number
  totalCount: number
  onBulkDelete: () => void
  onBulkExport: () => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'running', label: 'Running' },
  { value: 'failed', label: 'Failed' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'audit', label: 'Audit' },
  { value: 'full-analysis', label: 'Full Analysis' },
  { value: 'fullAnalysis', label: 'Full Analysis (v2)' },
  { value: 'dataAudit', label: 'Data Audit' },
]

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'score', label: 'Score' },
  { value: 'opportunity', label: 'Opportunity $' },
  { value: 'duration', label: 'Duration' },
  { value: 'domain', label: 'Domain' },
]

function SelectFilter({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none pl-3 pr-7 py-1.5 rounded-lg border text-xs transition-colors',
          'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
          'text-slate-700 dark:text-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          value !== 'all' && value !== '' && 'border-primary ring-1 ring-primary/30 bg-primary/5',
          className,
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  )
}

export default function HistoryToolbar({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  availableVerticals,
  selectedCount,
  totalCount,
  onBulkDelete,
  onBulkExport,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (partial: Partial<HistoryFilters>) =>
    onFiltersChange({ ...filters, ...partial })

  const clearFilter = (key: keyof HistoryFilters) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set({ [key]: (DEFAULT_FILTERS as any)[key] } as Partial<HistoryFilters>)
  }

  const activeFilterCount = [
    filters.status !== 'all',
    filters.type !== 'all',
    filters.vertical !== 'all',
    filters.scoreMin !== '',
    filters.scoreMax !== '',
    filters.dateFrom !== '',
    filters.dateTo !== '',
  ].filter(Boolean).length

  const toggleSort = (field: SortField) => {
    if (sort.field === field) {
      onSortChange({ field, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ field, dir: 'desc' })
    }
  }

  const verticalOptions = [
    { value: 'all', label: 'All verticals' },
    ...availableVerticals.map((v) => ({ value: v, label: v })),
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain or app..."
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className={cn(
              'w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs transition-colors',
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
              'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            )}
          />
          {filters.search && (
            <button
              onClick={() => set({ search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <SelectFilter
          value={filters.status}
          onChange={(v) => set({ status: v as HistoryFilters['status'] })}
          options={STATUS_OPTIONS}
        />

        <SelectFilter
          value={filters.type}
          onChange={(v) => set({ type: v })}
          options={TYPE_OPTIONS}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced((v) => !v)}
          className={cn('h-8 gap-1.5 text-xs', showAdvanced && 'border-primary bg-primary/5 text-primary')}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-0.5 h-4 min-w-[16px] px-1 text-[10px] leading-none">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <SelectFilter
            value={sort.field}
            onChange={(v) => toggleSort(v as SortField)}
            options={SORT_OPTIONS}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSortChange({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' })}
            className="h-8 w-8 p-0"
            title={`Sort ${sort.dir === 'asc' ? 'descending' : 'ascending'}`}
          >
            <span className="text-xs">{sort.dir === 'asc' ? '↑' : '↓'}</span>
          </Button>
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shrink-0">
          <button
            onClick={() => onViewModeChange('row')}
            className={cn(
              'h-8 w-8 flex items-center justify-center transition-colors',
              viewMode === 'row'
                ? 'bg-primary text-primary-foreground'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800',
            )}
            title="Table view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('card')}
            className={cn(
              'h-8 w-8 flex items-center justify-center transition-colors',
              viewMode === 'card'
                ? 'bg-primary text-primary-foreground'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800',
            )}
            title="Card view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 flex flex-wrap gap-3 items-end">
          {availableVerticals.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Vertical</label>
              <SelectFilter
                value={filters.vertical}
                onChange={(v) => set({ vertical: v })}
                options={verticalOptions}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Score range (0-10)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0} max={10} step={0.5}
                placeholder="Min"
                value={filters.scoreMin}
                onChange={(e) => set({ scoreMin: e.target.value === '' ? '' : Number(e.target.value) })}
                className={cn(
                  'w-16 px-2 py-1.5 rounded-lg border text-xs',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                )}
              />
              <span className="text-xs text-muted-foreground">—</span>
              <input
                type="number"
                min={0} max={10} step={0.5}
                placeholder="Max"
                value={filters.scoreMax}
                onChange={(e) => set({ scoreMax: e.target.value === '' ? '' : Number(e.target.value) })}
                className={cn(
                  'w-16 px-2 py-1.5 rounded-lg border text-xs',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                )}
              />
              {(filters.scoreMin !== '' || filters.scoreMax !== '') && (
                <button onClick={() => { clearFilter('scoreMin'); clearFilter('scoreMax') }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Date range</label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => set({ dateFrom: e.target.value })}
                className={cn(
                  'px-2 py-1.5 rounded-lg border text-xs',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                )}
              />
              <span className="text-xs text-muted-foreground">—</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => set({ dateTo: e.target.value })}
                className={cn(
                  'px-2 py-1.5 rounded-lg border text-xs',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                )}
              />
              {(filters.dateFrom || filters.dateTo) && (
                <button onClick={() => { clearFilter('dateFrom'); clearFilter('dateTo') }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange(DEFAULT_FILTERS)}
              className="h-8 text-xs text-muted-foreground gap-1 self-end"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs font-medium text-primary">
            {selectedCount} of {totalCount} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkExport}
            className="h-7 text-xs gap-1 text-slate-700 dark:text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkDelete}
            className="h-7 text-xs gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete selected
          </Button>
        </div>
      )}
    </div>
  )
}
