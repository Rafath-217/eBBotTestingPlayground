import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar, Search, Filter, TrendingDown, AlertTriangle, Store, Zap, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { ViewMode } from '../components/Layout';
import { PMResultView } from '../components/PMViews';
import { getChurnedStores, getStoreDetail, analyseStore, backfillChurnData, ChurnedStore, ChurnQuery, StoreDetail, ChurnReason, ChurnAnalysisResult } from '../services/churnAnalysisApi';

interface ChurnAnalysisProps {
  viewMode: ViewMode;
}

// PM-friendly view for Structure LLM output
const PMStructureView: React.FC<{ output: any }> = ({ output }) => {
  if (!output) return <div className="text-muted-foreground text-sm">No structure output</div>;

  const structureType = output.structureType;
  const steps = output.steps || [];
  const stepLabels = steps.map((s: any) => s.label).filter(Boolean);
  const collectionHints = steps.flatMap((s: any) => s.collectionHints || []);

  return (
    <div className="border rounded-lg bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Structure Type</h4>
        <Badge variant={structureType === 'SINGLE_STEP' ? 'success' : structureType === 'MULTI_STEP' ? 'blue' : 'destructive'}>
          {structureType || 'null'}
        </Badge>
      </div>

      {stepLabels.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Step Labels</p>
          <div className="flex flex-wrap gap-2">
            {stepLabels.map((label: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                Step {idx + 1}: {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {collectionHints.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Collection Hints</p>
          <div className="flex flex-wrap gap-2">
            {collectionHints.map((hint: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {hint}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// PM-friendly view for Discount LLM output
const PMDiscountView: React.FC<{ output: any }> = ({ output }) => {
  if (!output) return <div className="text-muted-foreground text-sm">No discount output</div>;

  const config = output.discountConfiguration || output;
  const discountMode = config.discountMode;
  const rules = config.rules || [];

  const getModeVariant = () => {
    if (discountMode === 'PERCENTAGE') return 'success';
    if (discountMode === 'FIXED') return 'blue';
    if (discountMode === 'FIXED_BUNDLE_PRICE') return 'purple';
    return 'destructive';
  };

  return (
    <div className="border rounded-lg bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Discount Mode</h4>
        <Badge variant={getModeVariant()}>
          {discountMode || 'null'}
        </Badge>
      </div>

      {rules.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Discount Rules</p>
          <div className="space-y-2">
            {rules.map((rule: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                <span className="text-muted-foreground">{rule.type}: {rule.value}</span>
                <Badge variant="outline">{rule.discountValue}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// PM-friendly view for Rules LLM output
const PMRulesView: React.FC<{ output: any }> = ({ output }) => {
  if (!output) return <div className="text-muted-foreground text-sm">No rules output</div>;

  const conditionsObj = output.conditions || {};
  const conditions = conditionsObj.rules || [];

  const getConditionLabel = (condition: string) => {
    if (condition === 'greaterThanOrEqualTo') return 'At least';
    if (condition === 'lessThanOrEqualTo') return 'At most';
    if (condition === 'equalTo') return 'Exactly';
    return condition;
  };

  return (
    <div className="border rounded-lg bg-card p-4 space-y-3">
      <h4 className="font-semibold text-sm">Selection Rules</h4>

      {conditions.length > 0 ? (
        <div className="space-y-2">
          {conditions.map((cond: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
              {cond.stepIndex !== undefined && (
                <Badge variant="outline" className="text-xs">Step {cond.stepIndex + 1}</Badge>
              )}
              <span>{getConditionLabel(cond.condition)}</span>
              <Badge variant="secondary">{cond.value}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No specific rules - any quantity allowed</p>
      )}
    </div>
  );
};


const ChurnAnalysis: React.FC<ChurnAnalysisProps> = ({ viewMode }) => {
  // Store list & pagination
  const [stores, setStores] = useState<ChurnedStore[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded row
  const [expandedShop, setExpandedShop] = useState<string | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Analysis
  const [analysisResults, setAnalysisResults] = useState<Record<string, ChurnAnalysisResult>>({});
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);

  // Backfill
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [searchShopName, setSearchShopName] = useState('');
  const [minRuns, setMinRuns] = useState('');
  const [maxRuns, setMaxRuns] = useState('');
  const [hadErrors, setHadErrors] = useState<'ALL' | 'WITH_ERRORS'>('ALL');
  const [sortBy, setSortBy] = useState<string>('uninstalledAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Formatting helpers
  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getSeverityVariant = (severity: string) => {
    if (severity === 'high') return 'destructive';
    if (severity === 'medium') return 'warning';
    return 'secondary';
  };

  const formatReasonLabel = (reason: string) =>
    (reason || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const activePreset = (() => {
    if (!dateFrom && !dateTo) return 'all';
    if (!dateFrom || dateTo) return null;
    const diffDays = Math.round((Date.now() - dateFrom.getTime()) / 86400000);
    if (diffDays >= 6 && diffDays <= 8) return '7d';
    if (diffDays >= 29 && diffDays <= 31) return '30d';
    if (diffDays >= 89 && diffDays <= 91) return '90d';
    return null;
  })();

  // Fetch stores
  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: ChurnQuery = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };
      if (dateFrom) query.dateFrom = dateFrom.toISOString();
      if (dateTo) query.dateTo = dateTo.toISOString();
      if (searchShopName.trim()) query.search = searchShopName.trim();
      if (minRuns) query.minRuns = Number(minRuns);
      if (maxRuns) query.maxRuns = Number(maxRuns);
      if (hadErrors === 'WITH_ERRORS') query.hadErrors = 'true';

      const response = await getChurnedStores(query);
      setStores(response.data.stores);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch churned stores:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch churned stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [currentPage, sortBy, sortOrder, dateFrom, dateTo]);

  // Expand row -> fetch detail
  const handleRowClick = async (shopName: string) => {
    if (expandedShop === shopName) {
      setExpandedShop(null);
      setStoreDetail(null);
      setDetailError(null);
      return;
    }

    setExpandedShop(shopName);
    setStoreDetail(null);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await getStoreDetail(shopName);
      setStoreDetail(response.data);
    } catch (err) {
      console.error('Failed to fetch store detail:', err);
      setDetailError(err instanceof Error ? err.message : 'Failed to fetch store detail');
    } finally {
      setDetailLoading(false);
    }
  };

  // Analyse churn reasons
  const handleAnalyse = async (shopName: string) => {
    setAnalysisLoading(shopName);
    try {
      const response = await analyseStore(shopName);
      setAnalysisResults((prev) => ({ ...prev, [shopName]: response.data }));
    } catch (err) {
      console.error('Failed to analyse store:', err);
    } finally {
      setAnalysisLoading(null);
    }
  };

  // Backfill
  const handleBackfill = async () => {
    setBackfillLoading(true);
    setBackfillResult(null);
    try {
      const response = await backfillChurnData();
      setBackfillResult(
        `Backfill complete: ${response.data.annotated} annotated out of ${response.data.total} total (${response.data.skippedInstalled} still installed, skipped)`
      );
    } catch (err) {
      console.error('Backfill failed:', err);
      setBackfillResult(`Backfill failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setBackfillLoading(false);
    }
  };

  // Filter actions
  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchStores();
  };

  const handleClearFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    setSearchShopName('');
    setMinRuns('');
    setMaxRuns('');
    setHadErrors('ALL');
    setSortBy('uninstalledAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Download all pages for current filters as JSON
  const handleDownload = async () => {
    try {
      const query: ChurnQuery = {
        page: 1,
        limit: 1000,
        sortBy,
        sortOrder,
      };
      if (dateFrom) query.dateFrom = dateFrom.toISOString();
      if (dateTo) query.dateTo = dateTo.toISOString();
      if (searchShopName.trim()) query.search = searchShopName.trim();
      if (minRuns) query.minRuns = Number(minRuns);
      if (maxRuns) query.maxRuns = Number(maxRuns);
      if (hadErrors === 'WITH_ERRORS') query.hadErrors = 'true';

      const response = await getChurnedStores(query);
      const exportData = {
        exportedAt: new Date().toISOString(),
        filters: {
          dateFrom: dateFrom?.toISOString() || null,
          dateTo: dateTo?.toISOString() || null,
          search: searchShopName.trim() || null,
          minRuns: minRuns || null,
          maxRuns: maxRuns || null,
          hadErrors: hadErrors !== 'ALL' ? hadErrors : null,
          sortBy,
          sortOrder,
        },
        total: response.data.pagination.total,
        stores: response.data.stores,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `churn-analysis-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download churn analysis data');
    }
  };

  // Pagination page numbers (same pattern as PipelineHistory)
  const renderPageNumbers = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
      let pageNum: number;
      if (pagination.totalPages <= 5) {
        pageNum = i + 1;
      } else if (pagination.page <= 3) {
        pageNum = i + 1;
      } else if (pagination.page >= pagination.totalPages - 2) {
        pageNum = pagination.totalPages - 4 + i;
      } else {
        pageNum = pagination.page - 2 + i;
      }

      return (
        <Button
          key={pageNum}
          variant={pageNum === pagination.page ? 'default' : 'outline'}
          size="sm"
          className="w-9"
          onClick={() => setCurrentPage(pageNum)}
        >
          {pageNum}
        </Button>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            Churn Analysis
          </h1>
          <p className="text-muted-foreground">
            Stores that uninstalled after using the AI bundle setup pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={loading || stores.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleBackfill} disabled={backfillLoading}>
            {backfillLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Backfill...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Backfill
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Backfill result alert */}
      {backfillResult && (
        <div
          className={cn(
            'flex items-center space-x-2 p-4 rounded-md border',
            backfillResult.startsWith('Backfill failed')
              ? 'bg-destructive/10 text-destructive border-destructive/20'
              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          )}
        >
          {backfillResult.startsWith('Backfill failed') ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Zap className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{backfillResult}</span>
          <button
            onClick={() => setBackfillResult(null)}
            className="ml-auto text-xs underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          {/* Row 1: Quick date presets + date range picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Uninstall Date
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {([
                { key: 'all', label: 'All Time', from: null as Date | null, to: null as Date | null },
                { key: '7d', label: 'Last 7 days', from: daysAgo(7), to: null as Date | null },
                { key: '30d', label: 'Last 30 days', from: daysAgo(30), to: null as Date | null },
                { key: '90d', label: 'Last 90 days', from: daysAgo(90), to: null as Date | null },
              ]).map((preset) => (
                <Button
                  key={preset.key}
                  variant={activePreset === preset.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDateFrom(preset.from);
                    setDateTo(preset.to);
                    setCurrentPage(1);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
              <div className="h-6 w-px bg-border mx-1" />
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={dateFrom}
                  onChange={(dates) => {
                    const [start, end] = dates as [Date | null, Date | null];
                    setDateFrom(start);
                    setDateTo(end);
                    setCurrentPage(1);
                  }}
                  startDate={dateFrom}
                  endDate={dateTo}
                  selectsRange
                  isClearable
                  placeholderText="Select date range..."
                  dateFormat="MMM d, yyyy"
                  maxDate={new Date()}
                  className="h-9 w-64 px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  calendarClassName="shadow-lg border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Search + quick filters */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 flex-1 min-w-[200px] max-w-sm">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Shop Name
              </label>
              <input
                type="text"
                value={searchShopName}
                onChange={(e) => setSearchShopName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilter();
                }}
                placeholder="Search by shop name..."
                className="h-9 w-full px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pipeline Runs</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={minRuns}
                  onChange={(e) => setMinRuns(e.target.value)}
                  placeholder="Min"
                  min={0}
                  className="h-9 w-20 px-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">–</span>
                <input
                  type="number"
                  value={maxRuns}
                  onChange={(e) => setMaxRuns(e.target.value)}
                  placeholder="Max"
                  min={0}
                  className="h-9 w-20 px-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Errors</label>
              <div className="flex items-center gap-1">
                {(['ALL', 'WITH_ERRORS'] as const).map((value) => (
                  <Button
                    key={value}
                    variant={hadErrors === value ? 'default' : 'outline'}
                    size="sm"
                    className="h-9"
                    onClick={() => setHadErrors(value)}
                  >
                    {value === 'ALL' ? 'All' : 'With Errors'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort</label>
              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-2 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="uninstalledAt">Uninstalled</option>
                  <option value="pipelineRuns">Runs</option>
                  <option value="lastRunDate">Last Run</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  title={sortOrder === 'desc' ? 'Descending (click to change)' : 'Ascending (click to change)'}
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </Button>
              </div>
            </div>
          </div>

          {/* Row 3: Action buttons + result count */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleApplyFilter}>
                Apply Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearFilter}>
                Clear All
              </Button>
            </div>
            {pagination && (
              <span className="text-sm text-muted-foreground">
                {pagination.total} churned store{pagination.total !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center space-x-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stores.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Churned Stores Found</h3>
            <p className="text-muted-foreground">
              No stores matching the current filters have uninstalled after using the pipeline.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      {!loading && !error && stores.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop Name</TableHead>
              <TableHead>Pipeline Runs</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Uninstalled At</TableHead>
              <TableHead>Time to Uninstall</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Churn Reasons</TableHead>
              <TableHead className="w-10">{' '}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <React.Fragment key={store.shopName}>
                {/* Summary Row */}
                <TableRow onClick={() => handleRowClick(store.shopName)}>
                  <TableCell className="font-medium text-sm">
                    <a
                      href={`https://${store.shopName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {store.shopName}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{store.pipelineRuns}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(store.lastRunDate)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(store.uninstalledAt)}
                  </TableCell>
                  <TableCell className="text-xs">{store.timeToUninstall}</TableCell>
                  <TableCell>
                    <Badge variant={store.hadGeminiErrors ? 'destructive' : 'success'}>
                      {store.hadGeminiErrors ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {store.churnReasons.length > 0 ? (
                        store.churnReasons.map((r, idx) => (
                          <span key={idx}>
                            <Badge variant={getSeverityVariant(r.severity) as any} className="text-xs">
                              {formatReasonLabel(r.reason)}
                            </Badge>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {expandedShop === store.shopName ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                </TableRow>

                {/* Expanded Detail Row */}
                {expandedShop === store.shopName && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="p-0">
                      <div className="border-t bg-muted/30 p-6 space-y-6">
                        {/* Detail Loading */}
                        {detailLoading && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        )}

                        {/* Detail Error */}
                        {detailError && (
                          <div className="flex items-center space-x-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{detailError}</span>
                          </div>
                        )}

                        {/* Detail Content */}
                        {storeDetail && !detailLoading && (
                          <>
                            {/* Shop Info Panel */}
                            {storeDetail.shopSnapshot && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Shop Info</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Plan</p>
                                      <p className="font-medium">{storeDetail.shopSnapshot.plan || '--'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Currency</p>
                                      <p className="font-medium">{storeDetail.shopSnapshot.currency || '--'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Country</p>
                                      <p className="font-medium">{storeDetail.shopSnapshot.country || '--'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Installed</p>
                                      <p className="font-medium">
                                        {storeDetail.shopSnapshot.installedAt
                                          ? formatDate(storeDetail.shopSnapshot.installedAt)
                                          : '--'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Uninstalled</p>
                                      <p className="font-medium">
                                        {storeDetail.shopSnapshot.uninstalledAt
                                          ? formatDate(storeDetail.shopSnapshot.uninstalledAt)
                                          : '--'}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Timeline */}
                            {storeDetail.timeline && storeDetail.timeline.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                    {storeDetail.timeline.map((event, idx) => (
                                      <React.Fragment key={idx}>
                                        {idx > 0 && (
                                          <div className="w-8 h-px bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                                        )}
                                        <div
                                          className={cn(
                                            'flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs',
                                            event.event === 'installed' &&
                                              'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
                                            event.event === 'pipeline_run' &&
                                              'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                                            event.event === 'uninstalled' &&
                                              'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                                          )}
                                        >
                                          <span className="font-semibold capitalize">
                                            {event.event.replace(/_/g, ' ')}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {formatDate(event.date)}
                                          </span>
                                        </div>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Pipeline Runs (newest first) */}
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
                                Pipeline Runs ({storeDetail.runs.length})
                              </h3>
                              {[...storeDetail.runs]
                                .sort(
                                  (a, b) =>
                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                )
                                .map((run) => (
                                  <div key={run._id}>
                                  <Card>
                                    <CardContent className="pt-4 space-y-4">
                                      {/* Run header */}
                                      <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <Badge variant="outline">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {formatDate(run.createdAt)}
                                        </Badge>
                                        <Badge variant="secondary">
                                          {(run.totalDurationMs / 1000).toFixed(1)}s
                                        </Badge>
                                        <Badge variant="blue">{run.source}</Badge>
                                        {run.geminiError && (
                                          <Badge variant="destructive">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Error: {run.geminiErrorLLMsFailed?.join(', ') || 'Unknown'}
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Merchant text */}
                                      {run.input.merchantText && (
                                        <div>
                                          <label className="text-xs text-muted-foreground mb-1 block">
                                            Merchant Text
                                          </label>
                                          <div className="p-3 bg-background rounded border text-sm italic">
                                            &ldquo;{run.input.merchantText}&rdquo;
                                          </div>
                                        </div>
                                      )}

                                      {/* Products */}
                                      {run.input.products && run.input.products.length > 0 && (
                                        <div>
                                          <label className="text-xs text-muted-foreground mb-2 block">
                                            Products ({run.input.products.length})
                                          </label>
                                          <div className="flex flex-wrap gap-1">
                                            {run.input.products.map((p, idx) => (
                                              <span key={idx}>
                                                <Badge variant="outline" className="text-xs">
                                                  {p.title}
                                                </Badge>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Collections */}
                                      {run.input.collections && run.input.collections.length > 0 && (
                                        <div>
                                          <label className="text-xs text-muted-foreground mb-2 block">
                                            Collections ({run.input.collections.length})
                                          </label>
                                          <div className="flex flex-wrap gap-1">
                                            {run.input.collections.map((c, idx) => (
                                              <span key={idx}>
                                                <Badge variant="blue" className="text-xs">
                                                  {c.title}
                                                </Badge>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Dev mode: full JSON */}
                                      {viewMode === 'dev' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          <div className="space-y-3">
                                            <CodeBlock
                                              label="Structure LLM Output"
                                              code={run.llmOutputs?.structureOutput}
                                            />
                                            <CodeBlock
                                              label="Discount LLM Output"
                                              code={run.llmOutputs?.discountOutput}
                                            />
                                            <CodeBlock
                                              label="Rules LLM Output"
                                              code={run.llmOutputs?.rulesOutput}
                                            />
                                          </div>
                                          <div>
                                            <CodeBlock
                                              label="Assembled Result"
                                              code={run.assembledResult}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* PM mode: rich visual cards */}
                                      {viewMode === 'pm' && (
                                        <div className="space-y-6">
                                          {/* LLM Outputs */}
                                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div>
                                              <label className="text-xs text-muted-foreground mb-2 block font-medium">Structure LLM</label>
                                              <PMStructureView output={run.llmOutputs?.structureOutput} />
                                            </div>
                                            <div>
                                              <label className="text-xs text-muted-foreground mb-2 block font-medium">Discount LLM</label>
                                              <PMDiscountView output={run.llmOutputs?.discountOutput} />
                                            </div>
                                            <div>
                                              <label className="text-xs text-muted-foreground mb-2 block font-medium">Rules LLM</label>
                                              <PMRulesView output={run.llmOutputs?.rulesOutput} />
                                            </div>
                                          </div>

                                          {/* Assembled Result */}
                                          <div>
                                            <label className="text-xs text-muted-foreground mb-2 block font-medium">Assembled Bundle Config</label>
                                            {run.assembledResult?.error ? (
                                              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                                                <p className="text-red-700 dark:text-red-300 font-medium">Assembly Error:</p>
                                                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{run.assembledResult.error}</p>
                                              </div>
                                            ) : (
                                              <PMResultView config={run.assembledResult?.bundleConfig || run.assembledResult} />
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                  </div>
                                ))}
                            </div>

                            {/* Analyse button + results */}
                            <div className="space-y-3">
                              <Button
                                onClick={() => handleAnalyse(store.shopName)}
                                disabled={analysisLoading === store.shopName}
                              >
                                {analysisLoading === store.shopName ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analysing...
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Analyse Churn Reasons
                                  </>
                                )}
                              </Button>

                              {analysisResults[store.shopName] && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Analysis Results
                                  </h4>
                                  {analysisResults[store.shopName].summary && (
                                    <div className="rounded-md bg-muted/50 border px-4 py-3 text-sm text-foreground italic">
                                      {analysisResults[store.shopName].summary}
                                    </div>
                                  )}
                                  {analysisResults[store.shopName].reasons.map((reason, idx) => (
                                    <div key={idx}>
                                    <Card>
                                      <CardContent className="py-3 px-4">
                                        <div className="flex items-start gap-3">
                                          <Badge
                                            variant={getSeverityVariant(reason.severity) as any}
                                            className="mt-0.5 flex-shrink-0"
                                          >
                                            {reason.severity}
                                          </Badge>
                                          <div className="space-y-1 min-w-0">
                                            <p className="text-sm font-medium">
                                              {formatReasonLabel(reason.reason)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {reason.evidence}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">{renderPageNumbers()}</div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChurnAnalysis;
