import axios from 'axios'
import type {
  ProfilesQueryParams,
  ProfilesResponse,
  DashboardStatsResponse,
  FiltersResponse,
  RunAllResponse,
  StoreProfile,
  UpdateIndustryPayload,
  MatchedStoresResponse,
} from '../types/successMetrics'

const api = axios.create({
  baseURL: '/api/ebCalculateSuccessMetrics',
  timeout: 120000,
})

export const getProfiles = (params: ProfilesQueryParams = {}) =>
  api.get<ProfilesResponse>('/getProfiles', { params })

export const getDashboardStats = () =>
  api.get<DashboardStatsResponse>('/getDashboardStats')

export const getProfile = (shopName: string) =>
  api.get<{ statusCode: number; message: string; data: StoreProfile }>(`/getProfile/${encodeURIComponent(shopName)}`)

export const getFilters = () =>
  api.get<FiltersResponse>('/getFilters')

export const runAll = (limit = 100) =>
  api.post<RunAllResponse>('/runAll', null, { params: { limit }, timeout: 600000 })

export const updateIndustry = (shopName: string, payload: UpdateIndustryPayload) =>
  api.put(`/updateIndustry/${encodeURIComponent(shopName)}`, payload)

export const getMatchedStores = (shopName: string) =>
  api.get<MatchedStoresResponse>(`/getMatchedStores/${encodeURIComponent(shopName)}`)

export const onboardStore = (shopName: string) =>
  api.post('/onboardStore', { shopName }, { timeout: 180000 })

export const getOnboardingHistory = (params: {
  page?: number
  limit?: number
  search?: string
  strategySource?: string
  recommendedBundleType?: string
  dataReliability?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) => api.get('/onboardingHistory', { params })

export const deleteOnboardingHistory = (shopName: string) =>
  api.delete(`/onboardingHistory/${encodeURIComponent(shopName)}`)

export const submitOnboardingFeedback = (shopName: string, body: { rating: string; remarks?: string }) =>
  api.patch(`/onboardingHistory/${encodeURIComponent(shopName)}/feedback`, body)

export default api
