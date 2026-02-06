import React, { useState, useEffect } from 'react';
import { Card, CardContent, CodeBlock, Badge, CategoryBadge, StyleBadge, Button, cn } from '../components/ui';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Clock, Filter, X } from 'lucide-react';
import { Category, Style, EvaluationRunDetail, EvaluationResult } from '../types';
import { ViewMode } from '../components/Layout';
import { PMResultView } from '../components/PMViews';
import { getLatestEvaluationRun } from '../services/evaluationApi';

interface AssemblyProps {
  viewMode: ViewMode;
}

// PM-friendly view for Structure LLM output — matches PipelineHistory card style
const PMStructureView: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div className="text-muted-foreground text-sm">No structure output</div>;

  const structureType = data.structureType;
  const steps = data.steps || [];
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

// PM-friendly view for Discount LLM output — matches PipelineHistory card style
const PMDiscountView: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div className="text-muted-foreground text-sm">No discount output</div>;

  const config = data.discountConfiguration || data;
  const discountMode = config.discountMode;
  const rules = config.rules || [];

  const getModeVariant = () => {
    if (discountMode === 'PERCENTAGE') return 'success' as const;
    if (discountMode === 'FIXED') return 'blue' as const;
    if (discountMode === 'FIXED_BUNDLE_PRICE') return 'purple' as const;
    return 'destructive' as const;
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

// PM-friendly view for Rules LLM output — matches PipelineHistory card style
const PMRulesView: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div className="text-muted-foreground text-sm">No rules output</div>;

  const conditionsObj = data.conditions || {};
  const conditions = Array.isArray(data) ? data : (conditionsObj.rules || data.rules || []);

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

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'PASS':
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case 'FAIL':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'PARTIAL':
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case 'ERROR':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'PASS':
      return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800';
    case 'FAIL':
      return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    case 'PARTIAL':
      return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
    case 'ERROR':
      return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

interface FilterState {
  category: string;
  style: string;
  status: string;
}

const FilterDropdown = ({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-9 px-3 text-sm rounded-md border border-input bg-background"
  >
    <option value="">{label}</option>
    {options.map(opt => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const Assembly: React.FC<AssemblyProps> = ({ viewMode }) => {
  const [evaluationRun, setEvaluationRun] = useState<EvaluationRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    style: '',
    status: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const run = await getLatestEvaluationRun();
        setEvaluationRun(run);
      } catch (err) {
        console.error('Failed to fetch evaluation run:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch evaluation run');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCase = (id: number) => {
    setExpandedCase(expandedCase === id ? null : id);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', style: '', status: '' });
  };

  const hasActiveFilters = filters.category || filters.style || filters.status;

  // Get results from evaluation run
  const results: EvaluationResult[] = evaluationRun?.results || [];

  // Get unique categories and styles
  const categories = [...new Set(results.map(r => r.category))].sort();
  const styles = [...new Set(results.map(r => r.style))].sort();

  // Filter results
  const filteredResults = results.filter(result => {
    if (filters.category && result.category !== filters.category) return false;
    if (filters.style && result.style !== filters.style) return false;
    if (filters.status && result.status !== filters.status) return false;
    return true;
  });

  // Calculate overall stats
  const stats = {
    passed: results.filter(r => r.status === 'PASS').length,
    partial: results.filter(r => r.status === 'PARTIAL').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    errors: results.filter(r => r.status === 'ERROR').length,
    total: results.length,
  };

  // Helper to get overall status color for a result row
  const getRowClass = (result: EvaluationResult) => {
    if (result.status === 'FAIL' || result.status === 'ERROR') return 'border-red-300 dark:border-red-700';
    if (result.status === 'PARTIAL') return 'border-amber-300 dark:border-amber-700';
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assembly Layer</h1>
        <p className="text-muted-foreground mt-1">
          Combined view of all 3 LLM outputs (Structure + Discount + Rules) from the latest evaluation run
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What is the Assembly Layer?</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          The Assembly layer is a <strong>deterministic</strong> process (no AI) that combines outputs from the three LLMs
          into the final bundle configuration. It matches collection hints to actual collections, builds step categories,
          and applies discount/rules configurations. This view shows how all 3 LLM outputs combine for each test case.
        </p>
      </Card>

      {/* Evaluation Run Metadata */}
      {evaluationRun && (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Run:</span>
                <span className="font-mono text-xs">{evaluationRun.runId}</span>
              </div>
              <div className="text-muted-foreground">
                {new Date(evaluationRun.startedAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {stats.passed} Pass
                </Badge>
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {stats.partial} Partial
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {stats.failed + stats.errors} Fail
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading evaluation results...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 border-red-200 dark:border-red-800">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">Error Loading Results</p>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </Card>
      ) : !evaluationRun ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <p className="text-lg font-semibold">No Evaluation Runs Found</p>
            <p className="text-muted-foreground mt-2">Run an evaluation from the Playground to see results here.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <FilterDropdown
              label="All Categories"
              value={filters.category}
              options={categories}
              onChange={(v) => updateFilter('category', v)}
            />
            <FilterDropdown
              label="All Styles"
              value={filters.style}
              options={styles}
              onChange={(v) => updateFilter('style', v)}
            />
            <FilterDropdown
              label="All Status"
              value={filters.status}
              options={['PASS', 'PARTIAL', 'FAIL', 'ERROR']}
              onChange={(v) => updateFilter('status', v)}
            />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              {filteredResults.length} of {results.length} cases
            </span>
          </div>

          {/* Test Cases List */}
          <div className="space-y-3">
            {filteredResults.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No results match the current filters
              </Card>
            ) : (
              filteredResults.map((result) => (
                <Card key={result.testCaseId} className={cn("overflow-hidden", getRowClass(result))}>
                  <div
                    onClick={() => toggleCase(result.testCaseId)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium">{result.testCaseId}</span>
                      <CategoryBadge category={result.category} minimal />
                      <StyleBadge style={result.style} minimal />
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
                        getStatusBadgeClasses(result.status)
                      )}>
                        <StatusIcon status={result.status} />
                        {result.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground max-w-md truncate">
                        {result.text}
                      </span>
                      {expandedCase === result.testCaseId ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedCase === result.testCaseId && (
                    <div className="border-t p-6 bg-muted/30 space-y-6">
                      {/* Input Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Input</h3>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Merchant Query</label>
                          <div className="p-3 bg-background rounded border text-sm italic">
                            "{result.text}"
                          </div>
                        </div>
                      </div>

                      {/* Output Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Output</h3>

                        {viewMode === 'pm' ? (
                          /* PM Mode - Visual Cards matching PipelineHistory */
                          <div className="space-y-6">
                            {/* Actual LLM Outputs */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block font-medium flex items-center gap-2">
                                  Structure LLM
                                  <StatusIcon status={result.structureResult.match ? 'PASS' : 'FAIL'} />
                                </label>
                                <PMStructureView data={result.structureResult.actual} />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block font-medium flex items-center gap-2">
                                  Discount LLM
                                  <StatusIcon status={result.discountResult.match ? 'PASS' : 'FAIL'} />
                                </label>
                                <PMDiscountView data={result.discountResult.actual} />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block font-medium flex items-center gap-2">
                                  Rules LLM
                                  <StatusIcon status={result.rulesResult.match ? 'PASS' : 'FAIL'} />
                                </label>
                                <PMRulesView data={result.rulesResult.actual} />
                              </div>
                            </div>

                            {/* Expected outputs on mismatch */}
                            {(result.status === 'FAIL' || result.status === 'PARTIAL') && (
                              <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Expected</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  {!result.structureResult.match && (
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-2 block font-medium">Structure LLM (Expected)</label>
                                      <PMStructureView data={result.structureResult.expected} />
                                      {result.structureResult.details && (
                                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                                          {result.structureResult.details}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!result.discountResult.match && (
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-2 block font-medium">Discount LLM (Expected)</label>
                                      <PMDiscountView data={result.discountResult.expected} />
                                      {result.discountResult.details && (
                                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                                          {result.discountResult.details}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!result.rulesResult.match && (
                                    <div>
                                      <label className="text-xs text-muted-foreground mb-2 block font-medium">Rules LLM (Expected)</label>
                                      <PMRulesView data={result.rulesResult.expected} />
                                      {result.rulesResult.details && (
                                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                                          {result.rulesResult.details}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Dev Mode - JSON Code Blocks matching PipelineHistory layout */
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Expected LLM Outputs */}
                            <div className="space-y-4">
                              <CodeBlock label="Structure LLM (Expected)" code={result.structureResult.expected} />
                              <CodeBlock label="Discount LLM (Expected)" code={result.discountResult.expected} />
                              <CodeBlock label="Rules LLM (Expected)" code={result.rulesResult.expected} />
                            </div>

                            {/* Right: Actual LLM Outputs */}
                            <div className="space-y-4">
                              <div>
                                <CodeBlock label="Structure LLM (Actual)" code={result.structureResult.actual} />
                                {!result.structureResult.match && result.structureResult.details && (
                                  <div className="text-xs text-red-600 dark:text-red-400 p-2 mt-1 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                                    {result.structureResult.details}
                                  </div>
                                )}
                              </div>
                              <div>
                                <CodeBlock label="Discount LLM (Actual)" code={result.discountResult.actual} />
                                {!result.discountResult.match && result.discountResult.details && (
                                  <div className="text-xs text-red-600 dark:text-red-400 p-2 mt-1 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                                    {result.discountResult.details}
                                  </div>
                                )}
                              </div>
                              <div>
                                <CodeBlock label="Rules LLM (Actual)" code={result.rulesResult.actual} />
                                {!result.rulesResult.match && result.rulesResult.details && (
                                  <div className="text-xs text-red-600 dark:text-red-400 p-2 mt-1 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                                    {result.rulesResult.details}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Assembly;
