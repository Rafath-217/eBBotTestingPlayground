import { Star, Plus, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, cn } from '../ui'
import type { RecommendedPillars, PillarName } from '../../types/strategy'

interface Props {
  recommendedPillars: RecommendedPillars
}

interface PillarDef {
  id: PillarName
  label: string
  description: string
  icon: string
}

const ALL_PILLARS: PillarDef[] = [
  {
    id: 'volumeDriver',
    label: 'Volume Driver',
    description: 'Incentivize buying more units per order',
    icon: '📦',
  },
  {
    id: 'liquidationEngine',
    label: 'Liquidation Engine',
    description: 'Move slow-moving inventory via bundles',
    icon: '🔄',
  },
  {
    id: 'conveniencePack',
    label: 'Convenience Pack',
    description: 'Reduce decision fatigue for new buyers',
    icon: '🎁',
  },
  {
    id: 'outfitBuilder',
    label: 'Outfit Builder',
    description: 'Complete-the-look cross-category bundles',
    icon: '👗',
  },
  {
    id: 'giftEngine',
    label: 'Gift Engine',
    description: 'Seasonal and occasion-based gift sets',
    icon: '🎀',
  },
  {
    id: 'subscriptionConverter',
    label: 'Subscription Converter',
    description: 'Convert one-time buyers to subscribers',
    icon: '🔁',
  },
  {
    id: 'urgencyBundle',
    label: 'Urgency Bundle',
    description: 'Time-limited offer to drive conversion',
    icon: '⚡',
  },
  {
    id: 'premiumUpsell',
    label: 'Premium Upsell',
    description: 'Bundle premium items to lift AOV ceiling',
    icon: '💎',
  },
]

type PillarStatus = 'primary' | 'secondary' | 'avoid' | 'neutral'

function getPillarStatus(id: PillarName, pillars: RecommendedPillars): PillarStatus {
  if (pillars.primary.includes(id)) return 'primary'
  if (pillars.secondary.includes(id)) return 'secondary'
  if (pillars.avoid.includes(id)) return 'avoid'
  return 'neutral'
}

const statusConfig: Record<
  PillarStatus,
  { border: string; bg: string; labelColor: string; badge: string; badgeText: string; badgeIcon: React.ReactNode }
> = {
  primary: {
    border: 'border-indigo-300 dark:border-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    labelColor: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-600 text-white',
    badgeText: 'Primary',
    badgeIcon: <Star className="w-3 h-3" />,
  },
  secondary: {
    border: 'border-violet-200 dark:border-violet-700',
    bg: 'bg-violet-50 dark:bg-violet-900/10',
    labelColor: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    badgeText: 'Secondary',
    badgeIcon: <Plus className="w-3 h-3" />,
  },
  avoid: {
    border: 'border-red-200 dark:border-red-800',
    bg: 'bg-red-50 dark:bg-red-900/10',
    labelColor: 'text-red-500 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    badgeText: 'Avoid',
    badgeIcon: <Minus className="w-3 h-3" />,
  },
  neutral: {
    border: 'border-slate-200 dark:border-slate-700',
    bg: 'bg-slate-50 dark:bg-slate-800/30',
    labelColor: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    badgeText: 'N/A',
    badgeIcon: null,
  },
}

export default function PillarFramework({ recommendedPillars }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>8-Pillar Bundle Framework</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Which bundle strategies fit your store's vertical and data profile.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {(['primary', 'secondary', 'avoid', 'neutral'] as PillarStatus[]).map((s) => {
            const cfg = statusConfig[s]
            return (
              <div key={s} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    cfg.badge
                  )}
                >
                  {cfg.badgeIcon}
                  {cfg.badgeText}
                </span>
              </div>
            )
          })}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_PILLARS.map((pillar) => {
            const status = getPillarStatus(pillar.id, recommendedPillars)
            const cfg = statusConfig[status]
            const isAvoid = status === 'avoid'
            const isNeutral = status === 'neutral'

            return (
              <div
                key={pillar.id}
                className={cn(
                  'relative rounded-xl border p-4 transition-all',
                  cfg.border,
                  cfg.bg,
                  isAvoid && 'opacity-60',
                  isNeutral && 'opacity-50'
                )}
              >
                {/* Status badge top-right */}
                {status !== 'neutral' && (
                  <span
                    className={cn(
                      'absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                      cfg.badge
                    )}
                  >
                    {cfg.badgeIcon}
                    {cfg.badgeText}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'text-2xl mb-2',
                    isAvoid && 'grayscale',
                    isNeutral && 'grayscale opacity-50'
                  )}
                >
                  {pillar.icon}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    'text-sm font-semibold leading-tight mb-1',
                    cfg.labelColor,
                    (isAvoid || isNeutral) && 'text-slate-500 dark:text-slate-500'
                  )}
                >
                  {pillar.label}
                </p>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-snug">
                  {pillar.description}
                </p>

                {/* Avoid overlay line */}
                {isAvoid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-xl overflow-hidden">
                    <div className="absolute inset-0 border-2 border-red-300 dark:border-red-700 rounded-xl" />
                    <div className="absolute top-1/2 left-0 w-full h-px bg-red-300/60 dark:bg-red-600/50 rotate-[-12deg]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
