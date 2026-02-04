import { PipelineRequest, PipelineResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
 * Parse comma-separated product types into API format
 */
export function parseProducts(input: string): { id: string; productType: string }[] {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map(type => type.trim())
    .filter(Boolean)
    .map((productType, i) => ({ id: `p_${i + 1}`, productType }));
}

/**
 * Run the pipeline with the given inputs
 */
export async function runPipeline(request: PipelineRequest): Promise<PipelineResponse> {
  const response = await fetch(`${API_BASE_URL}/api/internalUtility/eBBotTesting/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
