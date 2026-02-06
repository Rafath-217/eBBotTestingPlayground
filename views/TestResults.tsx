import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, CategoryBadge } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Category, Style, CATEGORIES, EvaluationRunDetail, EvaluationResult } from '../types';
import { ViewMode } from '../components/Layout';
import { Search, Filter, X, AlertCircle, RefreshCw } from 'lucide-react';
import { getLatestEvaluationRun } from '../services/evaluationApi';

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
  structure: any[];
  discount: any[];
  rules: any[];
  viewMode: ViewMode;
}

const TestResults: React.FC<TestResultsProps> = ({ viewMode }) => {
    const [evaluationRun, setEvaluationRun] = useState<EvaluationRunDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FilterState>({
      category: '',
      style: '',
      status: '',
    });

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const run = await getLatestEvaluationRun();
          setEvaluationRun(run);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch evaluation data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

    const results: EvaluationResult[] = evaluationRun?.results || [];

    const updateFilter = (key: keyof FilterState, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
      setFilters({ category: '', style: '', status: '' });
      setSearchTerm('');
    };

    const hasActiveFilters = filters.category || filters.style || filters.status || searchTerm;

    // --- Stats ---
    const structureStats = {
      passed: results.filter(r => r.structureResult?.match).length,
      total: results.length,
    };
    const discountStats = {
      passed: results.filter(r => r.discountResult?.match).length,
      total: results.length,
    };
    const rulesStats = {
      passed: results.filter(r => r.rulesResult?.match).length,
      total: results.length,
    };
    const overallStats = {
      passed: results.filter(r => r.status === 'PASS').length,
      total: results.length,
    };

    // --- CHART DATA ---
    const calculatePassRate = (filterKey: 'category' | 'style', filterValue: string, llm: 'structure' | 'discount' | 'rules') => {
        const filtered = results.filter(r => r[filterKey] === filterValue);
        if (filtered.length === 0) return 0;
        const resultKey = `${llm}Result` as keyof EvaluationResult;
        const passed = filtered.filter(r => (r[resultKey] as any)?.match).length;
        return (passed / filtered.length) * 100;
    };

    const categories = [...CATEGORIES];
    const categoryChartData = categories.map(cat => ({
        name: cat,
        Structure: calculatePassRate('category', cat, 'structure'),
        Discount: calculatePassRate('category', cat, 'discount'),
        Rules: calculatePassRate('category', cat, 'rules'),
    }));

    const styles = Object.values(Style);
    const styleChartData = styles.map(s => ({
        name: s.replace('_', ' '),
        Structure: calculatePassRate('style', s, 'structure'),
        Discount: calculatePassRate('style', s, 'discount'),
        Rules: calculatePassRate('style', s, 'rules'),
    }));

    // --- PROBLEMATIC CASES ---
    const problematicCases = results
      .filter(r => {
        const failCount = [r.structureResult?.match === false, r.discountResult?.match === false, r.rulesResult?.match === false].filter(Boolean).length;
        return failCount >= 2;
      })
      .map(r => {
        const failedLLMs: string[] = [];
        if (!r.structureResult?.match) failedLLMs.push('structure');
        if (!r.discountResult?.match) failedLLMs.push('discount');
        if (!r.rulesResult?.match) failedLLMs.push('rules');
        return { id: r.testCaseId, category: r.category, text: r.text, failedLLMs };
      });

    // --- FILTER ---
    const filteredCases = results.filter(r => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term || r.text?.toLowerCase().includes(term) || String(r.testCaseId).includes(term);
        const matchesCategory = !filters.category || r.category === filters.category;
        const matchesStyle = !filters.style || r.style === filters.style;

        let matchesStatus = true;
        if (filters.status) {
          const allPass = r.structureResult?.match && r.discountResult?.match && r.rulesResult?.match;
          const allFail = !r.structureResult?.match && !r.discountResult?.match && !r.rulesResult?.match;
          const anyFail = !r.structureResult?.match || !r.discountResult?.match || !r.rulesResult?.match;

          if (filters.status === 'ALL_PASS') matchesStatus = !!allPass;
          else if (filters.status === 'ALL_FAIL') matchesStatus = !!allFail;
          else if (filters.status === 'ANY_FAIL') matchesStatus = !!anyFail;
        }

        return matchesSearch && matchesCategory && matchesStyle && matchesStatus;
    });

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-8 border-red-200 dark:border-red-800">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">Error Loading Results</p>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </Card>
      );
    }

    if (!evaluationRun) {
      return (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <p className="text-lg font-semibold">No Evaluation Runs Found</p>
            <p className="text-muted-foreground mt-2">Run an evaluation to see results here.</p>
          </div>
        </Card>
      );
    }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analysis & Metrics</h2>
        <p className="text-muted-foreground">Comprehensive performance breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Structure LLM', stats: structureStats, color: 'text-green-600' },
            { label: 'Discount LLM', stats: discountStats, color: 'text-purple-600' },
            { label: 'Rules LLM', stats: rulesStats, color: 'text-yellow-600' },
            { label: 'Overall', stats: overallStats, color: 'text-blue-600' }
        ].map((item, i) => {
            const rate = item.stats.total ? ((item.stats.passed / item.stats.total) * 100).toFixed(1) : '0.0';
            return (
                <Card key={i}>
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold">{rate}%</div>
                        <div className={`text-xs font-medium uppercase ${item.color}`}>{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.stats.passed}/{item.stats.total} Passed</div>
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
                            <TableCell><CategoryBadge category={pc.category} minimal /></TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {pc.failedLLMs.map(t => (
                                        <span key={t} className="inline-flex items-center rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 uppercase">{t}</span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">{pc.text}</TableCell>
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
              {filteredCases.length} of {results.length} cases
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
                    {filteredCases.map((row) => (
                        <TableRow key={row.testCaseId}>
                            <TableCell className="font-mono text-xs">{row.testCaseId}</TableCell>
                            <TableCell>
                                <div className={`w-3 h-3 rounded-full ${row.structureResult?.match ? 'bg-green-500' : 'bg-red-500'}`} />
                            </TableCell>
                            <TableCell>
                                <div className={`w-3 h-3 rounded-full ${row.discountResult?.match ? 'bg-green-500' : 'bg-red-500'}`} />
                            </TableCell>
                            <TableCell>
                                <div className={`w-3 h-3 rounded-full ${row.rulesResult?.match ? 'bg-green-500' : 'bg-red-500'}`} />
                            </TableCell>
                            <TableCell className="text-xs truncate max-w-[300px] text-muted-foreground">
                                {row.text}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
      </Card>
    </div>
  );
};

export default TestResults;
