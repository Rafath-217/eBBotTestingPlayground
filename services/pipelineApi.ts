import { PipelineRequest, PipelineResponse } from '../types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_SECRET_KEY = process.env.DASHBOARD_KEY || '';

/**
 * Parse comma-separated collection titles into API format
 */
export function parseCollections(input: string): { id: string; title: string }[] {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map(title => title.trim())
    .filter(Boolean)
    .map((title, i) => ({ id: `col_${i + 1}`, title }));
}

/**
 * Parse comma-separated product titles and types into API format.
 * Titles and types are paired positionally: title 1 → type 1, title 2 → type 2, etc.
 * Either input can be provided independently.
 */
export function parseProducts(typesInput: string, titlesInput?: string): { id: string; productType: string; title?: string }[] {
  const types = typesInput.trim()
    ? typesInput.split(',').map(t => t.trim()).filter(Boolean)
    : [];
  const titles = titlesInput?.trim()
    ? titlesInput.split(',').map(t => t.trim()).filter(Boolean)
    : [];
  const length = Math.max(types.length, titles.length);
  if (length === 0) return [];
  return Array.from({ length }, (_, i) => ({
    id: `p_${i + 1}`,
    productType: types[i] || '',
    ...(titles[i] ? { title: titles[i] } : {}),
  }));
}

/**
 * Run the pipeline with the given inputs
 */
export async function runPipeline(request: PipelineRequest): Promise<PipelineResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bundleSetupLlmPipeline/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'secret-key': API_SECRET_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Re-run a pipeline using a previous run's ID.
 * The backend reads the original input from the DB.
 */
export async function rerunPipeline(runId: string): Promise<PipelineResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bundleSetupLlmPipeline/rerun`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'secret-key': API_SECRET_KEY,
    },
    body: JSON.stringify({ runId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
