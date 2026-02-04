import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CodeBlock, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui';
import { ResultsTable } from '../components/ResultsTable';
import { EnrichedResult } from '../services/dataService';
import { RulesLLMSpec } from '../types';
import { ViewMode } from '../components/Layout';

interface RulesLLMProps {
  results: EnrichedResult[];
  spec: RulesLLMSpec;
  viewMode: ViewMode;
}

const RulesLLM: React.FC<RulesLLMProps> = ({ results, spec, viewMode }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{spec.name} ({spec.version})</h2>
        <p className="text-muted-foreground">{spec.purpose}</p>
      </div>

      <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Default Behavior</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
                {spec.defaultBehavior.description}
            </p>
            <CodeBlock code={spec.defaultBehavior.output} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Conditions Supported</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {spec.conditions.map((condition, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <div>
                            <span className="font-mono font-bold text-primary block">{condition.name}</span>
                            {condition.alias && <span className="text-xs text-muted-foreground">({condition.alias})</span>}
                        </div>
                        <span className="text-sm text-muted-foreground text-right">{condition.description}<br/>"{condition.example}"</span>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Pattern Mapping</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pattern</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spec.patternMapping.map((pattern, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{pattern.pattern}</TableCell>
                                <TableCell><Badge variant="secondary">{pattern.condition}</Badge></TableCell>
                                <TableCell className="text-xs text-muted-foreground">{pattern.valueSource}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Test Results</h3>
        <ResultsTable results={results} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default RulesLLM;
