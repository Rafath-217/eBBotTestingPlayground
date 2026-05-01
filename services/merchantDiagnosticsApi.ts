const API_BASE_URL = process.env.STAG_GIFTWRAP_API_BASE_URL || 'http://localhost:3002';
const API_SECRET_KEY = process.env.STAG_GIFTWRAP_KEY || '';

export interface DiagnosticWindow {
  type: string;
  monthKey?: string | null;
  startDate: string;
  endDate: string;
  days?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StoreInsightRow {
  shopName: string;
  industry: string;
  shopifyPlanGroup: string;
  appPlanGroup: string;
  priceBand: string;
  bundleSetup: string;
  storeRevenue: number | null;
  storeOrders: number | null;
  storeSessions: number | null;
  storeAov: number | null;
  ebRevenueUsd: number | null;
  ebOrders: number | null;
  ebAovUsd: number | null;
  ebSessions: number | null;
  completionRate: number | null;
  ebRevenueShare: number | null;
  aovLift: number | null;
  activeBundleCount: number;
  bundleCount: number;
  reliabilityLevel: string;
  flags: string[];
}

export interface BundleInsightRow {
  shopName: string;
  industry: string;
  priceBand: string;
  bundleRef: string;
  title: string;
  bundlingStrategy: string;
  offerStrategy: string;
  rawOfferType?: string;
  bundleLink: string | null;
  revenueUsd: number | null;
  orders: number | null;
  sessions: number | null;
  completionRate: number | null;
  conversionRate: number | null;
  revenueRankInStore: number | null;
}

export interface SegmentRow {
  segment: string;
  storeCount?: number;
  storesWithEbRevenue?: number;
  bundleCount?: number;
  ebRevenueUsd?: number;
  revenueUsd?: number;
  orders?: number;
  sessions?: number;
  medianStoreRevenue?: number | null;
  medianEbRevenueUsd?: number | null;
  medianEbRevenueShare?: number | null;
  medianCompletionRate?: number | null;
  medianAovLift?: number | null;
  sampleQuality?: string;
}

export interface FilterOptions {
  industries?: string[];
  shopifyPlanGroups?: string[];
  appPlanGroups?: string[];
  priceBands?: string[];
  bundleSetups?: string[];
  bundlingStrategies?: string[];
  offerStrategies?: string[];
}

export interface SummaryResponse {
  success: boolean;
  window: DiagnosticWindow;
  summary: Record<string, number | string | boolean | null>;
  coverage: { stores: Record<string, number>; bundles: Record<string, number> };
  revenueByIndustry: SegmentRow[];
  revenueByBundlingStrategy: SegmentRow[];
  revenueByOfferStrategy: SegmentRow[];
  filters: FilterOptions;
  caveats: string[];
}

export interface BaselineResponse {
  success: boolean;
  window: DiagnosticWindow;
  preset: string;
  candidatePool: Record<string, number>;
  segments: Record<string, SegmentRow[]>;
  rows: StoreInsightRow[];
  pagination: Pagination;
  caveats: string[];
}

export interface AovImpactResponse {
  success: boolean;
  window: DiagnosticWindow;
  preset: string;
  claim: { text: string; storeCount: number; positiveLiftStores: number; positiveLiftPercent: number | null; medianAovLift: number | null };
  distribution: Record<string, number | null>;
  segments: Record<string, SegmentRow[]>;
  rows: StoreInsightRow[];
  bundleDrivers: BundleInsightRow[];
  pagination: Pagination;
  caveats: string[];
}

export interface BundleDriversResponse {
  success: boolean;
  window: DiagnosticWindow;
  summary: Record<string, number | null>;
  revenueByBundlingStrategy: SegmentRow[];
  revenueByOfferStrategy: SegmentRow[];
  rows: BundleInsightRow[];
  pagination: Pagination;
  caveats: string[];
}

export interface StoreInsightResponse {
  success: boolean;
  window: DiagnosticWindow;
  store: StoreInsightRow;
  sourceSummary: Record<string, string>;
  bundles: BundleInsightRow[];
  caveats: string[];
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

async function request<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}/api/merchantDiagnosticSnapshots${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), {
    headers: API_SECRET_KEY ? { 'secret-key': API_SECRET_KEY } : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(async () => ({ error: await response.text().catch(() => 'Network error') }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const getMerchantDiagnosticsSummary = (params: QueryParams = {}) =>
  request<SummaryResponse>('/insights/summary', params);

export const getMerchantDiagnosticsBaseline = (params: QueryParams = {}) =>
  request<BaselineResponse>('/insights/baseline', params);

export const getMerchantDiagnosticsAovImpact = (params: QueryParams = {}) =>
  request<AovImpactResponse>('/insights/aov-impact', params);

export const getMerchantDiagnosticsBundleDrivers = (params: QueryParams = {}) =>
  request<BundleDriversResponse>('/insights/bundle-drivers', params);

export const getMerchantDiagnosticsStore = (shopName: string, params: QueryParams = {}) =>
  request<StoreInsightResponse>(`/insights/store/${encodeURIComponent(shopName)}`, params);
