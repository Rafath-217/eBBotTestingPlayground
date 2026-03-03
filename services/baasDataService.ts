import axios from 'axios'

const api = axios.create({
  baseURL: 'https://staging.backend.gwm.giftkart.app/api/analytics',
  timeout: 120000, // 2 min — pipelines can take 15-40s
})

export const healthCheck = () => api.get('/health')

export const runAudit = (shopName: string) => api.post('/audit', { shopName })

export const runDataAudit = (shopName: string, appName: string) =>
  api.post('/auditData', { shopName, appName })

export const runFullAnalysis = (payload: { shopName?: string; appName?: string }) =>
  api.post('/analyze', payload)

export const getHistory = (page = 1, limit = 20) =>
  api.get('/history', { params: { page, limit } })

export const getHistoryItem = (id: string) => api.get(`/history/${id}`)

export const deleteHistoryItem = (id: string) => api.delete(`/history/${id}`)

export default api
