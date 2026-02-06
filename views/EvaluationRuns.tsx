import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  CategoryBadge,
  CodeBlock,
  cn,
} from '../components/ui';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  RefreshCw,
  GitCompare,
  CheckCircle,
  X,
  Info,
  AlertCircle,
  Inbox,
  Tag,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { EvaluationRun, EvaluationRunDetail, EvaluationResult, PromptVersionStats } from '../types';
import { triggerEvaluation, getEvaluationRuns, getEvaluationRun, getPromptVersionStats } from '../services/evaluationApi';

interface Props {
  viewMode: 'pm' | 'dev';
  onCompare: (runs: [string, string]) => void;
}

// Helper to get accuracy color class
const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (accuracy >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate run ID for display
const truncateId = (id: string, length: number = 8): string => {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}...`;
};

// Category filter dropdown
const CategoryFilter = ({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (val: string) => void;
  categories: string[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-9 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat} value={cat}>
        {cat.replace(/_/g, ' ')}
      </option>
    ))}
  </select>
);

// Delta indicator component
const DeltaIndicator = ({ current, previous }: { current: number; previous?: number }) => {
  if (previous === undefined) return <span className="text-slate-400">-</span>;

  const delta = current - previous;
  if (delta === 0) {
    return (
      <span className="inline-flex items-center text-slate-500">
        <Minus className="w-3 h-3 mr-1" />
        0%
      </span>
    );
  }

  if (delta > 0) {
    return (
      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
        <ArrowUp className="w-3 h-3 mr-1" />
        +{delta.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-red-600 dark:text-red-400">
      <ArrowDown className="w-3 h-3 mr-1" />
      {delta.toFixed(1)}%
    </span>
  );
};

// --- RunDetailPanel: inline detail view when expanding a run ---
const RunDetailPanel = ({
  detail,
  viewMode,
}: {
  detail: EvaluationRunDetail;
  viewMode: 'pm' | 'dev';
}) => {
  const [statusFilter, setStatusFilter] = React.useState<'FAIL' | 'PARTIAL' | 'ALL'>('FAIL');
  const [expandedTestCase, setExpandedTestCase] = React.useState<number | null>(null);
  const [showAll, setShowAll] = React.useState(false);
  const [showJson, setShowJson] = React.useState(false);

  const results = detail.results || [];

  // Extract prompt versions from first result's actual outputs
  const firstResult = results[0];
  const runPromptVersions = React.useMemo(() => {
    if (!firstResult) return null;
    const sv = (firstResult.structureResult as any)?.actual?._promptVersion;
    const dv = (firstResult.discountResult as any)?.actual?._promptVersion;
    const rv = (firstResult.rulesResult as any)?.actual?._promptVersion;
    return (sv || dv || rv) ? { structure: sv, discount: dv, rules: rv } : null;
  }, [firstResult]);

  // Per-LLM accuracy
  const structureAcc = results.length > 0
    ? (results.filter(r => r.structureResult?.match).length / results.length * 100)
    : 0;
  const discountAcc = results.length > 0
    ? (results.filter(r => r.discountResult?.match).length / results.length * 100)
    : 0;
  const rulesAcc = results.length > 0
    ? (results.filter(r => r.rulesResult?.match).length / results.length * 100)
    : 0;

  // Filter results
  const filteredResults = React.useMemo(() => {
    let filtered = results;
    if (statusFilter === 'FAIL') {
      filtered = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    } else if (statusFilter === 'PARTIAL') {
      filtered = results.filter(r => r.status === 'PARTIAL');
    }
    // Sort failures first
    return [...filtered].sort((a, b) => {
      const order = { ERROR: 0, FAIL: 1, PARTIAL: 2, PASS: 3 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });
  }, [results, statusFilter]);

  const visibleResults = showAll ? filteredResults : filteredResults.slice(0, 20);

  const failCount = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length;
  const partialCount = results.filter(r => r.status === 'PARTIAL').length;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-4">
      {/* Per-LLM accuracy badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-500 uppercase font-medium">Per-LLM Accuracy:</span>
        <Badge variant={structureAcc >= 90 ? 'success' : structureAcc >= 70 ? 'warning' : 'destructive'}>
          Structure {structureAcc.toFixed(0)}%{runPromptVersions?.structure ? ` (v${runPromptVersions.structure})` : ''}
        </Badge>
        <Badge variant={discountAcc >= 90 ? 'success' : discountAcc >= 70 ? 'warning' : 'destructive'}>
          Discount {discountAcc.toFixed(0)}%{runPromptVersions?.discount ? ` (v${runPromptVersions.discount})` : ''}
        </Badge>
        <Badge variant={rulesAcc >= 90 ? 'success' : rulesAcc >= 70 ? 'warning' : 'destructive'}>
          Rules {rulesAcc.toFixed(0)}%{runPromptVersions?.rules ? ` (v${runPromptVersions.rules})` : ''}
        </Badge>
        <span className="ml-auto text-xs text-slate-500">{results.length} test cases</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1">
        {([
          { key: 'FAIL' as const, label: `Failed (${failCount})`, active: statusFilter === 'FAIL' },
          { key: 'PARTIAL' as const, label: `Partial (${partialCount})`, active: statusFilter === 'PARTIAL' },
          { key: 'ALL' as const, label: `All (${results.length})`, active: statusFilter === 'ALL' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setShowAll(false); }}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              tab.active
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
        {viewMode === 'dev' && (
          <button
            onClick={() => setShowJson(!showJson)}
            className={cn(
              'ml-auto px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              showJson
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            JSON
          </button>
        )}
      </div>

      {/* Test case results */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-6 text-sm text-slate-500">
          No {statusFilter === 'FAIL' ? 'failed' : statusFilter === 'PARTIAL' ? 'partial' : ''} results
        </div>
      ) : showJson ? (
        <CodeBlock code={filteredResults} label="Results JSON" />
      ) : (
        <div className="max-h-[400px] overflow-auto rounded-md border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-24">Category</TableHead>
                <TableHead className="w-12">Struct</TableHead>
                <TableHead className="w-12">Disc</TableHead>
                <TableHead className="w-12">Rules</TableHead>
                <TableHead>Input</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleResults.map((r) => {
                const isExpanded = expandedTestCase === r.testCaseId;
                return (
                  <React.Fragment key={r.testCaseId}>
                    <TableRow
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      onClick={() => setExpandedTestCase(isExpanded ? null : r.testCaseId)}
                    >
                      <TableCell className="font-mono text-xs">{r.testCaseId}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === 'PASS' ? 'success' :
                            r.status === 'PARTIAL' ? 'warning' :
                            'destructive'
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={r.category} minimal />
                      </TableCell>
                      <TableCell>
                        <div className={cn('w-3 h-3 rounded-full', r.structureResult?.match ? 'bg-emerald-500' : 'bg-red-500')} />
                      </TableCell>
                      <TableCell>
                        <div className={cn('w-3 h-3 rounded-full', r.discountResult?.match ? 'bg-emerald-500' : 'bg-red-500')} />
                      </TableCell>
                      <TableCell>
                        <div className={cn('w-3 h-3 rounded-full', r.rulesResult?.match ? 'bg-emerald-500' : 'bg-red-500')} />
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[250px] text-slate-600 dark:text-slate-400">
                        {r.text}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-white dark:bg-slate-900 p-4">
                          <div className="space-y-3">
                            {(['structure', 'discount', 'rules'] as const).map(llm => {
                              const key = `${llm}Result` as keyof EvaluationResult;
                              const result = r[key] as any;
                              if (!result) return null;
                              return (
                                <div key={llm} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={cn('w-2.5 h-2.5 rounded-full', result.match ? 'bg-emerald-500' : 'bg-red-500')} />
                                    <span className="text-sm font-medium capitalize">{llm}</span>
                                    <span className={cn('text-xs', result.match ? 'text-emerald-600' : 'text-red-600')}>
                                      {result.match ? 'Match' : 'Mismatch'}
                                    </span>
                                  </div>
                                  {result.details && (
                                    <p className="text-xs text-slate-500 mb-2">{result.details}</p>
                                  )}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <div className="text-[10px] uppercase text-slate-500 mb-1">Expected</div>
                                      <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                                        {typeof result.expected === 'object' ? JSON.stringify(result.expected, null, 2) : String(result.expected ?? '-')}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className="text-[10px] uppercase text-slate-500 mb-1">Actual</div>
                                      <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                                        {typeof result.actual === 'object' ? JSON.stringify(result.actual, null, 2) : String(result.actual ?? '-')}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Show all button */}
      {!showAll && filteredResults.length > 20 && !showJson && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
            Show all {filteredResults.length} results
          </Button>
        </div>
      )}
    </div>
  );
};

// Run card for PM mode
const RunCard = ({
  run,
  runLabel,
  previousRun,
  isSelected,
  selectionDisabled,
  onSelect,
  isExpanded,
  onToggleExpand,
  detailLoading,
  expandedDetail,
  viewMode,
}: {
  run: EvaluationRun;
  runLabel: string;
  previousRun?: EvaluationRun;
  isSelected: boolean;
  selectionDisabled: boolean;
  onSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  detailLoading: boolean;
  expandedDetail: EvaluationRunDetail | null;
  viewMode: 'pm' | 'dev';
}) => {
  const accuracy = run.summary.overall.accuracy;

  return (
    <>
      <Card className={cn('transition-all', isSelected && 'ring-2 ring-blue-500')}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100" title={run.runId}>
                  {runLabel}
                </span>
                {run.category && <CategoryBadge category={run.category} minimal />}
              </div>
              <div className="text-xs text-slate-500">{formatDate(run.startedAt)}</div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                disabled={selectionDisabled && !isSelected}
                title={selectionDisabled && !isSelected ? 'Unselect a run first (max 2)' : undefined}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-xs text-slate-500">Compare</span>
            </label>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={cn('text-3xl font-bold', getAccuracyColor(accuracy))}>
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Accuracy</div>
            </div>
            <DeltaIndicator current={accuracy} previous={previousRun?.summary.overall.accuracy} />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {run.summary.overall.passed}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Passed</div>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {run.summary.overall.failed}
              </div>
              <div className="text-[10px] text-red-600 dark:text-red-400 uppercase">Failed</div>
            </div>
            <div className="text-center p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                {run.summary.overall.partial}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase">Partial</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span>{run.testCasesCount} test cases</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={onToggleExpand}
            disabled={detailLoading}
          >
            {detailLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {detailLoading ? 'Loading...' : isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
        </CardContent>
      </Card>
      {/* Inline detail panel (spans full grid width) */}
      {isExpanded && expandedDetail && (
        <div className="col-span-full">
          <Card>
            <RunDetailPanel detail={expandedDetail} viewMode={viewMode} />
          </Card>
        </div>
      )}
    </>
  );
};

const EvaluationRuns: React.FC<Props> = ({ viewMode, onCompare }) => {
  const [runs, setRuns] = React.useState<EvaluationRun[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [triggering, setTriggering] = React.useState(false);
  const [triggerSuccess, setTriggerSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [selectedRuns, setSelectedRuns] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);

  // Inline detail expand
  const [expandedRunId, setExpandedRunId] = React.useState<string | null>(null);
  const [expandedRunDetail, setExpandedRunDetail] = React.useState<EvaluationRunDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // Prompt versions
  const [promptVersions, setPromptVersions] = React.useState<PromptVersionStats | null>(null);

  const itemsPerPage = viewMode === 'pm' ? 6 : 10;

  // Fetch runs and prompt versions on mount
  React.useEffect(() => {
    fetchRuns();
    getPromptVersionStats().then(setPromptVersions).catch(() => {});
  }, []);

  // Auto-dismiss success banner
  React.useEffect(() => {
    if (triggerSuccess) {
      const timer = setTimeout(() => setTriggerSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [triggerSuccess]);

  const fetchRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluationRuns();
      setRuns(data.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch runs');
    } finally {
      setLoading(false);
    }
  };

  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleTriggerRun = async () => {
    setShowConfirm(false);
    setTriggering(true);
    setError(null);
    try {
      await triggerEvaluation({ category: categoryFilter || undefined });
      setTriggerSuccess(true);
      await fetchRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger run');
    } finally {
      setTriggering(false);
    }
  };

  const toggleRunSelection = (runId: string) => {
    setSelectedRuns((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) {
        next.delete(runId);
      } else if (next.size < 2) {
        next.add(runId);
      }
      return next;
    });
  };

  const handleCompareSelected = () => {
    const [runId1, runId2] = Array.from(selectedRuns);
    if (runId1 && runId2 && onCompare) {
      onCompare([runId1, runId2]);
    }
  };

  const handleToggleExpand = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      setExpandedRunDetail(null);
      return;
    }
    setExpandedRunId(runId);
    setDetailLoading(true);
    try {
      const detail = await getEvaluationRun(runId);
      setExpandedRunDetail(detail);
    } catch {
      setError('Failed to load run details');
      setExpandedRunId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter runs by category
  const filteredRuns = categoryFilter
    ? runs.filter((r) => r.category === categoryFilter)
    : runs;

  // Pagination
  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage);
  const paginatedRuns = filteredRuns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate summary stats
  const totalRunsCount = runs.length;
  const latestAccuracy = runs[0]?.summary.overall.accuracy ?? 0;
  const previousAccuracy = runs[1]?.summary.overall.accuracy;
  const accuracyDelta = previousAccuracy !== undefined ? latestAccuracy - previousAccuracy : null;
  const bestAccuracy = runs.length > 0
    ? Math.max(...runs.map(r => r.summary.overall.accuracy))
    : 0;

  // Sparkline data: accuracy trend over last 10 runs (reversed so oldest is first)
  const trendData = React.useMemo(() => {
    return [...runs]
      .slice(0, 10)
      .reverse()
      .map((r, i) => ({
        index: i,
        accuracy: r.summary.overall.accuracy,
      }));
  }, [runs]);

  // Get unique categories for filter
  const categories = [...new Set(runs.map((r) => r.category).filter(Boolean))] as string[];

  // Get previous run for delta comparison
  const getPreviousRun = (index: number): EvaluationRun | undefined => {
    const currentRunIndex = filteredRuns.findIndex(
      (r) => r.runId === paginatedRuns[index]?.runId
    );
    return filteredRuns[currentRunIndex + 1];
  };

  // Human-readable run label: "Run #N" (N counts from total, newest = highest)
  const getRunLabel = (runId: string): string => {
    const globalIndex = runs.findIndex(r => r.runId === runId);
    const runNumber = runs.length - globalIndex;
    return `Run #${runNumber}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Evaluation Runs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and compare LLM evaluation results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CategoryFilter
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
            categories={categories}
          />
          <Button onClick={() => setShowConfirm(true)} disabled={triggering}>
            {triggering ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {triggering ? 'Running Evaluation...' : 'Trigger New Run'}
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Trigger Evaluation Run?
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    This will run all test cases through the LLM pipeline{categoryFilter ? ` for category "${categoryFilter.replace(/_/g, ' ')}"` : ''}. This may take a few minutes.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleTriggerRun}>
                  <Play className="w-4 h-4 mr-1" />
                  Run Evaluation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success banner */}
      {triggerSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-emerald-700 dark:text-emerald-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Evaluation triggered successfully! Results are refreshed below.</span>
          <button onClick={() => setTriggerSuccess(false)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Empty state */}
      {runs.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No evaluation runs yet
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                Run your first evaluation to see how your LLM pipeline performs across test cases.
                Results will appear here with accuracy trends and detailed breakdowns.
              </p>
              <Button onClick={() => setShowConfirm(true)} disabled={triggering} className="gap-2">
                {triggering ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {triggering ? 'Running Evaluation...' : 'Trigger First Run'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalRunsCount}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Runs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className={cn('text-3xl font-bold', getAccuracyColor(latestAccuracy))}>
                  {latestAccuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Latest Accuracy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                {accuracyDelta !== null ? (
                  <>
                    <div className={cn('text-3xl font-bold', accuracyDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : accuracyDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400')}>
                      {accuracyDelta > 0 ? '+' : ''}{accuracyDelta.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">vs Previous Run</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-slate-400">-</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">vs Previous Run</div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className={cn('text-3xl font-bold', getAccuracyColor(bestAccuracy))}>
                  {bestAccuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Best Accuracy</div>
              </CardContent>
            </Card>
            {/* Accuracy trend sparkline */}
            <Card>
              <CardContent className="p-6">
                {trendData.length > 1 ? (
                  <>
                    <div className="h-10 mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <RechartsTooltip
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Accuracy Trend</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {runs[0]?.testCasesCount ?? '-'}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Test Cases</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current prompt versions */}
          {promptVersions?.currentVersions && (
            <div className="flex flex-wrap items-center gap-3 px-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Prompt Versions:</span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                Structure v{promptVersions.currentVersions.structure}
              </span>
              <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                Discount v{promptVersions.currentVersions.discount}
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                Rules v{promptVersions.currentVersions.rules}
              </span>
            </div>
          )}

          {/* Compare guidance */}
          {selectedRuns.size === 1 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0" />
              <span className="text-sm">Select one more run to compare</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-blue-600 dark:text-blue-400 h-7 px-2"
                onClick={() => setSelectedRuns(new Set())}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Compare Button */}
          {selectedRuns.size === 2 && (
            <div className="flex justify-center">
              <Button onClick={handleCompareSelected} className="gap-2">
                <GitCompare className="w-4 h-4" />
                Compare Selected Runs
              </Button>
            </div>
          )}

          {/* Runs List/Cards */}
          {viewMode === 'pm' ? (
            // PM Mode: Visual Cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRuns.map((run, index) => (
                <RunCard
                  key={run.runId}
                  run={run}
                  runLabel={getRunLabel(run.runId)}
                  previousRun={getPreviousRun(index)}
                  isSelected={selectedRuns.has(run.runId)}
                  selectionDisabled={selectedRuns.size >= 2}
                  onSelect={() => toggleRunSelection(run.runId)}
                  isExpanded={expandedRunId === run.runId}
                  onToggleExpand={() => handleToggleExpand(run.runId)}
                  detailLoading={detailLoading && expandedRunId === run.runId}
                  expandedDetail={expandedRunId === run.runId ? expandedRunDetail : null}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            // Dev Mode: Table with more details
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <span className="sr-only">Compare</span>
                      </TableHead>
                      <TableHead>Run</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Test Cases</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Partial</TableHead>
                      <TableHead>vs Previous</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRuns.map((run, index) => {
                      const previousRun = getPreviousRun(index);
                      const accuracy = run.summary.overall.accuracy;
                      const isExpanded = expandedRunId === run.runId;

                      return (
                        <React.Fragment key={run.runId}>
                          <TableRow>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedRuns.has(run.runId)}
                                onChange={() => toggleRunSelection(run.runId)}
                                disabled={!selectedRuns.has(run.runId) && selectedRuns.size >= 2}
                                title={!selectedRuns.has(run.runId) && selectedRuns.size >= 2 ? 'Unselect a run first (max 2)' : undefined}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                            </TableCell>
                            <TableCell className="text-sm font-medium" title={run.runId}>{getRunLabel(run.runId)}</TableCell>
                            <TableCell className="text-sm">{formatDate(run.startedAt)}</TableCell>
                            <TableCell>
                              {run.category ? (
                                <CategoryBadge category={run.category} minimal />
                              ) : (
                                <span className="text-slate-400">All</span>
                              )}
                            </TableCell>
                            <TableCell>{run.testCasesCount}</TableCell>
                            <TableCell>
                              <span className={cn('font-semibold', getAccuracyColor(accuracy))}>
                                {accuracy.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-emerald-600 dark:text-emerald-400">
                              {run.summary.overall.passed}
                            </TableCell>
                            <TableCell className="text-red-600 dark:text-red-400">
                              {run.summary.overall.failed}
                            </TableCell>
                            <TableCell className="text-amber-600 dark:text-amber-400">
                              {run.summary.overall.partial || 0}
                            </TableCell>
                            <TableCell>
                              <DeltaIndicator
                                current={accuracy}
                                previous={previousRun?.summary.overall.accuracy}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleExpand(run.runId)}
                                disabled={detailLoading && expandedRunId === run.runId}
                                className="gap-1"
                              >
                                {detailLoading && expandedRunId === run.runId ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                                {isExpanded ? 'Hide' : 'Details'}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && expandedRunDetail && (
                            <TableRow>
                              <TableCell colSpan={11} className="p-0">
                                <RunDetailPanel detail={expandedRunDetail} viewMode={viewMode} />
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredRuns.length)} of {filteredRuns.length} runs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EvaluationRuns;
