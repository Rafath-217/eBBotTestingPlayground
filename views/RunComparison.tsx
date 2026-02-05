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
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { EvaluationRun, RunComparison as RunComparisonType } from '../types';
import { compareRuns, getEvaluationRun } from '../services/evaluationApi';

interface Props {
  runId1: string;
  runId2: string;
  viewMode: 'pm' | 'dev';
  onBack: () => void;
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

// Delta display component with arrow
const DeltaDisplay = ({ value, inverted = false }: { value: number; inverted?: boolean }) => {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;

  if (value === 0) {
    return (
      <span className="inline-flex items-center text-slate-500 font-medium">
        <Minus className="w-4 h-4 mr-1" />
        0%
      </span>
    );
  }

  if (isPositive) {
    return (
      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
        <ArrowUp className="w-4 h-4 mr-1" />
        +{Math.abs(value).toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-red-600 dark:text-red-400 font-medium">
      <ArrowDown className="w-4 h-4 mr-1" />
      -{Math.abs(value).toFixed(1)}%
    </span>
  );
};

// Status transition badge
const StatusTransition = ({
  from,
  to,
}: {
  from: 'PASS' | 'FAIL' | 'PARTIAL';
  to: 'PASS' | 'FAIL' | 'PARTIAL';
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800';
      case 'FAIL':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'PARTIAL':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded border', getStatusColor(from))}>
        {from}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-400" />
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded border', getStatusColor(to))}>
        {to}
      </span>
    </div>
  );
};

// Type for changes from RunComparison API
interface ChangeItem {
  testCaseId: number;
  category: string;
  from: string;
  to: string;
  text?: string;
}

// Regression row component
const RegressionRow = ({
  change,
  viewMode,
}: {
  change: ChangeItem;
  viewMode: 'pm' | 'dev';
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
            TC-{String(change.testCaseId).padStart(3, '0')}
          </span>
          <CategoryBadge category={change.category} minimal />
          <StatusTransition
            from={change.from as 'PASS' | 'FAIL' | 'PARTIAL'}
            to={change.to as 'PASS' | 'FAIL' | 'PARTIAL'}
          />
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && change.text && (
        <div className="p-4 pt-0 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Test Input
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
              {change.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Improvement row component
const ImprovementRow = ({
  change,
  viewMode,
}: {
  change: ChangeItem;
  viewMode: 'pm' | 'dev';
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
            TC-{String(change.testCaseId).padStart(3, '0')}
          </span>
          <CategoryBadge category={change.category} minimal />
          <StatusTransition
            from={change.from as 'PASS' | 'FAIL' | 'PARTIAL'}
            to={change.to as 'PASS' | 'FAIL' | 'PARTIAL'}
          />
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && change.text && (
        <div className="p-4 pt-0 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Test Input
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
              {change.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary card component
const SummaryCard = ({
  title,
  run,
  variant = 'default',
}: {
  title: string;
  run: EvaluationRun;
  variant?: 'default' | 'run1' | 'run2';
}) => {
  const borderColor =
    variant === 'run1'
      ? 'border-blue-200 dark:border-blue-800'
      : variant === 'run2'
        ? 'border-violet-200 dark:border-violet-800'
        : '';

  return (
    <Card className={cn(borderColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="text-xs text-slate-500">{formatDate(run.startedAt)}</div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold mb-4', getAccuracyColor(run.summary.overall.accuracy))}>
          {run.summary.overall.accuracy.toFixed(1)}%
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded">
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {run.summary.overall.passed}
            </div>
            <div className="text-[10px] text-emerald-600 uppercase">Passed</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {run.summary.overall.failed}
            </div>
            <div className="text-[10px] text-red-600 uppercase">Failed</div>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded">
            <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
              {run.summary.overall.partial}
            </div>
            <div className="text-[10px] text-amber-600 uppercase">Partial</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// LLM accuracy comparison chart
const LLMComparisonChart = ({
  run1,
  run2,
}: {
  run1: EvaluationRun;
  run2: EvaluationRun;
}) => {
  const llmTypes = ['structure', 'discount', 'rules'] as const;

  const data = llmTypes.map((llm) => ({
    name: llm.charAt(0).toUpperCase() + llm.slice(1),
    'Run 1': run1.summary.byLlm?.[llm]?.accuracy ?? 0,
    'Run 2': run2.summary.byLlm?.[llm]?.accuracy ?? 0,
  }));

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend />
          <Bar dataKey="Run 1" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
          <Bar dataKey="Run 2" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RunComparison: React.FC<Props> = ({ runId1, runId2, viewMode, onBack }) => {
  const [run1, setRun1] = React.useState<EvaluationRun | null>(null);
  const [run2, setRun2] = React.useState<EvaluationRun | null>(null);
  const [comparison, setComparison] = React.useState<RunComparisonType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showFullDiff, setShowFullDiff] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [r1, r2, comp] = await Promise.all([
          getEvaluationRun(runId1),
          getEvaluationRun(runId2),
          compareRuns(runId1, runId2),
        ]);
        setRun1(r1);
        setRun2(r2);
        setComparison(comp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [runId1, runId2]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !run1 || !run2 || !comparison) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Runs
        </Button>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error || 'Failed to load comparison data'}
        </div>
      </div>
    );
  }

  const overallDelta = run2.summary.overall.accuracy - run1.summary.overall.accuracy;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Run Comparison
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {truncateId(runId1)} vs {truncateId(runId2)}
          </p>
        </div>
      </div>

      {/* Summary Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title={`Run 1: ${truncateId(runId1)}`} run={run1} variant="run1" />

        {/* Delta Card */}
        <Card className="flex items-center justify-center">
          <CardContent className="text-center py-8">
            <div className="text-sm text-slate-500 uppercase tracking-wide mb-2">Change</div>
            <div className="text-4xl mb-4">
              <DeltaDisplay value={overallDelta} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {comparison.changes.improvements.length}
                </div>
                <div className="text-xs text-slate-500">Improved</div>
              </div>
              <div>
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  {comparison.changes.regressions.length}
                </div>
                <div className="text-xs text-slate-500">Regressed</div>
              </div>
              <div>
                <div className="text-slate-600 dark:text-slate-400 font-semibold">
                  {comparison.changes.unchanged.length}
                </div>
                <div className="text-xs text-slate-500">Unchanged</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <SummaryCard title={`Run 2: ${truncateId(runId2)}`} run={run2} variant="run2" />
      </div>

      {/* Per-LLM Accuracy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Per-LLM Accuracy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'pm' ? (
            <LLMComparisonChart run1={run1} run2={run2} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LLM Type</TableHead>
                  <TableHead>Run 1</TableHead>
                  <TableHead>Run 2</TableHead>
                  <TableHead>Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(['structure', 'discount', 'rules'] as const).map((llm) => {
                  const r1Acc = run1.summary.byLlm?.[llm]?.accuracy ?? 0;
                  const r2Acc = run2.summary.byLlm?.[llm]?.accuracy ?? 0;
                  const delta = r2Acc - r1Acc;

                  return (
                    <TableRow key={llm}>
                      <TableCell className="font-medium capitalize">{llm}</TableCell>
                      <TableCell>
                        <span className={getAccuracyColor(r1Acc)}>{r1Acc.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell>
                        <span className={getAccuracyColor(r2Acc)}>{r2Acc.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell>
                        <DeltaDisplay value={delta} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Regressions Section */}
      {comparison.changes.regressions.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Regressions ({comparison.changes.regressions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comparison.changes.regressions.map((change) => (
              <RegressionRow key={change.testCaseId} change={change} viewMode={viewMode} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Improvements Section */}
      {comparison.changes.improvements.length > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              Improvements ({comparison.changes.improvements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comparison.changes.improvements.map((change) => (
              <ImprovementRow key={change.testCaseId} change={change} viewMode={viewMode} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Changes Message */}
      {comparison.changes.regressions.length === 0 && comparison.changes.improvements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Minus className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
              No Changes Detected
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              All test cases produced the same results in both runs.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Full JSON Diff (Dev Mode) */}
      {viewMode === 'dev' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Full Comparison Data</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFullDiff(!showFullDiff)}>
                {showFullDiff ? 'Hide' : 'Show'} JSON
              </Button>
            </div>
          </CardHeader>
          {showFullDiff && (
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <CodeBlock code={run1} label="Run 1 Full Data" />
                </div>
                <div>
                  <CodeBlock code={run2} label="Run 2 Full Data" />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default RunComparison;
