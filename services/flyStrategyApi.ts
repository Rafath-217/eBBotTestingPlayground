const FLY_API_BASE_URL = process.env.STAG_GIFTWRAP_API_BASE_URL || 'http://localhost:3002';
const API_SECRET_KEY = process.env.STAG_GIFTWRAP_KEY || '';

export interface FlyStrategyResult {
  success?: boolean;
  shopName?: string;
  storeTrace?: string[];
  recommendation: {
    bundleStrategy: {
      formatAdvice: { format: string; priority: string; reason: string }[];
      fbtTriggers: any[];
      customPools: any[];
      fixedBundles: any[];
      volumeDiscounts: any[];
    };
    pb: {
      recommend: boolean;
      confidence: string;
      pbScore: number;
      qbScore: number;
      reasoning: string;
      suggestedBundles: any[];
      anchorProducts: any[];
    };
    qb: {
      candidateCount: number;
      candidates: { productId: string; title: string; totalOrders: number; multiBuyOrders: number; multiBuyPct: number }[];
    };
    fbt: {
      pairCount: number;
      multiItemPct: number;
      pairs: any[];
    };
  };
  mvr: {
    tier: { tier: number; label: string; reason: string };
    orderStrategy: { useOrganic: boolean; useTotal: boolean; confidence: string; reason: string };
    hasMinimumViable: boolean;
    totalRecommendations: number;
    productGrouping: {
      strategy: string;
      quality: string;
      coverage: number;
      groupCount: number;
      filteredProducts?: number;
    };
    dataQualityHints: (string | { field: string; severity: string; message: string; action: string })[];
  };
  signals: Record<string, number>;
  stats: {
    productsFound: number;
    ordersFound: number;
    organicOrders: number;
    elapsedMs: number;
    [key: string]: any;
  };
}

export type FeedbackType = 'correct' | 'incorrect' | 'partially_correct';

export interface FlyStrategyHistoryEntry {
  _id: string;
  shopName: string;
  status?: string;
  tier?: number;
  tierLabel?: string;
  shopifyPlan?: string;
  recommendationStrength?: string;
  totalRecommendations?: number;
  hasMinimumViable?: boolean;
  productsFound?: number;
  ordersFound?: number;
  organicOrders?: number;
  groupingStrategy?: string;
  durationMs?: number;
  triggeredBy?: string;
  variantPairsBlocked?: number;
  error?: string | null;
  result?: FlyStrategyResult;
  feedback?: FeedbackType;
  feedbackText?: string;
  feedbackAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HistoryFilters {
  page?: number;
  limit?: number;
  shopName?: string;
  status?: string;
  tier?: string;
  tierLabel?: string;
  shopifyPlan?: string;
  recommendationStrength?: string;
  hasMinimumViable?: string;
  minProducts?: number;
  maxProducts?: number;
  minOrders?: number;
  maxOrders?: number;
  minOrganic?: number;
  noOrganic?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface HistoryResponse {
  success: boolean;
  count: number;
  pagination: HistoryPagination;
  runs: FlyStrategyHistoryEntry[];
}

/**
 * Run fly strategy recommendation for a store
 */
export async function runFlyStrategy(shopName: string): Promise<FlyStrategyHistoryEntry> {
  const response = await fetch(`${FLY_API_BASE_URL}/api/flyBundleRecommendations/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'secret-key': API_SECRET_KEY,
    },
    body: JSON.stringify({ shopName }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch fly strategy run history with filters and pagination
 */
export async function getFlyStrategyHistory(filters: HistoryFilters = {}): Promise<HistoryResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  if (!params.has('limit')) params.set('limit', '20');

  const response = await fetch(`${FLY_API_BASE_URL}/api/flyBundleRecommendations/history?${params}`, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();

  // Handle both new paginated response and legacy formats
  if (data.pagination && data.runs) {
    return data as HistoryResponse;
  }

  // Legacy fallback: wrap array response in paginated format
  const runs = Array.isArray(data) ? data
    : Array.isArray(data.entries) ? data.entries
    : Array.isArray(data.history) ? data.history
    : Array.isArray(data.runs) ? data.runs
    : [];

  return {
    success: true,
    count: runs.length,
    pagination: {
      page: 1,
      limit: runs.length,
      totalItems: runs.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    runs,
  };
}

/**
 * Fetch full detail for a single history entry
 */
export async function getFlyStrategyHistoryDetail(id: string): Promise<FlyStrategyHistoryEntry> {
  const response = await fetch(`${FLY_API_BASE_URL}/api/flyBundleRecommendations/history/${id}`, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  // Detail endpoint returns { success, run: { ... } }
  return data.run || data;
}

/**
 * Poll for a completed recommendation result
 */
export async function pollForResult(
  id: string,
  onProgress?: (msg: string) => void,
  intervalMs = 3000,
  timeoutMs = 300000,
): Promise<FlyStrategyHistoryEntry> {
  const start = Date.now();
  const messages = [
    'Fetching products from Shopify...',
    'Analyzing order history...',
    'Detecting co-purchase patterns...',
    'Building bundle recommendations...',
    'Scoring and ranking...',
    'Almost done...',
  ];
  let msgIdx = 0;

  while (Date.now() - start < timeoutMs) {
    const detail = await getFlyStrategyHistoryDetail(id);
    if (detail.status === 'completed' && detail.result) return detail;
    if (detail.status === 'error') throw new Error(detail.error || 'Processing failed');

    if (onProgress && msgIdx < messages.length) {
      onProgress(messages[msgIdx]);
      msgIdx++;
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Recommendation timed out — please try again');
}

export interface FeedbackResponse {
  success: boolean;
  runId: string;
  feedback: string;
  feedbackText?: string;
  feedbackAt: string;
}

/**
 * Submit feedback for a pipeline run
 */
export async function submitRunFeedback(
  id: string,
  feedback: FeedbackType,
  text?: string,
): Promise<FeedbackResponse> {
  const response = await fetch(`${FLY_API_BASE_URL}/api/flyBundleRecommendations/history/${id}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'secret-key': API_SECRET_KEY,
    },
    body: JSON.stringify({ feedback, text: text || undefined }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
