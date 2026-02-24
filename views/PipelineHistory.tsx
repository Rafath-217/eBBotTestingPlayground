import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar, Package, Tag, Search, Filter, MessageSquare, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn } from '../components/ui';
import { ViewMode } from '../components/Layout';
import { PMResultView, PMDiscountsPanel, PMRulesPanel, PMStepsPanel } from '../components/PMViews';
import { PipelineHistoryLog, PipelineHistoryPagination, FeedbackRating } from '../types';
import { getPipelineHistory, searchPipelineHistory, submitFeedback } from '../services/pipelineHistoryApi';

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

  // Client-side filter/search state
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'APP' | 'NON-APP'>('ALL');
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' | 'NO_FEEDBACK'>('ALL');
  const [merchantTextFilter, setMerchantTextFilter] = useState<'ALL' | 'EMPTY' | 'NON_EMPTY'>('ALL');
  const [shopNameSearch, setShopNameSearch] = useState<string>('');

  // Shop name search mode (server-side)
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Feedback state
  const [feedbackActiveId, setFeedbackActiveId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | null>(null);
  const [feedbackRemarks, setFeedbackRemarks] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const handleFeedbackSelect = (logId: string, rating: FeedbackRating) => {
    setFeedbackActiveId(logId);
    setFeedbackRating(rating);
    setFeedbackRemarks('');
  };

  const handleFeedbackSubmit = async (logId: string) => {
    if (!feedbackRating) return;
    setFeedbackSubmitting(true);
    try {
      await submitFeedback(logId, feedbackRating, feedbackRemarks);
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? { ...log, feedback: { rating: feedbackRating, remarks: feedbackRemarks, updatedAt: new Date().toISOString() } }
            : log
        )
      );
      setFeedbackActiveId(null);
      setFeedbackRating(null);
      setFeedbackRemarks('');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isSearchMode && shopNameSearch.trim()) {
        response = await searchPipelineHistory({
          shopName: shopNameSearch.trim(),
          page: currentPage,
          limit,
        });
      } else {
        response = await getPipelineHistory({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
          limit,
          source: sourceFilter,
          feedback: feedbackFilter,
          merchantText: merchantTextFilter,
        });
      }

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
  }, [currentPage, isSearchMode, fetchTrigger]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setFetchTrigger((t) => t + 1);
  };

  const handleShopSearch = () => {
    if (!shopNameSearch.trim()) return;
    setCurrentPage(1);
    setIsSearchMode(true);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSourceFilter('ALL');
    setFeedbackFilter('ALL');
    setMerchantTextFilter('ALL');
    setShopNameSearch('');
    setIsSearchMode(false);
    setCurrentPage(1);
    setFetchTrigger((t) => t + 1);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Date filters row */}
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
          </div>

          {/* Source filter + Shop name search row */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Source
              </label>
              <div className="flex items-center gap-1">
                {(['ALL', 'APP', 'NON-APP'] as const).map((value) => (
                  <Button
                    key={value}
                    variant={sourceFilter === value ? 'default' : 'outline'}
                    size="sm"
                    className="h-10"
                    onClick={() => setSourceFilter(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </label>
              <div className="flex items-center gap-1">
                {([
                  { value: 'ALL', label: 'All' },
                  { value: 'CORRECT', label: 'Correct' },
                  { value: 'INCORRECT', label: 'Incorrect' },
                  { value: 'PARTIALLY_CORRECT', label: 'Partial' },
                  { value: 'NO_FEEDBACK', label: 'None' },
                ] as const).map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={feedbackFilter === value ? 'default' : 'outline'}
                    size="sm"
                    className="h-10"
                    onClick={() => setFeedbackFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Merchant Text
              </label>
              <div className="flex items-center gap-1">
                {([
                  { value: 'ALL', label: 'All' },
                  { value: 'NON_EMPTY', label: 'Has Text' },
                  { value: 'EMPTY', label: 'Empty' },
                ] as const).map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={merchantTextFilter === value ? 'default' : 'outline'}
                    size="sm"
                    className="h-10"
                    onClick={() => setMerchantTextFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2 flex-1 min-w-[200px] max-w-sm">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Shop Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shopNameSearch}
                  onChange={(e) => setShopNameSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleShopSearch(); }}
                  placeholder="Search by shop name..."
                  className="h-10 flex-1 px-3 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleShopSearch} className="h-10" disabled={!shopNameSearch.trim()}>
                  Search
                </Button>
                {isSearchMode && (
                  <Button variant="outline" className="h-10" onClick={() => { setShopNameSearch(''); setIsSearchMode(false); setCurrentPage(1); }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons + result count */}
          <div className="flex items-center gap-4">
            <Button onClick={handleApplyFilter} className="h-10">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilter} className="h-10">
              Clear
            </Button>
            {pagination && (
              <span className="text-sm text-muted-foreground">
                Showing {logs.length} of {pagination.total} results
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
              {isSearchMode
                ? `No runs found for shop "${shopNameSearch}". Try a different search term.`
                : startDate || endDate || sourceFilter !== 'ALL' || feedbackFilter !== 'ALL' || merchantTextFilter !== 'ALL'
                ? 'No runs found for the selected filters. Try adjusting your criteria.'
                : 'No pipeline runs have been recorded yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Runs List */}
      {!loading && !error && logs.length > 0 && (
        <div className="space-y-3">
          {/* Column Headers */}
          <div className="grid grid-cols-[150px_220px_80px_100px_80px_1fr_40px] items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <span>Date</span>
            <span>Shop</span>
            <span>Bundle</span>
            <span>Duration</span>
            <span>Feedback</span>
            <span>Input</span>
            <span></span>
          </div>
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              {/* Header Row - Always Visible */}
              <div
                onClick={() => toggleExpand(log.id)}
                className="grid grid-cols-[150px_220px_80px_100px_80px_1fr_40px] items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {formatDate(log.timestamp)}
                </div>
                {log.shopName ? (
                  <a
                    href={`https://${log.shopName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {log.shopName}
                  </a>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">-</span>
                )}
                {log.bundleLink ? (
                  <a
                    href={log.bundleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '-'}
                </span>
                <div>
                  {log.feedback ? (
                    <Badge variant={
                      log.feedback.rating === 'CORRECT' ? 'success' :
                      log.feedback.rating === 'INCORRECT' ? 'destructive' : 'warning'
                    } className="text-xs">
                      {log.feedback.rating === 'CORRECT' ? 'Correct' :
                       log.feedback.rating === 'INCORRECT' ? 'Incorrect' : 'Partial'}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground truncate">
                  {log.input.merchantText}
                </span>
                <div className="flex justify-end">
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
                                <Badge variant="outline" className="text-xs">
                                  {product.productType || 'empty product type'}
                                </Badge>
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

                  {/* Feedback Section */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Feedback
                    </h3>

                    {/* Existing feedback display */}
                    {log.feedback && feedbackActiveId !== log.id && (
                      <div className="flex items-start gap-3 p-3 bg-background rounded border">
                        <Badge variant={
                          log.feedback.rating === 'CORRECT' ? 'success' :
                          log.feedback.rating === 'INCORRECT' ? 'destructive' : 'warning'
                        }>
                          {log.feedback.rating === 'CORRECT' ? 'Correct' :
                           log.feedback.rating === 'INCORRECT' ? 'Incorrect' : 'Partially Correct'}
                        </Badge>
                        {log.feedback.remarks && (
                          <p className="text-sm text-muted-foreground flex-1">{log.feedback.remarks}</p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedbackSelect(log.id, log.feedback!.rating);
                            setFeedbackRemarks(log.feedback!.remarks || '');
                          }}
                          className="text-xs"
                        >
                          Update
                        </Button>
                      </div>
                    )}

                    {/* Rating buttons */}
                    {(!log.feedback || feedbackActiveId === log.id) && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {([
                            { rating: 'CORRECT' as FeedbackRating, label: 'Correct', icon: Check, color: 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' },
                            { rating: 'INCORRECT' as FeedbackRating, label: 'Incorrect', icon: X, color: 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' },
                            { rating: 'PARTIALLY_CORRECT' as FeedbackRating, label: 'Partially Correct', icon: AlertTriangle, color: 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' },
                          ]).map(({ rating, label, icon: Icon, color }) => (
                            <button
                              key={rating}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedbackSelect(log.id, rating);
                              }}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-all cursor-pointer hover:scale-105 hover:shadow-md active:scale-95',
                                color,
                                feedbackActiveId === log.id && feedbackRating === rating
                                  ? 'ring-2 ring-offset-1 ring-current opacity-100'
                                  : 'opacity-70 hover:opacity-100'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* Remarks + Submit (visible after selecting a rating) */}
                        {feedbackActiveId === log.id && feedbackRating && (
                          <div className="space-y-2">
                            <textarea
                              value={feedbackRemarks}
                              onChange={(e) => setFeedbackRemarks(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Add remarks (optional)..."
                              className="w-full p-2 text-sm border rounded bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedbackSubmit(log.id);
                                }}
                                disabled={feedbackSubmitting}
                              >
                                {feedbackSubmitting ? (
                                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</>
                                ) : (
                                  'Submit Feedback'
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFeedbackActiveId(null);
                                  setFeedbackRating(null);
                                  setFeedbackRemarks('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
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
