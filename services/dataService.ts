import { TestCase, TestResult, Metrics, LLMType, LLMSpecs } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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

  console.log('Fetching dashboard data from:', `${API_BASE_URL}/internalUtility/eBBotTesting/dashboard`);

  const response = await fetch(`${API_BASE_URL}/internalUtility/eBBotTesting/dashboard`);
  if (!response.ok) {
    const text = await response.text();
    console.error('Dashboard API error:', response.status, text);
    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
  }

  const json = await response.json();
  console.log('Dashboard data received:', json);

  if (!json.data) {
    throw new Error('No data in response');
  }

  cachedData = json.data;
  return cachedData!;
}

/**
 * Clear cached data (useful for refresh)
 */
export function clearCache(): void {
  cachedData = null;
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
