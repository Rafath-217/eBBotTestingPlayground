import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, Download, RefreshCw, ChevronDown, ChevronUp, AlertTriangle,
  Info, Zap, Trash2, Eye, Plus, Clock, Database, ArrowUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, cn } from '../components/ui';
import { ViewMode } from '../components/Layout';
import {
  generateReport,
  getStoredReports,
  getReportById,
  deleteReport,
  StoredReport,
  StoredReportSummary,
  ReportFilters,
  ChurnReportCategory,
  ChurnReportInsight,
  ChurnPagination,
} from '../services/churnAnalysisApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChurnReportProps {
  viewMode: ViewMode;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Unsupported Features': '#ef4444',
  'Pipeline Quality Issues': '#f59e0b',
  'Input Quality Issues': '#3b82f6',
  'Error-Related': '#dc2626',
  'Behavioral Signals': '#8b5cf6',
  'Out of Scope': '#6b7280',
};

const SEVERITY_STYLES: Record<string, string> = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-950/30',
  medium: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
};

const SEVERITY_BADGE: Record<string, 'destructive' | 'warning' | 'blue'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'blue',
};

const TIME_BUCKET_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'];

const EFFORT_BADGE: Record<string, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function toISODateString(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10);
}

const ChurnReportView: React.FC<ChurnReportProps> = ({ viewMode }) => {
  // ── Reports list state ──
  const [reports, setReports] = useState<StoredReportSummary[]>([]);
  const [pagination, setPagination] = useState<ChurnPagination | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ── Generate report state ──
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [shopNamesInput, setShopNamesInput] = useState('');
  const [minRuns, setMinRuns] = useState('');
  const [maxRuns, setMaxRuns] = useState('');
  const [hadErrors, setHadErrors] = useState<'all' | 'errors'>('all');
  const [generating, setGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // ── Expanded report state ──
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<StoredReport | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // ── Polling state ──
  const pollingRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // ── Fetch reports list ──
  const fetchReports = useCallback(async (page = 1) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await getStoredReports({ page, limit: 10 });
      setReports(res.data.reports);
      setPagination(res.data.pagination);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ── Auto-polling for generating reports ──
  useEffect(() => {
    const generatingReports = reports.filter((r) => r.status === 'generating');

    // Clear polls for reports no longer generating
    pollingRefs.current.forEach((interval, id) => {
      if (!generatingReports.find((r) => r._id === id)) {
        clearInterval(interval);
        pollingRefs.current.delete(id);
      }
    });

    // Start polls for newly generating reports
    generatingReports.forEach((report) => {
      if (!pollingRefs.current.has(report._id)) {
        const interval = setInterval(async () => {
          try {
            const res = await getReportById(report._id);
            if (res.data.status !== 'generating') {
              clearInterval(interval);
              pollingRefs.current.delete(report._id);
              fetchReports(pagination?.page || 1);
              // If this report is expanded, update it
              if (expandedReportId === report._id) {
                setExpandedReport(res.data);
              }
            }
          } catch {
            // Ignore poll errors
          }
        }, 3000);
        pollingRefs.current.set(report._id, interval);
      }
    });

    return () => {
      pollingRefs.current.forEach((interval) => clearInterval(interval));
    };
  }, [reports, fetchReports, pagination?.page, expandedReportId]);

  // ── Generate report handler ──
  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);
    try {
      const filters: ReportFilters = {};
      if (dateFrom) filters.dateFrom = toISODateString(dateFrom);
      if (dateTo) filters.dateTo = toISODateString(dateTo);
      if (shopNamesInput.trim()) {
        filters.shopNames = shopNamesInput.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (minRuns) filters.minRuns = parseInt(minRuns, 10);
      if (maxRuns) filters.maxRuns = parseInt(maxRuns, 10);
      if (hadErrors === 'errors') filters.hadErrors = true;

      const res = await generateReport(filters);
      setGenerateSuccess(res.data.reportId);
      // Auto-refresh list
      setTimeout(() => fetchReports(), 500);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // ── Auto-expand first completed report on load ──
  const autoExpandedRef = useRef(false);
  useEffect(() => {
    if (autoExpandedRef.current || reports.length === 0) return;
    const firstCompleted = reports.find((r) => r.status === 'completed');
    if (firstCompleted && !expandedReportId) {
      autoExpandedRef.current = true;
      handleExpandInternal(firstCompleted._id);
    }
  }, [reports]);

  // ── Expand/collapse report ──
  const handleExpandInternal = async (id: string) => {
    setExpandedReportId(id);
    setExpandedLoading(true);
    setExpandedReport(null);
    setExpandedCategories(new Set());
    try {
      const res = await getReportById(id);
      setExpandedReport(res.data);
    } catch {
      setExpandedReport(null);
    } finally {
      setExpandedLoading(false);
    }
  };

  const handleExpand = async (id: string) => {
    if (expandedReportId === id) {
      setExpandedReportId(null);
      setExpandedReport(null);
      return;
    }
    handleExpandInternal(id);
  };

  // ── Delete report ──
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteReport(id);
      if (expandedReportId === id) {
        setExpandedReportId(null);
        setExpandedReport(null);
      }
      fetchReports(pagination?.page || 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  // ── Download report JSON ──
  const handleDownload = (report: StoredReport | StoredReportSummary, full = false) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churn-report-${report._id.slice(-6)}-${new Date(report.createdAt).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Churn Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and view stored churn analysis reports
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchReports(pagination?.page || 1)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* ══════ Section A: Generate Report Panel ══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Uninstall Date From
              </label>
              <DatePicker
                selected={dateFrom}
                onChange={(date: Date | null) => setDateFrom(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Start date"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                isClearable
              />
            </div>
            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Uninstall Date To
              </label>
              <DatePicker
                selected={dateTo}
                onChange={(date: Date | null) => setDateTo(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="End date"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                isClearable
              />
            </div>
            {/* Shop Names */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Shop Names (comma-separated)
              </label>
              <input
                type="text"
                value={shopNamesInput}
                onChange={(e) => setShopNamesInput(e.target.value)}
                placeholder="shop1.myshopify.com, shop2..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            {/* Min Runs */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Min Pipeline Runs
              </label>
              <input
                type="number"
                value={minRuns}
                onChange={(e) => setMinRuns(e.target.value)}
                placeholder="e.g. 1"
                min={0}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            {/* Max Runs */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Max Pipeline Runs
              </label>
              <input
                type="number"
                value={maxRuns}
                onChange={(e) => setMaxRuns(e.target.value)}
                placeholder="e.g. 10"
                min={0}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            {/* Had Errors Toggle */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Error Filter
              </label>
              <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                <button
                  onClick={() => setHadErrors('all')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                    hadErrors === 'all'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setHadErrors('errors')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                    hadErrors === 'errors'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  With Errors Only
                </button>
              </div>
            </div>
          </div>

          {/* Generate button + feedback */}
          <div className="mt-6 flex items-center gap-4">
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            {generateSuccess && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Report queued! ID: <code className="font-mono text-xs">{generateSuccess}</code>
              </span>
            )}
            {generateError && (
              <span className="text-sm text-red-600 dark:text-red-400">
                {generateError}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ══════ Section B: Reports List ══════ */}
      {listLoading && reports.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : listError ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <p className="text-muted-foreground">{listError}</p>
          <Button variant="outline" onClick={() => fetchReports()}>
            Retry
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <Info className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">No reports generated yet.</p>
          <ArrowUp className="w-6 h-6 text-muted-foreground animate-bounce" />
          <p className="text-xs text-muted-foreground">Use the panel above to generate your first report</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              isExpanded={expandedReportId === report._id}
              expandedReport={expandedReportId === report._id ? expandedReport : null}
              expandedLoading={expandedReportId === report._id && expandedLoading}
              expandedCategories={expandedCategories}
              onToggleExpand={() => handleExpand(report._id)}
              onDelete={() => handleDelete(report._id)}
              onDownload={() => {
                if (expandedReportId === report._id && expandedReport) {
                  handleDownload(expandedReport, true);
                } else {
                  handleDownload(report);
                }
              }}
              onToggleCategory={toggleCategory}
            />
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchReports(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchReports(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════

const StatusBadgeReport: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'generating') {
    return (
      <Badge variant="blue" className="gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Generating
      </Badge>
    );
  }
  if (status === 'completed') {
    return <Badge variant="success">Completed</Badge>;
  }
  return <Badge variant="destructive">Failed</Badge>;
};

interface ReportCardProps {
  report: StoredReportSummary;
  isExpanded: boolean;
  expandedReport: StoredReport | null;
  expandedLoading: boolean;
  expandedCategories: Set<string>;
  onToggleExpand: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onToggleCategory: (category: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isExpanded,
  expandedReport,
  expandedLoading,
  expandedCategories,
  onToggleExpand,
  onDelete,
  onDownload,
  onToggleCategory,
}) => {
  const isGenerating = report.status === 'generating';

  return (
    <Card
      className={cn(
        'transition-all',
        isGenerating && 'animate-pulse border-blue-300 dark:border-blue-700'
      )}
    >
      {/* Header row */}
      <div className="p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadgeReport status={report.status} />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(report.createdAt)}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            {report.storesAnalyzed} stores
          </span>
          {report.generationDurationMs > 0 && (
            <span className="text-xs text-muted-foreground">
              ({formatDuration(report.generationDurationMs)})
            </span>
          )}
          {report.totalLogsAnalyzed > 0 && (
            <span className="text-xs text-muted-foreground">
              {report.totalLogsAnalyzed} logs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {report.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={onToggleExpand}>
              <Eye className="w-4 h-4 mr-1" />
              {isExpanded ? 'Collapse' : 'View Full Report'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 pb-4">
        {isGenerating ? (
          <p className="text-sm text-muted-foreground italic flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating report...
          </p>
        ) : report.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{report.error}</p>
        ) : report.summary ? (
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{report.summary}</p>
        ) : null}

        {/* Filter tags */}
        {report.filters && Object.keys(report.filters).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {report.filters.dateFrom && (
              <Badge variant="secondary" className="text-xs">From: {report.filters.dateFrom}</Badge>
            )}
            {report.filters.dateTo && (
              <Badge variant="secondary" className="text-xs">To: {report.filters.dateTo}</Badge>
            )}
            {report.filters.shopNames && report.filters.shopNames.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Shops: {report.filters.shopNames.length}
              </Badge>
            )}
            {report.filters.minRuns !== undefined && (
              <Badge variant="secondary" className="text-xs">Min runs: {report.filters.minRuns}</Badge>
            )}
            {report.filters.maxRuns !== undefined && (
              <Badge variant="secondary" className="text-xs">Max runs: {report.filters.maxRuns}</Badge>
            )}
            {report.filters.hadErrors && (
              <Badge variant="warning" className="text-xs">Errors only</Badge>
            )}
          </div>
        )}
      </div>

      {/* Expanded full report */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          {expandedLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : expandedReport ? (
            <ExpandedReportView
              report={expandedReport}
              expandedCategories={expandedCategories}
              onToggleCategory={onToggleCategory}
              onDownload={() => {
                const blob = new Blob([JSON.stringify(expandedReport, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `churn-report-full-${expandedReport._id.slice(-6)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground">Failed to load full report.</div>
          )}
        </div>
      )}
    </Card>
  );
};

// ── Expanded Report View ──

interface ExpandedReportViewProps {
  report: StoredReport;
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onDownload: () => void;
}

const ExpandedReportView: React.FC<ExpandedReportViewProps> = ({
  report,
  expandedCategories,
  onToggleCategory,
  onDownload,
}) => {
  const det = report.deterministicAnalysis;
  const llm = report.llmAnalysis;
  const executiveSummary = det?.executiveSummary;
  const reasonsBreakdown = det?.reasonsBreakdown || [];
  const timeDistribution = det?.timeDistribution || [];

  return (
    <div className="p-6 space-y-8">
      {/* 1. Executive Summary */}
      {executiveSummary && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Executive Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard label="Churned Stores" value={executiveSummary.totalChurnedStores} />
            <MetricCard label="Total Pipeline Runs" value={executiveSummary.totalPipelineRuns} />
            <MetricCard label="Avg Runs / Store" value={executiveSummary.avgPipelineRunsPerStore} />
            <MetricCard label="Avg Time to Uninstall" value={executiveSummary.avgTimeToUninstall} />
            <MetricCard
              label="Error Rate"
              value={`${executiveSummary.errorRate}%`}
              highlight={executiveSummary.errorRate > 20}
            />
          </div>
        </div>
      )}

      {/* 2. LLM Summary */}
      {report.summary && (
        <Card className="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Summary
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {report.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 3. LLM Patterns */}
      {llm?.patterns && llm.patterns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Cross-Store Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {llm.patterns.map((pattern: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
                    {pattern.title || pattern.name || `Pattern ${idx + 1}`}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {pattern.description || pattern.detail || JSON.stringify(pattern)}
                  </p>
                  {pattern.affectedStores !== undefined && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {pattern.affectedStores} stores affected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. Churn Reasons Breakdown */}
      {reasonsBreakdown.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Churn Reasons by Category</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reasonsBreakdown.filter((c: any) => c.storesAffected > 0)}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis type="number" className="text-xs" tick={{ fill: 'currentColor' }} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={160}
                      className="text-xs"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card, #fff)',
                        border: '1px solid var(--color-border, #e2e8f0)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, _name: string, props: any) => [
                        `${value} stores (${props.payload.percentage}%)`,
                        'Affected',
                      ]}
                    />
                    <Bar dataKey="storesAffected" radius={[0, 4, 4, 0]}>
                      {reasonsBreakdown
                        .filter((c: any) => c.storesAffected > 0)
                        .map((entry: any, index: number) => (
                          <Cell
                            key={index}
                            fill={CATEGORY_COLORS[entry.category] || '#6b7280'}
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expandable category details */}
          <div className="mt-4 space-y-3">
            {reasonsBreakdown
              .filter((c: any) => c.storesAffected > 0)
              .map((cat: any) => (
                <CategoryCard
                  key={cat.category}
                  category={cat}
                  totalStores={executiveSummary?.totalChurnedStores || report.storesAnalyzed}
                  expanded={expandedCategories.has(cat.category)}
                  onToggle={() => onToggleCategory(cat.category)}
                />
              ))}
          </div>
        </div>
      )}

      {/* 5. Time Distribution */}
      {timeDistribution.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Time-to-Uninstall Distribution</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeDistribution} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'currentColor', fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card, #fff)',
                        border: '1px solid var(--color-border, #e2e8f0)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} stores`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {timeDistribution.map((_entry: any, index: number) => (
                        <Cell key={index} fill={TIME_BUCKET_COLORS[index] || '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. LLM Recommendations */}
      {llm?.recommendations && llm.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Recommendations</h3>
          <div className="space-y-3">
            {llm.recommendations.map((rec: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {rec.title || rec.recommendation || JSON.stringify(rec)}
                      </p>
                      {rec.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{rec.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {rec.priority && (
                          <Badge variant={SEVERITY_BADGE[rec.priority] || 'secondary'} className="text-xs">
                            Priority: {rec.priority}
                          </Badge>
                        )}
                        {rec.effort && (
                          <Badge variant={EFFORT_BADGE[rec.effort] || 'secondary'} className="text-xs">
                            Effort: {rec.effort}
                          </Badge>
                        )}
                        {rec.impact && (
                          <Badge variant="blue" className="text-xs">
                            Impact: {rec.impact}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 7. Actionable Insights (merged deterministic + LLM) */}
      {((report.actionableInsights && report.actionableInsights.length > 0) ||
        (llm?.insights && llm.insights.length > 0)) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Actionable Insights</h3>
          <div className="space-y-3">
            {/* Deterministic insights */}
            {report.actionableInsights?.map((insight: any, idx: number) => (
              <InsightCard
                key={`det-${idx}`}
                insight={insight}
                index={idx + 1}
                source="deterministic"
              />
            ))}
            {/* LLM insights */}
            {llm?.insights?.map((insight: any, idx: number) => (
              <InsightCard
                key={`llm-${idx}`}
                insight={insight}
                index={(report.actionableInsights?.length || 0) + idx + 1}
                source="llm"
              />
            ))}
          </div>
        </div>
      )}

      {/* 8. Download full report */}
      <div className="flex justify-end pt-4">
        <Button onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download Full Report JSON
        </Button>
      </div>
    </div>
  );
};

// ── Metric Card ──
const MetricCard: React.FC<{ label: string; value: string | number; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-2xl font-bold mt-1',
          highlight
            ? 'text-red-600 dark:text-red-400'
            : 'text-slate-900 dark:text-slate-100'
        )}
      >
        {value}
      </p>
    </CardContent>
  </Card>
);

// ── Category Card ──
const CategoryCard: React.FC<{
  category: any;
  totalStores: number;
  expanded: boolean;
  onToggle: () => void;
}> = ({ category, totalStores, expanded, onToggle }) => (
  <Card>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: CATEGORY_COLORS[category.category] || '#6b7280' }}
        />
        <div>
          <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
            {category.category}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {category.storesAffected} stores ({category.percentage}%)
          </span>
        </div>
      </div>
      {expanded ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
    {expanded && category.topReasons && category.topReasons.length > 0 && (
      <div className="px-4 pb-4 pt-0">
        <div className="border-t pt-3 space-y-2">
          {category.topReasons.map((r: any) => (
            <div key={r.reason} className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {r.reason.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">{r.storeCount} stores</span>
                <Badge variant="secondary" className="text-xs">
                  {r.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
);

// ── Insight Card ──
const InsightCard: React.FC<{ insight: any; index: number; source?: string }> = ({
  insight,
  index,
  source,
}) => (
  <div
    className={cn(
      'border-l-4 rounded-lg p-4',
      SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.low
    )}
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
        {index}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={SEVERITY_BADGE[insight.severity] || 'blue'} className="text-xs">
            {insight.severity}
          </Badge>
          {source && (
            <Badge
              variant={source === 'llm' ? 'purple' : 'secondary'}
              className="text-xs"
            >
              {source === 'llm' ? 'AI' : 'Data'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {insight.insight || insight.description || JSON.stringify(insight)}
        </p>
      </div>
    </div>
  </div>
);

export default ChurnReportView;
