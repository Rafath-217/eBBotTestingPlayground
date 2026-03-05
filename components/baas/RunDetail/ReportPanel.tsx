/**
 * ReportPanel — Report Compiler results
 *
 * Renders the full markdown strategy document with:
 * - Copy-to-clipboard button
 * - Print / export hint
 * - Sticky mini-toolbar
 * - Falls back to legacy result.strategy string
 */

import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, Copy, Check, Printer } from 'lucide-react'
import { Button, cn } from '../../ui'
import type { EnrichedPipelineRun } from '../../../types'

interface ReportPanelProps {
  run: EnrichedPipelineRun
}

export default function ReportPanel({ run }: ReportPanelProps) {
  const [copied, setCopied] = useState(false)

  // reportResults can be { markdownContent: string } or a raw string (normalized in toEnriched)
  const content: string | null =
    run.reportResults?.markdownContent ??
    (typeof run.reportResults === 'string' ? run.reportResults : null) ??
    run.result?.strategy ??
    null

  if (!content) {
    return <EmptyPanel message="No report has been generated for this run." />
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently ignore clipboard errors
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Strategy Report
          </span>
          {run.reportResults?.generatedAt && (
            <span className="text-xs text-muted-foreground">
              · generated {new Date(run.reportResults.generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="h-8 px-2 gap-1.5 text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={cn(
              'h-8 px-3 gap-1.5 text-xs transition-all',
              copied && 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
            )}
          >
            {copied
              ? <><Check className="w-3.5 h-3.5" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy</>
            }
          </Button>
        </div>
      </div>

      {/* ── Markdown Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 print:overflow-visible">
        <div
          className={cn(
            'prose prose-slate dark:prose-invert max-w-none',
            'prose-headings:font-bold prose-headings:tracking-tight',
            'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base',
            'prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400',
            'prose-li:text-slate-600 dark:prose-li:text-slate-400',
            'prose-strong:text-slate-900 dark:prose-strong:text-slate-100',
            'prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded',
            'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
            'prose-hr:border-slate-200 dark:prose-hr:border-slate-700',
            // Table styling
            'prose-table:w-full prose-table:border-collapse prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700',
            'prose-thead:bg-slate-50 dark:prose-thead:bg-slate-800/80',
            'prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:uppercase prose-th:tracking-wide prose-th:text-slate-600 dark:prose-th:text-slate-300 prose-th:border-b prose-th:border-slate-200 dark:prose-th:border-slate-700',
            'prose-td:px-4 prose-td:py-2.5 prose-td:text-sm prose-td:border-b prose-td:border-slate-100 dark:prose-td:border-slate-800',
          )}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  )
}
