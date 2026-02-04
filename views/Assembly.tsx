import React from 'react';
import { Card, CodeBlock, Badge, CategoryBadge, StyleBadge } from '../components/ui';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { TestCase, Category, Style } from '../types';

interface AssemblyProps {
  testCases: TestCase[];
}

const Assembly: React.FC<AssemblyProps> = ({ testCases }) => {
  const [expandedCase, setExpandedCase] = React.useState<string | null>(null);
  const [filterCategory, setFilterCategory] = React.useState<string>('');
  const [filterStyle, setFilterStyle] = React.useState<string>('');

  const toggleCase = (id: string) => {
    setExpandedCase(expandedCase === id ? null : id);
  };

  const filteredCases = testCases.filter(tc => {
    if (filterCategory && tc.category !== filterCategory) return false;
    if (filterStyle && tc.style !== filterStyle) return false;
    return true;
  });

  const hasError = (tc: TestCase) => tc.assembledOutput?.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assembly Layer</h1>
        <p className="text-muted-foreground mt-1">
          Final bundle configuration output from combining Structure + Discount + Rules LLM outputs
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What is the Assembly Layer?</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          The Assembly layer is a <strong>deterministic</strong> process (no AI) that combines outputs from the three LLMs
          into the final bundle configuration. It matches collection hints to actual collections, builds step categories,
          and applies discount/rules configurations.
        </p>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 px-3 text-sm rounded-md border border-input bg-background"
        >
          <option value="">All Categories</option>
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStyle}
          onChange={(e) => setFilterStyle(e.target.value)}
          className="h-9 px-3 text-sm rounded-md border border-input bg-background"
        >
          <option value="">All Styles</option>
          {Object.values(Style).map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground ml-auto">
          {filteredCases.length} of {testCases.length} cases
        </span>
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredCases.map((tc) => (
          <Card key={tc.id} className={`overflow-hidden ${hasError(tc) ? 'border-red-300 dark:border-red-700' : ''}`}>
            <div
              onClick={() => toggleCase(tc.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium">{tc.id}</span>
                <CategoryBadge category={tc.category} minimal />
                <StyleBadge style={tc.style} minimal />
                {hasError(tc) ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Error
                  </Badge>
                ) : (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    OK
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground max-w-md truncate">
                  {tc.input}
                </span>
                {expandedCase === tc.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedCase === tc.id && (
              <div className="border-t p-4 bg-muted/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Inputs */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Merchant Input</h4>
                      <div className="p-3 bg-background rounded border text-sm italic">
                        "{tc.input}"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {tc.collections && tc.collections.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Collections</h4>
                          <div className="p-3 bg-background rounded border text-xs font-mono space-y-1">
                            {tc.collections.map((col, i) => (
                              <div key={i}>
                                <span className="text-blue-600 dark:text-blue-400">{col.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {tc.products && tc.products.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Products</h4>
                          <div className="p-3 bg-background rounded border text-xs font-mono space-y-1">
                            {tc.products.map((prod, i) => (
                              <div key={i}>
                                <span className="text-green-600 dark:text-green-400">{prod.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">LLM Outputs (Inputs to Assembly)</h4>
                      <div className="space-y-2">
                        <CodeBlock label="Structure LLM" code={tc.expectedStructure} />
                        <CodeBlock label="Discount LLM" code={tc.expectedDiscount} />
                        <CodeBlock label="Rules LLM" code={tc.expectedRules} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Assembled Output */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Assembled Output (Final Bundle Config)
                    </h4>
                    {hasError(tc) ? (
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-red-700 dark:text-red-300 font-medium">Assembly Error:</p>
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{tc.assembledOutput?.error}</p>
                      </div>
                    ) : (
                      <CodeBlock label="" code={tc.assembledOutput} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Assembly;
