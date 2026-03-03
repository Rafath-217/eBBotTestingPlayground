import { useState, useRef } from 'react'
import Markdown from 'react-markdown'
import {
  FileText,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui'

interface Props {
  markdown: string
}

interface Section {
  id: string
  level: number
  title: string
  anchor: string
}

function extractSections(md: string): Section[] {
  const lines = md.split('\n')
  const sections: Section[] = []
  lines.forEach((line, i) => {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim()
      const anchor = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
      sections.push({ id: `section-${i}`, level, title, anchor })
    }
  })
  return sections
}

function buildCollapsibleSections(md: string): { title: string; content: string }[] {
  const lines = md.split('\n')
  const sections: { title: string; content: string }[] = []
  let currentTitle = ''
  let currentLines: string[] = []
  let inSection = false

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    if (h2) {
      if (inSection && currentTitle) {
        sections.push({ title: currentTitle, content: currentLines.join('\n') })
      }
      currentTitle = h2[1].trim()
      currentLines = []
      inSection = true
    } else {
      if (inSection) {
        currentLines.push(line)
      }
    }
  }
  if (inSection && currentTitle) {
    sections.push({ title: currentTitle, content: currentLines.join('\n') })
  }
  return sections
}

export default function FullReportView({ markdown }: Props) {
  const [viewMode, setViewMode] = useState<'sections' | 'full'>('sections')
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const [copySuccess, setCopySuccess] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const toc = extractSections(markdown)
  const sections = buildCollapsibleSections(markdown)

  // Extract intro (everything before first ##)
  const introEnd = markdown.indexOf('\n## ')
  const intro = introEnd > -1 ? markdown.slice(0, introEnd) : ''

  function toggleSection(i: number) {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function collapseAll() {
    setCollapsedSections(new Set(sections.map((_, i) => i)))
  }

  function expandAll() {
    setCollapsedSections(new Set())
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // ignore
    }
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'strategy-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const sectionIcons: Record<string, string> = {
    'Executive Thesis': '🎯',
    'Data Truth': '📊',
    Recommendations: '💡',
    'Financial Impact': '💰',
    '90-Day Roadmap': '🗓️',
    'Next Steps': '➡️',
  }

  function getSectionIcon(title: string) {
    return (
      Object.entries(sectionIcons).find(([key]) =>
        title.toLowerCase().includes(key.toLowerCase())
      )?.[1] ?? '📋'
    )
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Full Strategy Report
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete analysis with financial projections and implementation plan.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1 mt-4 border-b border-slate-100 dark:border-slate-800">
          {(['sections', 'full'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                viewMode === mode
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {mode === 'sections' ? 'Sections View' : 'Full Report'}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className="flex gap-0 divide-x divide-slate-100 dark:divide-slate-800">
        {/* TOC sidebar */}
        <div className="hidden lg:block w-56 shrink-0 p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Contents
          </p>
          {toc.map((item) => (
            <button
              key={item.id}
              className={cn(
                'w-full text-left text-xs leading-snug py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                item.level === 1
                  ? 'font-semibold text-slate-700 dark:text-slate-300'
                  : item.level === 2
                  ? 'pl-4 text-muted-foreground'
                  : 'pl-6 text-muted-foreground'
              )}
              onClick={() => {
                if (viewMode === 'sections') {
                  setViewMode('full')
                  setTimeout(() => {
                    const el = document.getElementById(`toc-${item.anchor}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 50)
                } else {
                  const el = document.getElementById(`toc-${item.anchor}`)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              {item.level > 1 && (
                <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground mr-1.5 align-middle" />
              )}
              {item.title}
            </button>
          ))}
        </div>

        {/* Main content */}
        <CardContent className="flex-1 min-w-0 pt-5"><div ref={contentRef}>
          {viewMode === 'sections' ? (
            <div className="space-y-3">
              {/* Intro block */}
              {intro && (
                <div className="prose text-sm text-slate-700 dark:text-slate-300 max-w-none mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <Markdown>{intro}</Markdown>
                </div>
              )}

              {/* Collapse / Expand all */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  {sections.length} sections
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={collapseAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Collapse all
                  </button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button
                    onClick={expandAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Expand all
                  </button>
                </div>
              </div>

              {sections.map((section, i) => {
                const isCollapsed = collapsedSections.has(i)
                const icon = getSectionIcon(section.title)
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-base">{icon}</span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex-1">
                        {section.title}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {!isCollapsed && (
                      <div className="px-5 py-4 prose text-sm text-slate-700 dark:text-slate-300 max-w-none">
                        <Markdown>{section.content}</Markdown>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="prose text-sm text-slate-700 dark:text-slate-300 max-w-none">
              {/* Inject anchor IDs for TOC linking */}
              <Markdown
                components={{
                  h1: ({ children, ...props }) => {
                    const text = String(children)
                    const anchor = text
                      .toLowerCase()
                      .replace(/[^a-z0-9\s]/g, '')
                      .replace(/\s+/g, '-')
                    return (
                      <h1 id={`toc-${anchor}`} {...props}>
                        {children}
                      </h1>
                    )
                  },
                  h2: ({ children, ...props }) => {
                    const text = String(children)
                    const anchor = text
                      .toLowerCase()
                      .replace(/[^a-z0-9\s]/g, '')
                      .replace(/\s+/g, '-')
                    return (
                      <h2 id={`toc-${anchor}`} {...props}>
                        {children}
                      </h2>
                    )
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children)
                    const anchor = text
                      .toLowerCase()
                      .replace(/[^a-z0-9\s]/g, '')
                      .replace(/\s+/g, '-')
                    return (
                      <h3 id={`toc-${anchor}`} {...props}>
                        {children}
                      </h3>
                    )
                  },
                }}
              >
                {markdown}
              </Markdown>
            </div>
          )}
        </div></CardContent>
      </div>
    </Card>
  )
}


