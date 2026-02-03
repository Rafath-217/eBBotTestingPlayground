import React from 'react';
import { EnrichedResult } from '../services/dataService';
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, CodeBlock, Button, CategoryBadge, StyleBadge, StatusBadge } from './ui';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { Category, Style } from '../types';

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

export const ResultsTable = ({ results }: { results: EnrichedResult[] }) => {
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
                          <CodeBlock label="Expected Output" code={result.llmType === 'structure' ? testCase.expectedStructure : result.llmType === 'discount' ? testCase.expectedDiscount : testCase.expectedRules} />
                          <CodeBlock label="Actual Output" code={result.actual} />
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
