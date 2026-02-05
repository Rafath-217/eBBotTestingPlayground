import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar, Package, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn } from '../components/ui';
import { ViewMode } from '../components/Layout';
import { PMResultView, PMDiscountsPanel, PMRulesPanel, PMStepsPanel } from '../components/PMViews';
import { PipelineHistoryLog, PipelineHistoryPagination } from '../types';
import { getPipelineHistory } from '../services/pipelineHistoryApi';

interface PipelineHistoryProps {
  viewMode: ViewMode;
}

// PM-friendly view for Structure LLM output
const PMStructureView: React.FC<{ output: any }> = ({ output }) => {
  if (!output) return <div className="text-muted-foreground text-sm">No structure output</div>;

  const structureType = output.structureType;
  // Handle nested structure: steps[].label and steps[].collectionHints
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

  // Handle nested structure: output.discountConfiguration.discountMode
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

  // Handle nested structure: output.conditions.rules
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

const PipelineHistory: React.FC<PipelineHistoryProps> = ({ viewMode }) => {
  const [logs, setLogs] = useState<PipelineHistoryLog[]>([]);
  const [pagination, setPagination] = useState<PipelineHistoryPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Date filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPipelineHistory({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit,
      });

      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch pipeline history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, startDate, endDate]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchHistory();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'AUTO') return { variant: 'success' as const, text: 'AUTO' };
    if (status === 'DOWNGRADED_TO_MANUAL') return { variant: 'warning' as const, text: 'DOWNGRADED' };
    return { variant: 'destructive' as const, text: 'MANUAL' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline History</h1>
        <p className="text-muted-foreground">View historical pipeline runs and their results</p>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 px-3 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={handleApplyFilter} className="h-10">
              Apply Filter
            </Button>
            <Button variant="outline" onClick={handleClearFilter} className="h-10">
              Clear
            </Button>
            {pagination && (
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {logs.length} of {pagination.total} runs
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
      {!loading && !error && logs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pipeline Runs Found</h3>
            <p className="text-muted-foreground">
              {startDate || endDate
                ? 'No runs found for the selected date range. Try adjusting your filters.'
                : 'No pipeline runs have been recorded yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Runs List */}
      {!loading && !error && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              {/* Header Row - Always Visible */}
              <div
                onClick={() => toggleExpand(log.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatDate(log.timestamp)}
                  </div>
                  <Badge variant={getStatusBadge(log.status).variant}>
                    {getStatusBadge(log.status).text}
                  </Badge>
                  {log.durationMs && (
                    <span className="text-xs text-muted-foreground">
                      {(log.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground max-w-md truncate">
                    {log.input.merchantText}
                  </span>
                  {expandedId === log.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === log.id && (
                <div className="border-t p-6 bg-muted/30 space-y-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Input</h3>

                    {/* Merchant Text */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Merchant Query</label>
                      <div className="p-3 bg-background rounded border text-sm italic">
                        "{log.input.merchantText}"
                      </div>
                    </div>

                    {/* Products & Collections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Products */}
                      {log.input.products && log.input.products.length > 0 && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Products ({log.input.products.length})
                          </label>
                          <div className="p-3 bg-background rounded border space-y-1">
                            {log.input.products.map((product, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {product.title}
                                </span>
                                {product.productType && (
                                  <Badge variant="outline" className="text-xs">
                                    {product.productType}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Collections */}
                      {log.input.collections && log.input.collections.length > 0 && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Collections ({log.input.collections.length})
                          </label>
                          <div className="p-3 bg-background rounded border space-y-1">
                            {log.input.collections.map((collection, idx) => (
                              <div key={idx} className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {collection.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Output</h3>

                    {viewMode === 'pm' ? (
                      /* PM Mode - Visual Cards */
                      <div className="space-y-6">
                        {/* LLM Outputs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block font-medium">Structure LLM</label>
                            <PMStructureView output={log.output.structureLLM} />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block font-medium">Discount LLM</label>
                            <PMDiscountView output={log.output.discountLLM} />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block font-medium">Rules LLM</label>
                            <PMRulesView output={log.output.rulesLLM} />
                          </div>
                        </div>

                        {/* Assembled Result */}
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block font-medium">Assembled Bundle Config</label>
                          {log.output.assembledResult?.error ? (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                              <p className="text-red-700 dark:text-red-300 font-medium">Assembly Error:</p>
                              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{log.output.assembledResult.error}</p>
                            </div>
                          ) : (
                            <PMResultView config={log.output.assembledResult?.bundleConfig || log.output.assembledResult} />
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Dev Mode - JSON Code Blocks */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LLM Outputs */}
                        <div className="space-y-4">
                          <CodeBlock label="Structure LLM Output" code={log.output.structureLLM} />
                          <CodeBlock label="Discount LLM Output" code={log.output.discountLLM} />
                          <CodeBlock label="Rules LLM Output" code={log.output.rulesLLM} />
                        </div>

                        {/* Assembled Result */}
                        <div>
                          <CodeBlock label="Assembled Result" code={log.output.assembledResult} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
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

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // Show pages around current page
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
                  })}
                </div>

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

export default PipelineHistory;
