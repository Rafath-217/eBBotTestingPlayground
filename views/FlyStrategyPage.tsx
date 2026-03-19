import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Loader2, AlertCircle, ChevronDown, ChevronRight, Clock, Copy, Check, Package, RefreshCw, ExternalLink, MessageCircle, Search, Filter, X, ChevronLeft, ChevronsLeft, ChevronsRight, Info, ThumbsUp, ThumbsDown, MinusCircle, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn } from '../components/ui';
import { ViewMode } from '../components/Layout';
import { runFlyStrategy, getFlyStrategyHistory, getFlyStrategyHistoryDetail, pollForResult, submitRunFeedback, FlyStrategyResult, FlyStrategyHistoryEntry, HistoryFilters, HistoryPagination, FeedbackType } from '../services/flyStrategyApi';

interface FlyStrategyPageProps {
  viewMode: ViewMode;
}

// =============================================
// Tooltip descriptions for all labels
// =============================================

const TOOLTIPS = {
  status: {
    running: 'Pipeline is currently processing this store\'s data. Typically completes in 1-2 minutes.',
    completed: 'Pipeline finished successfully and produced recommendations.',
    failed: 'Pipeline encountered an error and could not complete. Check error details for cause.',
  } as Record<string, string>,
  tier: {
    1: 'Best quality — has products, order history, and clean product groupings.',
    2: 'Has products and orders but product grouping was weak (e.g. generic product types).',
    3: 'Has products but no usable order history. Recommendations are based on catalog structure only.',
    4: 'Limited data quality — products and some orders exist but grouping signals are unreliable.',
    5: 'Fewer than 10 active products. Very limited bundle combinations possible.',
    6: 'Fewer than 3 active products. Not enough products to form meaningful bundles.',
  } as Record<number, string>,
  recommendationStrength: {
    none: 'No recommendations could be generated for this store.',
    early: 'All recommendations are exploratory — based on limited data, worth testing but low certainty.',
    moderate: 'At least one medium-confidence recommendation. Decent data signals but not fully validated.',
    strong: 'At least one high-confidence recommendation backed by strong co-purchase or order data.',
  } as Record<string, string>,
  shopifyPlan: {
    basic: 'Shopify Basic plan — smallest merchants, typically lower order volume.',
    shopify: 'Shopify standard plan — mid-tier merchants with moderate traffic.',
    advanced: 'Shopify Advanced plan — established merchants with higher volume.',
    shopify_plus: 'Shopify Plus — enterprise merchants, typically highest order volume and catalog size.',
  } as Record<string, string>,
  hasMinimumViable: {
    true: 'Pipeline produced at least one actionable recommendation.',
    false: 'Pipeline could not produce any recommendation — store may lack sufficient data.',
  } as Record<string, string>,
  companionStrength: {
    strong: 'Co-purchased 10+ times with statistical lift ≥ 1.5 — highly correlated pair.',
    moderate: 'Co-purchased 5+ times with lift ≥ 1.2 — meaningful association.',
    weak: 'Co-purchased 3+ times but without strong statistical association.',
    none: 'No multi-item orders found — no co-purchase signal available.',
  } as Record<string, string>,
  formatAdvicePriority: {
    high: 'This bundle format has strong data support — recommended as the primary format to offer.',
    medium: 'This format has some data support — viable as a secondary option.',
    low: 'Limited evidence for this format — consider only if other formats aren\'t available.',
  } as Record<string, string>,
  orderStrategyConfidence: {
    high: '50+ organic (non-attributed) orders — strong, unbiased purchase signal.',
    moderate: '20-49 organic orders — decent signal but may not capture all buying patterns.',
    low: 'Fewer than 20 organic orders — pipeline uses all orders with organic weighted 2x to compensate.',
    very_low: 'Zero organic orders — pipeline relies entirely on total orders including app-attributed ones.',
  } as Record<string, string>,
  productGroupingQuality: {
    high: 'Products grouped by product type or collections — clean, meaningful categories.',
    medium: 'Products grouped by tags or title clustering — usable but less reliable than explicit categories.',
    low: 'Products grouped by price bands only — no semantic grouping available.',
    insufficient: 'Could not group products — too few products or no distinguishing signals.',
  } as Record<string, string>,
  fbtSignal: 'This bundle includes products that are frequently bought together based on real order data.',
  filters: {
    status: 'Filter by pipeline run status — running, completed, or failed.',
    tier: 'Data tier reflects the quality and completeness of a store\'s product and order data.',
    recommendationStrength: 'Strength is based on the best recommendation the pipeline could generate for a store.',
    shopifyPlan: 'The Shopify subscription plan of the store. Higher plans typically have more data.',
    hasMinimumViable: 'Whether the pipeline produced at least one actionable recommendation.',
    dateRange: 'Filter runs by when they were created.',
    products: 'Filter by the number of active products found in the store.',
    orders: 'Filter by the number of orders found in the store.',
    organic: 'Organic orders are orders not attributed to any app. Zero organic means all orders came through apps.',
    sortBy: 'Choose which field to sort the results by.',
    sortOrder: 'Sort direction — newest or oldest first.',
  } as Record<string, string>,
};

// =============================================
// Portal tooltip components
// =============================================

/** Info icon that shows a portal tooltip on hover */
const Tip: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: Math.min(r.left + r.width / 2, window.innerWidth - 140) });
  }, []);
  const hide = useCallback(() => setPos(null), []);
  if (!text) return null;
  return (
    <span className={cn('inline-flex', className)}>
      <Info
        ref={ref}
        className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors"
        onMouseEnter={show}
        onMouseLeave={hide}
      />
      {pos && createPortal(
        <span
          className="fixed z-[9999] max-w-[280px] px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  );
};

/** Badge that shows a portal tooltip on hover (wraps the whole badge) */
const TipBadge: React.FC<{
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  className?: string;
  tooltip?: string;
  children: React.ReactNode;
}> = ({ variant = 'default', className: cls, tooltip, children }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: Math.min(r.left + r.width / 2, window.innerWidth - 140) });
  }, []);
  const hide = useCallback(() => setPos(null), []);
  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={hide} className={tooltip ? 'cursor-help' : undefined}>
      <Badge variant={variant} className={cls}>{children}</Badge>
      {tooltip && pos && createPortal(
        <span
          className="fixed z-[9999] max-w-[280px] px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip}
        </span>,
        document.body,
      )}
    </span>
  );
};

// --- Copiable text with optional hyperlink ---
const CopyableText: React.FC<{ text: string; href?: string; className?: string }> = ({ text, href, className }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hover:text-primary hover:underline transition-colors"
        >
          {text}
        </a>
      ) : (
        text
      )}
      <button onClick={handleCopy} title="Copy" className="inline-flex items-center opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      </button>
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="Open store" className="inline-flex items-center opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </span>
  );
};

// --- Contexts for result display ---
const TraceVisibleContext = React.createContext(true);
const ShopNameContext = React.createContext('');

const ProductTitle: React.FC<{ title: string; handle?: string; className?: string }> = ({ title, handle, className }) => {
  const shopName = React.useContext(ShopNameContext);
  if (shopName && handle) {
    return (
      <a
        href={`https://${shopName}/products/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className={cn('hover:underline transition-colors', className)}
      >
        {title}
      </a>
    );
  }
  return <span className={className}>{title}</span>;
};

/** Wraps children in an <a> to the product page if handle is available, otherwise a plain div */
const ProductLink: React.FC<{ handle?: string; className?: string; children: React.ReactNode }> = ({ handle, className, children }) => {
  const shopName = React.useContext(ShopNameContext);
  if (shopName && handle) {
    return (
      <a
        href={`https://${shopName}/products/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className={cn('block', className)}
      >
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
};

// --- Decision trace display ---
const TraceBlock: React.FC<{ trace?: string[]; className?: string }> = ({ trace, className }) => {
  const visible = React.useContext(TraceVisibleContext);
  if (!visible || !trace?.length) return null;
  return (
    <div className={cn('rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 space-y-1', className)}>
      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1">
        <MessageCircle className="w-3 h-3" /> Decision Trace
      </p>
      <ul className="space-y-0.5">
        {trace.map((line, i) => (
          <li key={i} className="text-xs text-blue-900 dark:text-blue-200">{line}</li>
        ))}
      </ul>
    </div>
  );
};

// --- Find the inner result object with recommendation, wherever it lives ---
function extractResult(raw: any): FlyStrategyResult | null {
  if (!raw) return null;
  if (raw.recommendation) return raw;
  if (raw.result?.recommendation) return raw.result;
  if (raw.data?.result?.recommendation) return raw.data.result;
  if (raw.data?.recommendation) return raw.data;
  return null;
}

// =============================================
// Shared helpers
// =============================================

// --- Product variant helpers ---
function getProductPrice(p: any): string {
  if (p.variants?.length) {
    const prices = p.variants.map((v: any) => parseFloat(v.price)).filter((n: number) => !isNaN(n));
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)}–$${max.toFixed(2)}`;
    }
  }
  return p.minPrice != null ? `$${p.minPrice}` : p.price != null ? `$${p.price}` : '—';
}

function getVariantSummary(p: any): string | null {
  if (!p.variants?.length || p.hasOnlyDefaultVariant) return null;
  return `${p.variants.length} variant${p.variants.length > 1 ? 's' : ''}`;
}

const ProductImage: React.FC<{ src?: string | null; alt: string; size?: number }> = ({ src, alt, size = 64 }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className="bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Package className="text-slate-400" style={{ width: size * 0.4, height: size * 0.4 }} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="rounded-lg object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
};

const ScoreBar: React.FC<{ score: number; max?: number }> = ({ score, max = 50 }) => {
  const pct = Math.min((score / max) * 100, 100);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-slate-400';
  const label = pct >= 70 ? 'Strong' : pct >= 40 ? 'Moderate' : 'Weak';
  const tip = `Score: ${score.toFixed(1)} / ${max} (${pct.toFixed(0)}%) — ${label}`;
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  }, []);
  const hide = useCallback(() => setPos(null), []);
  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="flex items-center gap-2 w-full max-w-[160px] cursor-help">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      {pos && createPortal(
        <span className="fixed z-[9999] max-w-[280px] px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>{tip}</span>,
        document.body,
      )}
    </div>
  );
};

const StrengthBadge: React.FC<{ strength: string; type?: 'recommendation' | 'companion' }> = ({ strength, type = 'recommendation' }) => {
  const v = strength === 'strong' ? 'success' as const
    : strength === 'moderate' ? 'default' as const
    : 'outline' as const;
  const tip = type === 'companion' ? TOOLTIPS.companionStrength[strength] : TOOLTIPS.recommendationStrength[strength];
  return <TipBadge variant={v} className="text-[10px] capitalize" tooltip={tip}>{strength}</TipBadge>;
};

const SetUpButton: React.FC<{ label: string }> = ({ label }) => (
  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 h-auto">
    {label}
  </Button>
);

const MerchantSectionHeading: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <div className="flex items-center gap-2 mb-4">
    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
    <Badge variant="outline" className="text-xs">{count}</Badge>
  </div>
);

const CollapsibleSection: React.FC<{ title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, count, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-2 border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {open ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <Badge variant="secondary" className="text-xs">{count}</Badge>
        </div>
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">{children}</div>}
    </section>
  );
};

// --- Tier badge (handles both object and number) ---
const TierBadge: React.FC<{ tier?: { tier: number; label: string } | number; tierLabel?: string }> = ({ tier, tierLabel }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: Math.min(r.left + r.width / 2, window.innerWidth - 140) });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  if (!tier) return null;
  const num = typeof tier === 'object' ? tier.tier : tier;
  const tip = TOOLTIPS.tier[num];

  if (typeof tier === 'object') {
    const colors: Record<number, string> = {
      1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      3: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };
    return (
      <span ref={ref} onMouseEnter={show} onMouseLeave={hide} className={cn('px-2 py-0.5 rounded-full text-xs font-semibold cursor-help', colors[tier.tier] || colors[3])}>
        T{tier.tier} — {tier.label}
        {tip && pos && createPortal(
          <span className="fixed z-[9999] max-w-[280px] px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>{tip}</span>,
          document.body,
        )}
      </span>
    );
  }
  const label = tierLabel || `Tier ${num}`;
  const variant = num === 1 ? 'success' as const : num === 2 ? 'default' as const : 'warning' as const;
  return <TipBadge variant={variant} className="text-xs" tooltip={tip}>{label}</TipBadge>;
};

// =============================================
// Merchant card sections (PM view)
// =============================================

const FBTTriggersSection: React.FC<{ triggers: any[] }> = ({ triggers }) => {
  if (!triggers?.length) return null;
  return (
    <CollapsibleSection title="Frequently Bought Together" count={triggers.length}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {triggers.map((t: any, i: number) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <ProductLink handle={t.trigger?.handle} className="flex gap-4">
                <ProductImage src={t.trigger?.image} alt={t.trigger?.title} size={96} />
                <div className="flex-1 min-w-0">
                  <ProductTitle title={t.trigger?.title} handle={t.trigger?.handle} className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate block" />
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{t.trigger?.productType}</Badge>
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{getProductPrice(t.trigger || {})}</span>
                    {getVariantSummary(t.trigger) && (
                      <span className="text-[10px] text-muted-foreground">{getVariantSummary(t.trigger)}</span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <ScoreBar score={t.score || 0} />
                  </div>
                </div>
              </ProductLink>
              <TraceBlock trace={t.trace} />
              {t.companions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Pairs with</p>
                  <div className="flex gap-4 overflow-x-auto">
                    {t.companions.map((c: any, j: number) => (
                      <ProductLink key={j} handle={c.handle} className="flex flex-col items-center text-center min-w-[110px] max-w-[130px] bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <ProductImage src={c.image} alt={c.title} size={80} />
                        <ProductTitle title={c.title} handle={c.handle} className="text-xs font-medium mt-2 line-clamp-2 block" />
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{getProductPrice(c)}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StrengthBadge strength={c.strength} type="companion" />
                          <span className="text-[10px] text-muted-foreground">co:{c.coFrequency}</span>
                        </div>
                      </ProductLink>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-1">
                <SetUpButton label="Set Up FBT" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CollapsibleSection>
  );
};

const CustomPoolsSection: React.FC<{ pools: any[] }> = ({ pools }) => {
  if (!pools?.length) return null;
  return (
    <section>
      <MerchantSectionHeading title="Mix & Match Pools" count={pools.length} />
      <div className="space-y-4">
        {pools.map((pool: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {pool.category || pool.categories?.join(' + ')}
                  </span>
                  <Badge variant="outline" className="text-xs">Pick {pool.pickCount}</Badge>
                  {pool.suggestedDiscount && (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                      {pool.suggestedDiscount} off
                    </Badge>
                  )}
                </div>
                <ScoreBar score={pool.score || 0} max={400} />
              </div>
              {pool.products?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pool.products.map((p: any, j: number) => (
                    <ProductLink key={j} handle={p.handle} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                      <ProductImage src={p.image} alt={p.title} size={64} />
                      <div className="min-w-0 flex-1">
                        <ProductTitle title={p.title} handle={p.handle} className="text-sm font-medium truncate block" />
                        <p className="text-xs text-muted-foreground font-mono">{getProductPrice(p)}</p>
                        {getVariantSummary(p) && (
                          <p className="text-[10px] text-muted-foreground">{getVariantSummary(p)}</p>
                        )}
                      </div>
                    </ProductLink>
                  ))}
                </div>
              )}
              <TraceBlock trace={pool.trace} />
              <div className="flex justify-end pt-1">
                <SetUpButton label="Set Up Pool" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

const FixedBundlesSection: React.FC<{ bundles: any[] }> = ({ bundles }) => {
  if (!bundles?.length) return null;
  return (
    <CollapsibleSection title="Fixed Bundles" count={bundles.length}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((b: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">${b.bundlePrice}</span>
                  {b.hasFBTSignal && (
                    <TipBadge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px]" tooltip={TOOLTIPS.fbtSignal}>
                      FBT Signal
                    </TipBadge>
                  )}
                </div>
                <ScoreBar score={b.score || 0} max={25} />
              </div>
              {b.products?.length > 0 && (
                <div className="flex gap-4 overflow-x-auto">
                  {b.products.map((p: any, j: number) => (
                    <ProductLink key={j} handle={p.handle} className="flex flex-col items-center text-center min-w-[110px]">
                      <ProductImage src={p.image} alt={p.title} size={96} />
                      <ProductTitle title={p.title} handle={p.handle} className="text-sm font-medium mt-1.5 line-clamp-2 block" />
                      <p className="text-xs text-muted-foreground font-mono">{getProductPrice(p)}</p>
                      {getVariantSummary(p) && (
                        <p className="text-[10px] text-muted-foreground">{getVariantSummary(p)}</p>
                      )}
                    </ProductLink>
                  ))}
                </div>
              )}
              <TraceBlock trace={b.trace} />
              <div className="flex justify-end pt-1">
                <SetUpButton label="Set Up Bundle" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CollapsibleSection>
  );
};

const VolumeDiscountsSection: React.FC<{ discounts: any[] }> = ({ discounts }) => {
  if (!discounts?.length) return null;
  return (
    <section>
      <MerchantSectionHeading title="Volume Discounts" count={discounts.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discounts.map((d: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <ProductLink handle={d.handle || d.product?.handle} className="flex gap-3">
                <ProductImage src={d.image || d.product?.image} alt={d.title || d.product?.title || 'Product'} size={80} />
                <div className="flex-1">
                  <ProductTitle title={d.title || d.product?.title || d.category} handle={d.handle || d.product?.handle} className="text-sm font-semibold block" />
                  {d.tiers && (
                    <div className="mt-2 space-y-1">
                      {d.tiers.map((tier: any, j: number) => (
                        <div key={j} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded px-2 py-1">
                          <span>Buy {tier.quantity}</span>
                          <Badge variant="default" className="text-[10px]">{tier.discount}% off</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ProductLink>
              <div className="flex justify-end pt-1">
                <SetUpButton label="Set Up Discount" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// =============================================
// Loading skeleton (PM view during polling)
// =============================================

const LoadingSkeleton: React.FC<{ message: string }> = ({ message }) => (
  <div className="space-y-6">
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" /> This usually takes 20-60 seconds
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(n => (
        <Card key={n}>
          <CardContent className="p-4 space-y-3 animate-pulse">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// =============================================
// Filter building blocks
// =============================================

const FilterSectionLabel: React.FC<{ children: React.ReactNode; tooltip?: string }> = ({ children, tooltip }) => (
  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
    {children}
    {tooltip && <Tip text={tooltip} />}
  </label>
);

const ChipWithTip: React.FC<{
  label: string;
  tooltip?: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, tooltip, active, onClick }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const show = useCallback(() => {
    if (!ref.current || !tooltip) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: Math.min(r.left + r.width / 2, window.innerWidth - 140) });
  }, [tooltip]);
  const hide = useCallback(() => setPos(null), []);
  return (
    <>
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={cn(
          'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all',
          active
            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
        )}
      >
        {label}
      </button>
      {tooltip && pos && createPortal(
        <span className="fixed z-[9999] max-w-[280px] px-3 py-2 text-[11px] leading-relaxed text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg pointer-events-none" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>{tooltip}</span>,
        document.body,
      )}
    </>
  );
};

const ChipFilter: React.FC<{
  label: string;
  tooltip?: string;
  chipTooltips?: Record<string, string>;
  options: { value: string; label: string; color?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ label, tooltip, chipTooltips, options, selected, onChange }) => {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };
  return (
    <div>
      <FilterSectionLabel tooltip={tooltip}>{label}</FilterSectionLabel>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <ChipWithTip
            key={opt.value}
            label={opt.label}
            tooltip={chipTooltips?.[opt.value]}
            active={selected.includes(opt.value)}
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
    </div>
  );
};

const FilterInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className: cls, ...props }) => (
  <div className="flex-1">
    {label && <FilterSectionLabel>{label}</FilterSectionLabel>}
    <input
      {...props}
      className={cn(
        'w-full px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 focus:ring-0 transition-colors',
        cls,
      )}
    />
  </div>
);

const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; tooltip?: string; options: { value: string; label: string }[] }> = ({ label, tooltip, options, className: cls, ...props }) => (
  <div className="flex-1">
    {label && <FilterSectionLabel tooltip={tooltip}>{label}</FilterSectionLabel>}
    <select
      {...props}
      className={cn(
        'w-full px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground',
        'focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 focus:ring-0 transition-colors',
        cls,
      )}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// =============================================
// Filter constants & state
// =============================================

const STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const TIER_OPTIONS = [
  { value: '1', label: 'T1 Full Data' },
  { value: '2', label: 'T2 Products + Orders' },
  { value: '3', label: 'T3 Products Only' },
  { value: '4', label: 'T4 Weak Grouping' },
  { value: '5', label: 'T5 Tiny Catalog' },
  { value: '6', label: 'T6 Near Empty' },
];

const STRENGTH_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'early', label: 'Early' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'strong', label: 'Strong' },
];

const PLAN_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'shopify_plus', label: 'Shopify Plus' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'durationMs', label: 'Duration' },
  { value: 'productsFound', label: 'Products Found' },
  { value: 'ordersFound', label: 'Orders Found' },
  { value: 'tier', label: 'Tier' },
  { value: 'totalRecommendations', label: 'Recommendations' },
];

interface FilterState {
  shopName: string;
  status: string[];
  tier: string[];
  recommendationStrength: string[];
  shopifyPlan: string[];
  hasMinimumViable: string;
  minProducts: string;
  maxProducts: string;
  minOrders: string;
  maxOrders: string;
  minOrganic: string;
  noOrganic: boolean;
  from: string;
  to: string;
  sortBy: string;
  sortOrder: string;
}

const DEFAULT_FILTERS: FilterState = {
  shopName: '',
  status: [],
  tier: [],
  recommendationStrength: [],
  shopifyPlan: [],
  hasMinimumViable: '',
  minProducts: '',
  maxProducts: '',
  minOrders: '',
  maxOrders: '',
  minOrganic: '',
  noOrganic: false,
  from: '',
  to: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

function filtersToParams(filters: FilterState, page: number): HistoryFilters {
  const params: HistoryFilters = { page, limit: 20 };
  if (filters.shopName) params.shopName = filters.shopName;
  if (filters.status.length) params.status = filters.status.join(',');
  if (filters.tier.length) params.tier = filters.tier.join(',');
  if (filters.recommendationStrength.length) params.recommendationStrength = filters.recommendationStrength.join(',');
  if (filters.shopifyPlan.length) params.shopifyPlan = filters.shopifyPlan.join(',');
  if (filters.hasMinimumViable) params.hasMinimumViable = filters.hasMinimumViable;
  if (filters.minProducts) params.minProducts = parseInt(filters.minProducts);
  if (filters.maxProducts) params.maxProducts = parseInt(filters.maxProducts);
  if (filters.minOrders) params.minOrders = parseInt(filters.minOrders);
  if (filters.maxOrders) params.maxOrders = parseInt(filters.maxOrders);
  if (filters.minOrganic) params.minOrganic = parseInt(filters.minOrganic);
  if (filters.noOrganic) params.noOrganic = 'true';
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  params.sortBy = filters.sortBy;
  params.sortOrder = filters.sortOrder;
  return params;
}

function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.shopName) count++;
  if (filters.status.length) count++;
  if (filters.tier.length) count++;
  if (filters.recommendationStrength.length) count++;
  if (filters.shopifyPlan.length) count++;
  if (filters.hasMinimumViable) count++;
  if (filters.minProducts || filters.maxProducts) count++;
  if (filters.minOrders || filters.maxOrders) count++;
  if (filters.minOrganic || filters.noOrganic) count++;
  if (filters.from || filters.to) count++;
  return count;
}

// =============================================
// History filters panel
// =============================================

const HistoryFiltersPanel: React.FC<{
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onApply: () => void;
}> = ({ filters, onChange, onApply }) => {
  const [expanded, setExpanded] = useState(false);
  const activeCount = getActiveFilterCount(filters);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const clearAll = () => {
    onChange(DEFAULT_FILTERS);
    setTimeout(onApply, 0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onApply();
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.shopName}
            onChange={e => update({ shopName: e.target.value })}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by shop name (e.g. sweet, bold-brew)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className={cn('h-[42px] px-4 gap-2', expanded && 'border-slate-400 dark:border-slate-400')}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 min-w-[20px] justify-center">{activeCount}</Badge>
          )}
        </Button>
        <Button onClick={onApply} className="h-[42px] px-5">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Filter Runs</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="text-xs">{activeCount} active</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Section 1: Classification filters */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Classification</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                <ChipFilter label="Status" tooltip={TOOLTIPS.filters.status} chipTooltips={TOOLTIPS.status} options={STATUS_OPTIONS} selected={filters.status} onChange={v => update({ status: v })} />
                <ChipFilter label="Recommendation Strength" tooltip={TOOLTIPS.filters.recommendationStrength} chipTooltips={TOOLTIPS.recommendationStrength} options={STRENGTH_OPTIONS} selected={filters.recommendationStrength} onChange={v => update({ recommendationStrength: v })} />
                <ChipFilter label="Data Tier" tooltip={TOOLTIPS.filters.tier} chipTooltips={TOOLTIPS.tier as unknown as Record<string, string>} options={TIER_OPTIONS} selected={filters.tier} onChange={v => update({ tier: v })} />
                <ChipFilter label="Shopify Plan" tooltip={TOOLTIPS.filters.shopifyPlan} chipTooltips={TOOLTIPS.shopifyPlan} options={PLAN_OPTIONS} selected={filters.shopifyPlan} onChange={v => update({ shopifyPlan: v })} />
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Section 2: Range & date filters */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Store Data & Date Range</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterSelect
                  label="Minimum Viable"
                  tooltip={TOOLTIPS.filters.hasMinimumViable}
                  value={filters.hasMinimumViable}
                  onChange={e => update({ hasMinimumViable: (e.target as HTMLSelectElement).value })}
                  options={[
                    { value: '', label: 'Any' },
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                  ]}
                />
                <div>
                  <FilterSectionLabel tooltip={TOOLTIPS.filters.dateRange}>Date From</FilterSectionLabel>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={e => update({ from: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <FilterSectionLabel tooltip={TOOLTIPS.filters.dateRange}>Date To</FilterSectionLabel>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={e => update({ to: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <FilterSectionLabel tooltip={TOOLTIPS.filters.organic}>Organic Orders</FilterSectionLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minOrganic}
                      onChange={e => update({ minOrganic: e.target.value })}
                      placeholder="Min"
                      className="flex-1 px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                    />
                    <label className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap select-none">
                      <input
                        type="checkbox"
                        checked={filters.noOrganic}
                        onChange={e => update({ noOrganic: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 accent-slate-900 dark:accent-slate-100"
                      />
                      Zero
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FilterSectionLabel tooltip={TOOLTIPS.filters.products}>Product Count</FilterSectionLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minProducts}
                      onChange={e => update({ minProducts: e.target.value })}
                      placeholder="Min"
                      className="flex-1 px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                    />
                    <span className="text-xs text-muted-foreground font-medium">to</span>
                    <input
                      type="number"
                      value={filters.maxProducts}
                      onChange={e => update({ maxProducts: e.target.value })}
                      placeholder="Max"
                      className="flex-1 px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <FilterSectionLabel tooltip={TOOLTIPS.filters.orders}>Order Count</FilterSectionLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minOrders}
                      onChange={e => update({ minOrders: e.target.value })}
                      placeholder="Min"
                      className="flex-1 px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                    />
                    <span className="text-xs text-muted-foreground font-medium">to</span>
                    <input
                      type="number"
                      value={filters.maxOrders}
                      onChange={e => update({ maxOrders: e.target.value })}
                      placeholder="Max"
                      className="flex-1 px-2.5 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Section 3: Sort */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Sort</h4>
              <div className="flex items-end gap-3">
                <FilterSelect
                  label="Sort By"
                  tooltip={TOOLTIPS.filters.sortBy}
                  value={filters.sortBy}
                  onChange={e => update({ sortBy: (e.target as HTMLSelectElement).value })}
                  options={SORT_OPTIONS}
                />
                <FilterSelect
                  label="Order"
                  tooltip={TOOLTIPS.filters.sortOrder}
                  value={filters.sortOrder}
                  onChange={e => update({ sortOrder: (e.target as HTMLSelectElement).value })}
                  options={[
                    { value: 'desc', label: 'Descending (newest first)' },
                    { value: 'asc', label: 'Ascending (oldest first)' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>
            )}
            <Button size="sm" onClick={onApply} className="px-6">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================
// Pagination controls
// =============================================

const PaginationControls: React.FC<{
  pagination: HistoryPagination;
  onPageChange: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  const { page, totalPages, totalItems, hasPrevPage, hasNextPage } = pagination;
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-muted-foreground">
        {totalItems} total runs &middot; Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1.5 text-xs text-muted-foreground">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[32px] h-8 rounded-md text-xs font-medium transition-colors',
                p === page
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'hover:bg-muted/50 text-muted-foreground'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =============================================
// Dev view helpers (collapsible sections, tables)
// =============================================

const Section: React.FC<{ title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, count, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left hover:bg-muted/50">
        <span className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {title}
          {count !== undefined && <Badge variant="outline" className="text-xs">{count}</Badge>}
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const FlatTable: React.FC<{ items: any[]; columns?: string[] }> = ({ items, columns }) => {
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">None</p>;
  const cols = columns || Object.keys(items[0]).filter(k => typeof items[0][k] !== 'object' || items[0][k] === null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {cols.map(k => <th key={k} className="text-left py-1.5 px-2 font-medium text-muted-foreground text-xs">{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(k => (
                <td key={k} className="py-1.5 px-2 font-mono text-xs">
                  {item[k] === null || item[k] === undefined ? '—' : String(item[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductList: React.FC<{ products: any[] }> = ({ products }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-1 px-2 font-medium text-muted-foreground text-xs">Title</th>
          <th className="text-left py-1 px-2 font-medium text-muted-foreground text-xs">Handle</th>
          <th className="text-left py-1 px-2 font-medium text-muted-foreground text-xs">Type</th>
          <th className="text-right py-1 px-2 font-medium text-muted-foreground text-xs">Price</th>
          <th className="text-right py-1 px-2 font-medium text-muted-foreground text-xs">Variants</th>
          <th className="text-right py-1 px-2 font-medium text-muted-foreground text-xs">Orders</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p: any, i: number) => (
          <tr key={i} className="border-b last:border-0">
            <td className="py-1 px-2 text-xs">{p.title}</td>
            <td className="py-1 px-2 text-xs text-muted-foreground font-mono">{p.handle || '—'}</td>
            <td className="py-1 px-2 text-xs text-muted-foreground">{p.productType}</td>
            <td className="py-1 px-2 text-xs font-mono text-right">{getProductPrice(p)}</td>
            <td className="py-1 px-2 text-xs font-mono text-right">
              {p.variants?.length || '—'}
              {p.hasOnlyDefaultVariant === false && p.variants?.length > 1 && (
                <span className="text-muted-foreground ml-1" title={p.variants.map((v: any) => `${v.title}: $${v.price}`).join(', ')}>
                  ⓘ
                </span>
              )}
            </td>
            <td className="py-1 px-2 text-xs font-mono text-right">{p.orderCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// =============================================
// PM Merchant View
// =============================================

const MerchantResultView: React.FC<{ result: FlyStrategyResult }> = ({ result }) => {
  const bs = result.recommendation?.bundleStrategy;
  const hasSections = bs && (
    (bs.fbtTriggers?.length || 0) +
    // (bs.customPools?.length || 0) + // hidden for now
    (bs.fixedBundles?.length || 0) +
    (bs.volumeDiscounts?.length || 0)
  ) > 0;

  if (result.mvr?.hasMinimumViable === false) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Not Enough Data Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We need more order history to generate reliable bundle recommendations for this store.
            Check back in 7 days as we continue collecting data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <TierBadge tier={result.mvr?.tier} />
        <span className="text-sm text-muted-foreground">
          {result.mvr?.totalRecommendations || 0} recommendations
        </span>
      </div>

      <TraceBlock trace={result.storeTrace} />

      {hasSections ? (
        <>
          <FBTTriggersSection triggers={bs!.fbtTriggers} />
          {/* <CustomPoolsSection pools={bs!.customPools} /> */}
          <FixedBundlesSection bundles={bs!.fixedBundles} />
          <VolumeDiscountsSection discounts={bs!.volumeDiscounts} />
        </>
      ) : (
        <Card>
          <CardContent className="p-8 flex flex-col items-center text-center space-y-3">
            <Package className="w-8 h-8 text-slate-400" />
            <p className="text-sm text-muted-foreground">
              No specific bundle recommendations at this time. The store may need more sales history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// =============================================
// Dev Detailed View
// =============================================

const DevResultView: React.FC<{ result: FlyStrategyResult }> = ({ result }) => {
  const { recommendation, mvr, signals, stats } = result;
  const bs = recommendation?.bundleStrategy;

  return (
    <div className="space-y-4">
      {/* Store Trace */}
      <TraceBlock trace={result.storeTrace} />

      {/* MVR Summary */}
      <Card>
        <CardHeader><CardTitle className="text-base">MVR Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tier</p>
              <div className="mt-1"><TierBadge tier={mvr?.tier} /></div>
              {mvr?.tier && typeof mvr.tier === 'object' && mvr.tier.reason && <p className="text-xs text-muted-foreground mt-1">{mvr.tier.reason}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Order Strategy</p>
              <p className="text-sm font-medium mt-1 flex items-center gap-1">{mvr?.orderStrategy?.confidence || '—'} <Tip text={TOOLTIPS.orderStrategyConfidence[mvr?.orderStrategy?.confidence || '']} /></p>
              {mvr?.orderStrategy?.reason && <p className="text-xs text-muted-foreground mt-1">{mvr.orderStrategy.reason}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Minimum Viable</p>
              <TipBadge variant={mvr?.hasMinimumViable ? 'success' : 'destructive'} className="mt-1" tooltip={TOOLTIPS.hasMinimumViable[String(!!mvr?.hasMinimumViable)]}>{mvr?.hasMinimumViable ? 'Yes' : 'No'}</TipBadge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Recommendations</p>
              <p className="text-sm font-mono mt-1">{mvr?.totalRecommendations ?? '—'}</p>
            </div>
          </div>
          {mvr?.productGrouping && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Grouping Strategy</p>
                <p className="text-sm font-medium mt-1">{mvr.productGrouping.strategy}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quality</p>
                <p className="text-sm font-medium mt-1 flex items-center gap-1">{mvr.productGrouping.quality} <Tip text={TOOLTIPS.productGroupingQuality[mvr.productGrouping.quality]} /></p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Coverage</p>
                <p className="text-sm font-mono mt-1">{(mvr.productGrouping.coverage * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Groups / Products</p>
                <p className="text-sm font-mono mt-1">{mvr.productGrouping.groupCount} / {mvr.productGrouping.filteredProducts ?? '—'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Products Found</p>
              <p className="text-sm font-mono mt-1">{stats?.productsFound ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orders Found</p>
              <p className="text-sm font-mono mt-1">{stats?.ordersFound ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Organic Orders</p>
              <p className="text-sm font-mono mt-1">{stats?.organicOrders ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Elapsed</p>
              <p className="text-sm font-mono mt-1">{stats?.elapsedMs ? `${(stats.elapsedMs / 1000).toFixed(1)}s` : '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals */}
      {signals && (
        <Section title="Signals" defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(signals).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="text-sm font-mono mt-0.5">{typeof value === 'number' ? (value % 1 ? value.toFixed(2) : value) : String(value ?? '—')}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Format Advice */}
      {bs?.formatAdvice && bs.formatAdvice.length > 0 && (
        <Section title="Format Advice" count={bs.formatAdvice.length} defaultOpen>
          <div className="space-y-2">
            {bs.formatAdvice.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                <TipBadge variant={a.priority === 'high' ? 'success' : a.priority === 'medium' ? 'default' : 'outline'} className="text-xs mt-0.5" tooltip={TOOLTIPS.formatAdvicePriority[a.priority]}>{a.priority}</TipBadge>
                <div>
                  <p className="text-sm font-medium">{a.format}</p>
                  <p className="text-xs text-muted-foreground">{a.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* FBT Triggers */}
      {bs?.fbtTriggers && bs.fbtTriggers.length > 0 && (
        <Section title="FBT Triggers" count={bs.fbtTriggers.length}>
          <div className="space-y-3">
            {bs.fbtTriggers.map((t: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.trigger?.title}</p>
                    <p className="text-xs text-muted-foreground">{t.trigger?.productType} &middot; {t.trigger?.orderCount} orders &middot; ${t.trigger?.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="text-sm font-mono">{t.score?.toFixed(1)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t.reasoning}</p>
                <TraceBlock trace={t.trace} />
                {t.companions && t.companions.length > 0 && (
                  <div className="pl-4 border-l-2 border-muted space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Companions</p>
                    {t.companions.map((c: any, j: number) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <span>{c.title} <span className="text-muted-foreground">({c.productType})</span></span>
                        <span className="flex items-center gap-2">
                          <TipBadge variant={c.strength === 'strong' ? 'success' : c.strength === 'moderate' ? 'default' : 'outline'} className="text-[10px]" tooltip={TOOLTIPS.companionStrength[c.strength]}>{c.strength}</TipBadge>
                          <span className="font-mono">lift {c.lift?.toFixed(1)}</span>
                          <span className="text-muted-foreground">co:{c.coFrequency}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Custom Pools — hidden for now
      {bs?.customPools && bs.customPools.length > 0 && (
        <Section title="Custom Pools" count={bs.customPools.length}>
          <div className="space-y-3">
            {bs.customPools.map((pool: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{pool.poolType}</Badge>
                    <span className="text-sm font-medium">{pool.category || pool.categories?.join(' + ')}</span>
                    <span className="text-xs text-muted-foreground">pick {pool.pickCount}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono">score {pool.score?.toFixed(0)}</span>
                    {pool.suggestedDiscount && <Badge variant="default" className="text-xs">{pool.suggestedDiscount} off</Badge>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{pool.reasoning}</p>
                <TraceBlock trace={pool.trace} />
                {pool.products && <ProductList products={pool.products} />}
              </div>
            ))}
          </div>
        </Section>
      )} */}

      {/* Fixed Bundles */}
      {bs?.fixedBundles && bs.fixedBundles.length > 0 && (
        <Section title="Fixed Bundles" count={bs.fixedBundles.length}>
          <div className="space-y-3">
            {bs.fixedBundles.map((b: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Bundle ${b.bundlePrice}</span>
                    {b.hasFBTSignal && <TipBadge variant="success" className="text-[10px]" tooltip={TOOLTIPS.fbtSignal}>FBT signal</TipBadge>}
                  </div>
                  <span className="text-xs font-mono">score {b.score?.toFixed(1)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{b.reasoning}</p>
                <TraceBlock trace={b.trace} />
                {b.products && <ProductList products={b.products} />}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Volume Discounts */}
      {bs?.volumeDiscounts && bs.volumeDiscounts.length > 0 && (
        <Section title="Volume Discounts" count={bs.volumeDiscounts.length}>
          <FlatTable items={bs.volumeDiscounts} />
        </Section>
      )}

      {/* PB/QB Classification */}
      {recommendation?.pb && (
        <Section title="PB/QB Classification">
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Recommend PB</p>
                <Badge variant={recommendation.pb.recommend ? 'success' : 'outline'} className="mt-1">{recommendation.pb.recommend ? 'Yes' : 'No'}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-sm font-medium mt-1">{recommendation.pb.confidence}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PB Score</p>
                <p className="text-sm font-mono mt-1">{recommendation.pb.pbScore}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">QB Score</p>
                <p className="text-sm font-mono mt-1">{recommendation.pb.qbScore}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{recommendation.pb.reasoning}</p>
            {recommendation.pb.anchorProducts?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Anchor Products</p>
                <ProductList products={recommendation.pb.anchorProducts} />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* QB Candidates */}
      {recommendation?.qb?.candidates && recommendation.qb.candidates.length > 0 && (
        <Section title={`QB Candidates (${recommendation.qb.candidateCount})`}>
          <FlatTable items={recommendation.qb.candidates} columns={['title', 'totalOrders', 'multiBuyOrders', 'multiBuyPct']} />
        </Section>
      )}

      {/* FBT Pairs */}
      {recommendation?.fbt?.pairs && recommendation.fbt.pairs.length > 0 && (
        <Section title={`FBT Pairs (${recommendation.fbt.pairCount}) — ${recommendation.fbt.multiItemPct}% multi-item`}>
          <div className="space-y-2">
            {recommendation.fbt.pairs.map((pair: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pair.product1?.title}</span>
                  <span className="text-muted-foreground">&times;</span>
                  <span className="font-medium">{pair.product2?.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TipBadge variant={pair.strength === 'strong' ? 'success' : pair.strength === 'moderate' ? 'default' : 'outline'} className="text-[10px]" tooltip={TOOLTIPS.companionStrength[pair.strength]}>{pair.strength}</TipBadge>
                  <span className="font-mono">lift {pair.lift?.toFixed(1)}</span>
                  <span className="text-muted-foreground">co:{pair.coFrequency}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Data Quality Hints */}
      {mvr?.dataQualityHints && mvr.dataQualityHints.length > 0 && (
        <Section title="Data Quality Hints" count={mvr.dataQualityHints.length} defaultOpen>
          <ul className="space-y-1">
            {mvr.dataQualityHints.map((hint: any, i: number) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                {typeof hint === 'string' ? hint : hint.message || JSON.stringify(hint)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Full JSON */}
      <Section title="Raw JSON">
        <CodeBlock code={result} />
      </Section>
    </div>
  );
};

// =============================================
// Result Display (switches on viewMode)
// =============================================

const ResultDisplay: React.FC<{ result: any; viewMode: ViewMode }> = ({ result: rawResult, viewMode }) => {
  const result = extractResult(rawResult);
  if (!result) return <p className="text-sm text-muted-foreground">No result data</p>;

  if (viewMode === 'pm') {
    return <MerchantResultView result={result} />;
  }
  return <DevResultView result={result} />;
};

// =============================================
// Run Feedback
// =============================================

const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
  {
    value: 'correct',
    label: 'Correct',
    icon: <ThumbsUp className="w-4 h-4" />,
    color: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400',
    activeColor: 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  },
  {
    value: 'partially_correct',
    label: 'Partially Correct',
    icon: <MinusCircle className="w-4 h-4" />,
    color: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400',
    activeColor: 'border-amber-500 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  },
  {
    value: 'incorrect',
    label: 'Incorrect',
    icon: <ThumbsDown className="w-4 h-4" />,
    color: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400',
    activeColor: 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  },
];

const RunFeedback: React.FC<{
  runId: string;
  existingFeedback?: FeedbackType;
  existingText?: string;
  existingAt?: string;
  onSubmitted?: (feedback: FeedbackType, text: string, at: string) => void;
}> = ({ runId, existingFeedback, existingText, existingAt, onSubmitted }) => {
  const [editing, setEditing] = useState(!existingFeedback);
  const [selected, setSelected] = useState<FeedbackType | null>(existingFeedback || null);
  const [text, setText] = useState(existingText || '');
  const [submitting, setSubmitting] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(existingFeedback || null);
  const [savedText, setSavedText] = useState(existingText || '');
  const [savedAt, setSavedAt] = useState(existingAt || '');
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (value: FeedbackType) => {
    setSelected(prev => prev === value ? null : value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitRunFeedback(runId, selected, text.trim() || undefined);
      setSavedFeedback(selected);
      setSavedText(text.trim());
      setSavedAt(res.feedbackAt);
      setEditing(false);
      onSubmitted?.(selected, text.trim(), res.feedbackAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setSelected(savedFeedback);
    setText(savedText);
    setEditing(true);
  };

  const handleCancel = () => {
    setSelected(savedFeedback);
    setText(savedText);
    setEditing(false);
    setError(null);
  };

  // Saved state view
  if (!editing && savedFeedback) {
    const opt = FEEDBACK_OPTIONS.find(o => o.value === savedFeedback);
    return (
      <div className="border-t border-slate-200 dark:border-slate-700 mt-5 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={cn('flex items-center gap-1.5 text-sm font-medium', opt?.activeColor?.split(' ').filter(c => c.startsWith('text-'))[0])}>
                {opt?.icon} {opt?.label}
              </span>
              {savedAt && (
                <span className="text-[11px] text-muted-foreground">{new Date(savedAt).toLocaleString()}</span>
              )}
            </div>
            {savedText && (
              <p className="text-sm text-slate-600 dark:text-slate-400 pl-6">{savedText}</p>
            )}
          </div>
          <button
            onClick={handleEdit}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  // Editing / new feedback view
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 mt-5 pt-4 space-y-3">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
        {savedFeedback ? 'Update feedback' : 'How accurate are these recommendations?'}
      </p>
      <div className="flex items-center gap-2">
        {FEEDBACK_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
              selected === opt.value ? opt.activeColor : opt.color,
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add remarks (optional)..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-slate-400 dark:focus:border-slate-400 transition-colors resize-none"
          />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSubmit} disabled={submitting} className="px-5">
              {submitting ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-3.5 h-3.5 mr-1.5" /> {savedFeedback ? 'Update Feedback' : 'Submit Feedback'}</>
              )}
            </Button>
            {savedFeedback && (
              <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
            )}
            {error && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================
// History Table
// =============================================

const HistoryTable: React.FC<{ entries: FlyStrategyHistoryEntry[]; viewMode: ViewMode }> = ({ entries, viewMode }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [traceVisibleIds, setTraceVisibleIds] = useState<Set<string>>(new Set());
  const [detailCache, setDetailCache] = useState<Record<string, FlyStrategyResult>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [feedbackCache, setFeedbackCache] = useState<Record<string, { feedback: FeedbackType; text: string; at: string }>>({});

  const fetchDetail = async (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (detailCache[id] || entry?.result) return;
    setDetailLoading(id);
    try {
      const detail = await getFlyStrategyHistoryDetail(id);
      if (detail.result) {
        setDetailCache(prev => ({ ...prev, [id]: detail.result! }));
      }
    } catch {
      // will show "No result data"
    } finally {
      setDetailLoading(null);
    }
  };

  const toggleTrace = (id: string) => {
    setTraceVisibleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    await fetchDetail(id);
  };

  const runningEntries = entries.filter(e => e.status === 'running');
  const otherEntries = entries.filter(e => e.status !== 'running');

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No history yet.</p>;
  }

  return (
    <div className="space-y-3">
      {runningEntries.length > 0 && (
        <div className="space-y-2">
          {runningEntries.map(entry => (
            <div
              key={entry._id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
            >
              <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
              <span className="font-mono text-sm font-medium text-blue-900 dark:text-blue-200">{entry.shopName}</span>
              <span className="text-xs text-blue-600 dark:text-blue-400">Running...</span>
              <span className="text-[11px] text-blue-500 dark:text-blue-500 ml-auto">{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      {otherEntries.map(entry => (
        <div key={entry._id} className={cn(
          'border-2 rounded-xl overflow-hidden transition-colors',
          expandedId === entry._id
            ? 'border-slate-300 dark:border-slate-500'
            : 'border-slate-200 dark:border-slate-700'
        )}>
          <button
            onClick={() => handleExpand(entry._id)}
            className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* Left: name + badges */}
              <div className="flex items-center gap-3 group min-w-0">
                {expandedId === entry._id ? <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />}
                <CopyableText text={entry.shopName} href={`https://${entry.shopName}`} className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100" />
                {entry.status && (
                  <TipBadge variant={entry.status === 'completed' ? 'success' : entry.status === 'error' ? 'destructive' : 'outline'} className="text-[10px]" tooltip={TOOLTIPS.status[entry.status]}>
                    {entry.status}
                  </TipBadge>
                )}
                {entry.tierLabel && <TierBadge tier={entry.tier} tierLabel={entry.tierLabel} />}
                {entry.recommendationStrength && (
                  <StrengthBadge strength={entry.recommendationStrength} />
                )}
                {entry.shopifyPlan && (
                  <TipBadge variant="outline" className="text-[10px]" tooltip={TOOLTIPS.shopifyPlan[entry.shopifyPlan]}>{entry.shopifyPlan}</TipBadge>
                )}
              </div>
              {/* Right: trace toggle + date */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); toggleTrace(entry._id); }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors',
                    traceVisibleIds.has(entry._id)
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'text-muted-foreground border-slate-200 dark:border-slate-700 hover:bg-muted/50'
                  )}
                >
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {traceVisibleIds.has(entry._id) ? 'Hide Traces' : 'Show Traces'}
                  </span>
                </button>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
            </div>
            {/* Stats row */}
            <div className="flex items-center gap-4 mt-1.5 ml-8">
              {entry.totalRecommendations !== undefined && (
                <span className="text-xs text-muted-foreground"><span className="font-mono font-medium text-slate-600 dark:text-slate-400">{entry.totalRecommendations}</span> recs</span>
              )}
              {entry.productsFound !== undefined && (
                <span className="text-xs text-muted-foreground"><span className="font-mono font-medium text-slate-600 dark:text-slate-400">{entry.productsFound}</span> products</span>
              )}
              {entry.ordersFound !== undefined && (
                <span className="text-xs text-muted-foreground"><span className="font-mono font-medium text-slate-600 dark:text-slate-400">{entry.ordersFound}</span> orders</span>
              )}
              {entry.durationMs !== undefined && (
                <span className="text-xs text-muted-foreground"><span className="font-mono font-medium text-slate-600 dark:text-slate-400">{(entry.durationMs / 1000).toFixed(1)}s</span></span>
              )}
            </div>
          </button>
          {expandedId === entry._id && (
            <div className="px-5 pb-5 border-t-2 border-slate-200 dark:border-slate-600">
              <div className="pt-5">
                {detailLoading === entry._id ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading details...
                  </div>
                ) : (
                  <>
                    <ShopNameContext.Provider value={entry.shopName}>
                      <TraceVisibleContext.Provider value={traceVisibleIds.has(entry._id)}>
                        <ResultDisplay result={detailCache[entry._id] || entry} viewMode={viewMode} />
                      </TraceVisibleContext.Provider>
                    </ShopNameContext.Provider>
                    <RunFeedback
                      runId={entry._id}
                      existingFeedback={feedbackCache[entry._id]?.feedback ?? entry.feedback}
                      existingText={feedbackCache[entry._id]?.text ?? entry.feedbackText}
                      existingAt={feedbackCache[entry._id]?.at ?? entry.feedbackAt}
                      onSubmitted={(fb, txt, at) => setFeedbackCache(prev => ({ ...prev, [entry._id]: { feedback: fb, text: txt, at } }))}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// =============================================
// Main Page
// =============================================

const FlyStrategyPage: React.FC<FlyStrategyPageProps> = ({ viewMode }) => {
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Connecting to Shopify...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(false);

  const [history, setHistory] = useState<FlyStrategyHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [pagination, setPagination] = useState<HistoryPagination | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const loadHistory = useCallback(async (page = currentPage, currentFilters = filters) => {
    setHistoryLoading(true);
    try {
      const params = filtersToParams(currentFilters, page);
      const response = await getFlyStrategyHistory(params);
      setHistory(response.runs);
      setPagination(response.pagination);
      setCurrentPage(response.pagination.page);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadHistory(1);
    return () => { abortRef.current = true; };
  }, []);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadHistory(1, filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadHistory(page, filters);
  };

  const handleSubmit = async () => {
    if (!shopName.trim()) {
      setError('Please enter a store name');
      return;
    }

    abortRef.current = false;
    setLoading(true);
    setError(null);
    setResult(null);
    setProgressMsg('Connecting to Shopify...');

    try {
      const summary = await runFlyStrategy(shopName.trim());
      if (abortRef.current) return;

      // Poll for the full result
      const detail = await pollForResult(
        summary._id,
        (msg) => { if (!abortRef.current) setProgressMsg(msg); },
      );
      if (abortRef.current) return;

      setResult(detail);
      loadHistory(1, filters);
    } catch (err) {
      if (abortRef.current) return;
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fly Bundle Recommendations</h1>
        <p className="text-muted-foreground">Test bundle recommendations for any Shopify store</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="store-name.myshopify.com"
              className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Enter the Shopify store domain</p>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !shopName.trim()} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Evaluating... (5-40s)
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Evaluate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading skeleton for PM mode */}
      {loading && viewMode === 'pm' && <LoadingSkeleton message={progressMsg} />}

      {error && (
        <div className="flex items-center space-x-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Result</h2>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <><Check className="w-4 h-4 mr-2" />Copied!</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" />Copy JSON</>
              )}
            </Button>
          </div>
          <ShopNameContext.Provider value={shopName.trim()}>
            <ResultDisplay result={result} viewMode={viewMode} />
          </ShopNameContext.Provider>
        </>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Run History</CardTitle>
            {pagination && (
              <span className="text-xs text-muted-foreground font-normal">
                {pagination.totalItems} runs
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <HistoryFiltersPanel
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
          />
          {historyLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading history...
            </div>
          ) : (
            <>
              <HistoryTable entries={history} viewMode={viewMode} />
              {pagination && (
                <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlyStrategyPage;
