import React from 'react';
import { EnrichedResult } from '../services/dataService';
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, CodeBlock, Button, CategoryBadge, StyleBadge, StatusBadge, cn } from './ui';
import { ChevronDown, ChevronUp, Filter, X, CheckCircle, XCircle } from 'lucide-react';
import { Category, Style } from '../types';
import { ViewMode } from './Layout';

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

interface ResultsTableProps {
  results: EnrichedResult[];
  viewMode: ViewMode;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, viewMode }) => {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<FilterState>({
    category: '',
    style: '',
    status: '',
  });

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', style: '', status: '' });
  };

  const hasActiveFilters = filters.category || filters.style || filters.status;

  // Apply filters
  const filteredResults = results.filter(({ testCase, result }) => {
    if (filters.category && testCase.category !== filters.category) return false;
    if (filters.style && testCase.style !== filters.style) return false;
    if (filters.status && result.status !== filters.status) return false;
    return true;
  });

  const categories = Object.values(Category);
  const styles = Object.values(Style);
  const statuses = ['PASS', 'FAIL'];

  return (
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
          options={statuses}
          onChange={(v) => updateFilter('status', v)}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredResults.length} of {results.length} results
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
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
            filteredResults.map(({ testCase, result }) => (
              <React.Fragment key={result.id}>
                <TableRow
                  onClick={() => toggleRow(result.id)}
                  className={result.status === 'FAIL' ? 'bg-red-50 dark:bg-red-950/10' : ''}
                >
                  <TableCell className="font-mono text-xs">{testCase.id}</TableCell>
                  <TableCell>
                    <CategoryBadge category={testCase.category} minimal />
                  </TableCell>
                  <TableCell>
                    <StyleBadge style={testCase.style} minimal />
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                    {testCase.input}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={result.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedRow === result.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRow === result.id && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={6} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold mb-2">Merchant Text</h4>
                            <div className="p-3 bg-background rounded border text-sm italic">
                              "{testCase.input}"
                            </div>
                          </div>
                          {testCase.collections && testCase.collections.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold mb-2">Collections</h4>
                              <div className="p-3 bg-background rounded border text-xs font-mono">
                                {testCase.collections.map((col: any, i: number) => (
                                  <div key={i} className="mb-1">
                                    <span className="text-blue-600 dark:text-blue-400">{col.title}</span>
                                    <span className="text-muted-foreground ml-2">({col.handle})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {testCase.products && testCase.products.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold mb-2">Products</h4>
                              <div className="p-3 bg-background rounded border text-xs font-mono">
                                {testCase.products.map((prod: any, i: number) => (
                                  <div key={i} className="mb-1">
                                    <span className="text-green-600 dark:text-green-400">{prod.title}</span>
                                    <span className="text-muted-foreground ml-2">({prod.productType})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {testCase.adversarialType !== 'NONE' && (
                            <div>
                               <Badge variant="warning">{testCase.adversarialType}</Badge>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {viewMode === 'dev' ? (
                            <>
                              <CodeBlock label="Expected Output" code={result.llmType === 'structure' ? testCase.expectedStructure : result.llmType === 'discount' ? testCase.expectedDiscount : testCase.expectedRules} />
                              <CodeBlock label="Actual Output" code={result.actual} />
                            </>
                          ) : (
                            <>
                              {result.llmType === 'structure' && (
                                <>
                                  <PMStructureView data={testCase.expectedStructure} label="Expected" />
                                  <PMStructureView data={result.actual} label="Actual" />
                                </>
                              )}
                              {result.llmType === 'discount' && (
                                <>
                                  <PMDiscountView data={testCase.expectedDiscount} label="Expected" />
                                  <PMDiscountView data={result.actual} label="Actual" />
                                </>
                              )}
                              {result.llmType === 'rules' && (
                                <>
                                  <PMRulesView data={testCase.expectedRules} label="Expected" />
                                  <PMRulesView data={result.actual} label="Actual" />
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
