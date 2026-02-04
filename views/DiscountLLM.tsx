import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CodeBlock, Badge } from '../components/ui';
import { ResultsTable } from '../components/ResultsTable';
import { EnrichedResult } from '../services/dataService';
import { DiscountLLMSpec } from '../types';
import { ViewMode } from '../components/Layout';
import { Info } from 'lucide-react';

interface DiscountLLMProps {
  results: EnrichedResult[];
  spec: DiscountLLMSpec;
  viewMode: ViewMode;
}

const DiscountLLM: React.FC<DiscountLLMProps> = ({ results, spec, viewMode }) => {
  
  const getColorClasses = (color: string) => {
    switch(color) {
        case 'purple': return { card: 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800', title: 'text-purple-700 dark:text-purple-400' };
        case 'orange': return { card: 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800', title: 'text-orange-700 dark:text-orange-400' };
        case 'teal': return { card: 'bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800', title: 'text-teal-700 dark:text-teal-400' };
        case 'gray': return { card: 'bg-gray-50/50 dark:bg-gray-800/50', title: 'text-gray-500' };
        default: return { card: '', title: '' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{spec.name} ({spec.version})</h2>
        <p className="text-muted-foreground">{spec.purpose}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {spec.discountModes.map((mode, idx) => {
            const colors = getColorClasses(mode.color);
            return (
                <Card key={idx} className={colors.card}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`${colors.title} text-base`}>{mode.mode === null ? 'null' : mode.mode}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                        {mode.example ? (
                            <>
                                <p>"{mode.example.input}"</p>
                                <div className="font-mono bg-background/50 p-2 rounded">discountMode: "{mode.example.output.discountMode}"</div>
                            </>
                        ) : (
                            <p>{mode.triggers?.join(", ")}</p>
                        )}
                        <p className="text-muted-foreground italic mt-2">{mode.description}</p>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      <div className="flex items-start p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
        <Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
            <p className="font-semibold mb-1">Key Normalization Rules</p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
                {spec.keyRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                ))}
            </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Test Results</h3>
        <ResultsTable results={results} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default DiscountLLM;
