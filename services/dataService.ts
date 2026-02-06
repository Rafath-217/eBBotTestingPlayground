import { TestCase, TestResult, Metrics, LLMType, LLMSpecs } from '../types';
import { getCached, setCache, clearAllCache } from './cache';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_SECRET_KEY = process.env.DASHBOARD_KEY || '';

interface DashboardData {
  metrics: Metrics;
  llmSpecs: LLMSpecs;
  testCases: TestCase[];
  results: {
    structure: TestResult[];
    discount: TestResult[];
    rules: TestResult[];
  };
}

let cachedData: DashboardData | null = null;

/**
 * Fetch all dashboard data from backend API
 */
async function fetchDashboardData(): Promise<DashboardData> {
  if (cachedData) return cachedData;

  // Check localStorage cache
  const stored = getCached<DashboardData>('dashboard');
  if (stored) {
    cachedData = stored;
    return stored;
  }

  const response = await fetch(`${API_BASE_URL}/api/bundleSetupLlmPipeline/dashboard`, {
    headers: { 'secret-key': API_SECRET_KEY },
  });
  if (!response.ok) {
    const text = await response.text();
    console.error('Dashboard API error:', response.status, text);
    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
  }

  const json = await response.json();

  if (!json.data) {
    throw new Error('No data in response');
  }

  const raw = json.data;

  // Map backend llmSpecs field names (structure/discount/rules)
  // to frontend expected names (structureLLM/discountLLM/rulesLLM)
  const llmSpecs: LLMSpecs = raw.llmSpecs?.structureLLM
    ? raw.llmSpecs
    : {
        structureLLM: raw.llmSpecs?.structure || {},
        discountLLM: raw.llmSpecs?.discount || {},
        rulesLLM: raw.llmSpecs?.rules || {},
      };

  cachedData = {
    metrics: raw.metrics,
    llmSpecs,
    testCases: raw.testCases || [],
    results: raw.results || { structure: [], discount: [], rules: [] },
  };
  setCache('dashboard', cachedData);
  return cachedData!;
}

/**
 * Clear cached data (useful for refresh)
 */
export function clearCache(): void {
  cachedData = null;
  clearAllCache();
}

export const getMetrics = async (): Promise<Metrics> => {
  const data = await fetchDashboardData();
  return data.metrics;
};

export const getTestCases = async (): Promise<TestCase[]> => {
  const data = await fetchDashboardData();
  return data.testCases;
};

export const getResults = async (type: LLMType): Promise<TestResult[]> => {
  const data = await fetchDashboardData();
  return data.results[type];
};

export const getAllResults = async (): Promise<{
  structure: TestResult[];
  discount: TestResult[];
  rules: TestResult[];
}> => {
  const data = await fetchDashboardData();
  return data.results;
};

export const getLLMSpecs = async (): Promise<LLMSpecs> => {
  const data = await fetchDashboardData();
  return data.llmSpecs;
};

// Helper to join test case with result
export interface EnrichedResult {
  testCase: TestCase;
  result: TestResult;
}

export const getEnrichedResults = async (type: LLMType): Promise<EnrichedResult[]> => {
  const data = await fetchDashboardData();
  const results = data.results[type];
  const testCases = data.testCases;

  return results
    .map((r) => ({
      testCase: testCases.find((tc) => tc.id === r.testCaseId)!,
      result: r,
    }))
    .filter((r) => r.testCase); // Safety check
};
