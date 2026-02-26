const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_SECRET_KEY = process.env.DASHBOARD_KEY || '';

export interface ChurnReason {
  reason: string;
  evidence: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ChurnedStore {
  shopName: string;
  pipelineRuns: number;
  firstRunDate: string;
  lastRunDate: string;
  uninstalledAt: string;
  timeToUninstall: string;
  timeToUninstallMs: number;
  hadGeminiErrors: boolean;
  churnReasons: ChurnReason[];
}

export interface ChurnPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChurnQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minRuns?: number;
  maxRuns?: number;
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
  hadErrors?: string;
  search?: string;
}

export interface StoreDetailRun {
  _id: string;
  createdAt: string;
  input: {
    merchantText: string;
    products: { id: string; title: string }[];
    collections: { id: string; title: string }[];
  };
  llmOutputs: {
    structureOutput: any;
    discountOutput: any;
    rulesOutput: any;
  };
  assembledResult: any;
  aiPayload: { bundleName: string; stepsCount: number } | null;
  totalDurationMs: number;
  geminiError: boolean;
  geminiErrorLLMsFailed: string[];
  source: string;
  churnData: any;
}

export interface ShopSnapshot {
  plan: string;
  currency: string;
  country: string;
  installedAt: string;
  uninstalledAt: string;
  isAppInstalled: boolean;
}

export interface TimelineEvent {
  event: 'installed' | 'pipeline_run' | 'uninstalled';
  date: string;
  runId?: string;
}

export interface StoreDetail {
  shopName: string;
  runs: StoreDetailRun[];
  shopSnapshot: ShopSnapshot | null;
  timeline: TimelineEvent[];
}

export async function getChurnedStores(query: ChurnQuery = {}): Promise<{
  statusCode: number;
  message: string;
  data: { stores: ChurnedStore[]; pagination: ChurnPagination };
}> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis?${params.toString()}`;
  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getStoreDetail(shopName: string): Promise<{
  statusCode: number;
  message: string;
  data: StoreDetail;
}> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/${encodeURIComponent(shopName)}`;
  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface ChurnAnalysisResult {
  summary: string;
  reasons: ChurnReason[];
}

export async function analyseStore(shopName: string): Promise<{
  statusCode: number;
  message: string;
  data: ChurnAnalysisResult;
}> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/${encodeURIComponent(shopName)}/analyse`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Churn Report Types ──

export interface ReasonStoreEntry {
  shopName: string;
  merchantText?: string;
  runs?: number;
}

export interface IntentGapStoreEntry {
  shopName: string;
  gaps: string[];
  gapSeverity: 'low' | 'medium' | 'high';
  gapSummary: string;
}

export interface ChurnReportReasonDetail {
  reason: string;
  storeCount: number;
  percentage: number;
  stores?: (ReasonStoreEntry | IntentGapStoreEntry)[];
}

// ── Gap Analysis Types ──

export interface GapAnalysisDetail {
  hasGap: boolean;
  gaps: string[];
  severity: 'low' | 'medium' | 'high';
  summary: string;
}

export interface GapAnalysis {
  storesAnalyzed: number;
  storesWithGaps: number;
  details: Record<string, GapAnalysisDetail>;
}

export interface ChurnReportCategory {
  category: string;
  storesAffected: number;
  percentage: number;
  topReasons: ChurnReportReasonDetail[];
}

export interface ChurnReportTimeBucket {
  label: string;
  count: number;
}

export interface ChurnReportRunBucket {
  label: string;
  count: number;
}

export interface ChurnReportUsagePatterns {
  runCountDistribution: ChurnReportRunBucket[];
  errorRate: number;
  storesWithErrors: number;
  storesWithMerchantText: number;
  storesWithoutMerchantText: number;
}

export interface ChurnReportExecutiveSummary {
  totalChurnedStores: number;
  totalPipelineRuns: number;
  avgPipelineRunsPerStore: number;
  avgTimeToUninstall: string;
  avgTimeToUninstallMs: number;
  medianTimeToUninstall: string;
  medianTimeToUninstallMs: number;
  errorRate: number;
  storesWithErrors: number;
  storesWithMerchantText: number;
}

export interface ChurnReportInsight {
  priority: number;
  severity: 'high' | 'medium' | 'low';
  insight: string;
}

export interface ChurnReport {
  executiveSummary: ChurnReportExecutiveSummary | null;
  reasonsBreakdown: ChurnReportCategory[];
  timeDistribution: ChurnReportTimeBucket[];
  usagePatterns: ChurnReportUsagePatterns | null;
  actionableInsights: ChurnReportInsight[];
  generatedAt?: string;
}

export async function getChurnReport(): Promise<{
  statusCode: number;
  message: string;
  data: ChurnReport;
}> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/report`;
  const response = await fetch(url, {
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Stored Report Types ──

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  shopNames?: string[];
  minRuns?: number;
  maxRuns?: number;
  hadErrors?: boolean;
}

export interface StoredReport {
  _id: string;
  filters: ReportFilters;
  deterministicAnalysis: {
    executiveSummary: any;
    reasonsBreakdown: any[];
    timeDistribution: any[];
    usagePatterns: any;
  };
  llmAnalysis: {
    insights: any[];
    patterns: any[];
    recommendations: any[];
  };
  gapAnalysis?: GapAnalysis;
  summary: string;
  actionableInsights: any[];
  storesAnalyzed: number;
  totalLogsAnalyzed: number;
  generationDurationMs: number;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredReportSummary {
  _id: string;
  filters: ReportFilters;
  summary: string;
  actionableInsights: any[];
  storesAnalyzed: number;
  totalLogsAnalyzed: number;
  generationDurationMs: number;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
}

// ── Stored Report API Functions ──

export async function generateReport(filters: ReportFilters = {}): Promise<{ statusCode: number; data: { reportId: string; status: string } }> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/report/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'secret-key': API_SECRET_KEY },
    body: JSON.stringify(filters),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getStoredReports(query: { page?: number; limit?: number } = {}): Promise<{ statusCode: number; data: { reports: StoredReportSummary[]; pagination: ChurnPagination } }> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.append('page', String(query.page));
  if (query.limit !== undefined) params.append('limit', String(query.limit));
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/reports${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, { headers: { 'secret-key': API_SECRET_KEY } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getReportById(id: string): Promise<{ statusCode: number; data: StoredReport }> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/reports/${id}`;
  const response = await fetch(url, { headers: { 'secret-key': API_SECRET_KEY } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deleteReport(id: string): Promise<{ statusCode: number; message: string }> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/reports/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'secret-key': API_SECRET_KEY },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function backfillChurnData(): Promise<{
  statusCode: number;
  message: string;
  data: { annotated: number; total: number; skippedInstalled: number };
}> {
  const url = `${API_BASE_URL}/api/bundleSetupLlmPipeline/churnAnalysis/backfill`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'secret-key': API_SECRET_KEY },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
