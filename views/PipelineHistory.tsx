import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar, Package, Tag, Search, Filter, MessageSquare, Check, X, AlertTriangle, ExternalLink, Brain, Play, FileEdit, Copy, Maximize2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn } from '../components/ui';
import { ViewMode } from '../components/Layout';
import { PMResultView, PMDiscountsPanel, PMRulesPanel, PMStepsPanel } from '../components/PMViews';
import { PipelineHistoryLog, PipelineHistoryPagination, FeedbackRating, PipelineResult } from '../types';
import { getPipelineHistory, searchPipelineHistory, submitFeedback, updateSpec, getPatternTags, getShopifyPlans } from '../services/pipelineHistoryApi';
import { rerunPipeline } from '../services/pipelineApi';

interface PipelineHistoryProps {
  viewMode: ViewMode;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="flex-shrink-0 opacity-0 group-hover/shop:opacity-60 hover:!opacity-100 transition-opacity"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

const JsonCopyButton: React.FC<{ data: any }> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy JSON"
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>}
    </button>
  );
};

const OutputModal: React.FC<{
  title: string;
  data: any;
  config: any;
  viewMode: ViewMode;
  status?: string;
  borderColor?: string;
  onClose: () => void;
}> = ({ title, data, config, viewMode, status, borderColor = 'border-slate-300 dark:border-slate-600', onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={cn("relative bg-card rounded-xl border-2 shadow-2xl w-[90vw] max-w-5xl max-h-[85vh] flex flex-col", borderColor)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
            {status && (
              <Badge variant={status === 'AUTO' ? 'success' : 'destructive'}>{status}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <JsonCopyButton data={data} />
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'pm' ? (
            <PMResultView config={config} />
          ) : (
            <CodeBlock label="" code={data} />
          )}
        </div>
      </div>
    </div>
  );
};

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
  const isEnabled = config.isDiscountEnabled;

  const getModeVariant = (): string => {
    if (discountMode === 'PERCENTAGE') return 'success';
    if (discountMode === 'FIXED') return 'blue';
    if (discountMode === 'FIXED_BUNDLE_PRICE') return 'purple';
    if (discountMode === 'BXGY') return 'warning';
    return 'destructive';
  };

  const getModeLabel = () => {
    if (discountMode === 'BXGY') return 'Buy X Get Y';
    return discountMode || 'null';
  };

  // BXGY-specific rendering
  if (discountMode === 'BXGY' && rules.length > 0) {
    return (
      <div className="border rounded-lg bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Discount Mode</h4>
          <div className="flex items-center gap-2">
            {isEnabled !== undefined && (
              <Badge variant={isEnabled ? 'success' : 'outline'}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            )}
            <Badge variant={getModeVariant() as any}>{getModeLabel()}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {rules.map((rule: any, idx: number) => (
            <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule #{idx + 1}</p>
                {rule.discountCodePrefix && (
                  <Badge variant="outline" className="text-[10px] font-mono">{rule.discountCodePrefix}</Badge>
                )}
              </div>

              {/* Customer Buys */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer Buys</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    <span className="text-xs text-muted-foreground">Min {rule.type || 'quantity'} of items</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.buyQty || rule.value}</span>
                  </div>
                </div>
              </div>

              {/* Customer Gets */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer Gets</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    <span className="text-xs text-muted-foreground">Quantity</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.getQty}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground italic">Customer must add the quantity of items specified above to their cart.</p>
              </div>

              {/* Discount Details */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Discount Details</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Value</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.discountValue}</p>
                  </div>
                  <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Type</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{Number(rule.discountValue) === 100 ? '% off' : '% off'}</p>
                  </div>
                  <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Apply to</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-[11px]">Lowest priced</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default rendering for PERCENTAGE / FIXED / FIXED_BUNDLE_PRICE
  return (
    <div className="border rounded-lg bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Discount Mode</h4>
        <div className="flex items-center gap-2">
          {isEnabled !== undefined && (
            <Badge variant={isEnabled ? 'success' : 'outline'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          )}
          <Badge variant={getModeVariant() as any}>
            {getModeLabel()}
          </Badge>
        </div>
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

  // Pattern tags filter
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [shopifyPlanFilter, setShopifyPlanFilter] = useState<string>('ALL');
  const [availablePlans, setAvailablePlans] = useState<string[]>([]);
  const [productCountFilter, setProductCountFilter] = useState<string>('ALL');
  const [collectionCountFilter, setCollectionCountFilter] = useState<string>('ALL');
  const [uniqueStores, setUniqueStores] = useState(false);
  const [patternDropdownOpen, setPatternDropdownOpen] = useState(false);

  // Shop name search mode (server-side)
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Reasoning section collapse state
  const [reasoningOpenId, setReasoningOpenId] = useState<string | null>(null);

  // Feedback state
  const [feedbackActiveId, setFeedbackActiveId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | null>(null);
  const [feedbackRemarks, setFeedbackRemarks] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Copy summary state
  const [copiedSummaryId, setCopiedSummaryId] = useState<string | null>(null);

  // Update Spec state
  const [specActiveId, setSpecActiveId] = useState<string | null>(null);
  const [specText, setSpecText] = useState('');
  const [specSubmitting, setSpecSubmitting] = useState(false);
  const [specSuccess, setSpecSuccess] = useState<string | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);

  // Re-run state
  const [rerunningId, setRerunningId] = useState<string | null>(null);
  const [rerunResults, setRerunResults] = useState<Record<string, any>>({});
  const [rerunErrors, setRerunErrors] = useState<Record<string, string>>({});

  // Output modal state
  const [modalData, setModalData] = useState<{ title: string; data: any; config: any; status?: string; borderColor?: string } | null>(null);

  const handleRerun = async (log: PipelineHistoryLog) => {
    setRerunningId(log.id);
    setRerunErrors((prev) => { const next = { ...prev }; delete next[log.id]; return next; });
    try {
      const response = await rerunPipeline(log.id);
      setRerunResults((prev) => ({ ...prev, [log.id]: response.data }));
    } catch (err: any) {
      setRerunErrors((prev) => ({ ...prev, [log.id]: err.message || 'Pipeline run failed' }));
    } finally {
      setRerunningId(null);
    }
  };

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

  const handleSpecSubmit = async (logId: string) => {
    if (!specText.trim()) return;
    setSpecSubmitting(true);
    setSpecError(null);
    try {
      await updateSpec(logId, specText.trim());
      setSpecSuccess(logId);
      setTimeout(() => setSpecSuccess(null), 3000);
      setSpecActiveId(null);
      setSpecText('');
    } catch (err: any) {
      console.error('Failed to update spec:', err);
      setSpecError(err?.message || 'Failed to update spec');
    } finally {
      setSpecSubmitting(false);
    }
  };

  // Fetch available pattern tags and shopify plans on mount
  useEffect(() => {
    getPatternTags().then(setAvailableTags).catch(() => {});
    getShopifyPlans().then(setAvailablePlans).catch(() => {});
  }, []);

  // Group tags by prefix for display (exclude product_count / collection_count — they have dedicated dropdowns)
  const groupedTags = availableTags.filter((tag) => !tag.startsWith('product_count:') && !tag.startsWith('collection_count:')).reduce<Record<string, string[]>>((acc, tag) => {
    const [prefix] = tag.split(':');
    const group = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    if (!acc[group]) acc[group] = [];
    acc[group].push(tag);
    return acc;
  }, {});

  const formatTagLabel = (tag: string) => {
    const [, ...rest] = tag.split(':');
    return rest.join(':').replace(/_/g, ' ');
  };

  const togglePattern = (tag: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const PRODUCT_COUNT_OPTIONS = [
    { label: 'All', value: 'ALL' },
    { label: '0 (no products)', value: 'product_count:0' },
    { label: '1', value: 'product_count:1' },
    { label: '2', value: 'product_count:2' },
    { label: '3', value: 'product_count:3' },
    { label: '4', value: 'product_count:4' },
    { label: '5', value: 'product_count:5' },
    { label: '6\u201310', value: 'product_count:6-10' },
    { label: '11\u201315', value: 'product_count:11-15' },
    { label: '15+', value: 'product_count:gt15' },
  ];

  const COLLECTION_COUNT_OPTIONS = [
    { label: 'All', value: 'ALL' },
    { label: '0 (no collections)', value: 'collection_count:0' },
    { label: '1', value: 'collection_count:1' },
    { label: '2', value: 'collection_count:2' },
    { label: '3', value: 'collection_count:3' },
    { label: '4', value: 'collection_count:4' },
    { label: '5', value: 'collection_count:5' },
    { label: '6\u201310', value: 'collection_count:6-10' },
    { label: '11\u201315', value: 'collection_count:11-15' },
    { label: '15+', value: 'collection_count:gt15' },
  ];

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
        const allPatterns = [...selectedPatterns];
        if (productCountFilter !== 'ALL') allPatterns.push(productCountFilter);
        if (collectionCountFilter !== 'ALL') allPatterns.push(collectionCountFilter);

        response = await getPipelineHistory({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
          limit,
          source: sourceFilter,
          feedback: feedbackFilter,
          merchantText: merchantTextFilter,
          patterns: allPatterns.length > 0 ? allPatterns : undefined,
          shopifyPlanName: shopifyPlanFilter !== 'ALL' ? shopifyPlanFilter : undefined,
          uniqueStores: uniqueStores || undefined,
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
    setSelectedPatterns([]);
    setShopifyPlanFilter('ALL');
    setProductCountFilter('ALL');
    setCollectionCountFilter('ALL');
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
            {availablePlans.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Shopify Plan
                </label>
                <select
                  value={shopifyPlanFilter}
                  onChange={(e) => setShopifyPlanFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ALL">All Plans</option>
                  {availablePlans.map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Count
              </label>
              <select
                value={productCountFilter}
                onChange={(e) => setProductCountFilter(e.target.value)}
                className="h-10 px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PRODUCT_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Collection Count
              </label>
              <select
                value={collectionCountFilter}
                onChange={(e) => setCollectionCountFilter(e.target.value)}
                className="h-10 px-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {COLLECTION_COUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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

          {/* Pattern Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Pattern Tags
                {selectedPatterns.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {selectedPatterns.length}
                  </Badge>
                )}
              </label>
              <div className="relative">
                <button
                  onClick={() => setPatternDropdownOpen(!patternDropdownOpen)}
                  className="h-10 px-3 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2 min-w-[200px] text-sm"
                >
                  <span className="flex-1 text-left truncate">
                    {selectedPatterns.length === 0
                      ? 'Select patterns...'
                      : `${selectedPatterns.length} tag${selectedPatterns.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', patternDropdownOpen && 'rotate-180')} />
                </button>

                {patternDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setPatternDropdownOpen(false)} />
                    <div className="absolute z-20 mt-1 w-72 max-h-80 overflow-y-auto rounded-md border bg-background shadow-lg">
                      {selectedPatterns.length > 0 && (
                        <button
                          onClick={() => setSelectedPatterns([])}
                          className="w-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted text-left border-b"
                        >
                          Clear all
                        </button>
                      )}
                      {Object.entries(groupedTags).map(([group, tags]) => (
                        <div key={group}>
                          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 sticky top-0">
                            {group}
                          </div>
                          {tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => togglePattern(tag)}
                              className={cn(
                                'w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 transition-colors',
                                selectedPatterns.includes(tag) && 'bg-primary/10'
                              )}
                            >
                              <div className={cn(
                                'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                                selectedPatterns.includes(tag)
                                  ? 'bg-primary border-primary'
                                  : 'border-muted-foreground/30'
                              )}>
                                {selectedPatterns.includes(tag) && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                              {formatTagLabel(tag)}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Selected tags chips */}
              {selectedPatterns.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatterns.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => togglePattern(tag)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-destructive/20 transition-colors"
                    >
                      {tag}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Unique stores toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uniqueStores}
              onChange={(e) => setUniqueStores(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm font-medium">Unique stores only</span>
            <span className="text-xs text-muted-foreground">(latest run per store)</span>
          </label>

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
                : startDate || endDate || sourceFilter !== 'ALL' || feedbackFilter !== 'ALL' || merchantTextFilter !== 'ALL' || selectedPatterns.length > 0
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
          <div className="grid grid-cols-[140px_180px_90px_80px_70px_80px_80px_80px_1fr_40px] items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
            <span>Date</span>
            <span>Shop</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Bundle</span>
            <span>Duration</span>
            <span>Feedback</span>
            <span>Installed</span>
            <span>Input</span>
            <span></span>
          </div>
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              {/* Header Row - Always Visible */}
              <div
                onClick={() => toggleExpand(log.id)}
                className="grid grid-cols-[140px_180px_90px_80px_70px_80px_80px_80px_1fr_40px] items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {formatDate(log.timestamp)}
                </div>
                {log.shopName ? (
                  <div className="flex items-center gap-1 group/shop">
                    <a
                      href={`https://${log.shopName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {log.shopName}
                    </a>
                    <CopyButton text={log.shopName} />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">-</span>
                )}
                <span className="text-xs text-muted-foreground truncate">{log.shopifyPlanName || '-'}</span>
                <div>
                  {log.isChurned === true ? (
                    <Badge variant="destructive" className="text-[10px]">Uninstalled</Badge>
                  ) : log.isChurned === false ? (
                    <Badge variant="success" className="text-[10px]">Installed</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
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
                <div>
                  {log.isAppInstalled === true ? (
                    <Badge variant="success" className="text-[10px]">Yes</Badge>
                  ) : log.isAppInstalled === false ? (
                    <Badge variant="destructive" className="text-[10px]">No</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-muted-foreground truncate">
                    {log.input.merchantText}
                  </span>
                  {/* Pattern tags hidden for now — too noisy on each row
                  {log.patternTags && log.patternTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {log.patternTags.map((tag) => {
                        const [prefix] = tag.split(':');
                        const colorMap: Record<string, string> = {
                          structure: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                          discount: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                          rules: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                          input: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                          pipeline: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                        };
                        return (
                          <span
                            key={tag}
                            className={cn(
                              'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
                              colorMap[prefix] || 'bg-muted text-muted-foreground'
                            )}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  */}
                </div>
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

                  {/* Run Summary */}
                  {(log as any).runSummary && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Run Summary</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText((log as any).runSummary);
                            setCopiedSummaryId(log.id);
                            setTimeout(() => setCopiedSummaryId(null), 2000);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {copiedSummaryId === log.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border rounded text-sm leading-relaxed whitespace-pre-wrap">
                        {(log as any).runSummary}
                      </div>
                    </div>
                  )}

                  {/* Output Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Output</h3>

                    {viewMode === 'pm' ? (
                      /* PM Mode - Visual Cards */
                      <div className="space-y-6">
                        {/* Individual LLM Outputs — hidden for now, only showing assembled
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
                        */}

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
                      <div className="space-y-4">
                        {/* Individual LLM Outputs — hidden for now, only showing assembled
                        <div className="space-y-4">
                          <CodeBlock label="Structure LLM Output" code={log.output.structureLLM} />
                          <CodeBlock label="Discount LLM Output" code={log.output.discountLLM} />
                          <CodeBlock label="Rules LLM Output" code={log.output.rulesLLM} />
                        </div>
                        */}

                        <CodeBlock label="Assembled Result" code={log.output.assembledResult} />
                        {log.output.aiPayload && (
                          <CodeBlock label="AI Payload" code={log.output.aiPayload} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─── Re-run with Current Pipeline ─── */}
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={rerunningId === log.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRerun(log);
                          }}
                          className="flex items-center gap-2"
                        >
                          {rerunningId === log.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                          ) : (
                            <><Play className="w-3.5 h-3.5" /> Re-run with Current Pipeline</>
                          )}
                        </Button>
                      </div>

                    {rerunErrors[log.id] && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {rerunErrors[log.id]}
                      </div>
                    )}

                    {rerunResults[log.id] && (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {/* Original Result */}
                        <div className="rounded-lg border-2 border-slate-300 dark:border-slate-600 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Original Pipeline Output</span>
                            <div className="flex items-center gap-2">
                              <JsonCopyButton data={log.output.assembledResult} />
                              <button
                                onClick={(e) => { e.stopPropagation(); setModalData({ title: 'Original Pipeline Output', data: log.output.assembledResult, config: log.output.assembledResult?.bundleConfig || log.output.assembledResult }); }}
                                title="Expand"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            {viewMode === 'pm' ? (
                              <PMResultView config={log.output.assembledResult?.bundleConfig || log.output.assembledResult} />
                            ) : (
                              <CodeBlock label="" code={log.output.assembledResult} />
                            )}
                          </div>
                        </div>

                        {/* New Result */}
                        <div className="rounded-lg border-2 border-blue-400 dark:border-blue-500 overflow-hidden">
                          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-400 dark:border-blue-500 flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Current Pipeline Output</span>
                              {rerunResults[log.id].status && (
                                <Badge className="ml-2" variant={rerunResults[log.id].status === 'AUTO' ? 'success' : 'destructive'}>
                                  {rerunResults[log.id].status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <JsonCopyButton data={rerunResults[log.id]} />
                              <button
                                onClick={(e) => { e.stopPropagation(); setModalData({ title: 'Current Pipeline Output', data: rerunResults[log.id], config: rerunResults[log.id].bundleConfig || rerunResults[log.id], status: rerunResults[log.id].status, borderColor: 'border-blue-400 dark:border-blue-500' }); }}
                                title="Expand"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            {viewMode === 'pm' ? (
                              <PMResultView config={rerunResults[log.id].bundleConfig || rerunResults[log.id]} />
                            ) : (
                              <CodeBlock label="" code={rerunResults[log.id]} />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LLM Reasoning & Decision Summary (collapsible) */}
                  {((log as any).llmReasoning || (log as any).decisionSummary) && (
                    <div className="border-t pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReasoningOpenId(reasoningOpenId === log.id ? null : log.id);
                        }}
                        className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground tracking-wider hover:text-foreground transition-colors w-full"
                      >
                        <Brain className="w-4 h-4" />
                        LLM Reasoning & Decision Summary
                        {reasoningOpenId === log.id ? (
                          <ChevronUp className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        )}
                      </button>

                      {reasoningOpenId === log.id && (
                        <div className="mt-3 space-y-4">
                          {(log as any).decisionSummary && (
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block font-medium">Decision Summary</label>
                              {typeof (log as any).decisionSummary === 'string' ? (
                                <div className="p-3 bg-background rounded border text-sm whitespace-pre-wrap">
                                  {(log as any).decisionSummary}
                                </div>
                              ) : (
                                <CodeBlock label="" code={(log as any).decisionSummary} />
                              )}
                            </div>
                          )}
                          {(log as any).llmReasoning && (
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block font-medium">LLM Reasoning</label>
                              {typeof (log as any).llmReasoning === 'string' ? (
                                <div className="p-3 bg-background rounded border text-sm whitespace-pre-wrap">
                                  {(log as any).llmReasoning}
                                </div>
                              ) : (
                                <CodeBlock label="" code={(log as any).llmReasoning} />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* Update Spec Section */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                      <FileEdit className="w-4 h-4" />
                      Update Spec
                    </h3>

                    {specSuccess === log.id && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
                        <Check className="w-4 h-4" /> Spec updated successfully
                      </div>
                    )}

                    {specActiveId !== log.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpecActiveId(log.id);
                          setSpecText('');
                          setSpecError(null);
                        }}
                      >
                        <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                        Update Spec
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          value={specText}
                          onChange={(e) => setSpecText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Enter spec update..."
                          className="w-full p-2 text-sm border rounded bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                          rows={4}
                        />
                        {specError && (
                          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {specError}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpecSubmit(log.id);
                            }}
                            disabled={specSubmitting || !specText.trim()}
                          >
                            {specSubmitting ? (
                              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</>
                            ) : (
                              'Submit'
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSpecActiveId(null);
                              setSpecText('');
                              setSpecError(null);
                            }}
                          >
                            Cancel
                          </Button>
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
      {modalData && (
        <OutputModal
          title={modalData.title}
          data={modalData.data}
          config={modalData.config}
          viewMode={viewMode}
          status={modalData.status}
          borderColor={modalData.borderColor}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
};

export default PipelineHistory;
