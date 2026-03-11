import { useState, useEffect, useCallback } from 'react'
import { Trophy, ChevronDown, Store, Loader2, Search } from 'lucide-react'
import { Card, CardContent, Badge, Button, cn } from '../components/ui'
import { getFilters, getWinningStrategies } from '../services/successMetricsService'

// ─── Strategy display labels ────────────────────────────────────────────────

const STRATEGY_LABELS: Record<string, string> = {
  percentage_flat: 'Percentage Discount',
  percentage_tiered: 'Tiered Percentage',
  fixed_amount_flat: 'Fixed Amount Off',
  fixed_amount_tiered: 'Tiered Fixed Amount',
  fixed_bundle_price_flat: 'Fixed Bundle Price',
  fixed_bundle_price_tiered: 'Tiered Bundle Price',
  bxgy_flat: 'Buy X Get Y',
  bxgy_tiered: 'Tiered BXGY',
  subscription: 'Subscription',
}

const STRATEGY_COLORS: Record<string, string> = {
  percentage_flat: 'bg-blue-500',
  percentage_tiered: 'bg-blue-600',
  fixed_amount_flat: 'bg-green-500',
  fixed_amount_tiered: 'bg-green-600',
  fixed_bundle_price_flat: 'bg-purple-500',
  fixed_bundle_price_tiered: 'bg-purple-600',
  bxgy_flat: 'bg-orange-500',
  bxgy_tiered: 'bg-orange-600',
  subscription: 'bg-teal-500',
}

const FALLBACK_INDUSTRIES = [
  'Activewear & Athleisure',
  'Automotive & Motorcycle',
  'Baby & Kids',
  'Beauty & Cosmetics',
  'Books & Education',
  'Cycling',
  'Fashion & Apparel',
  'Food & Gourmet',
  'Gaming & Esports',
  'Gifts & Personalization',
  'Haircare',
  'Health & Wellness',
  'Home Decor',
  'Jewelry',
  'Kitchen & Dining',
  'Outdoor & Adventure',
  'Personal Care & Grooming',
  'Pet Supplies',
  'Sports & Fitness',
  'Stationery & Office',
  'Supplements & Vitamins',
]

const RANK_STYLES = [
  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800',
]

// ─── Types ──────────────────────────────────────────────────────────────────

interface StrategyResult {
  strategy: string
  wins: number
  winRate: number
  totalRevenue: number
}

interface StoreDetail {
  shopName: string
  subIndustry: string | null
  winningStrategy: string
  winningRevenue: number
}

interface WinningStrategiesData {
  industry: string
  totalStores: number
  storesWithWinner: number
  strategies: StrategyResult[]
  storeDetails: StoreDetail[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function stripDomain(shopName: string): string {
  return shopName.replace(/\.myshopify\.com$/, '')
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WinningStrategiesPage() {
  const [industries, setIndustries] = useState<string[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [data, setData] = useState<WinningStrategiesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeSortBy, setStoreSortBy] = useState<'revenue' | 'name'>('revenue')
  const [industrySearch, setIndustrySearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Fetch industries on mount
  useEffect(() => {
    getFilters()
      .then((res) => {
        const apiIndustries = res.data?.data?.industry
        setIndustries(apiIndustries && apiIndustries.length > 0 ? apiIndustries : FALLBACK_INDUSTRIES)
      })
      .catch(() => {
        setIndustries(FALLBACK_INDUSTRIES)
      })
      .finally(() => setFiltersLoading(false))
  }, [])

  const fetchStrategies = useCallback(async (industry: string) => {
    if (!industry) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await getWinningStrategies(industry)
      setData(res.data?.data ?? null)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load strategies')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry)
    setDropdownOpen(false)
    setIndustrySearch('')
  }

  const handleSubmit = () => {
    if (selectedIndustry) fetchStrategies(selectedIndustry)
  }

  const filteredIndustries = industrySearch
    ? industries.filter((i) => i.toLowerCase().includes(industrySearch.toLowerCase()))
    : industries

  const maxWinRate = data?.strategies?.[0]?.winRate ?? 0

  const sortedStores = data?.storeDetails
    ? [...data.storeDetails].sort((a, b) =>
        storeSortBy === 'revenue'
          ? b.winningRevenue - a.winningRevenue
          : stripDomain(a.shopName).localeCompare(stripDomain(b.shopName))
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Winning Strategies
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          See which discount strategies perform best by industry, based on real revenue data from reference stores.
        </p>
      </div>

      {/* Industry Selector */}
      <div className="flex items-start gap-3">
      <div className="relative max-w-md flex-1">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={filtersLoading}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm text-left transition-colors',
            'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
            'text-slate-900 dark:text-slate-100',
            'hover:border-slate-300 dark:hover:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            filtersLoading && 'opacity-50'
          )}
        >
          {filtersLoading ? (
            <span className="text-slate-400">Loading industries...</span>
          ) : selectedIndustry ? (
            <span>{selectedIndustry}</span>
          ) : (
            <span className="text-slate-400">Select an industry...</span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg max-h-72 overflow-hidden">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  placeholder="Search industries..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded border-0 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-56">
              {filteredIndustries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No industries found</p>
              ) : (
                filteredIndustries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => handleIndustrySelect(ind)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      ind === selectedIndustry
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    {ind}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!selectedIndustry || loading}
        className="h-[42px] gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {loading ? 'Loading...' : 'Show Strategies'}
      </Button>
      </div>

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-10" onClick={() => { setDropdownOpen(false); setIndustrySearch('') }} />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading strategies...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty state — no industry selected */}
      {!selectedIndustry && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-muted-foreground">Select an industry to see which strategies are winning.</p>
        </div>
      )}

      {/* Empty state — no stores */}
      {data && data.totalStores === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-muted-foreground">No reference stores profiled for this industry yet.</p>
        </div>
      )}

      {/* Results */}
      {data && data.totalStores > 0 && (
        <>
          {/* Summary */}
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{data.industry}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Based on <strong className="text-foreground">{data.totalStores}</strong> reference stores</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span><strong className="text-foreground">{data.storesWithWinner}</strong> with revenue data</span>
            </div>
          </div>

          {/* Strategy Ranking */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Strategy Ranking</h3>
            <div className="space-y-2">
              {data.strategies.filter((s) => s.wins > 0).map((s, i) => (
                <Card key={s.strategy} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 px-4 py-3">
                      {/* Rank */}
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0',
                        RANK_STYLES[i] ?? 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      )}>
                        {i + 1}
                      </div>

                      {/* Strategy info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('w-2 h-2 rounded-full shrink-0', STRATEGY_COLORS[s.strategy] ?? 'bg-slate-400')} />
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {STRATEGY_LABELS[s.strategy] ?? s.strategy}
                          </span>
                        </div>
                        {/* Win rate bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', STRATEGY_COLORS[s.strategy] ?? 'bg-slate-400')}
                              style={{ width: `${maxWinRate > 0 ? (s.winRate / maxWinRate) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 shrink-0 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Wins</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.wins}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{(s.winRate * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Revenue</p>
                          <p className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">{fmtCurrency(s.totalRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Store Details */}
          {sortedStores.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Store Details</h3>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground mr-1">Sort:</span>
                  <button
                    onClick={() => setStoreSortBy('revenue')}
                    className={cn('px-2 py-0.5 rounded', storeSortBy === 'revenue' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setStoreSortBy('name')}
                    className={cn('px-2 py-0.5 rounded', storeSortBy === 'name' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
                  >
                    Name
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-800/50 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-2.5 font-medium">Store</th>
                      <th className="px-4 py-2.5 font-medium">Sub-Industry</th>
                      <th className="px-4 py-2.5 font-medium">Winning Strategy</th>
                      <th className="px-4 py-2.5 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedStores.map((store) => (
                      <tr key={store.shopName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                          {stripDomain(store.shopName)}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                          {store.subIndustry ?? <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STRATEGY_COLORS[store.winningStrategy] ?? 'bg-slate-400')} />
                            <span className="text-slate-700 dark:text-slate-300">
                              {STRATEGY_LABELS[store.winningStrategy] ?? store.winningStrategy}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-900 dark:text-slate-100">
                          {fmtCurrency(store.winningRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
