import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CodeBlock, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, CategoryBadge, StyleBadge, cn } from '../components/ui';
import { RulesLLMSpec, EvaluationRunDetail, EvaluationResult } from '../types';
import { ViewMode } from '../components/Layout';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Clock, Filter, X } from 'lucide-react';
import { getLatestEvaluationRun } from '../services/evaluationApi';

interface RulesLLMProps {
  spec: RulesLLMSpec;
  viewMode: ViewMode;
}

// PM-friendly view for Rules LLM output
const PMRulesView: React.FC<{ data: any; label: string }> = ({ data, label }) => {
  if (!data) return <div className="text-muted-foreground text-sm">No data</div>;

  // Handle multiple structures:
  // 1. Array directly: [{type, condition, value}]
  // 2. Nested: {conditions: {rules: [...]}}
  // 3. Partial: {rules: [...]}
  let rules: any[] = [];
  if (Array.isArray(data)) {
    rules = data;
  } else if (data.conditions?.rules) {
    rules = data.conditions.rules;
  } else if (data.rules) {
    rules = data.rules;
  }

  const getConditionLabel = (condition: string) => {
    if (condition === 'greaterThanOrEqualTo') return 'At least';
    if (condition === 'lessThanOrEqualTo') return 'At most';
    if (condition === 'equalTo') return 'Exactly';
    return condition;
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <h4 className="text-xs font-semibold text-muted-foreground mb-3">{label}</h4>
      <div className="space-y-3">
        {rules.length > 0 ? (
          <div className="space-y-2">
            {rules.map((rule: any, i: number) => (
              <div key={i} className="p-3 border rounded bg-muted/30 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Type</span>
                  <span className="font-medium">{rule.type === 'quantity' ? 'Quantity' : rule.type === 'amount' ? 'Amount' : rule.type}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Condition</span>
                  <span className="font-medium">{getConditionLabel(rule.condition)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Value</span>
                  <span className="font-medium">{rule.value}</span>
                </div>
                {rule.stepIndex && (
                  <div className="col-span-3">
                    <span className="text-xs text-muted-foreground">Step: {rule.stepIndex}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">Default rules (any quantity)</div>
        )}
      </div>
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
    className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
  >
    <option value="">{label}</option>
    {options.map(opt => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const RulesLLM: React.FC<RulesLLMProps> = ({ spec, viewMode }) => {
  const [evaluationRun, setEvaluationRun] = useState<EvaluationRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
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

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', style: '', status: '' });
  };

  const hasActiveFilters = filters.category || filters.style || filters.status;

  // Get rules results from evaluation run
  const rulesResults: EvaluationResult[] = evaluationRun?.results || [];

  // Get unique categories, styles
  const categories = [...new Set(rulesResults.map(r => r.category))].sort();
  const styles = [...new Set(rulesResults.map(r => r.style))].sort();

  // Filter results
  const filteredResults = rulesResults.filter(result => {
    if (filters.category && result.category !== filters.category) return false;
    if (filters.style && result.style !== filters.style) return false;
    // Filter by rules result status
    if (filters.status && (result.rulesResult.match ? 'PASS' : 'FAIL') !== filters.status) return false;
    return true;
  });

  // Calculate rules-specific stats
  const rulesStats = {
    passed: rulesResults.filter(r => r.rulesResult.match).length,
    failed: rulesResults.filter(r => !r.rulesResult.match).length,
    total: rulesResults.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{spec.name} ({spec.version})</h2>
        <p className="text-muted-foreground">{spec.purpose}</p>
      </div>

      <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Default Behavior</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
            {spec.defaultBehavior.description}
          </p>
          <CodeBlock code={spec.defaultBehavior.output} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conditions Supported</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spec.conditions.map((condition, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-mono font-bold text-primary block">{condition.name}</span>
                  {condition.alias && <span className="text-xs text-muted-foreground">({condition.alias})</span>}
                </div>
                <span className="text-sm text-muted-foreground text-right">{condition.description}<br/>"{condition.example}"</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pattern Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spec.patternMapping.map((pattern, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{pattern.pattern}</TableCell>
                    <TableCell><Badge variant="secondary">{pattern.condition}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{pattern.valueSource}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
                  {rulesStats.passed} Passed
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {rulesStats.failed} Failed
                </Badge>
                <span className="text-muted-foreground">
                  ({rulesStats.total > 0 ? ((rulesStats.passed / rulesStats.total) * 100).toFixed(1) : 0}% accuracy)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Rules LLM Results</h3>

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
          <Card className="overflow-hidden">
            {/* Filter Bar */}
            <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
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
                options={['PASS', 'FAIL']}
                onChange={(v) => updateFilter('status', v)}
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {filteredResults.length} of {rulesResults.length} results
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead className="w-[300px]">Input</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No results match the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => {
                    const rulesMatch = result.rulesResult.match;
                    return (
                      <React.Fragment key={result.testCaseId}>
                        <TableRow
                          onClick={() => toggleRow(result.testCaseId)}
                          className={!rulesMatch ? 'bg-red-50 dark:bg-red-950/10' : ''}
                        >
                          <TableCell className="font-mono text-xs">{result.testCaseId}</TableCell>
                          <TableCell>
                            <CategoryBadge category={result.category} minimal />
                          </TableCell>
                          <TableCell>
                            <StyleBadge style={result.style} minimal />
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                            {result.text}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
                              getStatusBadgeClasses(rulesMatch ? 'PASS' : 'FAIL')
                            )}>
                              <StatusIcon status={rulesMatch ? 'PASS' : 'FAIL'} />
                              {rulesMatch ? 'PASS' : 'FAIL'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {expandedRow === result.testCaseId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRow === result.testCaseId && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-xs font-semibold mb-2">Merchant Text</h4>
                                    <div className="p-3 bg-background rounded border text-sm italic">
                                      "{result.text}"
                                    </div>
                                  </div>
                                  {!rulesMatch && result.rulesResult.details && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                                      <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Mismatch Details</h4>
                                      <p className="text-sm text-red-600 dark:text-red-300">{result.rulesResult.details}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {viewMode === 'dev' ? (
                                    <>
                                      <CodeBlock label="Expected Rules" code={result.rulesResult.expected} />
                                      <CodeBlock label="Actual Rules" code={result.rulesResult.actual} />
                                    </>
                                  ) : (
                                    <>
                                      <PMRulesView data={result.rulesResult.expected} label="Expected" />
                                      <PMRulesView data={result.rulesResult.actual} label="Actual" />
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RulesLLM;
