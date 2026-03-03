import { useState } from 'react'
import { Loader2, Play, AlertTriangle, X } from 'lucide-react'
import { runAudit, runFullAnalysis } from '../../services/baasDataService'
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui'
import ResultDisplay from './ResultDisplay'

const LOADING_MESSAGES = [
  'Scraping website...',
  'Extracting product data...',
  'Analyzing with AI...',
  'Generating insights...',
  'Preparing report...',
]

interface PipelineTriggerProps {
  onPipelineComplete?: () => void
}

export default function PipelineTrigger({ onPipelineComplete }: PipelineTriggerProps) {
  const [shopName, setShopName] = useState('')
  const [mode, setMode] = useState<'audit-only' | 'audit+strategy'>('audit-only')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    let msgIdx = 0
    setLoadingMsg(LOADING_MESSAGES[0])
    const interval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, LOADING_MESSAGES.length - 1)
      setLoadingMsg(LOADING_MESSAGES[msgIdx])
    }, 5000)

    try {
      const { data } = mode === 'audit-only'
        ? await runAudit(shopName.trim())
        : await runFullAnalysis({ shopName: shopName.trim() })
      setResult(data)
      onPipelineComplete?.()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr.response?.data?.message || axiosErr.message || 'Pipeline failed')
    } finally {
      clearInterval(interval)
      setLoading(false)
      setLoadingMsg('')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Pipeline Trigger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Shop Name Input */}
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Shop Name
              </label>
              <input
                id="shop-name"
                type="text"
                placeholder="mystore.myshopify.com"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                disabled={loading}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border text-sm transition-colors',
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pipeline Mode
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'audit-only' as const, label: 'Audit Only' },
                  { value: 'audit+strategy' as const, label: 'Full Analysis' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm',
                      mode === option.value
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary dark:bg-primary/10'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
                      loading && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={option.value}
                      checked={mode === option.value}
                      onChange={(e) => setMode(e.target.value as 'audit-only' | 'audit+strategy')}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center',
                        mode === option.value ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                      )}
                    >
                      {mode === option.value && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !shopName.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Pipeline
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{loadingMsg}</p>
            <p className="text-xs text-muted-foreground mt-1.5">This typically takes 15-40 seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Pipeline Error</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded-md text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Result */}
      {result && <ResultDisplay data={result} />}
    </div>
  )
}
