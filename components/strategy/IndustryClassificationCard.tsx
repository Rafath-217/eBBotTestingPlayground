import { ShieldCheck, TrendingUp, Tag, AlertCircle, Lightbulb } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '../ui'
import type { IndustryClassification } from '../../types/strategy'

interface Props {
  data: IndustryClassification
}

const confidenceConfig = {
  High: { variant: 'success' as const, label: 'High Confidence' },
  Medium: { variant: 'warning' as const, label: 'Medium Confidence' },
  Low: { variant: 'secondary' as const, label: 'Low Confidence' },
}

const verticalIcons: Record<string, string> = {
  'Consumables (Food & Beverage)': '🥤',
  'Apparel & Fashion': '👗',
  'Beauty & Personal Care': '💄',
  'Electronics & Tech': '💻',
  'Home & Garden': '🏠',
  'Sports & Fitness': '🏋️',
}

export default function IndustryClassificationCard({ data }: Props) {
  const conf = confidenceConfig[data.confidence] ?? confidenceConfig.Medium
  const icon = verticalIcons[data.primaryVertical] ?? '🏪'

  return (
    <Card className="overflow-hidden">
      {/* Colored top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-2xl shrink-0">
              {icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Industry Classification
              </p>
              <CardTitle className="text-xl">{data.primaryVertical}</CardTitle>
            </div>
          </div>
          <Badge variant={conf.variant} className="shrink-0 mt-1">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {conf.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Evidence chips */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Classification Evidence
          </p>
          <div className="flex flex-wrap gap-2">
            {data.classificationEvidence.map((ev, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {ev}
              </span>
            ))}
          </div>
        </div>

        {/* Vertical context */}
        <div className="rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-semibold text-violet-900 dark:text-violet-200">
              Vertical Strategy Focus: {data.verticalContext.focus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ContextBlock
              label="Key Bundle Types"
              items={data.verticalContext.keyBundleTypes}
              color="violet"
              icon="+"
            />
            <ContextBlock
              label="Avoid"
              items={data.verticalContext.avoid}
              color="red"
              icon="-"
            />
            <div className="rounded-lg bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-800/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Typical AOV Lift</p>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                {data.verticalContext.typicalAovLift}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">for this vertical</p>
            </div>
          </div>
        </div>

        {/* Psychological trigger */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
              Primary Psychological Trigger
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
              {data.psychologicalTriggers}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              All bundle strategies are designed around this core motivator.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ContextBlock({
  label,
  items,
  color,
  icon,
}: {
  label: string
  items: string[]
  color: 'violet' | 'red'
  icon: string
}) {
  const isRed = color === 'red'
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        isRed
          ? 'bg-white dark:bg-slate-900 border-red-100 dark:border-red-800/30'
          : 'bg-white dark:bg-slate-900 border-violet-100 dark:border-violet-800/30'
      )}
    >
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-4 h-4 rounded text-xs font-bold flex items-center justify-center shrink-0',
                isRed
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
              )}
            >
              {icon}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
