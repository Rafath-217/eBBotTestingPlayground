import { useState, useEffect, useCallback } from 'react'
import {
  Store,
  Search,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Checkbox,
  cn,
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui'
import { getProfiles, getDashboardStats, getFilters, updateIndustry } from '../services/successMetricsService'
import StoreDetailPanel from '../components/SuccessMetrics/StoreDetailPanel'
import type {
  StoreProfile,
  DashboardStats,
  ProfilesQueryParams,
  SuccessTier,
  PriceBand,
  ProfilesPagination,
} from '../types/successMetrics'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

function tierBadgeVariant(tier: string): 'success' | 'warning' | 'destructive' {
  if (tier === 'strong') return 'success'
  if (tier === 'moderate') return 'warning'
  return 'destructive'
}

// ─── Bundle label mapping ────────────────────────────────────────────────────

const BUNDLE_TYPE_LABELS: Record<string, string> = {
  classic: 'Classic',
  mixAndMatch: 'Mix & Match',
  fixedBundlePrice: 'Fixed Bundle Price',
  tieredDiscount: 'Tiered Discount',
  volumeDiscount: 'Volume Discount',
  addonFreeGift: 'Add-on / Free Gift',
  bxgy: 'BXGY',
  subscription: 'Subscription',
}

function bundleLabel(key: string): string {
  return BUNDLE_TYPE_LABELS[key] ?? key
}

const SHOPIFY_PLAN_LABELS: Record<string, string> = {
  shopify_plus: 'Shopify Plus',
  professional: 'Professional',
  unlimited: 'Unlimited',
  basic: 'Basic',
  affiliate: 'Affiliate',
}

function planLabel(key: string): string {
  return SHOPIFY_PLAN_LABELS[key] ?? key
}

const PLAN_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'outline' | 'blue'> = {
  shopify_plus: 'success',
  professional: 'blue',
  unlimited: 'blue',
  basic: 'outline',
  affiliate: 'warning',
}

// ─── Column definitions ──────────────────────────────────────────────────────

interface Column {
  label: string
  key: string
  sortable: boolean
  render: (p: StoreProfile) => React.ReactNode
  className?: string
}

const DATA_COLUMNS: Column[] = [
  {
    label: 'Store',
    key: 'shopName',
    sortable: true,
    render: (p) => (
      <a
        href={`https://${p.shopName}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block max-w-[200px]"
      >
        {p.shopName.replace('.myshopify.com', '')}
      </a>
    ),
  },
  {
    label: 'Industry',
    key: 'industry',
    sortable: true,
    render: (p) => p.industry,
  },
  {
    label: 'Price Band',
    key: 'priceBand',
    sortable: true,
    render: (p) => (
      <Badge variant="outline">
        {p.priceBand ? p.priceBand.charAt(0).toUpperCase() + p.priceBand.slice(1) : '—'}
      </Badge>
    ),
  },
  {
    label: 'Revenue (60d)',
    key: 'totalRevenue60',
    sortable: true,
    render: (p) => <span className="font-mono">{fmtCurrency(p.totalRevenue60 ?? 0)}</span>,
    className: 'text-right',
  },
  {
    label: 'Attach Rate',
    key: 'attachRate60',
    sortable: true,
    render: (p) => <span className="font-mono">{fmtPct(p.attachRate60 ?? 0)}</span>,
    className: 'text-right',
  },
  {
    label: 'AOV',
    key: 'aov60',
    sortable: true,
    render: (p) => <span className="font-mono">${(p.aov60 ?? 0).toFixed(2)}</span>,
    className: 'text-right',
  },
  {
    label: 'Tier',
    key: 'ebSuccessTier',
    sortable: true,
    render: (p) => (
      <Badge variant={tierBadgeVariant(p.ebSuccessTier)}>
        {p.ebSuccessTier}
      </Badge>
    ),
  },
  {
    label: 'Shopify Plan',
    key: 'shopifyPlan',
    sortable: true,
    render: (p) => {
      const plan = p.shopifyPlan
      if (!plan) return <span className="text-slate-400">—</span>
      return <Badge variant={PLAN_BADGE_VARIANT[plan] ?? 'outline'}>{planLabel(plan)}</Badge>
    },
  },
  {
    label: 'Dominant Strategy',
    key: 'dominantStrategy',
    sortable: false,
    render: (p) => {
      const s = p.bundleStrategySummary?.dominantStrategy
      return s ? <span className="capitalize">{bundleLabel(s)}</span> : <span className="text-slate-400">—</span>
    },
  },
  {
    label: 'Active Bundles',
    key: 'totalActiveBundles',
    sortable: false,
    render: (p) => {
      const n = p.bundleStrategySummary?.totalActiveBundles
      return n != null ? n : <span className="text-slate-400">—</span>
    },
    className: 'text-right',
  },
  {
    label: 'Classic %',
    key: 'classicShare',
    sortable: false,
    render: (p) => {
      const share = p.bundleStrategySummary?.revenueShareByType?.classic?.share
      return share != null ? <span className="font-mono">{(share * 100).toFixed(1)}%</span> : <span className="text-slate-400">—</span>
    },
    className: 'text-right',
  },
  {
    label: 'Classic Rev',
    key: 'classicRevenue',
    sortable: false,
    render: (p) => {
      const rev = p.bundleStrategySummary?.revenueShareByType?.classic?.revenue
      return rev != null ? <span className="font-mono">{fmtCurrency(rev)}</span> : <span className="text-slate-400">—</span>
    },
    className: 'text-right',
  },
  {
    label: 'M&M %',
    key: 'mixAndMatchShare',
    sortable: false,
    render: (p) => {
      const share = p.bundleStrategySummary?.revenueShareByType?.mixAndMatch?.share
      return share != null ? <span className="font-mono">{(share * 100).toFixed(1)}%</span> : <span className="text-slate-400">—</span>
    },
    className: 'text-right',
  },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SuccessMetricsPage() {
  // Data state
  const [profiles, setProfiles] = useState<StoreProfile[]>([])
  const [pagination, setPagination] = useState<ProfilesPagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [filterOptions, setFilterOptions] = useState<{ ebSuccessTier: SuccessTier[]; industry: string[]; priceBand: PriceBand[]; bundleType?: string[]; bundleSubtype?: string[] } | null>(null)

  // Query state
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<SuccessTier | ''>('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [priceBandFilter, setPriceBandFilter] = useState<PriceBand | ''>('')
  const [verifiedFilter, setVerifiedFilter] = useState<'' | 'true' | 'false'>('')
  const [shopifyPlanFilter, setShopifyPlanFilter] = useState('')
  const [bundleTypeFilter, setBundleTypeFilter] = useState('')
  const [bundleSubtypeFilter, setBundleSubtypeFilter] = useState('')
  const [dominantTypeFilter, setDominantTypeFilter] = useState('')
  const [minRevenueShare, setMinRevenueShare] = useState(0)
  const [debouncedMinRevShare, setDebouncedMinRevShare] = useState(0)
  const [sortBy, setSortBy] = useState('totalRevenue60')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<StoreProfile | null>(null)
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set())
  const [bulkVerifying, setBulkVerifying] = useState(false)
  const [bulkProgress, setBulkProgress] = useState('')

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Debounced slider
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinRevShare(minRevenueShare)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [minRevenueShare])

  // Fetch filters + stats on mount (once)
  useEffect(() => {
    getDashboardStats()
      .then((res) => { if (res.data?.data) setStats(res.data.data) })
      .catch(() => {})
    getFilters()
      .then((res) => { if (res.data?.data) setFilterOptions(res.data.data) })
      .catch(() => {})
  }, [])

  // Fetch profiles when query changes
  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: ProfilesQueryParams = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (tierFilter) params.ebSuccessTier = tierFilter
      if (industryFilter) params.industry = industryFilter
      if (priceBandFilter) params.priceBand = priceBandFilter
      if (verifiedFilter) params.industryVerified = verifiedFilter === 'true'
      if (shopifyPlanFilter) params.shopifyPlan = shopifyPlanFilter
      if (bundleTypeFilter) params.bundleType = bundleTypeFilter
      if (bundleSubtypeFilter) params.bundleSubtype = bundleSubtypeFilter
      if (dominantTypeFilter) params.dominantType = dominantTypeFilter
      if (debouncedMinRevShare > 0 && (bundleTypeFilter || bundleSubtypeFilter)) params.minRevenueShare = debouncedMinRevShare / 100

      const res = await getProfiles(params)
      const d = res.data?.data
      setProfiles(d?.profiles ?? [])
      if (d?.pagination) setPagination(d.pagination)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortOrder, debouncedSearch, tierFilter, industryFilter, priceBandFilter, verifiedFilter, shopifyPlanFilter, bundleTypeFilter, bundleSubtypeFilter, dominantTypeFilter, debouncedMinRevShare])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  // Sort handler
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortBy(key)
      setSortOrder('desc')
    }
    setPage(1)
  }

  // Clear filters
  const clearFilters = () => {
    setSearch('')
    setTierFilter('')
    setIndustryFilter('')
    setPriceBandFilter('')
    setVerifiedFilter('')
    setShopifyPlanFilter('')
    setBundleTypeFilter('')
    setBundleSubtypeFilter('')
    setDominantTypeFilter('')
    setMinRevenueShare(0)
    setSortBy('totalRevenue60')
    setSortOrder('desc')
    setPage(1)
  }

  const hasFilters = !!search || !!tierFilter || !!industryFilter || !!priceBandFilter || !!verifiedFilter || !!shopifyPlanFilter || !!bundleTypeFilter || !!bundleSubtypeFilter || !!dominantTypeFilter || minRevenueShare > 0

  // Selection handlers
  const toggleShopSelection = (shopName: string) => {
    setSelectedShops((prev) => {
      const next = new Set(prev)
      if (next.has(shopName)) next.delete(shopName)
      else next.add(shopName)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedShops.size === profiles.length) {
      setSelectedShops(new Set())
    } else {
      setSelectedShops(new Set(profiles.map((p) => p.shopName)))
    }
  }

  // Bulk verify
  const handleBulkVerify = async () => {
    const verifiedBy = prompt('Enter your name for verification:')
    if (!verifiedBy?.trim()) return

    setBulkVerifying(true)
    const shopNames = Array.from(selectedShops)
    let completed = 0

    for (const shopName of shopNames) {
      completed++
      setBulkProgress(`Verifying ${completed} of ${shopNames.length}...`)
      const profile = profiles.find((p) => p.shopName === shopName)
      if (!profile) continue
      try {
        await updateIndustry(shopName, {
          industry: profile.industry,
          subIndustry: profile.subIndustry,
          verifiedBy: verifiedBy.trim(),
        })
      } catch {
        // Continue with remaining stores
      }
    }

    setSelectedShops(new Set())
    setBulkVerifying(false)
    setBulkProgress('')
    fetchProfiles()
  }

  // Profile update handler (from detail panel)
  const handleProfileUpdate = (updated: StoreProfile) => {
    setSelectedProfile(updated)
    setProfiles((prev) =>
      prev.map((p) => (p.shopName === updated.shopName ? updated : p))
    )
  }

  // Sort icon
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Store className="w-6 h-6 text-primary" />
            EB Store Success Metrics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze Shopify store modeling profiles and bundle performance
          </p>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Stores" value={(stats.totalStores ?? 0).toLocaleString()} />
          <Card className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tier Breakdown</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="success" className="text-[10px]">{stats.tierBreakdown?.strong ?? 0} strong</Badge>
              <Badge variant="warning" className="text-[10px]">{stats.tierBreakdown?.moderate ?? 0} mod</Badge>
              <Badge variant="destructive" className="text-[10px]">{stats.tierBreakdown?.weak ?? 0} weak</Badge>
            </div>
          </Card>
          <StatCard label="Avg AOV" value={'$' + (stats.avgAov ?? 0).toFixed(2)} />
          <StatCard label="Avg Attach Rate" value={fmtPct(stats.avgAttachRate ?? 0)} />
          <StatCard label="Avg Bundle Contribution" value={fmtPct(stats.avgBundleRevenueContribution ?? 0)} />
        </div>
      )}

      {/* ── Shopify Plan Distribution ───────────────────────── */}
      {stats?.shopifyPlanBreakdown && stats.shopifyPlanBreakdown.length > 0 && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Shopify Plan Distribution</p>
          <div className="flex flex-wrap items-center gap-3">
            {stats.shopifyPlanBreakdown.map((entry) => (
              <div key={entry.plan} className="flex items-center gap-1.5">
                <Badge variant={PLAN_BADGE_VARIANT[entry.plan] ?? 'outline'} className="text-[10px]">
                  {planLabel(entry.plan)}
                </Badge>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{entry.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value as SuccessTier | ''); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Tiers</option>
          {(filterOptions?.ebSuccessTier ?? []).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select
          value={industryFilter}
          onChange={(e) => { setIndustryFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Industries</option>
          {(filterOptions?.industry ?? []).map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <select
          value={priceBandFilter}
          onChange={(e) => { setPriceBandFilter(e.target.value as PriceBand | ''); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Price Bands</option>
          {(filterOptions?.priceBand ?? []).map((pb) => (
            <option key={pb} value={pb}>{pb.charAt(0).toUpperCase() + pb.slice(1)}</option>
          ))}
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => { setVerifiedFilter(e.target.value as '' | 'true' | 'false'); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <select
          value={shopifyPlanFilter}
          onChange={(e) => { setShopifyPlanFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Plans</option>
          {Object.entries(SHOPIFY_PLAN_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={fetchProfiles} title="Refresh">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* ── Filter Row 2: Bundle-specific ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={bundleTypeFilter}
          onChange={(e) => { setBundleTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Bundle Types</option>
          <option value="classic">Classic</option>
          <option value="mixAndMatch">Mix & Match</option>
        </select>
        <select
          value={bundleSubtypeFilter}
          onChange={(e) => { setBundleSubtypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Subtypes</option>
          {(filterOptions?.bundleSubtype ?? Object.keys(BUNDLE_TYPE_LABELS)).map((t) => (
            <option key={t} value={t}>{bundleLabel(t)}</option>
          ))}
        </select>
        <select
          value={dominantTypeFilter}
          onChange={(e) => { setDominantTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Dominant Strategies</option>
          {Object.entries(BUNDLE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Min Rev Share:</label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minRevenueShare}
            onChange={(e) => { setMinRevenueShare(Number(e.target.value)); setPage(1) }}
            disabled={!bundleTypeFilter && !bundleSubtypeFilter}
            className="w-28 accent-primary disabled:opacity-40"
          />
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-10">{minRevenueShare}%</span>
        </div>
      </div>

      {/* ── Error State ──────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Bulk Verify Bar ──────────────────────────────────── */}
      {selectedShops.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10">
          <span className="text-sm text-blue-700 dark:text-blue-400">
            {bulkVerifying ? bulkProgress : `${selectedShops.size} store(s) selected`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBulkVerify}
              disabled={bulkVerifying}
              className="gap-1.5"
            >
              {bulkVerifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Mark as Verified
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedShops(new Set())}
              disabled={bulkVerifying}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Data Table ───────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading && profiles.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading profiles...</p>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-2">
                <Store className="w-8 h-8 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {hasFilters ? 'No stores match the current filters.' : 'No store profiles found.'}
                </p>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <TableWrapper className="border-0 rounded-none shadow-none">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={profiles.length > 0 && selectedShops.size === profiles.length}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    {DATA_COLUMNS.map((col) => (
                      <TableHead
                        key={col.key}
                        className={cn(col.className, col.sortable && 'cursor-pointer select-none')}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      >
                        <span className="inline-flex items-center">
                          {col.label}
                          {col.sortable && <SortIcon columnKey={col.key} />}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow
                      key={profile.shopName}
                      className={cn(
                        'cursor-pointer',
                        selectedProfile?.shopName === profile.shopName && 'bg-primary/5'
                      )}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <TableCell className="w-10">
                        <Checkbox
                          checked={selectedShops.has(profile.shopName)}
                          onChange={() => toggleShopSelection(profile.shopName)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      {DATA_COLUMNS.map((col) => (
                        <TableCell key={col.key} className={col.className}>
                          {col.render(profile)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrapper>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {pagination.total.toLocaleString()} stores total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Store Detail Panel ───────────────────────────────── */}
      {selectedProfile && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedProfile(null)}
          />
          <StoreDetailPanel
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            onProfileUpdate={handleProfileUpdate}
          />
        </>
      )}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
    </Card>
  )
}
