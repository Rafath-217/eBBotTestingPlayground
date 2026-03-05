/**
 * ClassifierPanel — Industry Classifier results
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Vertical identity card                                  │
 *  │  [Vertical name]  [confidence meter]                    │
 *  ├──────────────────────────────────────────────────────────┤
 *  │  Classification Evidence (bullet list)                  │
 *  ├────────────────────────┬─────────────────────────────────┤
 *  │  Recommended Pillars   │  Vertical Context              │
 *  │  Primary · Secondary   │  Focus + key bundle types       │
 *  │  Avoid list            │                                │
 *  ├────────────────────────┴─────────────────────────────────┤
 *  │  Psychological Triggers (badge cloud)                   │
 *  └──────────────────────────────────────────────────────────┘
 */

import {
  Tag,
  CheckCircle2,
  XCircle,
  Minus,
  Brain,
  BookOpen,
  Target,
  BarChart3,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn, InfoTip } from '../../ui'
import { TIPS } from '../../../constants/baasTooltips'
import type { EnrichedPipelineRun, VerticalScoreEntry } from '../../../types'

interface ClassifierPanelProps {
  run: EnrichedPipelineRun
}

const TRIGGER_COLORS: string[] = [
  'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
]

export default function ClassifierPanel({ run }: ClassifierPanelProps) {
  const data = run.classifierResults

  if (!data) {
    return <EmptyPanel message="No classifier data available for this run." />
  }

  // confidence can be a number (0-1) or a string like "High"/"Medium"/"Low"
  const rawConf = data.confidence
  const numericConf = typeof rawConf === 'number' ? rawConf
    : rawConf === 'High' ? 0.9 : rawConf === 'Medium' ? 0.7 : rawConf === 'Low' ? 0.4 : 0
  const confidencePct = Math.round(numericConf * 100)

  return (
    <div className="space-y-4 p-6">
      {/* ── Vertical Identity Card ─────────────────────────────── */}
      <Card className="border-l-4 border-l-violet-500">
        <CardContent className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Primary Vertical<InfoTip text={TIPS.primaryVertical} />
              </p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {data.primaryVertical}
              </h2>
            </div>

            {/* Confidence meter */}
            <div className="flex flex-col items-end gap-2 min-w-[160px]">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground">Confidence<InfoTip text={TIPS.confidence} /></span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    confidencePct >= 80 ? 'text-emerald-700 dark:text-emerald-400' :
                    confidencePct >= 60 ? 'text-amber-700 dark:text-amber-400' :
                    'text-red-700 dark:text-red-400'
                  )}
                >
                  {confidencePct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    confidencePct >= 80 ? 'bg-emerald-500' :
                    confidencePct >= 60 ? 'bg-amber-500' :
                    'bg-red-500'
                  )}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Classification Evidence ────────────────────────────── */}
      {Array.isArray(data.classificationEvidence) && data.classificationEvidence.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Classification Evidence<InfoTip text={TIPS.classificationEvidence} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {data.classificationEvidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{ev}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── 2-col: Pillars + Context ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recommended Pillars */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-slate-500" />
              Recommended Bundle Pillars<InfoTip text={TIPS.recommendedBundlePillars} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <PillarGroup
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              label="Primary"
              pillars={data.recommendedPillars?.primary ?? []}
              badgeClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
            />
            <PillarGroup
              icon={<Minus className="w-3.5 h-3.5 text-amber-500" />}
              label="Secondary"
              pillars={data.recommendedPillars?.secondary ?? []}
              badgeClass="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
            />
            <PillarGroup
              icon={<XCircle className="w-3.5 h-3.5 text-red-400" />}
              label="Avoid"
              pillars={data.recommendedPillars?.avoid ?? []}
              badgeClass="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            />
          </CardContent>
        </Card>

        {/* Vertical Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Vertical Context<InfoTip text={TIPS.verticalContext} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {data.verticalContext?.focus && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Strategic Focus<InfoTip text={TIPS.strategicFocus} />
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.verticalContext.focus}
              </p>
            </div>
            )}

            {Array.isArray(data.verticalContext?.keyBundleTypes) && data.verticalContext.keyBundleTypes.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Key Bundle Types<InfoTip text={TIPS.keyBundleTypes} />
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.verticalContext.keyBundleTypes.map((bt, i) => (
                    <Badge key={i} variant="purple" className="text-xs">{bt}</Badge>
                  ))}
                </div>
              </div>
            )}
            {!data.verticalContext?.focus && !Array.isArray(data.verticalContext?.keyBundleTypes) && (
              <p className="text-sm text-muted-foreground py-2">No vertical context available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Deterministic Score Breakdown ────────────────────────── */}
      {data.deterministicScoreBreakdown && Object.keys(data.deterministicScoreBreakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              Vertical Score Breakdown<InfoTip text={TIPS.verticalScoreBreakdown} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(data.deterministicScoreBreakdown)
                .sort(([, a], [, b]) => b.score - a.score)
                .map(([key, entry]) => (
                  <VerticalScoreRow
                    key={key}
                    entry={entry}
                    isSelected={entry.name === data.primaryVertical}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Psychological Triggers ─────────────────────────────── */}
      {data.psychologicalTriggers && (() => {
        // Can be a single string or string[]
        const triggers: string[] = Array.isArray(data.psychologicalTriggers)
          ? data.psychologicalTriggers
          : typeof data.psychologicalTriggers === 'string'
            ? data.psychologicalTriggers.split(/;\s*/).filter(Boolean)
            : []
        if (triggers.length === 0) return null
        return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-slate-500" />
              Psychological Triggers<InfoTip text={TIPS.psychologicalTriggers} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {triggers.map((trigger, i) => (
                <span
                  key={i}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border border-transparent',
                    TRIGGER_COLORS[i % TRIGGER_COLORS.length]
                  )}
                >
                  {trigger}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        )
      })()}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillarGroup({ icon, label, pillars, badgeClass }: {
  icon: React.ReactNode
  label: string
  pillars: string[]
  badgeClass: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      {pillars.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pl-5">
          {pillars.map((p, i) => (
            <span key={i} className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', badgeClass)}>
              {p}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground pl-5">None specified</p>
      )}
    </div>
  )
}

function VerticalScoreRow({ entry, isSelected }: { entry: VerticalScoreEntry; isSelected: boolean }) {
  const maxScore = entry.totalKeywords > 0 ? entry.totalKeywords : 1
  const pct = Math.round((entry.score / maxScore) * 100)

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-2',
        isSelected
          ? 'border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/10'
          : 'border-slate-200 dark:border-slate-700'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
          {isSelected && <Badge variant="purple" className="text-[9px]">Selected</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={entry.confidence === 'High' ? 'success' : entry.confidence === 'Medium' ? 'warning' : 'outline'}
            className="text-[10px]"
          >
            {entry.confidence}
          </Badge>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {entry.score}/{entry.totalKeywords}
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isSelected ? 'bg-violet-500' : 'bg-slate-400 dark:bg-slate-600'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {entry.matchedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.matchedKeywords.map((kw, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
      {message}
    </div>
  )
}
