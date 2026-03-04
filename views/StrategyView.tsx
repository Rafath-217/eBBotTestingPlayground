import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  cn,
} from '../components/ui'
import { runFullAnalysis } from '../services/baasDataService'

const APP_OPTIONS = [
  { value: '', label: 'None (skip order analysis)' },
  { value: 'kite', label: 'Kite' },
  { value: 'fly', label: 'Fly' },
] as const

const AGENT_LABELS = [
  'Website Audit',
  'Data Analyst',
  'Industry Classifier',
  'Strategy Architect',
  'Report Compiler',
]

export default function StrategyView() {
  const navigate = useNavigate()

  const [shopName, setShopName] = useState('')
  const [appName, setAppName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = shopName.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    const payload: { shopName?: string; appName?: string } = {
      shopName: shopName.trim(),
    }
    if (appName) payload.appName = appName

    try {
      await runFullAnalysis(payload)
      navigate('/baas-overview')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Pipeline failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create Full Strategy
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Run all 5 agents — Website Audit, Data Analyst, Industry Classifier, Strategy Architect, Report Compiler
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {AGENT_LABELS.map((label) => (
            <Badge key={label} variant="purple" className="text-[10px]">
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shop Name */}
            <div className="space-y-2">
              <label
                htmlFor="shopName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Shop Name
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="mystore.myshopify.com"
                className={cn(
                  'w-full rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 px-4 py-2.5 text-sm',
                  'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                  'transition-colors'
                )}
              />
            </div>

            {/* App Name */}
            <div className="space-y-2">
              <label
                htmlFor="appName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                App Name
                <span className="ml-1.5 text-xs font-normal text-slate-400">(optional — needed for order analysis)</span>
              </label>
              <div className="relative">
                <select
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={cn(
                    'w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700',
                    'bg-white dark:bg-slate-900 px-4 py-2.5 pr-10 text-sm',
                    'text-slate-900 dark:text-slate-100',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'transition-colors'
                  )}
                >
                  {APP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Validation hint */}
            {!canSubmit && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Please enter a shop name to run the pipeline.
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Running Full Pipeline...' : 'Run Full Pipeline'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
