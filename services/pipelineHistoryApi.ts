import { PipelineHistoryResponse, PipelineHistoryQuery, FeedbackRating } from '../types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_SECRET_KEY = process.env.DASHBOARD_KEY || '';

/**
 * Fetch pipeline history with optional filtering and pagination
 */
export async function getPipelineHistory(query: PipelineHistoryQuery = {}): Promise<PipelineHistoryResponse> {
  const params = new URLSearchParams();

  if (query.startDate) {
    params.append('startDate', query.startDate);
  }
  if (query.endDate) {
    params.append('endDate', query.endDate);
  }
  if (query.page !== undefined) {
    params.append('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.append('limit', String(query.limit));
  }
  if (query.source && query.source !== 'ALL') {
    params.append('source', query.source);
  }
  if (query.feedback && query.feedback !== 'ALL') {
    params.append('feedback', query.feedback);
  }
  if (query.merchantText && query.merchantText !== 'ALL') {
    params.append('merchantText', query.merchantText);
  }
  if (query.patterns && query.patterns.length > 0) {
    params.append('patterns', query.patterns.join(','));
  }
  if (query.shopifyPlanName && query.shopifyPlanName !== 'ALL') {
    params.append('shopifyPlanName', query.shopifyPlanName);
  }
  if (query.bundleType && query.bundleType !== 'ALL') {
    params.append('bundleType', query.bundleType);
  }
  if (query.minViews != null) {
    params.append('minViews', String(query.minViews));
  }
  if (query.minRevenueUSD != null) {
    params.append('minRevenueUSD', String(query.minRevenueUSD));
  }
  if (query.uniqueStores) {
    params.append('uniqueStores', 'true');
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/pipelineHistory${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch available Shopify plans for filtering
 */
export async function getShopifyPlans(): Promise<string[]> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/pipelineHistory/shopifyPlans`;

  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data?.plans || [];
}

/**
 * Fetch available pattern tags for filtering
 */
export async function getPatternTags(): Promise<string[]> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/pipelineHistory/patternTags`;

  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data?.tags || [];
}

/**
 * Search pipeline history by shop name
 */
export async function searchPipelineHistory(query: { shopName: string; page?: number; limit?: number }): Promise<PipelineHistoryResponse> {
  const params = new URLSearchParams();
  params.append('shopName', query.shopName);
  if (query.page !== undefined) {
    params.append('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.append('limit', String(query.limit));
  }

  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/pipelineHistory/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Submit feedback for a pipeline history entry
 */
export async function submitFeedback(id: string, rating: FeedbackRating, remarks: string = ''): Promise<{ statusCode: number; message: string; data: any }> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/pipelineHistory/${id}/feedback`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'secret-key': API_SECRET_KEY,
    },
    body: JSON.stringify({ rating, remarks }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Update spec for a pipeline history entry
 */
export async function updateSpec(id: string, spec: string): Promise<{ statusCode: number; message: string; data: any }> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/pipelineHistory/${id}/updateSpec`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'secret-key': API_SECRET_KEY,
    },
    body: JSON.stringify({ text: spec }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
