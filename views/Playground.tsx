import React, { useState } from 'react';
import { Play, Copy, Check, AlertCircle, Loader2, Clock, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, CodeBlock, cn } from '../components/ui';
import { PipelineResult, TraceEntry } from '../types';
import { runPipeline, parseCollections, parseProducts } from '../services/pipelineApi';

const TraceTimeline: React.FC<{ trace: TraceEntry[] }> = ({ trace }) => {
  const getBadgeVariant = (entry: TraceEntry) => {
    // LLM entries
    if (entry.name.includes('LLM')) {
      if (entry.output?.structureType === 'SINGLE_STEP') return 'success';
      if (entry.output?.structureType === 'MULTI_STEP') return 'default';
      if (entry.output?.structureType === null) return 'destructive';
      if (entry.output?.discountMode === 'PERCENTAGE') return 'default';
      if (entry.output?.discountMode === 'FIXED') return 'warning';
      if (entry.output?.discountMode === 'FIXED_BUNDLE_PRICE') return 'secondary';
      if (entry.output?.discountMode === null) return 'destructive';
      return 'outline';
    }
    // Assembly entries
    if (entry.output === 'AUTO') return 'success';
    if (entry.output === 'MANUAL') return 'destructive';
    if (entry.pattern?.includes('DEFAULT') || entry.pattern?.includes('FALLBACK')) return 'warning';
    if (entry.exceededLimit) return 'destructive';
    return 'outline';
  };

  const getDisplayValue = (entry: TraceEntry): string => {
    if (entry.durationMs !== undefined) return `${entry.durationMs}ms`;
    if (entry.pattern) return entry.pattern;
    if (entry.output !== undefined) {
      if (typeof entry.output === 'object') {
        if (entry.output.structureType !== undefined) return entry.output.structureType || 'null';
        if (entry.output.discountMode !== undefined) return entry.output.discountMode || 'null';
        return JSON.stringify(entry.output);
      }
      return String(entry.output);
    }
    return '';
  };

  const getExtraInfo = (entry: TraceEntry): string | null => {
    if (entry.stepsCount !== undefined) return `${entry.stepsCount} step(s)`;
    if (entry.categoriesCount !== undefined) return `${entry.categoriesCount} category(ies)`;
    if (entry.discountMode) return entry.discountMode;
    if (entry.hasConflict) return 'conflict detected';
    if (entry.defaultRuleApplied) return 'default rule';
    if (entry.exceededLimit) return 'exceeded limit';
    return null;
  };

  const isLLMStep = (name: string) => name.includes('LLM');

  return (
    <div className="space-y-1">
      {trace.map((entry, idx) => (
        <div
          key={entry.step}
          className={cn(
            "flex items-center gap-3 p-2 rounded-md text-sm",
            isLLMStep(entry.name) ? "bg-primary/5" : "bg-muted/30"
          )}
        >
          {/* Step number */}
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground">
            {entry.step}
          </div>

          {/* Icon */}
          {isLLMStep(entry.name) ? (
            <Zap className="w-4 h-4 text-primary" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
          )}

          {/* Name */}
          <span className={cn("font-medium", isLLMStep(entry.name) && "text-primary")}>
            {entry.name}
          </span>

          {/* Duration for LLM calls */}
          {entry.durationMs !== undefined && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {entry.durationMs}ms
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Extra info */}
          {getExtraInfo(entry) && (
            <span className="text-xs text-muted-foreground">{getExtraInfo(entry)}</span>
          )}

          {/* Badge */}
          {(entry.pattern || entry.output !== undefined) && (
            <Badge variant={getBadgeVariant(entry)} className="text-xs">
              {getDisplayValue(entry)}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

const Playground: React.FC = () => {
  const [merchantText, setMerchantText] = useState('');
  const [collectionsInput, setCollectionsInput] = useState('');
  const [productsInput, setProductsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!merchantText.trim()) {
      setError('Please enter a merchant query');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runPipeline({
        merchantText: merchantText.trim(),
        collections: parseCollections(collectionsInput),
        products: parseProducts(productsInput),
      });
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    if (!result) return { text: 'N/A', variant: 'outline' as const };
    if (result.status === 'AUTO') return { text: 'AUTO', variant: 'success' as const };
    if (result.status === 'DOWNGRADED_TO_MANUAL') return { text: 'DOWNGRADED', variant: 'warning' as const };
    return { text: 'MANUAL', variant: 'destructive' as const };
  };

  const getTotalDuration = () => {
    if (!result?._trace) return null;
    const llmEntries = result._trace.filter(e => e.durationMs !== undefined);
    const total = llmEntries.reduce((sum, e) => sum + (e.durationMs || 0), 0);
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
        <p className="text-muted-foreground">Test merchant queries against the live pipeline</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Query Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Merchant Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Merchant Query</label>
            <textarea
              value={merchantText}
              onChange={(e) => setMerchantText(e.target.value)}
              placeholder="Enter your bundle description, e.g., 'Buy 3 items get 10% off, buy 5 get 20% off'"
              className="w-full h-32 px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Collections & Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collections (Optional)</label>
              <input
                type="text"
                value={collectionsInput}
                onChange={(e) => setCollectionsInput(e.target.value)}
                placeholder="Shirts, Pants, Hats"
                className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Comma-separated collection titles</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Products (Optional)</label>
              <input
                type="text"
                value={productsInput}
                onChange={(e) => setProductsInput(e.target.value)}
                placeholder="T-Shirt, Jeans, Cap"
                className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Comma-separated product types</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !merchantText.trim()}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Pipeline
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Status Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadge().variant} className="mt-1">
                      {getStatusBadge().text}
                    </Badge>
                  </div>
                  {getTotalDuration() !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">LLM Time</p>
                      <p className="font-mono text-sm mt-1">{getTotalDuration()}ms</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Steps</p>
                    <p className="font-mono text-sm mt-1">{result._trace?.length || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Trace */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Trace</CardTitle>
            </CardHeader>
            <CardContent>
              {result._trace ? (
                <TraceTimeline trace={result._trace} />
              ) : (
                <p className="text-muted-foreground text-sm">No trace available</p>
              )}
            </CardContent>
          </Card>

          {/* Final Result */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Final Result</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy JSON
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <CodeBlock code={result.bundleConfig} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Playground;
