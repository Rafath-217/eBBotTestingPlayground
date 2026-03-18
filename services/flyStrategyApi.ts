const FLY_API_BASE_URL = process.env.FLY_API_BASE_URL || 'http://localhost:3002';
const API_SECRET_KEY = process.env.DASHBOARD_KEY || '';

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

export interface FlyStrategyHistoryEntry {
  _id: string;
  shopName: string;
  status?: string;
  tier?: number;
  tierLabel?: string;
  totalRecommendations?: number;
  hasMinimumViable?: boolean;
  productsFound?: number;
  ordersFound?: number;
  organicOrders?: number;
  groupingStrategy?: string;
  durationMs?: number;
  error?: string | null;
  result?: FlyStrategyResult;
  createdAt: string;
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
 * Fetch fly strategy run history
 */
export async function getFlyStrategyHistory(limit = 20): Promise<FlyStrategyHistoryEntry[]> {
  const response = await fetch(`${FLY_API_BASE_URL}/api/flyBundleRecommendations/history?limit=${limit}`, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.entries)) return data.entries;
  if (Array.isArray(data.history)) return data.history;
  if (Array.isArray(data.runs)) return data.runs;
  return [];
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
