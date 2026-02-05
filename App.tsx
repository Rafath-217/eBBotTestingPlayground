import React, { useState, useEffect } from 'react';
import { Layout, ViewMode } from './components/Layout';
import Overview from './views/Overview';
import StructureLLM from './views/StructureLLM';
import DiscountLLM from './views/DiscountLLM';
import RulesLLM from './views/RulesLLM';
import Assembly from './views/Assembly';
import TestResults from './views/TestResults';
import Playground from './views/Playground';
import PipelineHistory from './views/PipelineHistory';
import EvaluationRuns from './views/EvaluationRuns';
import RunComparison from './views/RunComparison';
import { getMetrics, getAllResults, getEnrichedResults, EnrichedResult, getLLMSpecs, getTestCases } from './services/dataService';
import { getLatestEvaluationRun, getPromptVersionStats } from './services/evaluationApi';
import { Metrics, LLMSpecs, TestCase, EvaluationRunDetail, PromptVersionStats } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('pm');
  
  // Data State
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [specs, setSpecs] = useState<LLMSpecs | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [structureResults, setStructureResults] = useState<EnrichedResult[]>([]);
  const [discountResults, setDiscountResults] = useState<EnrichedResult[]>([]);
  const [rulesResults, setRulesResults] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evaluation features state
  const [latestRun, setLatestRun] = useState<EvaluationRunDetail | null>(null);
  const [promptVersions, setPromptVersions] = useState<PromptVersionStats | null>(null);
  const [compareRuns, setCompareRuns] = useState<[string, string] | null>(null);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [m, s, tc, structRes, discRes, rulesRes, latestRunData, promptVersionsData] = await Promise.all([
                getMetrics(),
                getLLMSpecs(),
                getTestCases(),
                getEnrichedResults('structure'),
                getEnrichedResults('discount'),
                getEnrichedResults('rules'),
                getLatestEvaluationRun().catch(() => null),
                getPromptVersionStats().catch(() => null),
            ]);

            setMetrics(m);
            setSpecs(s);
            setTestCases(tc);
            setStructureResults(structRes);
            setDiscountResults(discRes);
            setRulesResults(rulesRes);
            setLatestRun(latestRunData);
            setPromptVersions(promptVersionsData);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Theme Toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  if (loading) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
              <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary rounded-lg mb-4"></div>
                  <div className="text-lg font-semibold">Loading eBBot Dashboard...</div>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
              <div className="flex flex-col items-center text-center p-8">
                  <div className="text-red-500 text-6xl mb-4">!</div>
                  <div className="text-lg font-semibold mb-2">Failed to load dashboard</div>
                  <div className="text-muted-foreground mb-4">{error}</div>
                  <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                      Retry
                  </button>
              </div>
          </div>
      );
  }

  return (
    <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        toggleDark={toggleDark}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        compareRuns={compareRuns}
    >
        {activeTab === 'overview' && metrics && (
          <Overview
            metrics={metrics}
            viewMode={viewMode}
            latestRun={latestRun}
            promptVersions={promptVersions}
            onViewAllRuns={() => setActiveTab('evaluationRuns')}
          />
        )}
        {activeTab === 'structure' && specs && <StructureLLM spec={specs.structureLLM} viewMode={viewMode} />}
        {activeTab === 'discount' && specs && <DiscountLLM spec={specs.discountLLM} viewMode={viewMode} />}
        {activeTab === 'rules' && specs && <RulesLLM spec={specs.rulesLLM} viewMode={viewMode} />}
        {activeTab === 'assembly' && <Assembly viewMode={viewMode} />}
        {activeTab === 'results' && <TestResults structure={structureResults} discount={discountResults} rules={rulesResults} viewMode={viewMode} />}
        {activeTab === 'playground' && <Playground viewMode={viewMode} />}
        {activeTab === 'history' && <PipelineHistory viewMode={viewMode} />}
        {activeTab === 'evaluationRuns' && <EvaluationRuns viewMode={viewMode} onCompare={setCompareRuns} />}
        {activeTab === 'runComparison' && compareRuns && (
          <RunComparison
            runId1={compareRuns[0]}
            runId2={compareRuns[1]}
            viewMode={viewMode}
            onBack={() => { setCompareRuns(null); setActiveTab('evaluationRuns'); }}
          />
        )}
    </Layout>
  );
}

export default App;
