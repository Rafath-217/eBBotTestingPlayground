import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CodeBlock, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, CategoryBadge, StyleBadge, cn } from '../components/ui';
import { StructureLLMSpec, EvaluationRunDetail, EvaluationResult } from '../types';
import { ViewMode } from '../components/Layout';
import { ChevronRight, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Clock, Filter, X } from 'lucide-react';
import { getLatestEvaluationRun } from '../services/evaluationApi';

interface StructureLLMProps {
  spec: StructureLLMSpec;
  viewMode: ViewMode;
}

// PM-friendly view for Structure LLM output
const PMStructureView: React.FC<{ data: any; label: string }> = ({ data, label }) => {
  if (!data) return <div className="text-muted-foreground text-sm">No data</div>;

  const structureType = data.structureType;
  const steps = data.steps || [];

  return (
    <div className="border rounded-lg p-4 bg-background">
      <h4 className="text-xs font-semibold text-muted-foreground mb-3">{label}</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            structureType === 'SINGLE_STEP' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
            structureType === 'MULTI_STEP' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
            "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          )}>
            {structureType || 'null (rejected)'}
          </span>
        </div>
        {steps.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Steps:</span>
            {steps.map((step: any, i: number) => (
              <div key={i} className="ml-4 p-2 border rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="text-sm">{step.label || `Step ${i + 1}`}</span>
                </div>
                {step.collectionHints?.length > 0 && (
                  <div className="ml-8 mt-1 text-xs text-muted-foreground">
                    Hints: {step.collectionHints.join(', ')}
                  </div>
                )}
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

const StructureLLM: React.FC<StructureLLMProps> = ({ spec, viewMode }) => {
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
      case 'green': return { card: 'border-l-4 border-l-green-500', title: 'text-green-600' };
      case 'blue': return { card: 'border-l-4 border-l-blue-500', title: 'text-blue-600' };
      case 'red': return { card: 'border-l-4 border-l-red-500', title: 'text-red-600' };
      default: return { card: 'border-l-4 border-l-gray-500', title: 'text-gray-600' };
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

  // Get structure results from evaluation run
  const structureResults: EvaluationResult[] = evaluationRun?.results || [];

  // Get unique categories, styles and status options
  const categories = [...new Set(structureResults.map(r => r.category))].sort();
  const styles = [...new Set(structureResults.map(r => r.style))].sort();
  const statuses = ['PASS', 'FAIL', 'PARTIAL', 'ERROR'];

  // Filter results
  const filteredResults = structureResults.filter(result => {
    if (filters.category && result.category !== filters.category) return false;
    if (filters.style && result.style !== filters.style) return false;
    // Filter by structure result status, not overall status
    if (filters.status && (result.structureResult.match ? 'PASS' : 'FAIL') !== filters.status) return false;
    return true;
  });

  // Calculate structure-specific stats
  const structureStats = {
    passed: structureResults.filter(r => r.structureResult.match).length,
    failed: structureResults.filter(r => !r.structureResult.match).length,
    total: structureResults.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{spec.name} ({spec.version})</h2>
        <p className="text-muted-foreground">{spec.purpose}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {spec.outputTypes.map((type, idx) => {
          const colors = getColorClasses(type.color);
          return (
            <Card key={idx} className={colors.card}>
              <CardHeader className="pb-2">
                <CardTitle className={colors.title}>{type.value === null ? 'null' : type.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{type.description}</p>
                {type.useCases && (
                  <p className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
                    {type.useCases.join(", ")}
                  </p>
                )}
                {type.additionalFields && (
                  <p className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
                    Output: {type.additionalFields.join(", ")}
                  </p>
                )}
                {type.triggers && (
                  <p className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
                    Triggers: {type.triggers.join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spec.supportedPatterns.map((pattern, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-medium text-sm flex items-center"><ChevronRight className="w-4 h-4 mr-1"/> {pattern.name}</h4>
                <CodeBlock
                  code={pattern.example.output}
                  label={`Input: "${pattern.example.input}"`}
                />
              </div>
            ))}
          </div>
        </CardContent>
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
                  {structureStats.passed} Passed
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {structureStats.failed} Failed
                </Badge>
                <span className="text-muted-foreground">
                  ({((structureStats.passed / structureStats.total) * 100).toFixed(1)}% accuracy)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Structure LLM Results</h3>

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
                {filteredResults.length} of {structureResults.length} results
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
                    const structureMatch = result.structureResult.match;
                    return (
                      <React.Fragment key={result.testCaseId}>
                        <TableRow
                          onClick={() => toggleRow(result.testCaseId)}
                          className={!structureMatch ? 'bg-red-50 dark:bg-red-950/10' : ''}
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
                              getStatusBadgeClasses(structureMatch ? 'PASS' : 'FAIL')
                            )}>
                              <StatusIcon status={structureMatch ? 'PASS' : 'FAIL'} />
                              {structureMatch ? 'PASS' : 'FAIL'}
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
                                  {!structureMatch && result.structureResult.details && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                                      <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Mismatch Details</h4>
                                      <p className="text-sm text-red-600 dark:text-red-300">{result.structureResult.details}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {viewMode === 'dev' ? (
                                    <>
                                      <CodeBlock label="Expected Structure" code={result.structureResult.expected} />
                                      <CodeBlock label="Actual Structure" code={result.structureResult.actual} />
                                    </>
                                  ) : (
                                    <>
                                      <PMStructureView data={result.structureResult.expected} label="Expected" />
                                      <PMStructureView data={result.structureResult.actual} label="Actual" />
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

export default StructureLLM;
