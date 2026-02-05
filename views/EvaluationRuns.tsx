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
import { Play, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus, Filter, RefreshCw, GitCompare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EvaluationRun } from '../types';
import { triggerEvaluation, getEvaluationRuns } from '../services/evaluationApi';

interface Props {
  viewMode: 'pm' | 'dev';
  onCompare: (runs: [string, string]) => void;
  onViewRunDetails?: (runId: string) => void;
}

// Helper to get accuracy color class
const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (accuracy >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getAccuracyBgColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'bg-emerald-500';
  if (accuracy >= 70) return 'bg-amber-500';
  return 'bg-red-500';
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

// Run card for PM mode
const RunCard = ({
  run,
  previousRun,
  isSelected,
  onSelect,
  onViewDetails,
}: {
  run: EvaluationRun;
  previousRun?: EvaluationRun;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}) => {
  const accuracy = run.summary.overall.accuracy;

  return (
    <Card className={cn('transition-all', isSelected && 'ring-2 ring-blue-500')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                {truncateId(run.runId)}
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
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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

        <Button variant="outline" size="sm" className="w-full" onClick={onViewDetails}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

const EvaluationRuns: React.FC<Props> = ({ viewMode, onViewRunDetails, onCompare }) => {
  const [runs, setRuns] = React.useState<EvaluationRun[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [triggering, setTriggering] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [selectedRuns, setSelectedRuns] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [expandedRunId, setExpandedRunId] = React.useState<string | null>(null);

  const itemsPerPage = viewMode === 'pm' ? 6 : 10;

  // Fetch runs on mount
  React.useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluationRuns();
      setRuns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch runs');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRun = async () => {
    setTriggering(true);
    setError(null);
    try {
      await triggerEvaluation({ category: categoryFilter || undefined });
      await fetchRuns(); // Refresh the list
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
  const totalRuns = runs.length;
  const latestAccuracy = runs[0]?.summary.overall.accuracy ?? 0;
  const averageAccuracy =
    runs.length > 0
      ? runs.reduce((sum, r) => sum + r.summary.overall.accuracy, 0) / runs.length
      : 0;
  const totalTestCases = 59; // Static as per requirements

  // Get unique categories for filter
  const categories = [...new Set(runs.map((r) => r.category).filter(Boolean))] as string[];

  // Get previous run for delta comparison
  const getPreviousRun = (index: number): EvaluationRun | undefined => {
    const currentRunIndex = filteredRuns.findIndex(
      (r) => r.runId === paginatedRuns[index]?.runId
    );
    return filteredRuns[currentRunIndex + 1];
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
          <Button onClick={handleTriggerRun} disabled={triggering}>
            {triggering ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Trigger New Run
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalRuns}</div>
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
            <div className={cn('text-3xl font-bold', getAccuracyColor(averageAccuracy))}>
              {averageAccuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Average Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalTestCases}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Test Cases</div>
          </CardContent>
        </Card>
      </div>

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
              previousRun={getPreviousRun(index)}
              isSelected={selectedRuns.has(run.runId)}
              onSelect={() => toggleRunSelection(run.runId)}
              onViewDetails={() => onViewRunDetails?.(run.runId)}
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
                  <TableHead>Run ID</TableHead>
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
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{truncateId(run.runId)}</TableCell>
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewRunDetails?.(run.runId)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedRunId(isExpanded ? null : run.runId)}
                            >
                              {isExpanded ? 'Hide JSON' : 'JSON'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={11} className="bg-slate-50 dark:bg-slate-800">
                            <CodeBlock code={run} label="Run Data (JSON)" />
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
    </div>
  );
};

export default EvaluationRuns;
