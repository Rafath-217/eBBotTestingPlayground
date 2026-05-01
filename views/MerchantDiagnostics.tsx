import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowUpDown, Check, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react';
import { Badge, Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import {
  AovImpactResponse,
  BaselineResponse,
  BundleDriversResponse,
  BundleInsightRow,
  FilterOptions,
  SegmentRow,
  StoreInsightResponse,
  StoreInsightRow,
  SummaryResponse,
  getMerchantDiagnosticsAovImpact,
  getMerchantDiagnosticsBaseline,
  getMerchantDiagnosticsBundleDrivers,
  getMerchantDiagnosticsStore,
  getMerchantDiagnosticsSummary,
} from '../services/merchantDiagnosticsApi';

type Filters = {
  industry: string;
  shopifyPlanGroup: string;
  appPlanGroup: string;
  priceBand: string;
  bundleSetup: string;
  minEbRevenue: string;
  minEbOrders: string;
  minEbSessions: string;
  minStoreRevenue: string;
  search: string;
};

const DEFAULT_FILTERS: Filters = {
  industry: '',
  shopifyPlanGroup: '',
  appPlanGroup: '',
  priceBand: '',
  bundleSetup: '',
  minEbRevenue: '',
  minEbOrders: '',
  minEbSessions: '',
  minStoreRevenue: '',
  search: '',
};

function fmtNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtMoney(value: number | null | undefined, prefix = '$'): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return prefix + Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toFixed(2)}%`;
}

function safeRows<T>(rows: T[] | null | undefined): T[] {
  return Array.isArray(rows) ? rows : [];
}

function safePagination(pagination: Partial<{ page: number; totalPages: number; total: number }> | null | undefined) {
  return {
    page: pagination?.page || 1,
    totalPages: pagination?.totalPages || 1,
    total: pagination?.total || 0,
  };
}

function safeFilters(filters: FilterOptions | null | undefined): FilterOptions {
  return filters || {};
}

function badgeVariant(value: string): 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' {
  const v = value?.toLowerCase();
  if (v === 'high' || v === 'usable') return 'success';
  if (v === 'medium' || v === 'directional_only') return 'warning';
  if (v === 'low' || v === 'failed') return 'destructive';
  return 'secondary';
}

function queryFromFilters(filters: Partial<Filters>, extra: Record<string, string | number> = {}) {
  return {
    industry: filters.industry,
    shopifyPlanGroup: filters.shopifyPlanGroup,
    appPlanGroup: filters.appPlanGroup,
    priceBand: filters.priceBand,
    bundleSetup: filters.bundleSetup,
    minEbRevenue: filters.minEbRevenue,
    minEbOrders: filters.minEbOrders,
    minEbSessions: filters.minEbSessions,
    minStoreRevenue: filters.minStoreRevenue,
    search: filters.search,
    ...extra,
  };
}

function useSummaryOptions() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  useEffect(() => {
    getMerchantDiagnosticsSummary().then(setSummary).catch(() => null);
  }, []);
  return summary;
}

function PageShell({ title, subtitle, windowLabel, children }: { title: string; subtitle: string; windowLabel?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          {windowLabel && <Badge variant="outline">{windowLabel}</Badge>}
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Store revenue uses REST orders and is reported currency. Store sessions use ShopifyQL. EB and bundle revenue are USD.
        </div>
      </div>
      {children}
    </div>
  );
}

function LoadingState() {
  return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>;
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" /> {error}</div>
        <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, helper }: { label: string; value: React.ReactNode; helper?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</div>
        {helper && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
      </CardContent>
    </Card>
  );
}

function FilterBar({ filters, setFilters, options, onApply, onReset, hasChanges, children }: { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>>; options?: FilterOptions; onApply: () => void; onReset: () => void; hasChanges: boolean; children?: React.ReactNode }) {
  const update = (key: keyof Filters, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));
  const onEnter: React.KeyboardEventHandler = (e) => { if (e.key === 'Enter' && hasChanges) { e.preventDefault(); onApply(); } };
  return (
    <Card>
      <CardContent className="space-y-3 p-4" onKeyDown={onEnter}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Select label="Industry" value={filters.industry} onChange={(v) => update('industry', v)} options={options?.industries || []} />
          <Select label="Shopify plan" value={filters.shopifyPlanGroup} onChange={(v) => update('shopifyPlanGroup', v)} options={options?.shopifyPlanGroups || []} />
          <Select label="App plan" value={filters.appPlanGroup} onChange={(v) => update('appPlanGroup', v)} options={options?.appPlanGroups || []} />
          <Select label="Price band" value={filters.priceBand} onChange={(v) => update('priceBand', v)} options={options?.priceBands || []} />
          <Select label="Bundle setup" value={filters.bundleSetup} onChange={(v) => update('bundleSetup', v)} options={options?.bundleSetups || []} />
          <label className="space-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Search shop
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <input value={filters.search} onChange={(e) => update('search', e.target.value)} className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="shop name" />
            </div>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          <Input label="Min EB revenue" value={filters.minEbRevenue} onChange={(v) => update('minEbRevenue', v)} />
          <Input label="Min EB orders" value={filters.minEbOrders} onChange={(v) => update('minEbOrders', v)} />
          <Input label="Min EB sessions" value={filters.minEbSessions} onChange={(v) => update('minEbSessions', v)} />
          <Input label="Min store revenue" value={filters.minStoreRevenue} onChange={(v) => update('minStoreRevenue', v)} />
          {children}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          {hasChanges && <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Unapplied changes</span>}
          <Button variant="outline" size="sm" onClick={onReset}>Reset</Button>
          <Button size="sm" disabled={!hasChanges} onClick={onApply}>Apply filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="space-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        <option value="">All</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
    </label>
  );
}

function Presets({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Preset</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Button key={option.value} size="sm" variant={active ? 'default' : 'outline'} className={active ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950' : ''} onClick={() => onChange(option.value)}>
              {active && <Check className="mr-1 h-3 w-3" />}
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function presetLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label || value;
}

function filtersEqual(a: Filters, b: Filters): boolean {
  return (
    a.industry === b.industry &&
    a.shopifyPlanGroup === b.shopifyPlanGroup &&
    a.appPlanGroup === b.appPlanGroup &&
    a.priceBand === b.priceBand &&
    a.bundleSetup === b.bundleSetup &&
    a.minEbRevenue === b.minEbRevenue &&
    a.minEbOrders === b.minEbOrders &&
    a.minEbSessions === b.minEbSessions &&
    a.minStoreRevenue === b.minStoreRevenue &&
    a.search === b.search
  );
}

function SegmentTable({ title, rows }: { title: string; rows: SegmentRow[] }) {
  const safe = safeRows(rows);
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="font-semibold">{title}</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Segment</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">EB revenue</TableHead><TableHead className="text-right">Median EB rev</TableHead><TableHead className="text-right">Median completion</TableHead><TableHead>Quality</TableHead></TableRow></TableHeader>
          <TableBody>
            {safe.slice(0, 8).map((row) => (
              <TableRow key={row.segment}>
                <TableCell className="font-medium">{row.segment}</TableCell>
                <TableCell className="text-right font-mono">{fmtNumber(row.storeCount ?? row.bundleCount)}</TableCell>
                <TableCell className="text-right font-mono">{fmtMoney(row.ebRevenueUsd ?? row.revenueUsd)}</TableCell>
                <TableCell className="text-right font-mono">{fmtMoney(row.medianEbRevenueUsd)}</TableCell>
                <TableCell className="text-right font-mono">{fmtPct(row.medianCompletionRate)}</TableCell>
                <TableCell><Badge variant={badgeVariant(row.sampleQuality || 'usable')}>{row.sampleQuality || 'usable'}</Badge></TableCell>
              </TableRow>
            ))}
            {!safe.length && <TableRow><TableCell colSpan={6} className="text-sm text-slate-500">No rows for this selection.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StoreTable({ rows }: { rows: StoreInsightRow[] }) {
  const safe = safeRows(rows);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Store</TableHead><TableHead>Industry</TableHead><TableHead>Price band</TableHead><TableHead className="text-right">EB revenue</TableHead><TableHead className="text-right">Store revenue</TableHead><TableHead className="text-right">Store sessions</TableHead><TableHead className="text-right">EB share</TableHead><TableHead className="text-right">AOV lift</TableHead><TableHead className="text-right">EB sessions</TableHead><TableHead className="text-right">Completion</TableHead><TableHead>Reliability</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {safe.map((row) => (
          <TableRow key={row.shopName}>
            <TableCell><Link className="font-medium text-blue-600 hover:underline dark:text-blue-400" to={`/merchant-diagnostics/store/${encodeURIComponent(row.shopName)}`}>{row.shopName}</Link></TableCell>
            <TableCell>{row.industry}</TableCell>
            <TableCell><Badge variant="outline">{row.priceBand}</Badge></TableCell>
            <TableCell className="text-right font-mono">{fmtMoney(row.ebRevenueUsd)}</TableCell>
            <TableCell className="text-right font-mono">{fmtMoney(row.storeRevenue, '')}</TableCell>
            <TableCell className="text-right font-mono">{fmtNumber(row.storeSessions)}</TableCell>
            <TableCell className="text-right font-mono">{fmtPct(row.ebRevenueShare)}</TableCell>
            <TableCell className="text-right font-mono">{fmtPct(row.aovLift)}</TableCell>
            <TableCell className="text-right font-mono">{fmtNumber(row.ebSessions)}</TableCell>
            <TableCell className="text-right font-mono">{fmtPct(row.completionRate)}</TableCell>
            <TableCell><Badge variant={badgeVariant(row.reliabilityLevel)}>{row.reliabilityLevel}</Badge></TableCell>
          </TableRow>
        ))}
        {!safe.length && <TableRow><TableCell colSpan={11} className="text-sm text-slate-500">No stores match this selection.</TableCell></TableRow>}
      </TableBody>
    </Table>
  );
}

function BundleTable({ rows }: { rows: BundleInsightRow[] }) {
  const safe = safeRows(rows);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bundle</TableHead><TableHead>Shop</TableHead><TableHead>Bundling strategy</TableHead><TableHead>Offer strategy</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Sessions</TableHead><TableHead className="text-right">Completion</TableHead><TableHead>Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {safe.map((row) => (
          <TableRow key={`${row.shopName}-${row.bundleRef}`}>
            <TableCell className="max-w-[280px] font-medium">{row.title}</TableCell>
            <TableCell><Link className="text-blue-600 hover:underline dark:text-blue-400" to={`/merchant-diagnostics/store/${encodeURIComponent(row.shopName)}`}>{row.shopName}</Link></TableCell>
            <TableCell><Badge variant="outline">{row.bundlingStrategy}</Badge></TableCell>
            <TableCell><Badge variant="secondary">{row.offerStrategy}</Badge></TableCell>
            <TableCell className="text-right font-mono">{fmtMoney(row.revenueUsd)}</TableCell>
            <TableCell className="text-right font-mono">{fmtNumber(row.orders)}</TableCell>
            <TableCell className="text-right font-mono">{fmtNumber(row.sessions)}</TableCell>
            <TableCell className="text-right font-mono">{fmtPct(row.completionRate)}</TableCell>
            <TableCell>{row.bundleLink ? <a className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400" href={row.bundleLink} target="_blank" rel="noreferrer">Open <ExternalLink className="h-3 w-3" /></a> : <span className="text-slate-400">Missing</span>}</TableCell>
          </TableRow>
        ))}
        {!safe.length && <TableRow><TableCell colSpan={9} className="text-sm text-slate-500">No bundles match this selection.</TableCell></TableRow>}
      </TableBody>
    </Table>
  );
}

function PaginationLine({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>Page {page} of {totalPages} · {fmtNumber(total)} rows</span>
      <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button></div>
    </div>
  );
}

export function MerchantDiagnosticsOverview() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState('');
  const load = () => getMerchantDiagnosticsSummary().then((payload) => {
    if (!payload?.success || !payload.window) throw new Error('Unexpected Merchant Diagnostics summary response');
    setData(payload);
  }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  if (error) return <ErrorState error={error} onRetry={load} />;
	  if (!data) return <LoadingState />;
  const summary = data.summary || {};
	  const windowLabel = data.window ? `${data.window.type} · ${data.window.startDate} to ${data.window.endDate}` : undefined;
	  return (
	    <PageShell title="Merchant Diagnostic Overview" subtitle="Snapshot health, coverage, and fastest path into analysis." windowLabel={windowLabel}>
	      <div className="grid gap-4 md:grid-cols-5">
	        <StatCard label="Usable stores" value={fmtNumber(summary.usableStores as number)} helper="Failed excluded" />
	        <StatCard label="Bundle profiles" value={fmtNumber(summary.bundleProfiles as number)} />
	        <StatCard label="Stores with EB revenue" value={fmtNumber(summary.storesWithEbRevenue as number)} />
	        <StatCard label="AOV-ready stores" value={fmtNumber(summary.storesAovReady as number)} />
	        <StatCard label="Bundle links" value={fmtNumber(summary.bundlesWithLinks as number)} />
	      </div>
	      <div className="grid gap-4 xl:grid-cols-2">
	        <SegmentTable title="Top industries by EB revenue" rows={safeRows(data.revenueByIndustry)} />
	        <SegmentTable title="Revenue by bundling strategy" rows={safeRows(data.revenueByBundlingStrategy)} />
	      </div>
	      <SegmentTable title="Revenue by offer strategy" rows={safeRows(data.revenueByOfferStrategy)} />
	    </PageShell>
	  );
	}

const BASELINE_PRESETS = [
  { value: 'top-eb-revenue', label: 'Top EB revenue' },
  { value: 'high-share', label: 'High EB share' },
  { value: 'high-traffic-low-completion', label: 'High traffic, low completion' },
  { value: 'many-bundles-weak-revenue', label: 'Many bundles, weak revenue' },
  { value: 'few-bundles-strong-revenue', label: 'Few bundles, strong revenue' },
];

export function MerchantDiagnosticsBaseline() {
  const summary = useSummaryOptions();
  const baselineDefaults: Filters = { ...DEFAULT_FILTERS, minEbRevenue: '100', minEbSessions: '100' };
  const [draftFilters, setDraftFilters] = useState<Filters>(baselineDefaults);
  const [filters, setFilters] = useState<Filters>(baselineDefaults);
  const [preset, setPreset] = useState('top-eb-revenue');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BaselineResponse | null>(null);
  const [error, setError] = useState('');
  const hasChanges = !filtersEqual(draftFilters, filters);
  const applyFilters = () => setFilters(draftFilters);
  const resetFilters = () => { setDraftFilters(baselineDefaults); setFilters(baselineDefaults); };
  const load = () => getMerchantDiagnosticsBaseline(queryFromFilters(filters, { preset, page, limit: 50 })).then((payload) => {
    if (!payload?.success || !payload.window) throw new Error('Unexpected Merchant Diagnostics baseline response');
    setData(payload);
  }).catch((e) => setError(e.message));
  useEffect(() => { setPage(1); }, [filters, preset]);
  useEffect(() => { load(); }, [filters, preset, page]);
  if (error) return <ErrorState error={error} onRetry={load} />;
  const shownTotal = data?.pagination?.total ?? 0;
  const poolTotal = data?.candidatePool?.total ?? 0;
  const presetNarrowing = shownTotal !== poolTotal;
	  return (
	    <PageShell title="Baseline Insights" subtitle="Find strong stores and segments for benchmark work." windowLabel={data?.window ? `${data.window.startDate} to ${data.window.endDate}` : undefined}>
	      <FilterBar filters={draftFilters} setFilters={setDraftFilters} options={safeFilters(summary?.filters)} onApply={applyFilters} onReset={resetFilters} hasChanges={hasChanges} />
	      <Presets value={preset} onChange={setPreset} options={BASELINE_PRESETS} />
	      {!data ? <LoadingState /> : <>
	        <div className="grid gap-4 md:grid-cols-5"><StatCard label="Stores" value={fmtNumber(data.candidatePool?.total)} /><StatCard label="With store revenue" value={fmtNumber(data.candidatePool?.withStoreRevenue)} /><StatCard label="With store sessions" value={fmtNumber(data.candidatePool?.withStoreSessions)} /><StatCard label="With EB revenue" value={fmtNumber(data.candidatePool?.withEbRevenue)} /><StatCard label="With bundles" value={fmtNumber(data.candidatePool?.withBundleProfiles)} /></div>
	        <div className="grid gap-4 xl:grid-cols-2"><SegmentTable title="Segments by industry" rows={safeRows(data.segments?.byIndustry)} /><SegmentTable title="Segments by price band" rows={safeRows(data.segments?.byPriceBand)} /></div>
	        <Card><CardContent className="space-y-3 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Store candidates</h2><p className="text-xs text-slate-500 dark:text-slate-400">Showing {fmtNumber(shownTotal)} of {fmtNumber(poolTotal)} stores · Preset: {presetLabel(BASELINE_PRESETS, preset)}{presetNarrowing ? ' (narrowed from candidate pool)' : ''}</p></div><Badge variant="outline"><ArrowUpDown className="mr-1 h-3 w-3" /> EB revenue desc</Badge></div><StoreTable rows={safeRows(data.rows)} /><PaginationLine {...safePagination(data.pagination)} onPage={setPage} /></CardContent></Card>
	      </>}
	    </PageShell>
	  );
	}

const AOV_PRESETS = [
  { value: 'top-eb-revenue', label: 'Top EB revenue' },
  { value: 'positive-lift', label: 'Positive AOV lift' },
  { value: 'weak-lift', label: 'High revenue, weak lift' },
  { value: 'high-lift-low-revenue', label: 'High lift, low revenue' },
];

export function MerchantDiagnosticsAovImpact() {
  const summary = useSummaryOptions();
  const aovDefaults: Filters = { ...DEFAULT_FILTERS, minEbRevenue: '100', minEbOrders: '5', minStoreRevenue: '1000' };
  const [draftFilters, setDraftFilters] = useState<Filters>(aovDefaults);
  const [filters, setFilters] = useState<Filters>(aovDefaults);
  const [preset, setPreset] = useState('top-eb-revenue');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AovImpactResponse | null>(null);
  const [error, setError] = useState('');
  const hasChanges = !filtersEqual(draftFilters, filters);
  const applyFilters = () => setFilters(draftFilters);
  const resetFilters = () => { setDraftFilters(aovDefaults); setFilters(aovDefaults); };
  const load = () => getMerchantDiagnosticsAovImpact(queryFromFilters(filters, { preset, page, limit: 50 })).then((payload) => {
    if (!payload?.success || !payload.window) throw new Error('Unexpected Merchant Diagnostics AOV response');
    setData(payload);
  }).catch((e) => setError(e.message));
  useEffect(() => { setPage(1); }, [filters, preset]);
  useEffect(() => { load(); }, [filters, preset, page]);
  if (error) return <ErrorState error={error} onRetry={load} />;
	  return (
	    <PageShell title="AOV Impact" subtitle="Find defensible AOV and revenue-impact proof points." windowLabel={data?.window ? `${data.window.startDate} to ${data.window.endDate}` : undefined}>
	      <FilterBar filters={draftFilters} setFilters={setDraftFilters} options={safeFilters(summary?.filters)} onApply={applyFilters} onReset={resetFilters} hasChanges={hasChanges} />
	      <Presets value={preset} onChange={setPreset} options={AOV_PRESETS} />
	      {!data ? <LoadingState /> : <>
	        <div className="grid gap-4 md:grid-cols-5"><StatCard label="AOV-ready stores" value={fmtNumber(data.claim?.storeCount)} /><StatCard label="Positive lift" value={fmtNumber(data.claim?.positiveLiftStores)} helper={fmtPct(data.claim?.positiveLiftPercent)} /><StatCard label="Median lift" value={fmtPct(data.claim?.medianAovLift)} /><StatCard label="P10 / P90" value={`${fmtPct(data.distribution?.p10 as number)} / ${fmtPct(data.distribution?.p90 as number)}`} /><StatCard label="Sample caveat" value="Observed" helper="Not causal" /></div>
	        <Card><CardContent className="space-y-2 p-4"><h2 className="font-semibold">Claim copy</h2><p className="text-sm text-slate-700 dark:text-slate-300">{data.claim?.text || 'No claim-ready sample for this selection.'}</p><p className="text-xs text-slate-500">Use as an observed comparison, not a causal claim.</p></CardContent></Card>
	        <div className="grid gap-4 xl:grid-cols-2"><SegmentTable title="Claim-ready industries" rows={safeRows(data.segments?.byIndustry)} /><SegmentTable title="Claim-ready price bands" rows={safeRows(data.segments?.byPriceBand)} /></div>
	        <Card><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Store impact</h2><Badge variant="outline">EB revenue desc</Badge></div><StoreTable rows={safeRows(data.rows)} /><PaginationLine {...safePagination(data.pagination)} onPage={setPage} /></CardContent></Card>
	        <Card><CardContent className="space-y-3 p-4"><h2 className="font-semibold">Top bundles by revenue in current sample</h2><BundleTable rows={safeRows(data.bundleDrivers)} /></CardContent></Card>
	      </>}
	    </PageShell>
	  );
	}

const BUNDLE_PRESETS = [
  { value: 'top-revenue', label: 'Top revenue bundles' },
  { value: 'high-session-low-completion', label: 'High traffic, low completion' },
  { value: 'missing-links', label: 'Missing links' },
];

export function MerchantDiagnosticsBundleDrivers() {
  const summary = useSummaryOptions();
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [preset, setPreset] = useState('top-revenue');
  const [draftBundlingStrategy, setDraftBundlingStrategy] = useState('');
  const [bundlingStrategy, setBundlingStrategy] = useState('');
  const [draftOfferStrategy, setDraftOfferStrategy] = useState('');
  const [offerStrategy, setOfferStrategy] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BundleDriversResponse | null>(null);
  const [error, setError] = useState('');
  const hasChanges = !filtersEqual(draftFilters, filters) || draftBundlingStrategy !== bundlingStrategy || draftOfferStrategy !== offerStrategy;
  const applyFilters = () => {
    setFilters(draftFilters);
    setBundlingStrategy(draftBundlingStrategy);
    setOfferStrategy(draftOfferStrategy);
  };
  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS); setFilters(DEFAULT_FILTERS);
    setDraftBundlingStrategy(''); setBundlingStrategy('');
    setDraftOfferStrategy(''); setOfferStrategy('');
  };
  const load = () => getMerchantDiagnosticsBundleDrivers(queryFromFilters(filters, { preset, page, limit: 50, bundlingStrategy, offerStrategy })).then((payload) => {
    if (!payload?.success || !payload.window) throw new Error('Unexpected Merchant Diagnostics bundle response');
    setData(payload);
  }).catch((e) => setError(e.message));
  useEffect(() => { setPage(1); }, [filters, preset, bundlingStrategy, offerStrategy]);
  useEffect(() => { load(); }, [filters, preset, bundlingStrategy, offerStrategy, page]);
	  if (error) return <ErrorState error={error} onRetry={load} />;
  const options = safeFilters(summary?.filters);
	  return (
	    <PageShell title="Bundle Drivers" subtitle="Inspect bundle-level revenue, offer patterns, and links." windowLabel={data?.window ? `${data.window.startDate} to ${data.window.endDate}` : undefined}>
	      <FilterBar filters={draftFilters} setFilters={setDraftFilters} options={options} onApply={applyFilters} onReset={resetFilters} hasChanges={hasChanges}>
	        <Select label="Bundling strategy" value={draftBundlingStrategy} onChange={setDraftBundlingStrategy} options={options.bundlingStrategies || []} />
	        <Select label="Offer strategy" value={draftOfferStrategy} onChange={setDraftOfferStrategy} options={options.offerStrategies || []} />
	      </FilterBar>
	      <Presets value={preset} onChange={setPreset} options={BUNDLE_PRESETS} />
	      {!data ? <LoadingState /> : <>
	        <div className="grid gap-4 md:grid-cols-5"><StatCard label="Bundles" value={fmtNumber(data.summary?.totalBundles as number)} /><StatCard label="With revenue" value={fmtNumber(data.summary?.withRevenue as number)} /><StatCard label="With sessions" value={fmtNumber(data.summary?.withSessions as number)} /><StatCard label="With links" value={fmtNumber(data.summary?.withLinks as number)} /><StatCard label="Top revenue" value={fmtMoney(data.summary?.topBundleRevenueUsd as number)} /></div>
	        <div className="grid gap-4 xl:grid-cols-2"><SegmentTable title="Revenue by bundling strategy" rows={safeRows(data.revenueByBundlingStrategy)} /><SegmentTable title="Revenue by offer strategy" rows={safeRows(data.revenueByOfferStrategy)} /></div>
	        <Card><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Bundles</h2><Badge variant="outline">Bundle revenue desc</Badge></div><BundleTable rows={safeRows(data.rows)} /><PaginationLine {...safePagination(data.pagination)} onPage={setPage} /></CardContent></Card>
	      </>}
	    </PageShell>
	  );
	}

export function MerchantDiagnosticsStoreDrilldown() {
  const { shopName = '' } = useParams();
  const navigate = useNavigate();
  const decoded = useMemo(() => decodeURIComponent(shopName), [shopName]);
  const [data, setData] = useState<StoreInsightResponse | null>(null);
  const [error, setError] = useState('');
  const load = () => getMerchantDiagnosticsStore(decoded).then((payload) => {
    if (!payload?.success || !payload.window) throw new Error('Unexpected Merchant Diagnostics store response');
    setData(payload);
  }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [decoded]);
	  if (error) return <ErrorState error={error} onRetry={load} />;
	  if (!data) return <LoadingState />;
	  const store = data.store;
  if (!store) return <ErrorState error="No store data found for this shop." onRetry={load} />;
	  return (
	    <PageShell title={store.shopName} subtitle={`${store.industry} · ${store.shopifyPlanGroup} · ${store.appPlanGroup} · ${store.bundleSetup}`} windowLabel={`${data.window.startDate} to ${data.window.endDate}`}>
	      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
	      <Card><CardContent className="flex flex-wrap items-center gap-2 p-4"><span className="text-sm font-medium">Reliability</span><Badge variant={badgeVariant(store.reliabilityLevel)}>{store.reliabilityLevel}</Badge>{store.flags?.slice(0, 4).map((flag) => <Badge key={flag} variant="outline">{flag}</Badge>)}</CardContent></Card>
	      <div className="grid gap-4 md:grid-cols-6"><StatCard label="EB revenue" value={fmtMoney(store.ebRevenueUsd)} /><StatCard label="EB share" value={fmtPct(store.ebRevenueShare)} /><StatCard label="EB orders" value={fmtNumber(store.ebOrders)} /><StatCard label="EB sessions" value={fmtNumber(store.ebSessions)} /><StatCard label="Completion" value={fmtPct(store.completionRate)} /><StatCard label="AOV lift" value={fmtPct(store.aovLift)} /></div>
	      <div className="grid gap-4 md:grid-cols-4"><StatCard label="Store revenue" value={fmtMoney(store.storeRevenue, '')} helper={data.sourceSummary?.storeRevenueSource} /><StatCard label="Store sessions" value={fmtNumber(store.storeSessions)} helper={data.sourceSummary?.storeSessionsSource} /><StatCard label="Store AOV" value={fmtMoney(store.storeAov, '')} /><StatCard label="EB AOV" value={fmtMoney(store.ebAovUsd)} /></div>
	      <Card><CardContent className="space-y-3 p-4"><h2 className="font-semibold">Bundles by revenue</h2><BundleTable rows={safeRows(data.bundles)} /></CardContent></Card>
	    </PageShell>
	  );
	}
