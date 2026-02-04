import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, CategoryBadge, StyleBadge } from '../components/ui';
import { Activity, Database, FileText, Layers, AlertTriangle, MessageSquare } from 'lucide-react';
import { Metrics, Style } from '../types';
import { ViewMode } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const categoryBarColors: Record<string, string> = {
  'TIERED DISCOUNT': '#2563eb',    // vibrant blue
  'FIXED BUNDLE PRICE': '#059669', // emerald
  'MULTI STEP': '#7c3aed',         // violet
  'GOAL STATEMENT': '#4f46e5',     // indigo
  'ADVERSARIAL': '#ea580c',        // deep orange
};


// Writing style definitions with descriptions and examples
const writingStyleInfo: Record<Style, { description: string; example: string }> = {
  [Style.TERSE]: {
    description: "Minimal, to-the-point input with few words. Tests the LLM's ability to extract meaning from sparse information.",
    example: "Buy 2 get 10% off"
  },
  [Style.STRUCTURED_LIST]: {
    description: "Organized bullet points or numbered lists. Common format for merchants who think systematically.",
    example: "Bundle rules:\n- 2 items: 10% off\n- 3 items: 15% off\n- 4+ items: 20% off"
  },
  [Style.CONVERSATIONAL]: {
    description: "Natural, casual language as if explaining to a friend. Tests handling of informal phrasing.",
    example: "So basically if someone buys two shirts, they get a little discount, and if they buy three or more, the discount gets better"
  },
  [Style.MARKETING_COPY]: {
    description: "Promotional language with excitement and sales-speak. Often includes emojis, caps, or hyperbole.",
    example: "AMAZING DEAL! Mix & match ANY 3 items from our Summer Collection and save 25%! 🎉"
  },
  [Style.TECHNICAL_DETAILED]: {
    description: "Precise specifications with exact values and conditions. Tests handling of complex, detailed requirements.",
    example: "Apply 15% discount when cart contains ≥3 items from collection 'Premium Watches' with minimum order value of $500"
  },
  [Style.VAGUE_ASSUMES_CONTEXT]: {
    description: "Incomplete input that assumes prior knowledge. Tests graceful handling of ambiguous requests.",
    example: "Same discount as before but for the new collection"
  }
};

interface OverviewProps {
  metrics: Metrics;
  viewMode: ViewMode;
}

const Overview: React.FC<OverviewProps> = ({ metrics, viewMode }) => {
  const categoryData = Object.entries(metrics.byCategory).map(([name, data]) => ({
    name: name.replace('_', ' '),
    originalName: name,
    count: data.cases,
    passRate: parseFloat(data.passRate)
  }));

  const styleData = Object.entries(metrics.byStyle).map(([name, data]) => ({
    name: name.replace('_', ' '),
    count: data.cases,
    passRate: parseFloat(data.passRate)
  }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            eBBot LLM Testing Framework
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Validating merchant bundle configuration parsing</p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">Struct: {metrics.promptVersions.structure}</span>
            <span className="text-xs text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">Disc: {metrics.promptVersions.discount}</span>
            <span className="text-xs text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">Rules: {metrics.promptVersions.rules}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{metrics.model}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Last run: {new Date(metrics.timestamp).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Database className="w-8 h-8 mb-2 text-blue-500" />
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalTestCases}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Total Test Cases</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Activity className="w-8 h-8 mb-2 text-emerald-500" />
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metrics.results.overall.rate}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Overall Pass Rate</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Layers className="w-8 h-8 mb-2 text-violet-500" />
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(metrics.byCategory).length}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Categories</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FileText className="w-8 h-8 mb-2 text-pink-500" />
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(metrics.byStyle).length}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Writing Styles</span>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Test Case Categories</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <Tooltip
                              cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                              contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                padding: '12px 16px'
                              }}
                            />
                            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28}>
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={categoryBarColors[entry.name] || '#888'} />
                              ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Problematic Cases Summary</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-red-200 dark:border-b-red-800">
                                <TableHead className="h-8 text-red-900 dark:text-red-300">ID</TableHead>
                                <TableHead className="h-8 text-red-900 dark:text-red-300">Category</TableHead>
                                <TableHead className="h-8 text-red-900 dark:text-red-300">Failed LLMs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {metrics.problematicCases.slice(0, 3).map((pc) => (
                                 <TableRow key={pc.id} className="border-b-red-100 dark:border-b-red-900/50">
                                     <TableCell className="py-2 text-xs font-mono">TC-{String(pc.id).padStart(3, '0')}</TableCell>
                                     <TableCell className="py-2"><CategoryBadge category={pc.category} minimal /></TableCell>
                                     <TableCell className="py-2">
                                         <div className="flex gap-1">
                                             {pc.failedLLMs.map(llm => (
                                                 <span key={llm} className="inline-flex items-center rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">{llm}</span>
                                             ))}
                                         </div>
                                     </TableCell>
                                 </TableRow>
                             ))}
                             {metrics.problematicCases.length > 3 && (
                                 <TableRow>
                                     <TableCell colSpan={3} className="text-center text-xs text-muted-foreground pt-2">
                                         + {metrics.problematicCases.length - 3} more cases
                                     </TableCell>
                                 </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Writing Styles Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-500" />
            Writing Styles Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Test cases use different writing styles to simulate how real merchants describe their bundle configurations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(writingStyleInfo).map(([style, info]) => {
              const styleMetrics = metrics.byStyle[style];
              return (
                <div key={style} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <StyleBadge style={style} minimal />
                    {styleMetrics && (
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{styleMetrics.passRate}</span>
                        <span className="text-xs text-slate-400 ml-1">({styleMetrics.cases})</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                    {info.description}
                  </p>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1">Example</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic whitespace-pre-line">"{info.example}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;