import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CodeBlock, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, CategoryBadge, StyleBadge, cn } from '../components/ui';
import { DiscountLLMSpec, EvaluationRunDetail, EvaluationResult } from '../types';
import { ViewMode } from '../components/Layout';
import { Info, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Clock, Filter, X } from 'lucide-react';
import { getLatestEvaluationRun } from '../services/evaluationApi';

interface DiscountLLMProps {
  spec: DiscountLLMSpec;
  viewMode: ViewMode;
}

// PM-friendly view for Discount LLM output
const PMDiscountView: React.FC<{ data: any; label: string }> = ({ data, label }) => {
  if (!data) return <div className="text-muted-foreground text-sm">No data</div>;

  // Handle both direct and nested discountConfiguration structures
  const config = data.discountConfiguration || data;
  const discountMode = config.discountMode;
  const rules = config.rules || [];

  const getModeColor = (mode: string) => {
    if (mode === 'PERCENTAGE') return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    if (mode === 'FIXED') return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    if (mode === 'FIXED_BUNDLE_PRICE') return "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getSymbol = () => {
    if (discountMode === 'PERCENTAGE') return '%';
    return '$';
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <h4 className="text-xs font-semibold text-muted-foreground mb-3">{label}</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Mode:</span>
          <span className={cn("px-2 py-1 rounded text-xs font-medium", getModeColor(discountMode))}>
            {discountMode || 'null (no discount)'}
          </span>
        </div>
        {rules.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Rules:</span>
            {rules.map((rule: any, i: number) => (
              <div key={i} className="ml-4 p-3 border rounded bg-muted/30 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Qualifier</span>
                  <span className="font-medium">{rule.type === 'quantity' ? 'Quantity' : rule.type === 'amount' ? 'Amount' : rule.type}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Threshold</span>
                  <span className="font-medium">{rule.type === 'amount' ? '$' : ''}{rule.value}{rule.type === 'quantity' ? ' items' : ''}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Discount</span>
                  <span className="font-medium">{rule.discountValue}{getSymbol()}</span>
                </div>
              </div>
            ))}
          </div>
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

const DiscountLLM: React.FC<DiscountLLMProps> = ({ spec, viewMode }) => {
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

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'purple': return { card: 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800', title: 'text-purple-700 dark:text-purple-400' };
      case 'orange': return { card: 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800', title: 'text-orange-700 dark:text-orange-400' };
      case 'teal': return { card: 'bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800', title: 'text-teal-700 dark:text-teal-400' };
      case 'gray': return { card: 'bg-gray-50/50 dark:bg-gray-800/50', title: 'text-gray-500' };
      default: return { card: '', title: '' };
    }
  };

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

  // Get discount results from evaluation run
  const discountResults: EvaluationResult[] = evaluationRun?.results || [];

  // Get unique categories, styles
  const categories = [...new Set(discountResults.map(r => r.category))].sort();
  const styles = [...new Set(discountResults.map(r => r.style))].sort();

  // Filter results
  const filteredResults = discountResults.filter(result => {
    if (filters.category && result.category !== filters.category) return false;
    if (filters.style && result.style !== filters.style) return false;
    // Filter by discount result status
    if (filters.status && (result.discountResult.match ? 'PASS' : 'FAIL') !== filters.status) return false;
    return true;
  });

  // Calculate discount-specific stats
  const discountStats = {
    passed: discountResults.filter(r => r.discountResult.match).length,
    failed: discountResults.filter(r => !r.discountResult.match).length,
    total: discountResults.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{spec.name}{spec.version ? ` (${spec.version})` : ''}</h2>
        {spec.purpose && <p className="text-muted-foreground">{spec.purpose}</p>}
      </div>

      {(spec.discountModes || []).length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {spec.discountModes.map((mode, idx) => {
          const colors = getColorClasses(mode.color);
          return (
            <Card key={idx} className={colors.card}>
              <CardHeader className="pb-2">
                <CardTitle className={`${colors.title} text-base`}>{mode.mode === null ? 'null' : mode.mode}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                {mode.example ? (
                  <>
                    <p>"{mode.example.input}"</p>
                    <div className="font-mono bg-background/50 p-2 rounded">discountMode: "{mode.example.output.discountMode}"</div>
                  </>
                ) : (
                  <p>{mode.triggers?.join(", ")}</p>
                )}
                <p className="text-muted-foreground italic mt-2">{mode.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>}

      {(spec.keyRules || []).length > 0 && <div className="flex items-start p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
        <Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Key Normalization Rules</p>
          <ul className="list-disc list-inside space-y-1 opacity-90">
            {spec.keyRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>}

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
                  {discountStats.passed} Passed
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {discountStats.failed} Failed
                </Badge>
                <span className="text-muted-foreground">
                  ({discountStats.total > 0 ? ((discountStats.passed / discountStats.total) * 100).toFixed(1) : 0}% accuracy)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Discount LLM Results</h3>

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
                {filteredResults.length} of {discountResults.length} results
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
                    const discountMatch = result.discountResult.match;
                    return (
                      <React.Fragment key={result.testCaseId}>
                        <TableRow
                          onClick={() => toggleRow(result.testCaseId)}
                          className={!discountMatch ? 'bg-red-50 dark:bg-red-950/10' : ''}
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
                              getStatusBadgeClasses(discountMatch ? 'PASS' : 'FAIL')
                            )}>
                              <StatusIcon status={discountMatch ? 'PASS' : 'FAIL'} />
                              {discountMatch ? 'PASS' : 'FAIL'}
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
                                  {!discountMatch && result.discountResult.details && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                                      <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Mismatch Details</h4>
                                      <p className="text-sm text-red-600 dark:text-red-300">{result.discountResult.details}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {viewMode === 'dev' ? (
                                    <>
                                      <CodeBlock label="Expected Discount" code={result.discountResult.expected} />
                                      <CodeBlock label="Actual Discount" code={result.discountResult.actual} />
                                    </>
                                  ) : (
                                    <>
                                      <PMDiscountView data={result.discountResult.expected} label="Expected" />
                                      <PMDiscountView data={result.discountResult.actual} label="Actual" />
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

export default DiscountLLM;
