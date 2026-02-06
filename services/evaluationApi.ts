import {
  TestCaseDefinition,
  EvaluationRun,
  EvaluationRunDetail,
  EvaluationResult,
  RunComparison,
  PromptVersionStats,
} from '../types';
import { getCached, setCache, removeCacheByPrefix } from './cache';

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
  const cacheKey = `testCases_${category || 'all'}`;
  const cached = getCached<TestCaseDefinition[]>(cacheKey);
  if (cached !== undefined) return cached;

  const params = new URLSearchParams();
  if (category) {
    params.append('category', category);
  }
  const queryString = params.toString();
  const result = await apiFetch<{ testCases: TestCaseDefinition[] }>(`/evaluation/testCases${queryString ? `?${queryString}` : ''}`);
  const data = result.testCases || result as unknown as TestCaseDefinition[];
  setCache(cacheKey, data);
  return data;
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
  const cached = getCached<{ name: string; count: number }[]>('categories');
  if (cached !== undefined) return cached;

  const result = await apiFetch<{ categories: { name: string; count: number }[] }>('/evaluation/categories');
  const data = result.categories || result as unknown as { name: string; count: number }[];
  setCache('categories', data);
  return data;
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
  const cacheKey = `evalRuns_${page ?? ''}_${limit ?? ''}_${category ?? ''}`;
  const cached = getCached<{ runs: EvaluationRun[]; total: number; page: number; totalPages: number }>(cacheKey);
  if (cached !== undefined) return cached;

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
  const result = await apiFetch<{
    runs: any[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/evaluation/runs${queryString ? `?${queryString}` : ''}`);

  // Backend returns flat fields (accuracy, passed, failed, partial, errors)
  // but frontend expects nested summary.overall structure
  const runs: EvaluationRun[] = (result.runs || []).map((run: any) => ({
    ...run,
    summary: run.summary || {
      overall: {
        accuracy: run.accuracy ?? 0,
        passed: run.passed ?? 0,
        failed: run.failed ?? 0,
        partial: run.partial ?? 0,
        errors: run.errors ?? 0,
      },
      byLlm: run.byLlm || {},
      byCategory: run.byCategory || {},
    },
  }));

  const data = { ...result, runs };
  setCache(cacheKey, data);
  return data;
}

/**
 * Get single run with all results
 * Backend: GET /evaluation/runs/:runId
 */
export async function getEvaluationRun(runId: string): Promise<EvaluationRunDetail> {
  const cacheKey = `evalRun_${runId}`;
  const cached = getCached<EvaluationRunDetail>(cacheKey);
  if (cached !== undefined) return cached;

  const data = await apiFetch<EvaluationRunDetail>(`/evaluation/runs/${runId}`);
  setCache(cacheKey, data);
  return data;
}

/**
 * Get latest evaluation run (convenience - fetches first from paginated list)
 * Backend: GET /evaluation/runs?limit=1
 */
export async function getLatestEvaluationRun(): Promise<EvaluationRunDetail | null> {
  const cached = getCached<EvaluationRunDetail | null>('latestRun');
  if (cached !== undefined) return cached;

  try {
    const result = await getEvaluationRuns(1, 1);
    if (result.runs && result.runs.length > 0) {
      // Fetch full details of the latest run
      const run = await getEvaluationRun(result.runs[0].runId);
      setCache('latestRun', run);
      return run;
    }
    setCache('latestRun', null);
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

  const data = await apiFetch<{ status: string; startedAt: string }>('/evaluation/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Invalidate run-related caches so next fetch gets fresh data
  removeCacheByPrefix('evalRun');
  removeCacheByPrefix('latestRun');
  removeCacheByPrefix('promptVersions');

  return data;
}

/**
 * Compare two runs
 * Backend: GET /evaluation/compare?runId1=X&runId2=Y
 */
export async function compareRuns(runId1: string, runId2: string): Promise<RunComparison> {
  const cacheKey = `compare_${runId1}_${runId2}`;
  const cached = getCached<RunComparison>(cacheKey);
  if (cached !== undefined) return cached;

  const data = await apiFetch<RunComparison>(`/evaluation/compare?runId1=${encodeURIComponent(runId1)}&runId2=${encodeURIComponent(runId2)}`);
  setCache(cacheKey, data);
  return data;
}

/**
 * Get prompt version stats
 * Backend: GET /evaluation/promptVersions
 */
export async function getPromptVersionStats(): Promise<PromptVersionStats> {
  const cached = getCached<PromptVersionStats>('promptVersions');
  if (cached !== undefined) return cached;

  const data = await apiFetch<PromptVersionStats>('/evaluation/promptVersions');
  setCache('promptVersions', data);
  return data;
}
