import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Store, Package, TrendingUp, BarChart3, Clock, Info, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown, Pencil, Loader2, ExternalLink, PieChart } from 'lucide-react'
import { Card, CardContent, Badge, Button, cn } from '../ui'
import { timeAgo } from '../../utils'
import { updateIndustry } from '../../services/successMetricsService'
import type { StoreProfile, RevenueShareByType, BundleLink, BundleStrategySummary } from '../../types/successMetrics'

interface StoreDetailPanelProps {
  profile: StoreProfile
  onClose: () => void
  onProfileUpdate?: (updated: StoreProfile) => void
}

// ─── Valid Industries ─────────────────────────────────────────────────────────

const VALID_INDUSTRIES = [
  'Apparel & Fashion',
  'Arts & Crafts',
  'Automotive',
  'Baby & Kids',
  'Beauty & Cosmetics',
  'Books & Media',
  'Business & Industrial',
  'Cannabis & CBD',
  'Cleaning & Maintenance',
  'Computers & Electronics',
  'Education & Learning',
  'Entertainment & Events',
  'Fashion Accessories',
  'Financial Services',
  'Food & Beverage',
  'Furniture & Decor',
  'Gaming & Toys',
  'Garden & Outdoor',
  'General Merchandise',
  'Gifts & Specialty',
  'Hardware & Tools',
  'Health & Wellness',
  'Hobbies & Collectibles',
  'Home & Kitchen',
  'Home Improvement',
  'Jewelry & Watches',
  'Luggage & Travel',
  'Luxury Goods',
  'Music & Instruments',
  'Office Supplies',
  'Party & Occasions',
  'Personal Care',
  'Pet Supplies',
  'Photography & Optics',
  'Print on Demand',
  'Religious & Spiritual',
  'Safety & Security',
  'Shoes & Footwear',
  'Software & Digital',
  'Sporting Goods',
  'Stationery & Paper',
  'Subscription Boxes',
  'Supplements & Nutrition',
  'Sustainability & Eco',
  'Technology & Gadgets',
  'Telecom & Mobile',
  'Tobacco & Vape',
  'Travel & Outdoors',
  'Vehicles & Parts',
  'Wedding & Bridal',
]

// ─── Tooltip texts ────────────────────────────────────────────────────────────

const TOOLTIPS: Record<string, string> = {
  'SKU Count': 'Total number of active products in the store\'s catalog.',
  'Median Price': 'The middle price point when all products are sorted by price. For example, if a store has 100 products, this is the price of the 50th product. A store with median price $29 means half its products are under $29 and half are above. More reliable than average price since it\'s not skewed by a few very expensive or very cheap items.',
  'Price Range (P25–P75)': 'The price range covering the middle 50% of products. For example, if P25 is $25 and P75 is $35, then 25% of products are below $25, 50% are between $25–$35, and 25% are above $35. A narrow range (like $25–$35) means consistent pricing, while a wide range (like $50–$2,500) means the store sells a mix of low and high-ticket items.',
  'Sub-Industry': 'The specific product niche or category this store primarily sells in.',
  'Complementarity Score': 'How diverse the store\'s product types are. Higher score means wider variety, which tends to support stronger bundle opportunities.',
  'Revenue': 'Total store revenue over the last 60 days.',
  'Orders': 'Total number of orders placed in the last 60 days.',
  'AOV': 'Average Order Value — the typical amount a customer spends per order over the last 60 days.',
  'Repeat Rate': 'The share of customers who placed more than one order in the last 60 days.',
  'Revenue Concentration': 'How much of total revenue comes from the single best-selling product. A high percentage means the store is heavily dependent on one item.',
  'Bundle Revenue': 'Total revenue generated specifically through EasyBundles in the last 60 days.',
  'Bundle Orders': 'Total number of orders that included an EasyBundle in the last 60 days.',
  'Contribution': 'The share of total store revenue that came from bundles in the last 60 days.',
  'Attach Rate': 'The share of all orders that included at least one bundle in the last 60 days.',
  'Stability Score': 'How consistent bundle revenue has been over the last two months. Higher score means more predictable, steady bundle sales.',
  'EasyBundle Installed': 'Whether the EasyBundles app is currently installed and active on this store.',
  'Kite Installed': 'Whether the Kite app is currently installed and active on this store.',
  'Structural': 'Last time the store\'s product catalog data was refreshed. Updates weekly.',
  'Performance': 'Last time Shopify order and revenue data was refreshed. Updates daily.',
  'EB Metrics': 'Last time EasyBundles-specific analytics were refreshed. Updates daily.',
  'Confidence Score': 'How confident the AI classifier is in this industry assignment. Scores above 80% are generally reliable.',
}

const SHOPIFY_PLAN_LABELS: Record<string, string> = {
  shopify_plus: 'Shopify Plus',
  professional: 'Professional',
  unlimited: 'Unlimited',
  basic: 'Basic',
  affiliate: 'Affiliate',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tierBadgeVariant(tier: string): 'success' | 'warning' | 'destructive' {
  if (tier === 'strong') return 'success'
  if (tier === 'moderate') return 'warning'
  return 'destructive'
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      {icon}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h4>
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  const show = useCallback(() => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setPos({
      top: rect.top - 8,
      left: Math.min(rect.left + rect.width / 2, window.innerWidth - 140),
    })
  }, [])

  const hide = useCallback(() => setPos(null), [])

  return (
    <span className="inline-flex ml-1">
      <Info
        ref={iconRef}
        className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help"
        onMouseEnter={show}
        onMouseLeave={hide}
      />
      {pos && createPortal(
        <span
          className="fixed z-[9999] w-64 px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none -translate-x-1/2"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
        </span>,
        document.body
      )}
    </span>
  )
}

function KVRow({ label, children }: { label: string; children: React.ReactNode }) {
  const tip = TOOLTIPS[label]
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
        {label}
        {tip && <Tooltip text={tip} />}
      </span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{children}</span>
    </div>
  )
}

function ProgressBar({ value, max = 1 }: { value: number; max?: number }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  return (
    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all',
          pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-500'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

// ─── Bundle Type Display Names & Tooltips ────────────────────────────────────

const TYPE_DISPLAY_NAMES: Record<string, string> = {
  classic: 'Classic Bundle',
  mixAndMatch: 'Mix & Match',
}

const SUBTYPE_DISPLAY_NAMES: Record<string, string> = {
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

const TYPE_TOOLTIPS: Record<string, string> = {
  classic: 'Traditional pre-configured product bundles',
  mixAndMatch: 'Customer-built bundles where shoppers pick items from a grid',
}

const SUBTYPE_TOOLTIPS: Record<string, string> = {
  percentage_flat: 'Flat % off the bundle — e.g. "10% off when you buy 2+"',
  percentage_tiered: 'Escalating % off at quantity/amount tiers — e.g. "Buy 2 save 10%, buy 3 save 20%"',
  fixed_amount_flat: 'Flat $ off the bundle — e.g. "$5 off any bundle"',
  fixed_amount_tiered: 'Escalating $ off at tiers — e.g. "Buy 2 save $5, buy 3 save $12"',
  fixed_bundle_price_flat: 'Set price for the whole bundle — e.g. "Complete set for $49.99"',
  fixed_bundle_price_tiered: 'Different set prices at different tiers — e.g. "2-piece set $40, 3-piece set $55"',
  bxgy_flat: 'Buy one item, get another free/discounted — e.g. "Buy shampoo, get conditioner 50% off"',
  bxgy_tiered: 'BXGY with multiple tier levels — e.g. "Buy 2 get 1 free, buy 4 get 2 free"',
  subscription: 'Recurring subscription discount — e.g. "Subscribe & save 15%"',
}

const STRATEGY_COLORS: Record<string, { bar: string; barLight: string }> = {
  percentage_flat:           { bar: 'bg-blue-500', barLight: 'bg-blue-300 dark:bg-blue-400/60' },
  percentage_tiered:         { bar: 'bg-blue-600', barLight: 'bg-blue-400 dark:bg-blue-500/60' },
  fixed_amount_flat:         { bar: 'bg-green-500', barLight: 'bg-green-300 dark:bg-green-400/60' },
  fixed_amount_tiered:       { bar: 'bg-green-600', barLight: 'bg-green-400 dark:bg-green-500/60' },
  fixed_bundle_price_flat:   { bar: 'bg-purple-500', barLight: 'bg-purple-300 dark:bg-purple-400/60' },
  fixed_bundle_price_tiered: { bar: 'bg-purple-600', barLight: 'bg-purple-400 dark:bg-purple-500/60' },
  bxgy_flat:                 { bar: 'bg-orange-500', barLight: 'bg-orange-300 dark:bg-orange-400/60' },
  bxgy_tiered:               { bar: 'bg-orange-600', barLight: 'bg-orange-400 dark:bg-orange-500/60' },
}

// ─── Revenue Share Row ───────────────────────────────────────────────────────

function RevenueShareRow({
  label,
  tooltip,
  share,
  revenue,
  barColor,
  indented = false,
}: {
  label: string
  tooltip?: string
  share: number
  revenue: number
  barColor: string
  indented?: boolean
}) {
  const pct = (share * 100).toFixed(1)
  return (
    <div className={cn('flex items-center gap-2 py-1.5', indented && 'ml-5')}>
      <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center min-w-[110px] shrink-0">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', barColor)}
          style={{ width: `${Math.min(share * 100, 100)}%` }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 w-12 text-right shrink-0">{pct}%</span>
      <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200 w-20 text-right shrink-0">{fmtCurrency(revenue)}</span>
    </div>
  )
}

// ─── Revenue by Bundle Type Section (sidebar) ────────────────────────────────

function RevenueByTypePanel({ data }: { data: RevenueShareByType }) {
  const hasData = (data.classic && data.classic.revenue > 0) || (data.mixAndMatch && data.mixAndMatch.revenue > 0)

  const classicSubtypes = data.classic?.subtypes
    ? Object.entries(data.classic.subtypes).filter(([, v]) => v.revenue > 0).sort(([, a], [, b]) => b.revenue - a.revenue)
    : []

  const mmSubtypes = data.mixAndMatch?.subtypes
    ? Object.entries(data.mixAndMatch.subtypes).filter(([, v]) => v.revenue > 0).sort(([, a], [, b]) => b.revenue - a.revenue)
    : []

  return (
    <>
      <SectionHeader icon={<PieChart className="w-4 h-4 text-indigo-500" />} title="Revenue by Bundle Type" />
      <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-2 mb-2">Last 2 calendar months, net of cancellations</p>
      {!hasData ? (
        <p className="text-xs text-muted-foreground text-center py-3">No revenue data available for this period.</p>
      ) : (
        <div className="space-y-0.5">
          {data.classic && data.classic.revenue > 0 && (
            <>
              <RevenueShareRow
                label={TYPE_DISPLAY_NAMES.classic}
                tooltip={TYPE_TOOLTIPS.classic}
                share={data.classic.share}
                revenue={data.classic.revenue}
                barColor="bg-indigo-500"
              />
              {classicSubtypes.map(([key, entry]) => (
                <RevenueShareRow
                  key={key}
                  label={SUBTYPE_DISPLAY_NAMES[key] ?? key}
                  tooltip={SUBTYPE_TOOLTIPS[key]}
                  share={entry.share}
                  revenue={entry.revenue}
                  barColor={STRATEGY_COLORS[key]?.barLight ?? 'bg-indigo-300 dark:bg-indigo-400/60'}
                  indented
                />
              ))}
            </>
          )}
          {data.mixAndMatch && data.mixAndMatch.revenue > 0 && (
            <>
              <RevenueShareRow
                label={TYPE_DISPLAY_NAMES.mixAndMatch}
                tooltip={TYPE_TOOLTIPS.mixAndMatch}
                share={data.mixAndMatch.share}
                revenue={data.mixAndMatch.revenue}
                barColor="bg-emerald-500"
              />
              {mmSubtypes.map(([key, entry]) => (
                <RevenueShareRow
                  key={key}
                  label={SUBTYPE_DISPLAY_NAMES[key] ?? key}
                  tooltip={SUBTYPE_TOOLTIPS[key]}
                  share={entry.share}
                  revenue={entry.revenue}
                  barColor={STRATEGY_COLORS[key]?.barLight ?? 'bg-emerald-300 dark:bg-emerald-400/60'}
                  indented
                />
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}

// ─── Bundle Overview Panel (sidebar) ─────────────────────────────────────────

function BundleOverviewPanel({ summary }: { summary: BundleStrategySummary }) {
  const rev = summary.revenueShareByType
  const classicShare = rev?.classic?.share ?? 0
  const mmShare = rev?.mixAndMatch?.share ?? 0
  const hasRevData = rev && ((rev.classic?.revenue ?? 0) > 0 || (rev.mixAndMatch?.revenue ?? 0) > 0)

  const classicSubtypes = rev?.classic?.subtypes
    ? Object.entries(rev.classic.subtypes)
        .filter(([, v]) => v.revenue > 0)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
    : []

  const mmSubtypes = rev?.mixAndMatch?.subtypes
    ? Object.entries(rev.mixAndMatch.subtypes)
        .filter(([, v]) => v.revenue > 0)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
    : []

  return (
    <>
      <SectionHeader icon={<PieChart className="w-4 h-4 text-indigo-500" />} title="Bundle Overview" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] text-muted-foreground">Strategy</p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
            {summary.dominantStrategy ? (TYPE_DISPLAY_NAMES[summary.dominantStrategy] ?? SUBTYPE_DISPLAY_NAMES[summary.dominantStrategy] ?? summary.dominantStrategy) : '—'}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] text-muted-foreground">Bundles</p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{summary.totalActiveBundles ?? '—'}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] text-muted-foreground">Avg Disc.</p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {summary.avgDiscountPercent != null ? `${summary.avgDiscountPercent.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Stacked bar */}
      {hasRevData && (
        <div className="mb-3">
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {classicShare > 0 && (
              <div className="bg-indigo-500" style={{ width: `${classicShare * 100}%` }} />
            )}
            {mmShare > 0 && (
              <div className="bg-emerald-500" style={{ width: `${mmShare * 100}%` }} />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Classic {(classicShare * 100).toFixed(1)}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> M&M {(mmShare * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Revenue rows */}
      {hasRevData && rev && <RevenueByTypePanel data={rev} />}

      {/* Discount strategy breakdown */}
      {(classicSubtypes.length > 0 || mmSubtypes.length > 0) && (
        <div className="mt-3 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Discount Strategies</p>

          {classicSubtypes.length > 0 && (
            <div>
              <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mb-1">Classic</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {classicSubtypes.map(([key, entry]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${STRATEGY_COLORS[key]?.bar ?? 'bg-indigo-400'}`} />
                      {SUBTYPE_DISPLAY_NAMES[key] ?? key}
                      {SUBTYPE_TOOLTIPS[key] && <Tooltip text={SUBTYPE_TOOLTIPS[key]} />}
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200">
                      {(entry.share * 100).toFixed(1)}% · {fmtCurrency(entry.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mmSubtypes.length > 0 && (
            <div>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium mb-1">Mix & Match</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {mmSubtypes.map(([key, entry]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${STRATEGY_COLORS[key]?.bar ?? 'bg-emerald-400'}`} />
                      {SUBTYPE_DISPLAY_NAMES[key] ?? key}
                      {SUBTYPE_TOOLTIPS[key] && <Tooltip text={SUBTYPE_TOOLTIPS[key]} />}
                    </span>
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200">
                      {(entry.share * 100).toFixed(1)}% · {fmtCurrency(entry.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasRevData && (
        <p className="text-xs text-muted-foreground text-center py-2">No revenue data available for this period.</p>
      )}
    </>
  )
}

// ─── URL Helper ──────────────────────────────────────────────────────────────

function ensureFullUrl(url: string | undefined, shopName: string): string {
  if (!url) return '#'
  if (/^https?:\/\//.test(url)) return url
  const base = shopName.includes('.') ? shopName : `${shopName}.myshopify.com`
  const path = url.startsWith('/') ? url : `/${url}`
  return `https://${base}${path}`
}

// ─── Bundle Links Section (sidebar) ──────────────────────────────────────────

function BundleLinksPanel({ links, shopName }: { links?: BundleLink[]; shopName: string }) {
  const sorted = links && links.length > 0
    ? [...links].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'ACTIVE' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    : []

  return (
    <>
      <SectionHeader icon={<ExternalLink className="w-4 h-4 text-blue-500" />} title="Bundle Links" />
      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">No bundles found for this store.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((link, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <div className="flex-1 min-w-0">
                {link.link ? (
                  <a
                    href={ensureFullUrl(link.link, shopName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    {link.name}
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-700 dark:text-slate-300 truncate">{link.name}</span>
                )}
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{TYPE_DISPLAY_NAMES[link.type] ?? link.type}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="flex items-center">
                    {SUBTYPE_DISPLAY_NAMES[link.subtype] ?? link.subtype}
                    {SUBTYPE_TOOLTIPS[link.subtype] && <Tooltip text={SUBTYPE_TOOLTIPS[link.subtype]} />}
                  </span>
                </div>
              </div>
              <Badge
                variant={link.status === 'ACTIVE' ? 'success' : 'outline'}
                className="text-[10px] shrink-0 mt-0.5"
              >
                {link.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Verification Tooltip ─────────────────────────────────────────────────────

function VerificationIcon({ profile }: { profile: StoreProfile }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  const show = useCallback(() => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setPos({
      top: rect.top - 8,
      left: Math.min(rect.left + rect.width / 2, window.innerWidth - 140),
    })
  }, [])

  const hide = useCallback(() => setPos(null), [])

  const verified = profile.industryVerified === true
  const tooltipText = verified
    ? `Verified by ${profile.industryVerifiedBy || 'unknown'} on ${profile.industryVerifiedAt ? new Date(profile.industryVerifiedAt).toLocaleDateString() : 'unknown date'}`
    : 'Not yet verified'

  return (
    <span className="inline-flex ml-1.5">
      {verified ? (
        <CheckCircle2
          ref={iconRef}
          className="w-4 h-4 text-emerald-500 cursor-help"
          onMouseEnter={show}
          onMouseLeave={hide}
        />
      ) : (
        <AlertTriangle
          ref={iconRef}
          className="w-4 h-4 text-amber-500 cursor-help"
          onMouseEnter={show}
          onMouseLeave={hide}
        />
      )}
      {pos && createPortal(
        <span
          className="fixed z-[9999] w-64 px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
        >
          {tooltipText}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
        </span>,
        document.body
      )}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StoreDetailPanel({ profile: p, onClose, onProfileUpdate }: StoreDetailPanelProps) {
  const [showEvidence, setShowEvidence] = useState(false)
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideIndustry, setOverrideIndustry] = useState(p.industry)
  const [overrideSubIndustry, setOverrideSubIndustry] = useState(p.subIndustry)
  const [overrideVerifiedBy, setOverrideVerifiedBy] = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)
  const [overrideMessage, setOverrideMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const confidencePct = p.classificationConfidence != null ? Math.round(p.classificationConfidence * 100) : null
  const hasEvidence = !!p.industryClassificationInput
  const topProductTypes = Array.isArray(p.industryClassificationInput?.topProductTypes) ? p.industryClassificationInput.topProductTypes : []
  const sampleTitles = Array.isArray(p.industryClassificationInput?.sampleTitles) ? p.industryClassificationInput.sampleTitles : []

  const handleOverrideSubmit = async () => {
    if (!overrideVerifiedBy.trim()) return
    setOverrideSaving(true)
    setOverrideMessage(null)

    const previousProfile = { ...p }

    // Optimistic update
    const updated: StoreProfile = {
      ...p,
      industry: overrideIndustry,
      subIndustry: overrideSubIndustry,
      industryVerified: true,
      industryVerifiedBy: overrideVerifiedBy.trim(),
      industryVerifiedAt: new Date().toISOString(),
    }
    onProfileUpdate?.(updated)

    try {
      await updateIndustry(p.shopName, {
        industry: overrideIndustry,
        subIndustry: overrideSubIndustry,
        verifiedBy: overrideVerifiedBy.trim(),
      })
      setOverrideMessage({ type: 'success', text: 'Industry updated and verified successfully.' })
      setTimeout(() => setShowOverrideForm(false), 1500)
    } catch (err: any) {
      // Revert optimistic update
      onProfileUpdate?.(previousProfile)
      setOverrideMessage({ type: 'error', text: err?.response?.data?.message ?? err?.message ?? 'Failed to update industry.' })
    } finally {
      setOverrideSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50'

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="min-w-0">
          <a
            href={`https://${p.shopName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
          >
            {p.shopName}
          </a>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={tierBadgeVariant(p.ebSuccessTier)}>
              {p.ebSuccessTier}
            </Badge>
            <Badge variant="outline">{p.industry}</Badge>
            <VerificationIcon profile={p} />
            {p.priceBand && <Badge variant="blue">{p.priceBand.charAt(0).toUpperCase() + p.priceBand.slice(1)}</Badge>}
            {p.shopifyPlan && <Badge variant="outline" className="text-[10px]">{SHOPIFY_PLAN_LABELS[p.shopifyPlan] ?? p.shopifyPlan}</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Classification Evidence (collapsible) */}
        {hasEvidence && (
          <div className="mb-2">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center gap-2 w-full text-left py-2 group"
            >
              {showEvidence
                ? <ChevronDown className="w-4 h-4 text-slate-400" />
                : <ChevronRight className="w-4 h-4 text-slate-400" />
              }
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                Classification Evidence
              </h4>
            </button>
            {showEvidence && (
              <div className="ml-6 space-y-3 pb-2">
                {/* Top Product Types */}
                {topProductTypes.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Top Product Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topProductTypes.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Sample Titles */}
                {sampleTitles.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sample Titles</p>
                    <ul className="space-y-0.5">
                      {sampleTitles.slice(0, 5).map((t, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                          <span className="text-slate-400 mt-0.5">&#8226;</span>
                          <span className="truncate">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Confidence Score */}
                {confidencePct != null && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                        Confidence Score
                        <Tooltip text={TOOLTIPS['Confidence Score']} />
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                        {confidencePct}%
                      </span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={confidencePct} max={100} />
                    </div>
                  </div>
                )}
                {/* Explanation */}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic leading-relaxed">
                  The AI classifier analyzed the store's top product types and sample titles to determine the most likely industry.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manual Override Form (collapsible) */}
        <div className="mb-2">
          <button
            onClick={() => { setShowOverrideForm(!showOverrideForm); setOverrideMessage(null) }}
            className="flex items-center gap-2 w-full text-left py-2 group"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
              Edit Classification
            </h4>
          </button>
          {showOverrideForm && (
            <div className="ml-6 space-y-3 pb-2">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Industry</label>
                <select
                  value={overrideIndustry}
                  onChange={(e) => setOverrideIndustry(e.target.value)}
                  className={inputClass}
                >
                  {!VALID_INDUSTRIES.includes(p.industry) && (
                    <option value={p.industry}>{p.industry}</option>
                  )}
                  {VALID_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Sub-Industry</label>
                <input
                  type="text"
                  value={overrideSubIndustry}
                  onChange={(e) => setOverrideSubIndustry(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Verified By</label>
                <input
                  type="text"
                  value={overrideVerifiedBy}
                  onChange={(e) => setOverrideVerifiedBy(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <Button
                size="sm"
                onClick={handleOverrideSubmit}
                disabled={!overrideVerifiedBy.trim() || overrideSaving}
                className="gap-2"
              >
                {overrideSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save & Verify
              </Button>
              {overrideMessage && (
                <p className={cn(
                  'text-xs',
                  overrideMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {overrideMessage.text}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 1: Catalog */}
        <SectionHeader icon={<Package className="w-4 h-4 text-indigo-500" />} title="Catalog" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <KVRow label="SKU Count">{(p.skuCount ?? 0).toLocaleString()}</KVRow>
          <KVRow label="Median Price">${(p.medianProductPrice ?? 0).toFixed(2)}</KVRow>
          <KVRow label="Price Range (P25–P75)">${(p.priceP25 ?? 0).toFixed(2)} – ${(p.priceP75 ?? 0).toFixed(2)}</KVRow>
          <KVRow label="Sub-Industry">{p.subIndustry || '—'}</KVRow>
          <KVRow label="Complementarity Score">
            <div className="flex items-center gap-2">
              <ProgressBar value={p.complementarityScore ?? 0} />
              <span className="text-xs font-mono">{fmtPct(p.complementarityScore ?? 0)}</span>
            </div>
          </KVRow>
        </div>

        {/* Section 2: Shopify Performance */}
        <SectionHeader icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} title="Shopify Performance (60d)" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <KVRow label="Revenue">{fmtCurrency(p.totalRevenue60 ?? 0)}</KVRow>
          <KVRow label="Orders">{(p.totalOrders60 ?? 0).toLocaleString()}</KVRow>
          <KVRow label="AOV">${(p.aov60 ?? 0).toFixed(2)}</KVRow>
          <KVRow label="Repeat Rate">{fmtPct(p.repeatRate60 ?? 0)}</KVRow>
          <KVRow label="Revenue Concentration">{fmtPct(p.revenueConcentration60 ?? 0)}</KVRow>
        </div>

        {/* Section 3: Bundle Performance */}
        <SectionHeader icon={<BarChart3 className="w-4 h-4 text-purple-500" />} title="Bundle Performance (60d)" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <KVRow label="Bundle Revenue">{fmtCurrency(p.bundleRevenue60 ?? 0)}</KVRow>
          <KVRow label="Bundle Orders">{(p.bundleOrders60 ?? 0).toLocaleString()}</KVRow>
          <KVRow label="Contribution">{fmtPct(p.bundleRevenueContribution60 ?? 0)}</KVRow>
          <KVRow label="Attach Rate">{fmtPct(p.attachRate60 ?? 0)}</KVRow>
          <KVRow label="Stability Score">
            <div className="flex items-center gap-2">
              <ProgressBar value={p.stabilityScore60 ?? 0} />
              <span className="text-xs font-mono">{fmtPct(p.stabilityScore60 ?? 0)}</span>
            </div>
          </KVRow>
        </div>

        {/* Section 4: Bundle Overview (summary + stacked bar + revenue + subtypes) */}
        {p.bundleStrategySummary && (
          <BundleOverviewPanel summary={p.bundleStrategySummary} />
        )}

        {/* Section 5: Bundle Links */}
        <BundleLinksPanel links={p.bundleLinks} shopName={p.shopName} />

        {/* Section 6: App Status */}
        <SectionHeader icon={<Store className="w-4 h-4 text-blue-500" />} title="App Status" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <KVRow label="EasyBundle Installed">
            <Badge variant={p.isEbInstalled ? 'success' : 'outline'}>
              {p.isEbInstalled ? 'Yes' : 'No'}
            </Badge>
          </KVRow>
          <KVRow label="Kite Installed">
            <Badge variant={p.isKiteInstalled ? 'success' : 'outline'}>
              {p.isKiteInstalled ? 'Yes' : 'No'}
            </Badge>
          </KVRow>
        </div>

        {/* Section 5: Timestamps */}
        <SectionHeader icon={<Clock className="w-4 h-4 text-slate-400" />} title="Last Updated" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <KVRow label="Structural">{p.lastStructuralUpdateAt ? timeAgo(p.lastStructuralUpdateAt) : '—'}</KVRow>
          <KVRow label="Performance">{p.lastPerformanceUpdateAt ? timeAgo(p.lastPerformanceUpdateAt) : '—'}</KVRow>
          <KVRow label="EB Metrics">{p.lastEbMetricsUpdateAt ? timeAgo(p.lastEbMetricsUpdateAt) : '—'}</KVRow>
        </div>
      </div>
    </div>
  )
}
