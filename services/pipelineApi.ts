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
 * Parse comma-separated product types (and optional titles) into API format
 */
export function parseProducts(input: string, titlesInput?: string): { id: string; productType: string; title?: string }[] {
  if (!input.trim()) return [];
  const types = input.split(',').map(t => t.trim()).filter(Boolean);
  const titles = titlesInput?.trim()
    ? titlesInput.split(',').map(t => t.trim()).filter(Boolean)
    : [];
  return types.map((productType, i) => ({
    id: `p_${i + 1}`,
    productType,
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
