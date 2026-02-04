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
          <div className="w-full px-3 py-2 rounded-md border bg-muted/50 text-sm">
            {discountMode === 'PERCENTAGE' && 'Percentage Off'}
            {discountMode === 'FIXED' && 'Fixed Amount Off'}
            {discountMode === 'FIXED_BUNDLE_PRICE' && 'Fixed Bundle Price'}
            {!discountMode && 'None'}
          </div>
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
              <div key={catIdx} className="ml-11 flex items-center gap-2 text-sm py-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span>{cat.label}</span>
                {cat.collectionId && (
                  <span className="text-xs text-muted-foreground">(Collection)</span>
                )}
                {cat.productIds && (
                  <span className="text-xs text-muted-foreground">({cat.productIds.length} products)</span>
                )}
              </div>
            ))}
          </div>
        ))}
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
