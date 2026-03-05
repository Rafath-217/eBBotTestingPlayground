/**
 * AuditorPanel — Website Auditor results
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Score Ring (large) + site title/summary                │
 *  ├──────────────┬───────────────────────────────────────────┤
 *  │ Shipping     │  PDP Widget Checklist (score X/7)        │
 *  │ Analysis     │                                          │
 *  ├──────────────┼───────────────────────────────────────────┤
 *  │ Navigation   │  Price Range                             │
 *  │ Audit        │                                          │
 *  ├──────────────┴───────────────────────────────────────────┤
 *  │  Critical Findings (expandable list)                    │
 *  └──────────────────────────────────────────────────────────┘
 *
 * Falls back to legacy result.audit data when auditorResults is absent.
 */

import { useState } from 'react'
import {
  Truck,
  Navigation,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Tag,
  ChevronDown,
  Search,
  Boxes,
  ExternalLink,
  Image,
  Cpu,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '../../ui'
import { getScoreColor, currencySymbol } from '../../../utils'
import type { AuditorResults, EnrichedPipelineRun, ScoreCategory, BundleDetection, CatalogAnalysis, AuditorEvidence } from '../../../types'

interface AuditorPanelProps {
  run: EnrichedPipelineRun
}

export default function AuditorPanel({ run }: AuditorPanelProps) {
  // Prefer enriched data; fall back to legacy shape
  const data: AuditorResults | undefined = run.auditorResults ?? legacyAdapter(run)

  if (!data) {
    return (
      <EmptyPanel message="No auditor data available for this run." />
    )
  }

  const cs = currencySymbol(run.currency)
  const score = data.overallScore ?? 0
  const shipping = data.shippingAnalysis
  const nav = data.navigationAudit
  const pdp = data.pdpAudit
  const price = data.priceAnalysis

  return (
    <div className="space-y-4 p-6">
      {/* ── Hero: Score + Summary ──────────────────────────────── */}
      <Card className={cn(
        'border-l-4',
        score >= 8 ? 'border-l-emerald-500' :
        score >= 6 ? 'border-l-amber-500' :
                     'border-l-red-500'
      )}>
        <CardContent className="flex items-center gap-6 py-5">
          <LargeScoreRing score={score} />
          <div className="flex-1 min-w-0">
            {data.siteOverview?.title && (
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {data.siteOverview.title}
              </h2>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {data.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Score Breakdown Rubric ─────────────────────────────── */}
      {data.evidence?.scoreBreakdown && (
        <ScoreBreakdownSection categories={data.evidence.scoreBreakdown.categories} />
      )}

      {/* ── 2-column grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Shipping Analysis */}
        {shipping && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-slate-500" />
              Shipping Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <MetaRow label="Free Shipping">
              <Badge variant={shipping.hasFreeShipping ? 'success' : 'destructive'}>
                {shipping.hasFreeShipping ? 'Yes' : 'No'}
              </Badge>
            </MetaRow>
            {shipping.threshold != null && (
              <MetaRow label="Threshold">
                <span className="text-sm font-mono">{cs}{shipping.threshold}</span>
              </MetaRow>
            )}
            {shipping.deadZoneGap != null && (
              <MetaRow label="Dead-Zone Gap">
                <span className="text-sm font-mono text-amber-600 dark:text-amber-400">
                  {cs}{shipping.deadZoneGap}
                </span>
                <span className="text-xs text-muted-foreground ml-1">(AOV gap)</span>
              </MetaRow>
            )}
            {shipping.entryPriceGap != null && (
              <MetaRow label="Entry Price Gap">
                <span className="text-sm font-mono text-amber-600 dark:text-amber-400">
                  {cs}{shipping.entryPriceGap}
                </span>
              </MetaRow>
            )}
            {shipping.confidence && (
              <MetaRow label="Confidence">
                <Badge variant="outline" className="text-[10px]">{shipping.confidence}</Badge>
              </MetaRow>
            )}
            {shipping.coreProductPrice != null && (
              <MetaRow label="Core Product Price">
                <span className="text-sm font-mono">{cs}{shipping.coreProductPrice}</span>
              </MetaRow>
            )}
            {shipping.notes && (
              <p className="text-xs text-muted-foreground italic mt-2">{shipping.notes}</p>
            )}
          </CardContent>
        </Card>
        )}

        {/* PDP Widget Audit */}
        {pdp && (() => {
          // pdp.score can be "1/7" string or a number
          let pdpScoreNum: number
          let pdpMaxScore: number
          if (typeof pdp.score === 'string' && pdp.score.includes('/')) {
            const [s, m] = pdp.score.split('/').map(Number)
            pdpScoreNum = isNaN(s) ? 0 : s
            pdpMaxScore = isNaN(m) ? 7 : m
          } else {
            pdpScoreNum = typeof pdp.score === 'number' ? pdp.score : 0
            pdpMaxScore = pdp.maxScore ?? 7
          }
          const pdpRatio = pdpMaxScore > 0 ? pdpScoreNum / pdpMaxScore : 0

          return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                PDP Audit
              </span>
              <Badge variant="outline" className={getScoreColor(pdpRatio * 10)}>
                {pdpScoreNum}/{pdpMaxScore}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Score bar */}
            <div className="mb-4">
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    pdpRatio >= 0.7 ? 'bg-emerald-500' :
                    pdpRatio >= 0.4 ? 'bg-amber-500' :
                    'bg-red-500'
                  )}
                  style={{ width: `${pdpRatio * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              {(pdp.widgetsPresent ?? []).map((w, i) => (
                <WidgetRow key={i} label={w} present={true} />
              ))}
              {(pdp.widgetsMissing ?? []).map((w, i) => (
                <WidgetRow key={i} label={w} present={false} />
              ))}
            </div>
          </CardContent>
        </Card>
          )
        })()}

        {/* Navigation Audit */}
        {nav && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-slate-500" />
              Navigation Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {nav.hasBundleNavigation != null && (
              <MetaRow label="Bundle Navigation">
                <Badge variant={nav.hasBundleNavigation ? 'success' : 'destructive'}>
                  {nav.hasBundleNavigation ? 'Present' : 'Missing'}
                </Badge>
              </MetaRow>
            )}

            {nav.result && (
              <MetaRow label="Result">
                <Badge variant={nav.result.includes('FAIL') ? 'destructive' : 'success'} className="text-[10px]">
                  {nav.result}
                </Badge>
              </MetaRow>
            )}

            <MetaRow label="Gift Section">
              <Badge variant={nav.hasGiftSection ? 'success' : 'outline'}>
                {nav.hasGiftSection ? 'Present' : 'Absent'}
              </Badge>
            </MetaRow>

            {nav.hasCustomization != null && (
              <MetaRow label="Customization">
                <Badge variant={nav.hasCustomization ? 'success' : 'outline'}>
                  {nav.hasCustomization ? 'Yes' : 'No'}
                </Badge>
              </MetaRow>
            )}

            {Array.isArray(nav.bundleTermsFound) && nav.bundleTermsFound.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Bundle Terms Found</p>
                <div className="flex flex-wrap gap-1.5">
                  {nav.bundleTermsFound.map((term, i) => (
                    <Badge key={i} variant="blue" className="text-xs">{term}</Badge>
                  ))}
                </div>
              </div>
            )}

            {nav.recommendation && (
              <p className="text-xs text-muted-foreground italic mt-2">{nav.recommendation}</p>
            )}

            {Array.isArray(nav.navItems) && nav.navItems.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Nav Items</p>
                <div className="flex flex-wrap gap-1.5">
                  {nav.navItems.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Price Analysis */}
        {price && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-slate-500" />
              Price Range Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <PriceStat label="Min" value={price.min} currency={cs} />
              <PriceStat label="Median" value={price.median} currency={cs} highlight />
              <PriceStat label="Max" value={price.max} currency={cs} />
            </div>

            {/* Visual price spectrum bar */}
            <div className="mt-3 relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-visible">
              <div
                className="absolute h-full bg-gradient-to-r from-slate-300 to-primary rounded-full"
                style={{ width: '100%' }}
              />
              {/* Median marker */}
              {price.max > 0 && (
                <div
                  className="absolute -top-1 w-0.5 h-4 bg-primary rounded-full"
                  style={{
                    left: `${((price.median - price.min) / (price.max - price.min)) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                  title={`Median: $${price.median}`}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{cs}{price.min}</span>
              <span className="font-semibold text-primary">median {cs}{price.median}</span>
              <span>{cs}{price.max}</span>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Bundle Detection */}
        {data.bundleDetection && (
          <BundleDetectionCard detection={data.bundleDetection} />
        )}

        {/* Catalog Analysis */}
        {data.evidence?.catalogAnalysis && (
          <CatalogAnalysisCard catalog={data.evidence.catalogAnalysis} cs={cs} shopName={run.shopName} />
        )}
      </div>

      {/* ── Bundle & BYOB Links ────────────────────────────────── */}
      {((data.evidence?.bundlePages?.length ?? 0) > 0 || (data.evidence?.byobPages?.length ?? 0) > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-slate-500" />
              Bundle & BYOB Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {(data.evidence?.bundlePages?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Bundle Pages ({data.evidence!.bundlePages!.length})
                </p>
                <div className="space-y-1.5">
                  {data.evidence!.bundlePages!.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <ExternalLink className="w-3 h-3 text-primary shrink-0" />
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {p.label || p.url}
                      </a>
                      <Badge variant="outline" className="text-[10px] shrink-0">{p.source}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(data.evidence?.byobPages?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  BYOB Pages ({data.evidence!.byobPages!.length})
                </p>
                <div className="space-y-1.5">
                  {data.evidence!.byobPages!.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <ExternalLink className="w-3 h-3 text-primary shrink-0" />
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {p.label || p.url}
                      </a>
                      <Badge variant="outline" className="text-[10px] shrink-0">{p.source}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Critical Findings ──────────────────────────────────── */}
      {Array.isArray(data.criticalFindings) && data.criticalFindings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Critical Findings
              <Badge variant="warning" className="ml-auto">{data.criticalFindings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {data.criticalFindings.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20"
              >
                <TrendingDown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300">{typeof f === 'string' ? f : (f as Record<string, string>).finding ?? JSON.stringify(f)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Evidence Trail ──────────────────────────────────────── */}
      {data.evidence && <EvidenceTrailSection evidence={data.evidence} />}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LargeScoreRing({ score }: { score: number }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const strokeColor =
    score >= 8 ? '#10b981' :
    score >= 6 ? '#f59e0b' :
                 '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
          className="text-slate-100 dark:text-slate-700" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={strokeColor} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black leading-none" style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">/ 10</span>
      </div>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}

function WidgetRow({ label, present }: { label: string; present: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {present
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
      }
      <span className={cn('text-xs', present ? 'text-slate-700 dark:text-slate-300' : 'text-muted-foreground line-through')}>
        {label}
      </span>
    </div>
  )
}

function PriceStat({ label, value, currency = '$', highlight = false }: {
  label: string
  value: number
  currency?: string
  highlight?: boolean
}) {
  return (
    <div className={cn(
      'text-center rounded-lg p-2',
      highlight ? 'bg-primary/5 border border-primary/20' : 'bg-slate-50 dark:bg-slate-800/50'
    )}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={cn(
        'text-sm font-bold',
        highlight ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
      )}>
        {currency}{(value ?? 0).toLocaleString()}
      </p>
    </div>
  )
}

// ─── Score Breakdown ─────────────────────────────────────────────────────────

function ScoreBreakdownSection({ categories }: { categories: ScoreCategory[] }) {
  const [expandedCat, setExpandedCat] = useState<number | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Search className="w-4 h-4 text-slate-500" />
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {categories.map((cat, idx) => {
          const pct = cat.max > 0 ? (cat.earned / cat.max) * 100 : 0
          const isOpen = expandedCat === idx

          return (
            <div key={idx}>
              <button
                onClick={() => setExpandedCat(isOpen ? null : idx)}
                className="w-full flex items-center gap-3 py-2 group"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-left">
                  {cat.name}
                </span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {cat.earned}/{cat.max}
                </span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>

              {isOpen && cat.criteria.length > 0 && (
                <div className="ml-1 mb-2 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-1.5">
                  {cat.criteria.map((c, ci) => (
                    <div key={ci} className="flex items-start gap-2">
                      {c.met
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      }
                      <div className="min-w-0">
                        <span className={cn(
                          'text-xs',
                          c.met ? 'text-slate-700 dark:text-slate-300' : 'text-muted-foreground'
                        )}>
                          {c.label}
                          <span className="text-muted-foreground ml-1">({c.points}pt{c.points !== 1 ? 's' : ''})</span>
                        </span>
                        {c.detail && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{c.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ─── Bundle Detection Card ───────────────────────────────────────────────────

function BundleDetectionCard({ detection }: { detection: BundleDetection }) {
  const confColor =
    detection.confidence.toLowerCase() === 'high' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
    detection.confidence.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-slate-500" />
            Bundle Detection
          </span>
          <Badge className={cn('text-xs', confColor)}>
            {detection.confidence}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {detection.criticalGap && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">Critical gap — no bundling detected</p>
          </div>
        )}

        <div className="space-y-2">
          <MetaRow label="Dedicated Nav">
            <Badge variant={detection.hasDedicatedNavigation ? 'success' : 'outline'} className="text-[10px]">
              {detection.hasDedicatedNavigation ? 'Yes' : 'No'}
            </Badge>
          </MetaRow>
          <MetaRow label="Gift Section">
            <Badge variant={detection.hasGiftSection ? 'success' : 'outline'} className="text-[10px]">
              {detection.hasGiftSection ? 'Yes' : 'No'}
            </Badge>
          </MetaRow>
          <MetaRow label="Customization">
            <Badge variant={detection.hasCustomization ? 'success' : 'outline'} className="text-[10px]">
              {detection.hasCustomization ? 'Yes' : 'No'}
            </Badge>
          </MetaRow>
        </div>

        {Array.isArray(detection.signals) && detection.signals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Signals</p>
            <div className="space-y-1">
              {detection.signals.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px] shrink-0">{s.type}</Badge>
                  <span className="text-slate-600 dark:text-slate-400 truncate">{s.value}</span>
                  <span className="text-muted-foreground ml-auto shrink-0">{s.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(detection.keywordsFound) && detection.keywordsFound.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {detection.keywordsFound.map((kw, i) => (
                <Badge key={i} variant="blue" className="text-[10px]">{kw}</Badge>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(detection.appsDetected) && detection.appsDetected.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Apps Detected</p>
            <div className="flex flex-wrap gap-1.5">
              {detection.appsDetected.map((app, i) => (
                <Badge key={i} variant="purple" className="text-[10px]">{app}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Catalog Analysis Card ───────────────────────────────────────────────────

function CatalogAnalysisCard({ catalog, cs, shopName }: { catalog: CatalogAnalysis; cs: string; shopName: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-slate-500" />
            Catalog Analysis
          </span>
          <Badge variant="outline" className="text-xs">
            {catalog.totalProducts} products
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Bundle stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center rounded-lg p-2 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Bundles Found</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{catalog.bundleCount}</p>
          </div>
          <div className="text-center rounded-lg p-2 bg-primary/5 border border-primary/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Bundle %</p>
            <p className="text-sm font-bold text-primary">{catalog.bundlePercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Price ranges */}
        {catalog.bundlePriceRange && catalog.bundlePriceRange.median != null && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Bundle Price Range</p>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <span>{cs}{catalog.bundlePriceRange.min}</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="font-semibold text-primary">{cs}{catalog.bundlePriceRange.median}</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span>{cs}{catalog.bundlePriceRange.max}</span>
            </div>
          </div>
        )}

        {/* Bundle products */}
        {catalog.bundleProducts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Bundle Products ({catalog.bundleProducts.length})
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {catalog.bundleProducts.map((bp, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <a
                    href={`https://${shopName}/products/${bp.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate mr-2"
                  >
                    {bp.title}
                  </a>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono">{cs}{bp.price}</span>
                    <Badge variant="outline" className="text-[10px]">{bp.matchedTerm}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {catalog.categories && Object.keys(catalog.categories).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(catalog.categories).map(([cat, count]) => (
                <Badge key={cat} variant="outline" className="text-[10px] gap-1">
                  {cat} <span className="text-muted-foreground">({count})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Evidence Trail ──────────────────────────────────────────────────────────

function EvidenceTrailSection({ evidence }: { evidence: NonNullable<AuditorResults['evidence']> }) {
  const [open, setOpen] = useState(false)

  const hasPages = (evidence.bundlePages?.length ?? 0) > 0
  const hasByob = (evidence.byobPages?.length ?? 0) > 0
  const hasImages = (evidence.bundleImages?.length ?? 0) > 0
  const hasApps = (evidence.appsDetected?.length ?? 0) > 0
  const hasPdp = !!evidence.pdpWidgets?.productAudited
  const hasShipping = !!evidence.shipping
  const hasAny = hasPages || hasByob || hasImages || hasApps || hasPdp || hasShipping

  if (!hasAny) return null

  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Search className="w-4 h-4 text-slate-500" />
          Evidence Trail
        </span>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <CardContent className="pt-0 space-y-5 border-t border-slate-100 dark:border-slate-800">
          {/* Bundle Pages */}
          {hasPages && (
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                Bundle Pages ({evidence.bundlePages!.length})
              </p>
              <div className="space-y-1.5">
                {evidence.bundlePages!.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {p.label || p.url}
                    </a>
                    <Badge variant="outline" className="text-[10px] shrink-0">{p.source}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BYOB Pages */}
          {hasByob && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                BYOB Pages ({evidence.byobPages!.length})
              </p>
              <div className="space-y-1.5">
                {evidence.byobPages!.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {p.label || p.url}
                    </a>
                    <Badge variant="outline" className="text-[10px] shrink-0">{p.source}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bundle Images */}
          {hasImages && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Image className="w-3 h-3" />
                Bundle Images ({evidence.bundleImages!.length})
              </p>
              <div className="space-y-1.5">
                {evidence.bundleImages!.map((img, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge variant="blue" className="text-[10px] shrink-0">{img.matchedTerm}</Badge>
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {img.alt || img.src || '—'}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0 ml-auto">{img.source}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apps Detected */}
          {hasApps && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" />
                Apps Detected ({evidence.appsDetected!.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {evidence.appsDetected!.map((app, i) => (
                  <Badge key={i} variant="purple" className="text-[10px] gap-1">
                    {app.name}
                    <span className="text-[9px] opacity-60">({app.type})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* PDP Evidence */}
          {hasPdp && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                PDP Audited Product
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {evidence.pdpWidgets!.productAudited}
              </p>
            </div>
          )}

          {/* Shipping Evidence */}
          {hasShipping && (
            <ShippingEvidenceSection shipping={evidence.shipping!} />
          )}
        </CardContent>
      )}
    </Card>
  )
}

function ShippingEvidenceSection({ shipping }: { shipping: NonNullable<AuditorEvidence['shipping']> }) {
  const sym = shipping.currency ?? '$'

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">Shipping Evidence</p>
      <div className="space-y-1.5">
        {shipping.hasUnconditionalFreeShipping && (
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="success" className="text-[10px]">Unconditional Free Shipping</Badge>
          </div>
        )}
        {shipping.storeShape && (
          <EvidenceRow label="Store Shape" value={shipping.storeShape} />
        )}
        {shipping.anchorPrice != null && (
          <EvidenceRow label="Anchor Price" value={`${sym}${shipping.anchorPrice}`} />
        )}
        {shipping.anchorBand && (
          <EvidenceRow label="Anchor Band" value={shipping.anchorBand} />
        )}
        {shipping.anchorDominance != null && (
          <EvidenceRow label="Anchor Dominance" value={`${shipping.anchorDominance}%`} />
        )}
        {shipping.dominanceStrength && (
          <EvidenceRow label="Dominance" value={shipping.dominanceStrength} />
        )}
        {shipping.medianProductPrice != null && (
          <EvidenceRow label="Median Product Price" value={`${sym}${shipping.medianProductPrice}`} />
        )}
        {shipping.entryPriceGap != null && (
          <EvidenceRow label="Entry Price Gap" value={`${sym}${shipping.entryPriceGap}`} />
        )}
        {shipping.thresholdAlignment && (
          <EvidenceRow
            label="Threshold Alignment"
            value={`${shipping.thresholdAlignment.classification} (${shipping.thresholdAlignment.multiple.toFixed(1)}x)`}
          />
        )}
        {shipping.behavioral?.behavioralGap != null && (
          <EvidenceRow label="Behavioral Gap" value={`${sym}${shipping.behavioral.behavioralGap}`} />
        )}
        {shipping.behavioral?.gapReductionPotential != null && (
          <EvidenceRow label="Gap Reduction Potential" value={`${sym}${shipping.behavioral.gapReductionPotential}`} />
        )}
        {shipping.pricingConfidence && (
          <EvidenceRow label="Pricing Confidence" value={shipping.pricingConfidence} />
        )}

        {/* Price Distribution */}
        {shipping.priceDistribution && shipping.priceDistribution.length > 0 && (
          <div className="mt-2">
            <p className="text-[11px] text-muted-foreground mb-1.5">Price Distribution</p>
            <div className="space-y-1">
              {shipping.priceDistribution.map((band, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground w-20 shrink-0">{band.band}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full"
                      style={{ width: `${band.percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-right">{band.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  )
}

// ─── Legacy adapter ───────────────────────────────────────────────────────────
// Converts the old PipelineRun.result.audit shape into AuditorResults

function legacyAdapter(run: EnrichedPipelineRun): AuditorResults | undefined {
  const audit = run.result?.audit
  if (!audit) return undefined

  return {
    siteOverview: { title: audit.title, description: audit.description },
    shippingAnalysis: {
      hasFreeShipping: audit.shipping?.hasFreeShipping ?? false,
      threshold: audit.shipping?.threshold ?? null,
      deadZoneGap: null,
      entryPriceGap: null,
      coreProductPrice: null,
      notes: audit.shipping?.notes,
    },
    navigationAudit: {
      bundleTermsFound: [],
      hasGiftSection: audit.merchandising?.hasGiftSets ?? false,
      navItems: audit.merchandising?.navItems ?? [],
    },
    pdpAudit: {
      score: Math.round((audit.score / 10) * 7),
      maxScore: 7,
      widgetsPresent: [
        ...(audit.merchandising?.hasBundles ? ['Bundle widget'] : []),
        ...(audit.merchandising?.hasKits ? ['Kit builder'] : []),
        ...(audit.merchandising?.hasGiftSets ? ['Gift sets'] : []),
      ],
      widgetsMissing: [],
    },
    priceAnalysis: { min: 0, max: 0, median: 0 },
    criticalFindings: [],
    overallScore: audit.score ?? 0,
    summary: audit.summary ?? '',
  }
}
