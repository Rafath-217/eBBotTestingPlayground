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
 */
export async function getTestCases(category?: string): Promise<TestCaseDefinition[]> {
  const params = new URLSearchParams();
  if (category) {
    params.append('category', category);
  }
  const queryString = params.toString();
  return apiFetch<TestCaseDefinition[]>(`/testCases${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get single test case by ID
 */
export async function getTestCase(id: number): Promise<TestCaseDefinition> {
  return apiFetch<TestCaseDefinition>(`/testCases/${id}`);
}

/**
 * Get test case history across runs
 */
export async function getTestCaseHistory(id: number, limit?: number): Promise<any> {
  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }
  const queryString = params.toString();
  return apiFetch<any>(`/testCases/${id}/history${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get categories with counts
 */
export async function getCategories(): Promise<{ name: string; count: number }[]> {
  return apiFetch<{ name: string; count: number }[]>('/categories');
}

/**
 * List evaluation runs (paginated)
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
  }>(`/evaluations${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get single run with all results
 */
export async function getEvaluationRun(runId: string): Promise<EvaluationRunDetail> {
  return apiFetch<EvaluationRunDetail>(`/evaluations/${runId}`);
}

/**
 * Get latest evaluation run (convenience)
 */
export async function getLatestEvaluationRun(): Promise<EvaluationRunDetail | null> {
  return apiFetch<EvaluationRunDetail | null>('/evaluations/latest');
}

/**
 * Get failed cases from a run
 */
export async function getRunFailures(runId: string): Promise<EvaluationResult[]> {
  return apiFetch<EvaluationResult[]>(`/evaluations/${runId}/failures`);
}

/**
 * Trigger new evaluation
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

  return apiFetch<{ status: string; startedAt: string }>('/evaluations/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Compare two runs
 */
export async function compareRuns(runId1: string, runId2: string): Promise<RunComparison> {
  return apiFetch<RunComparison>(`/evaluations/compare?run1=${encodeURIComponent(runId1)}&run2=${encodeURIComponent(runId2)}`);
}

/**
 * Get prompt version stats
 */
export async function getPromptVersionStats(): Promise<PromptVersionStats> {
  return apiFetch<PromptVersionStats>('/evaluations/promptVersionStats');
}
