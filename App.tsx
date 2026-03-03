import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
import ChurnAnalysis from './views/ChurnAnalysis';
import ChurnReport from './views/ChurnReport';
import SuccessMetricsPage from './views/SuccessMetricsPage';
import OnboardingDiagnosisPage from './views/OnboardingDiagnosisPage';
import OnboardingHistoryPage from './views/OnboardingHistoryPage';
import StoreProfilingPage from './views/StoreProfilingPage';
import OnboardingFlowPage from './views/OnboardingFlowPage';
import StoreProfilingFAQPage from './views/StoreProfilingFAQPage';
import OnboardingFAQPage from './views/OnboardingFAQPage';
import BaasOverview from './views/BaasOverview';
import StrategyView from './views/StrategyView';
import { getMetrics, getAllResults, getEnrichedResults, EnrichedResult, getLLMSpecs, getTestCases } from './services/dataService';
import { getLatestEvaluationRun, getPromptVersionStats } from './services/evaluationApi';
import { Metrics, LLMSpecs, TestCase, EvaluationRunDetail, PromptVersionStats } from './types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_SECRET_KEY = process.env.DASHBOARD_KEY || '';

function App() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('pm');
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('eb_authenticated') === 'true');
  const [apiKey, setApiKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bundleSetupLlmPipeline/validateKey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'secret-key': API_SECRET_KEY },
        body: JSON.stringify({ key: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('eb_authenticated', 'true');
        setAuthenticated(true);
      } else {
        setAuthError(data.message || 'Invalid key');
      }
    } catch {
      setAuthError('Failed to validate key');
    } finally {
      setAuthLoading(false);
    }
  };

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

  if (!authenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <form onSubmit={handleKeySubmit} className="flex flex-col items-center gap-4 w-80">
          <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold text-xl">e</div>
          <h1 className="text-lg font-semibold">eBBot Dashboard</h1>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key"
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          {authError && <p className="text-sm text-red-500">{authError}</p>}
          <button
            type="submit"
            disabled={authLoading || !apiKey.trim()}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            {authLoading ? 'Validating...' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

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
        isDark={isDark}
        toggleDark={toggleDark}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        compareRuns={compareRuns}
    >
        <Routes>
          <Route path="/" element={
            metrics ? (
              <Overview
                metrics={metrics}
                viewMode={viewMode}
                latestRun={latestRun}
                promptVersions={promptVersions}
                onViewAllRuns={() => navigate('/evaluation-runs')}
              />
            ) : null
          } />
          <Route path="/playground" element={<Playground viewMode={viewMode} />} />
          <Route path="/history" element={<PipelineHistory viewMode={viewMode} />} />
          <Route path="/churn-analysis" element={<ChurnAnalysis viewMode={viewMode} />} />
          <Route path="/churn-report" element={<ChurnReport viewMode={viewMode} />} />
          <Route path="/results" element={<TestResults structure={structureResults} discount={discountResults} rules={rulesResults} viewMode={viewMode} />} />
          <Route path="/evaluation-runs" element={
            <EvaluationRuns viewMode={viewMode} onCompare={(runs) => { setCompareRuns(runs); navigate('/run-comparison'); }} />
          } />
          <Route path="/run-comparison" element={
            compareRuns ? (
              <RunComparison
                runId1={compareRuns[0]}
                runId2={compareRuns[1]}
                viewMode={viewMode}
                onBack={() => { setCompareRuns(null); navigate('/evaluation-runs'); }}
              />
            ) : <Navigate to="/evaluation-runs" replace />
          } />
          <Route path="/structure" element={specs ? <StructureLLM spec={specs.structureLLM} viewMode={viewMode} /> : null} />
          <Route path="/discount" element={specs ? <DiscountLLM spec={specs.discountLLM} viewMode={viewMode} /> : null} />
          <Route path="/rules" element={specs ? <RulesLLM spec={specs.rulesLLM} viewMode={viewMode} /> : null} />
          <Route path="/assembly" element={<Assembly viewMode={viewMode} />} />
          <Route path="/success-metrics" element={<SuccessMetricsPage />} />
          <Route path="/onboarding-diagnosis" element={<OnboardingDiagnosisPage />} />
          <Route path="/onboarding-history" element={<OnboardingHistoryPage />} />
          <Route path="/store-profiling" element={<StoreProfilingPage />} />
          <Route path="/onboarding-flow" element={<OnboardingFlowPage />} />
          <Route path="/store-profiling-faq" element={<StoreProfilingFAQPage />} />
          <Route path="/onboarding-faq" element={<OnboardingFAQPage />} />
          <Route path="/baas-overview" element={<BaasOverview />} />
          <Route path="/run-strategy" element={<StrategyView />} />
        </Routes>
    </Layout>
  );
}

export default App;
