import {
  TestCaseDefinition,
  EvaluationRun,
  EvaluationRunDetail,
  EvaluationResult,
  RunComparison,
  PromptVersionStats,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const BASE_PATH = '/api/internalUtility/bundleSetupLlmPipeline';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${BASE_PATH}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

/**
 * List all test cases (the constant 59)
 * Backend: GET /evaluation/testCases
 */
export async function getTestCases(category?: string): Promise<TestCaseDefinition[]> {
  const params = new URLSearchParams();
  if (category) {
    params.append('category', category);
  }
  const queryString = params.toString();
  const result = await apiFetch<{ testCases: TestCaseDefinition[] }>(`/evaluation/testCases${queryString ? `?${queryString}` : ''}`);
  return result.testCases || result as unknown as TestCaseDefinition[];
}

/**
 * Get single test case by ID
 * Backend: GET /evaluation/testCases/:id
 */
export async function getTestCase(id: number): Promise<TestCaseDefinition> {
  return apiFetch<TestCaseDefinition>(`/evaluation/testCases/${id}`);
}

/**
 * Get test case history across runs
 * Backend: GET /evaluation/testCases/:id/history
 */
export async function getTestCaseHistory(id: number, limit?: number): Promise<any> {
  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }
  const queryString = params.toString();
  return apiFetch<any>(`/evaluation/testCases/${id}/history${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get categories with counts
 * Backend: GET /evaluation/categories
 */
export async function getCategories(): Promise<{ name: string; count: number }[]> {
  const result = await apiFetch<{ categories: { name: string; count: number }[] }>('/evaluation/categories');
  return result.categories || result as unknown as { name: string; count: number }[];
}

/**
 * List evaluation runs (paginated)
 * Backend: GET /evaluation/runs
 */
export async function getEvaluationRuns(
  page?: number,
  limit?: number,
  category?: string
): Promise<{
  runs: EvaluationRun[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (page !== undefined) {
    params.append('page', String(page));
  }
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }
  if (category) {
    params.append('category', category);
  }
  const queryString = params.toString();
  return apiFetch<{
    runs: EvaluationRun[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/evaluation/runs${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get single run with all results
 * Backend: GET /evaluation/runs/:runId
 */
export async function getEvaluationRun(runId: string): Promise<EvaluationRunDetail> {
  return apiFetch<EvaluationRunDetail>(`/evaluation/runs/${runId}`);
}

/**
 * Get latest evaluation run (convenience - fetches first from paginated list)
 * Backend: GET /evaluation/runs?limit=1
 */
export async function getLatestEvaluationRun(): Promise<EvaluationRunDetail | null> {
  try {
    const result = await getEvaluationRuns(1, 1);
    if (result.runs && result.runs.length > 0) {
      // Fetch full details of the latest run
      return getEvaluationRun(result.runs[0].runId);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get failed cases from a run
 * Backend: GET /evaluation/runs/:runId/failures
 */
export async function getRunFailures(runId: string): Promise<EvaluationResult[]> {
  const result = await apiFetch<{ failures: EvaluationResult[] }>(`/evaluation/runs/${runId}/failures`);
  return result.failures || result as unknown as EvaluationResult[];
}

/**
 * Trigger new evaluation
 * Backend: POST /evaluation/run
 */
export async function triggerEvaluation(options?: {
  category?: string;
  dryRun?: boolean;
}): Promise<{ status: string; startedAt: string }> {
  const body: Record<string, any> = {};
  if (options?.category) {
    body.category = options.category;
  }
  if (options?.dryRun !== undefined) {
    body.dryRun = options.dryRun;
  }

  return apiFetch<{ status: string; startedAt: string }>('/evaluation/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Compare two runs
 * Backend: GET /evaluation/compare?runId1=X&runId2=Y
 */
export async function compareRuns(runId1: string, runId2: string): Promise<RunComparison> {
  return apiFetch<RunComparison>(`/evaluation/compare?runId1=${encodeURIComponent(runId1)}&runId2=${encodeURIComponent(runId2)}`);
}

/**
 * Get prompt version stats
 * Backend: GET /evaluation/promptVersions
 */
export async function getPromptVersionStats(): Promise<PromptVersionStats> {
  return apiFetch<PromptVersionStats>('/evaluation/promptVersions');
}
