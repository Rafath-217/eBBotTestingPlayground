// ─── EB Store Success Metrics Types ─────────────────────────────────────────

export interface StoreProfile {
  shopName: string
  isEbInstalled: boolean
  isKiteInstalled: boolean
  skuCount: number
  medianProductPrice: number
  priceP25: number
  priceP75: number
  priceBand: 'low' | 'mid' | 'high'
  industry: string
  subIndustry: string
  complementarityScore: number
  totalRevenue60: number
  totalOrders60: number
  aov60: number
  repeatRate60: number
  revenueConcentration60: number
  bundleRevenue60: number
  bundleOrders60: number
  bundleRevenueContribution60: number
  attachRate60: number
  stabilityScore60: number
  ebSuccessTier: 'strong' | 'moderate' | 'weak'
  lastStructuralUpdateAt: string
  lastPerformanceUpdateAt: string
  lastEbMetricsUpdateAt: string
  industryClassificationInput?: {
    topProductTypes: string[]
    sampleTitles: string[]
    totalProducts: number
  }
  industryVerified?: boolean
  industryVerifiedAt?: string
  industryVerifiedBy?: string
  classificationConfidence?: number
  bundleStrategySummary?: BundleStrategySummary
  bundleLinks?: BundleLink[]
  shopifyPlan?: string
}

export type SuccessTier = 'strong' | 'moderate' | 'weak'
export type PriceBand = 'low' | 'mid' | 'high'
export type SortOrder = 'asc' | 'desc'

export interface ProfilesQueryParams {
  page?: number
  limit?: number
  search?: string
  ebSuccessTier?: SuccessTier
  industry?: string
  priceBand?: PriceBand
  sortBy?: string
  sortOrder?: SortOrder
  industryVerified?: boolean
  bundleType?: string
  dominantType?: string
  strategyFamily?: string
  minRevenueShare?: number
  shopifyPlan?: string
}

export interface ProfilesPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProfilesResponse {
  statusCode: number
  message: string
  data: {
    profiles: StoreProfile[]
    pagination: ProfilesPagination
  }
}

export interface DashboardStats {
  totalStores: number
  tierBreakdown: Record<SuccessTier, number>
  industryTop5: { industry: string; count: number }[]
  priceBandBreakdown: Record<PriceBand, number>
  avgAov: number
  avgBundleRevenueContribution: number
  avgAttachRate: number
  shopifyPlanBreakdown?: { plan: string; count: number }[]
}

export interface DashboardStatsResponse {
  statusCode: number
  message: string
  data: DashboardStats
}

export interface FilterOption {
  value: string
  label: string
}

export interface FiltersResponse {
  statusCode: number
  message: string
  data: {
    ebSuccessTier: SuccessTier[]
    industry: string[]
    priceBand: PriceBand[]
    bundleType?: FilterOption[]
    strategyFamily?: FilterOption[]
    dominantStrategy?: FilterOption[]
  }
}

export interface UpdateIndustryPayload {
  industry: string
  subIndustry: string
  verifiedBy: string
}

export interface RunAllResult {
  duration: string
  storesProcessed: number
  structural: { success: string[]; failed: { shopName: string; error: string }[] }
  shopifyPerformance: { success: string[]; failed: { shopName: string; error: string }[] }
  ebMetrics: { success: string[]; failed: { shopName: string; error: string }[] }
}

export interface RunAllResponse {
  statusCode: number
  message: string
  data: RunAllResult
}

// ─── Store Advisor Types ──────────────────────────────────────────────────────

export interface RevenueShareEntry {
  share: number
  revenue: number
}

export interface ClassicRevenueShare extends RevenueShareEntry {
  subtypes?: Record<string, RevenueShareEntry>
}

export interface MixAndMatchRevenueShare extends RevenueShareEntry {
  subtypes?: Record<string, RevenueShareEntry>
}

export interface RevenueShareByType {
  classic?: ClassicRevenueShare
  mixAndMatch?: MixAndMatchRevenueShare
}

export interface BundleLink {
  name: string
  link?: string
  type: string
  subtype: string
  status: 'ACTIVE' | 'PAUSED'
}

export interface BundleStrategySummary {
  totalActiveBundles?: number
  dominantStrategy?: string
  dominantStrategyFamily?: string
  bundleTypes?: Record<string, number>
  avgDiscountPercent?: number
  avgProductsPerBundle?: number
  topBundlePattern?: string
  revenueShareByType?: RevenueShareByType
}

export interface MatchedStore {
  shopName: string
  matchScore: number
  matchType: 'same_industry' | 'adjacent' | 'general'
  industry: string
  subIndustry: string
  skuCount: number
  priceBand: string
  attachRate60: number
  bundleRevenueContribution60: number
  stabilityScore60: number
  ebSuccessTier: string
  bundleStrategySummary?: BundleStrategySummary
}

export interface MatchedStoresResponse {
  statusCode: number
  message: string
  data: {
    shopName: string
    matchedStores: MatchedStore[]
  }
}
