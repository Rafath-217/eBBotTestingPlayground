import React, { useState, useEffect, useRef } from 'react';
import { Play, Loader2, AlertCircle, ChevronDown, ChevronRight, Clock, Copy, Check, Package, RefreshCw, ExternalLink, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn } from '../components/ui';
import { ViewMode } from '../components/Layout';
import { runFlyStrategy, getFlyStrategyHistory, getFlyStrategyHistoryDetail, pollForResult, FlyStrategyResult, FlyStrategyHistoryEntry } from '../services/flyStrategyApi';

interface FlyStrategyPageProps {
  viewMode: ViewMode;
}

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

// --- Decision trace display ---
const TraceBlock: React.FC<{ trace?: string[]; className?: string }> = ({ trace, className }) => {
  if (!trace?.length) return null;
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
  return (
    <div className="flex items-center gap-2 w-full max-w-[160px]">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const StrengthBadge: React.FC<{ strength: string }> = ({ strength }) => {
  const v = strength === 'strong' ? 'success' as const
    : strength === 'moderate' ? 'default' as const
    : 'outline' as const;
  return <Badge variant={v} className="text-[10px] capitalize">{strength}</Badge>;
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

// --- Tier badge (handles both object and number) ---
const TierBadge: React.FC<{ tier?: { tier: number; label: string } | number; tierLabel?: string }> = ({ tier, tierLabel }) => {
  if (!tier) return null;
  if (typeof tier === 'object') {
    const colors: Record<number, string> = {
      1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      3: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', colors[tier.tier] || colors[3])}>
        T{tier.tier} — {tier.label}
      </span>
    );
  }
  const num = tier as number;
  const label = tierLabel || `Tier ${num}`;
  const variant = num === 1 ? 'success' as const : num === 2 ? 'default' as const : 'warning' as const;
  return <Badge variant={variant} className="text-xs">{label}</Badge>;
};

// =============================================
// Merchant card sections (PM view)
// =============================================

const FBTTriggersSection: React.FC<{ triggers: any[] }> = ({ triggers }) => {
  if (!triggers?.length) return null;
  return (
    <section>
      <MerchantSectionHeading title="Frequently Bought Together" count={triggers.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {triggers.map((t: any, i: number) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3">
                <ProductImage src={t.trigger?.image} alt={t.trigger?.title} size={80} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{t.trigger?.title}</p>
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
              </div>
              <TraceBlock trace={t.trace} />
              {t.companions?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Pairs with</p>
                  <div className="flex flex-wrap gap-3">
                    {t.companions.map((c: any, j: number) => (
                      <div key={j} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 pr-3">
                        <ProductImage src={c.image} alt={c.title} size={40} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate max-w-[120px]">{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StrengthBadge strength={c.strength} />
                            <span className="text-[10px] text-muted-foreground font-mono">{getProductPrice(c)}</span>
                            <span className="text-[10px] text-muted-foreground">co:{c.coFrequency}</span>
                          </div>
                        </div>
                      </div>
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
    </section>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {pool.products.map((p: any, j: number) => (
                    <div key={j} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                      <ProductImage src={p.image} alt={p.title} size={48} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{getProductPrice(p)}</p>
                        {getVariantSummary(p) && (
                          <p className="text-[10px] text-muted-foreground">{getVariantSummary(p)}</p>
                        )}
                      </div>
                    </div>
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
    <section>
      <MerchantSectionHeading title="Fixed Bundles" count={bundles.length} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((b: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">${b.bundlePrice}</span>
                  {b.hasFBTSignal && (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px]">
                      FBT Signal
                    </Badge>
                  )}
                </div>
                <ScoreBar score={b.score || 0} max={25} />
              </div>
              {b.products?.length > 0 && (
                <div className="flex gap-3 overflow-x-auto">
                  {b.products.map((p: any, j: number) => (
                    <div key={j} className="flex flex-col items-center text-center min-w-[90px]">
                      <ProductImage src={p.image} alt={p.title} size={80} />
                      <p className="text-xs font-medium mt-1.5 line-clamp-2">{p.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{getProductPrice(p)}</p>
                      {getVariantSummary(p) && (
                        <p className="text-[10px] text-muted-foreground">{getVariantSummary(p)}</p>
                      )}
                    </div>
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
    </section>
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
              <div className="flex gap-3">
                <ProductImage src={d.image || d.product?.image} alt={d.title || d.product?.title || 'Product'} size={64} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{d.title || d.product?.title || d.category}</p>
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
              </div>
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
    (bs.customPools?.length || 0) +
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
    <div className="space-y-8">
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
          <CustomPoolsSection pools={bs!.customPools} />
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
              <p className="text-sm font-medium mt-1">{mvr?.orderStrategy?.confidence || '—'}</p>
              {mvr?.orderStrategy?.reason && <p className="text-xs text-muted-foreground mt-1">{mvr.orderStrategy.reason}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Minimum Viable</p>
              <Badge variant={mvr?.hasMinimumViable ? 'success' : 'destructive'} className="mt-1">{mvr?.hasMinimumViable ? 'Yes' : 'No'}</Badge>
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
                <p className="text-sm font-medium mt-1">{mvr.productGrouping.quality}</p>
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
                <Badge variant={a.priority === 'high' ? 'success' : a.priority === 'medium' ? 'default' : 'outline'} className="text-xs mt-0.5">{a.priority}</Badge>
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
                          <Badge variant={c.strength === 'strong' ? 'success' : c.strength === 'moderate' ? 'default' : 'outline'} className="text-[10px]">{c.strength}</Badge>
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

      {/* Custom Pools */}
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
      )}

      {/* Fixed Bundles */}
      {bs?.fixedBundles && bs.fixedBundles.length > 0 && (
        <Section title="Fixed Bundles" count={bs.fixedBundles.length}>
          <div className="space-y-3">
            {bs.fixedBundles.map((b: any, i: number) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Bundle ${b.bundlePrice}</span>
                    {b.hasFBTSignal && <Badge variant="success" className="text-[10px]">FBT signal</Badge>}
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
                  <Badge variant={pair.strength === 'strong' ? 'success' : pair.strength === 'moderate' ? 'default' : 'outline'} className="text-[10px]">{pair.strength}</Badge>
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
// History Table
// =============================================

const HistoryTable: React.FC<{ entries: FlyStrategyHistoryEntry[]; viewMode: ViewMode }> = ({ entries, viewMode }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, FlyStrategyResult>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

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

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No history yet.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(entry => (
        <div key={entry._id} className="border rounded-lg">
          <button
            onClick={() => handleExpand(entry._id)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
          >
            <div className="flex items-center gap-3 group">
              {expandedId === entry._id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <CopyableText text={entry.shopName} href={`https://${entry.shopName}`} className="font-mono" />
              {entry.status && (
                <Badge variant={entry.status === 'completed' ? 'success' : entry.status === 'error' ? 'destructive' : 'outline'} className="text-[10px]">
                  {entry.status}
                </Badge>
              )}
              {entry.tierLabel && <TierBadge tier={entry.tier} tierLabel={entry.tierLabel} />}
              {entry.totalRecommendations !== undefined && (
                <span className="text-xs text-muted-foreground">{entry.totalRecommendations} recs</span>
              )}
              {entry.durationMs !== undefined && (
                <span className="text-xs text-muted-foreground">{(entry.durationMs / 1000).toFixed(1)}s</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
          </button>
          {expandedId === entry._id && (
            <div className="px-4 pb-4 border-t">
              <div className="pt-4">
                {detailLoading === entry._id ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading details...
                  </div>
                ) : (
                  <ResultDisplay result={detailCache[entry._id] || entry} viewMode={viewMode} />
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

  useEffect(() => {
    loadHistory();
    return () => { abortRef.current = true; };
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const entries = await getFlyStrategyHistory();
      setHistory(entries);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
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
      loadHistory();
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
          <ResultDisplay result={result} viewMode={viewMode} />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading history...
            </div>
          ) : (
            <HistoryTable entries={history} viewMode={viewMode} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlyStrategyPage;
