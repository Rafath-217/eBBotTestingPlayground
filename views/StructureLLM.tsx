import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CodeBlock, Badge } from '../components/ui';
import { ResultsTable } from '../components/ResultsTable';
import { EnrichedResult } from '../services/dataService';
import { StructureLLMSpec } from '../types';
import { ChevronRight } from 'lucide-react';

const StructureLLM = ({ results, spec }: { results: EnrichedResult[], spec: StructureLLMSpec }) => {
  
  const getColorClasses = (color: string) => {
      switch(color) {
          case 'green': return { card: 'border-l-4 border-l-green-500', title: 'text-green-600' };
          case 'blue': return { card: 'border-l-4 border-l-blue-500', title: 'text-blue-600' };
          case 'red': return { card: 'border-l-4 border-l-red-500', title: 'text-red-600' };
          default: return { card: 'border-l-4 border-l-gray-500', title: 'text-gray-600' };
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{spec.name} ({spec.version})</h2>
        <p className="text-muted-foreground">{spec.purpose}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {spec.outputTypes.map((type, idx) => {
            const colors = getColorClasses(type.color);
            return (
                <Card key={idx} className={colors.card}>
                    <CardHeader className="pb-2">
                        <CardTitle className={colors.title}>{type.value === null ? 'null' : type.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>{type.description}</p>
                        {type.useCases && (
                             <p className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
                                 {type.useCases.join(", ")}
                             </p>
                        )}
                         {type.additionalFields && (
                             <p className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
                                 Output: {type.additionalFields.join(", ")}
                             </p>
                        )}
                        {type.triggers && (
                             <p className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
                                 Triggers: {type.triggers.join(", ")}
                             </p>
                        )}
                    </CardContent>
                </Card>
            )
        })}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Supported Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spec.supportedPatterns.map((pattern, idx) => (
                    <div key={idx} className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center"><ChevronRight className="w-4 h-4 mr-1"/> {pattern.name}</h4>
                        <CodeBlock 
                            code={pattern.example.output} 
                            label={`Input: "${pattern.example.input}"`}
                        />
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Test Results</h3>
        <ResultsTable results={results} />
      </div>
    </div>
  );
};

export default StructureLLM;
