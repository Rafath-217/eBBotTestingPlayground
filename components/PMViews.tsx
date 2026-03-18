import React from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { cn } from './ui';

// PM-friendly Discounts Panel
export const PMDiscountsPanel: React.FC<{ config: any }> = ({ config }) => {
  const discountConfig = config?.discountConfiguration;
  const isEnabled = discountConfig?.isDiscountEnabled ?? false;
  const discountMode = discountConfig?.discountMode || 'None';
  const rules = discountConfig?.rules || [];

  const getDiscountSymbol = () => {
    if (discountMode === 'PERCENTAGE') return '%';
    if (discountMode === 'FIXED' || discountMode === 'FIXED_BUNDLE_PRICE') return '$';
    return '';
  };

  const getQualifierLabel = (rule: any) => {
    if (rule.type === 'quantity') return 'Quantity';
    if (rule.type === 'amount') return 'Cart Amount';
    return rule.type || 'Unknown';
  };

  const getModeLabel = () => {
    if (discountMode === 'PERCENTAGE') return 'Percentage Off';
    if (discountMode === 'FIXED') return 'Fixed Amount Off';
    if (discountMode === 'FIXED_BUNDLE_PRICE') return 'Fixed Bundle Price';
    if (discountMode === 'BXGY') return 'Buy X Get Y';
    return 'None';
  };

  // BXGY-specific layout
  if (discountMode === 'BXGY') {
    return (
      <div className="border rounded-lg bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Discounts</h3>
            <div className={cn(
              "w-10 h-6 rounded-full relative transition-colors",
              isEnabled ? "bg-primary" : "bg-muted"
            )}>
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                isEnabled ? "translate-x-5" : "translate-x-1"
              )} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Buy X Get Y discount configuration</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Discount Type</label>
            <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm">{getModeLabel()}</div>
          </div>
          {rules.length > 0 ? (
            <div className="space-y-3">
              {rules.map((rule: any, idx: number) => (
                <div key={idx} className="border rounded-md p-3 bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rule #{idx + 1}</span>
                    {rule.discountCodePrefix && (
                      <span className="text-[10px] font-mono text-muted-foreground border rounded px-1.5 py-0.5">{rule.discountCodePrefix}</span>
                    )}
                  </div>
                  {/* Customer Buys */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Customer Buys</label>
                    <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">Min {rule.type || 'quantity'} of items</span>
                      <span className="font-semibold">{rule.buyQty || rule.value}</span>
                    </div>
                  </div>
                  {/* Customer Gets */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Customer Gets</label>
                    <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-semibold">{rule.getQty}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">Customer must add the quantity of items specified above to their cart.</p>
                  </div>
                  {/* Discount Details */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Discount Details</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">Value</p>
                        <p className="text-sm font-semibold">{rule.discountValue}</p>
                      </div>
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">Type</p>
                        <p className="text-sm font-semibold">% off</p>
                      </div>
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">Apply to</p>
                        <p className="text-sm font-semibold text-[11px]">Lowest priced</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-md p-6 text-center text-muted-foreground text-sm">
              No discount rules configured
            </div>
          )}
          <button className="w-full py-2 border-2 border-dashed rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 cursor-default">
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Discounts</h3>
          <div className={cn(
            "w-10 h-6 rounded-full relative transition-colors",
            isEnabled ? "bg-primary" : "bg-muted"
          )}>
            <div className={cn(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
              isEnabled ? "translate-x-5" : "translate-x-1"
            )} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Configure discount rules for this bundle</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Discount Type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Discount Type</label>
          <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm">{getModeLabel()}</div>
        </div>

        {/* Rules */}
        {rules.length > 0 ? (
          <div className="space-y-3">
            {rules.map((rule: any, idx: number) => (
              <div key={idx} className="border rounded-md p-3 bg-background">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Rule #{idx + 1}</span>
                  <button className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Qualifier</label>
                    <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm">
                      {getQualifierLabel(rule)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Threshold</label>
                    <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm">
                      {rule.type === 'amount' ? `$${rule.value}` : `${rule.value} items`}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Discount Value</label>
                    <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm flex items-center justify-between">
                      <span>{rule.discountValue}</span>
                      <span className="text-muted-foreground">{getDiscountSymbol()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-md p-6 text-center text-muted-foreground text-sm">
            No discount rules configured
          </div>
        )}

        {/* Add Rule Button (visual only) */}
        <button className="w-full py-2 border-2 border-dashed rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 cursor-default">
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>
    </div>
  );
};

// PM-friendly Rules Panel
export const PMRulesPanel: React.FC<{ steps: any[] }> = ({ steps }) => {
  const getConditionLabel = (condition: string) => {
    if (condition === 'greaterThanOrEqualTo') return 'At least';
    if (condition === 'lessThanOrEqualTo') return 'At most';
    if (condition === 'equalTo') return 'Exactly';
    return condition;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'quantity') return 'Quantity';
    if (type === 'amount') return 'Amount';
    return type;
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Selection Rules</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define conditions customers must meet to complete the bundle.
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {steps.map((step, stepIdx) => (
          <div key={stepIdx} className="space-y-3">
            {steps.length > 1 && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ChevronRight className="w-4 h-4" />
                Step {stepIdx + 1}: {step.label || 'Select Items'}
              </div>
            )}

            {/* Categories in this step */}
            {step.categories?.length > 0 && (
              <div className="pl-4 border-l-2 border-muted space-y-2">
                <p className="text-xs text-muted-foreground">Categories:</p>
                {step.categories.map((cat: any, catIdx: number) => (
                  <div key={catIdx} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/20" />
                    <span>{cat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Rules for this step */}
            {step.conditions?.isEnabled && step.conditions?.rules?.length > 0 ? (
              <div className="space-y-2">
                {step.conditions.rules.map((rule: any, ruleIdx: number) => (
                  <div key={ruleIdx} className="border rounded-md p-3 bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        {steps.length > 1 ? `Step ${stepIdx + 1} - Rule ${ruleIdx + 1}` : `Rule #${ruleIdx + 1}`}
                      </span>
                      <button className="text-muted-foreground hover:text-destructive cursor-default">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Type</label>
                        <div className="px-2 py-1.5 rounded border bg-muted/50 text-sm">
                          {getTypeLabel(rule.type)}
                        </div>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">Condition</label>
                        <div className="px-2 py-1.5 rounded border bg-muted/50 text-sm">
                          {getConditionLabel(rule.condition)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Value</label>
                      <div className="px-3 py-2 rounded border bg-muted/50 text-sm">
                        {rule.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground text-sm">
                No rules - any quantity allowed
              </div>
            )}

            {stepIdx < steps.length - 1 && <hr className="my-4" />}
          </div>
        ))}

        {/* Add Rule Button (visual only) */}
        <button className="w-full py-2 border-2 border-dashed rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 cursor-default">
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>
    </div>
  );
};

// PM-friendly Steps/Structure Panel
export const PMStepsPanel: React.FC<{ steps: any[] }> = ({ steps }) => {
  const isMultiStep = steps.length > 1;

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Bundle Structure</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isMultiStep
            ? `Multi-step bundle with ${steps.length} sequential selections`
            : 'Single-step bundle - customers select from one pool'}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="border rounded-md p-4 bg-background">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                {idx + 1}
              </div>
              <div>
                <p className="font-medium">{step.label || `Step ${idx + 1}`}</p>
                <p className="text-xs text-muted-foreground">
                  {step.categories?.length || 0} category(ies)
                </p>
              </div>
            </div>

            {step.categories?.map((cat: any, catIdx: number) => (
              <div key={catIdx} className="ml-11 py-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{cat.label}</span>
                  {cat._source === 'collectionSplit' ? (
                    <span className="text-xs text-muted-foreground">(Split from {cat._splitFromCollection || 'collection'})</span>
                  ) : cat.collectionId ? (
                    <span className="text-xs text-muted-foreground">(Collection)</span>
                  ) : null}
                  {cat.productIds && (
                    <span className="text-xs text-muted-foreground">({cat.productIds.length} product{cat.productIds.length !== 1 ? 's' : ''})</span>
                  )}
                </div>
                {cat._source === 'collectionSplit' && cat.enrichedProducts?.length > 0 && (
                  <div className="ml-4 mt-1.5 space-y-1">
                    {cat.enrichedProducts.map((ep: any, epIdx: number) => (
                      <div key={epIdx} className="flex items-center gap-2 text-xs bg-muted/40 rounded px-2 py-1.5">
                        {ep.images?.[0]?.originalSrc ? (
                          <img src={ep.images[0].originalSrc} alt={ep.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{ep.title}</p>
                          <p className="text-muted-foreground">{ep.variants?.length || 0} variant{(ep.variants?.length || 0) !== 1 ? 's' : ''} · ${ep.variants?.[0]?.price || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Decision Trace Panel — renders reasoning for each LLM stage
export const DecisionTracePanel: React.FC<{ assembledResult: any }> = ({ assembledResult }) => {
  const trace = assembledResult?.decision_trace;
  const flags = assembledResult?.flags;
  const status = assembledResult?.status;

  if (!trace) return null;

  const stages = [
    { key: 'structure', label: 'Structure', color: 'blue' },
    { key: 'discount', label: 'Discount', color: 'green' },
    { key: 'rules', label: 'Rules', color: 'purple' },
  ] as const;

  const colorMap: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300', dot: 'bg-green-500' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  };

  const activeFlags = flags ? Object.entries(flags).filter(([, v]) => v).map(([k]) => k) : [];

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Decision Trace</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How each LLM output was interpreted and assembled</p>
        </div>
        {status && (
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold',
            status === 'AUTO'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
          )}>
            {status}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        {stages.map(({ key, label, color }) => {
          const entry = trace[key];
          if (!entry) return null;
          const c = colorMap[color];
          return (
            <div key={key} className={cn('rounded-lg border p-3 space-y-2', c.bg, c.border)}>
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', c.dot)} />
                <span className="text-sm font-semibold">{label}</span>
                <span className={cn('px-2 py-0.5 rounded text-[11px] font-mono font-medium', c.badge)}>
                  {entry.pattern}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{entry.reason}</p>
              {entry.llmReasoning && (
                <div className="pl-4 border-l-2 border-current/10">
                  <p className="text-xs text-muted-foreground italic leading-relaxed">{entry.llmReasoning}</p>
                </div>
              )}
            </div>
          );
        })}

        {trace.fallbacks_used?.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">Fallbacks Used</p>
            <ul className="list-disc list-inside text-sm text-amber-600 dark:text-amber-400 space-y-0.5">
              {trace.fallbacks_used.map((fb: string, i: number) => <li key={i}>{fb}</li>)}
            </ul>
          </div>
        )}

        {activeFlags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeFlags.map((flag) => (
              <span key={flag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Combined PM Result View (3-column layout)
export const PMResultView: React.FC<{ config: any }> = ({ config }) => {
  const steps = config?.steps || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <PMStepsPanel steps={steps} />
      <PMDiscountsPanel config={config} />
      <PMRulesPanel steps={steps} />
    </div>
  );
};
