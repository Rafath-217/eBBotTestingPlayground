import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, CategoryBadge } from '../components/ui';
import { EnrichedResult } from '../services/dataService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Category, Style, CATEGORIES } from '../types';
import { ViewMode } from '../components/Layout';
import { Search, Filter, X } from 'lucide-react';

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

interface TestResultsProps {
  structure: EnrichedResult[];
  discount: EnrichedResult[];
  rules: EnrichedResult[];
  viewMode: ViewMode;
}

const TestResults: React.FC<TestResultsProps> = ({ structure, discount, rules, viewMode }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filters, setFilters] = React.useState<FilterState>({
      category: '',
      style: '',
      status: '', // 'ALL_PASS', 'ALL_FAIL', 'MIXED'
    });

    const updateFilter = (key: keyof FilterState, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
      setFilters({ category: '', style: '', status: '' });
      setSearchTerm('');
    };

    const hasActiveFilters = filters.category || filters.style || filters.status || searchTerm;
    const allResults = [...structure, ...discount, ...rules];

    // --- CHART DATA PREP ---
    const calculatePassRate = (data: EnrichedResult[], filterKey: 'category' | 'style', filterValue: string) => {
        const filtered = data.filter(r => r.testCase[filterKey] === filterValue);
        if (filtered.length === 0) return 0;
        const passed = filtered.filter(r => r.result.status === 'PASS').length;
        return (passed / filtered.length) * 100;
    };

    const categories = [...CATEGORIES];
    const categoryChartData = categories.map(cat => ({
        name: cat,
        Structure: calculatePassRate(structure, 'category', cat),
        Discount: calculatePassRate(discount, 'category', cat),
        Rules: calculatePassRate(rules, 'category', cat),
    }));

    const styles = Object.values(Style);
    const styleChartData = styles.map(s => ({
        name: s.replace('_', ' '),
        Structure: calculatePassRate(structure, 'style', s),
        Discount: calculatePassRate(discount, 'style', s),
        Rules: calculatePassRate(rules, 'style', s),
    }));

    // --- PROBLEMATIC CASES ---
    // Find cases where at least 2 LLMs failed
    const failuresMap = new Map<string, number>();
    const failedTypesMap = new Map<string, string[]>();

    allResults.forEach(r => {
        if (r.result.status === 'FAIL') {
            const current = failuresMap.get(r.testCase.id) || 0;
            failuresMap.set(r.testCase.id, current + 1);
            
            const types = failedTypesMap.get(r.testCase.id) || [];
            types.push(r.result.llmType);
            failedTypesMap.set(r.testCase.id, types);
        }
    });

    const problematicCases = Array.from(failuresMap.entries())
        .filter(([_, count]) => count >= 2) // Filter for failures across multiple LLMs
        .map(([id, count]) => {
            const tc = structure.find(r => r.testCase.id === id)?.testCase;
            return {
                id,
                count,
                types: failedTypesMap.get(id),
                testCase: tc
            };
        })
        .filter(x => x.testCase); // Type safety

    // --- FULL BROWSER FILTER ---
    const filteredCases = structure.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = s.testCase.input.toLowerCase().includes(term) || s.testCase.id.toLowerCase().includes(term);
        const matchesCategory = !filters.category || s.testCase.category === filters.category;
        const matchesStyle = !filters.style || s.testCase.style === filters.style;

        // Status filter: check combined status across all LLMs
        let matchesStatus = true;
        if (filters.status) {
          const sStatus = structure.find(r => r.result.testCaseId === s.result.testCaseId)?.result.status;
          const dStatus = discount.find(r => r.result.testCaseId === s.result.testCaseId)?.result.status;
          const rStatus = rules.find(r => r.result.testCaseId === s.result.testCaseId)?.result.status;
          const allPass = sStatus === 'PASS' && dStatus === 'PASS' && rStatus === 'PASS';
          const allFail = sStatus === 'FAIL' && dStatus === 'FAIL' && rStatus === 'FAIL';

          if (filters.status === 'ALL_PASS') matchesStatus = allPass;
          else if (filters.status === 'ALL_FAIL') matchesStatus = allFail;
          else if (filters.status === 'ANY_FAIL') matchesStatus = sStatus === 'FAIL' || dStatus === 'FAIL' || rStatus === 'FAIL';
        }

        return matchesSearch && matchesCategory && matchesStyle && matchesStatus;
    });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analysis & Metrics</h2>
        <p className="text-muted-foreground">Comprehensive performance breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Structure LLM', data: structure, color: 'text-green-600' },
            { label: 'Discount LLM', data: discount, color: 'text-purple-600' },
            { label: 'Rules LLM', data: rules, color: 'text-yellow-600' },
            { label: 'Overall', data: allResults, color: 'text-blue-600' }
        ].map((item, i) => {
            const passed = item.data.filter(r => r.result.status === 'PASS').length;
            const total = item.data.length;
            const rate = total ? ((passed/total)*100).toFixed(1) : '0.0';
            return (
                <Card key={i}>
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold">{rate}%</div>
                        <div className={`text-xs font-medium uppercase ${item.color}`}>{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{passed}/{total} Passed</div>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Pass Rate by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} layout="vertical" margin={{ left: 40 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" width={100} style={{fontSize: '10px'}} />
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="Structure" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
                        <Bar dataKey="Discount" stackId="a" fill="#a855f7" radius={[0,0,0,0]} />
                        <Bar dataKey="Rules" stackId="a" fill="#eab308" radius={[0,4,4,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Pass Rate by Style</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={styleChartData} layout="vertical" margin={{ left: 40 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" width={100} style={{fontSize: '10px'}} />
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="Structure" fill="#22c55e" radius={[0,4,4,0]} barSize={10} />
                        <Bar dataKey="Discount" fill="#a855f7" radius={[0,4,4,0]} barSize={10} />
                        <Bar dataKey="Rules" fill="#eab308" radius={[0,4,4,0]} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      {/* Problematic Cases */}
      {problematicCases.length > 0 && (
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
                <CardTitle className="text-red-600">Problematic Cases (Failed 2+ LLMs)</CardTitle>
            </CardHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Failed Components</TableHead>
                        <TableHead>Input Preview</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {problematicCases.map((pc) => (
                        <TableRow key={pc.id}>
                            <TableCell className="font-mono">{pc.id}</TableCell>
                            <TableCell><CategoryBadge category={pc.testCase?.category || ''} minimal /></TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {pc.types?.map(t => (
                                        <span key={t} className="inline-flex items-center rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 uppercase">{t}</span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">{pc.testCase?.input}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </Card>
      )}

      {/* Full Browser */}
      <Card>
          <CardHeader>
            <CardTitle>Full Test Case Browser</CardTitle>
          </CardHeader>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 px-6 pb-4">
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
              options={['ALL_PASS', 'ANY_FAIL', 'ALL_FAIL']}
              onChange={(v) => updateFilter('status', v)}
            />
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="h-8 w-[150px] pl-8 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {filteredCases.length} of {structure.length} cases
            </span>
          </div>
          <div className="h-[400px] overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Struct</TableHead>
                        <TableHead>Disc</TableHead>
                        <TableHead>Rules</TableHead>
                        <TableHead>Input</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCases.map((row) => {
                        const sStatus = structure.find(r => r.result.testCaseId === row.result.testCaseId)?.result.status;
                        const dStatus = discount.find(r => r.result.testCaseId === row.result.testCaseId)?.result.status;
                        const rStatus = rules.find(r => r.result.testCaseId === row.result.testCaseId)?.result.status;
                        return (
                            <TableRow key={row.result.testCaseId}>
                                <TableCell className="font-mono text-xs">{row.result.testCaseId}</TableCell>
                                <TableCell>
                                    <div className={`w-3 h-3 rounded-full ${sStatus === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`} />
                                </TableCell>
                                <TableCell>
                                    <div className={`w-3 h-3 rounded-full ${dStatus === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`} />
                                </TableCell>
                                <TableCell>
                                    <div className={`w-3 h-3 rounded-full ${rStatus === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`} />
                                </TableCell>
                                <TableCell className="text-xs truncate max-w-[300px] text-muted-foreground">
                                    {row.testCase.input}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
          </div>
      </Card>
    </div>
  );
};

export default TestResults;