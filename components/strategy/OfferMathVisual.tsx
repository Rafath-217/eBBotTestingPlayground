import { ArrowRight, Tag } from 'lucide-react'
import type { OfferMathematics } from '../../types/strategy'

interface Props {
  data: OfferMathematics
  accentColor?: string
}

export default function OfferMathVisual({ data, accentColor = 'indigo' }: Props) {
  const savings = data.combinedRetail - data.bundlePrice

  const accentMap: Record<string, { bg: string; border: string; text: string; badge: string; savingsBg: string }> = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
      border: 'border-indigo-100 dark:border-indigo-800/30',
      text: 'text-indigo-700 dark:text-indigo-300',
      badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200',
      savingsBg: 'bg-indigo-600 dark:bg-indigo-500',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-100 dark:border-emerald-800/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
      savingsBg: 'bg-emerald-600 dark:bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      border: 'border-amber-100 dark:border-amber-800/30',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
      savingsBg: 'bg-amber-600 dark:bg-amber-500',
    },
  }
  const colors = accentMap[accentColor] ?? accentMap.indigo

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Offer Mathematics
      </p>

      {/* Products → Arrows → Bundle Price */}
      <div className="flex flex-col gap-2">
        {/* Individual products */}
        <div className="space-y-1.5">
          {data.products.map((product, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {product.price === 0 ? 'FREE' : `$${product.price}`}
              </span>
            </div>
          ))}
        </div>

        {/* Separator with arrow and combined retail */}
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-muted-foreground">Combined retail</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums line-through">
              ${data.combinedRetail}
            </span>
          </div>
          <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
        </div>

        {/* Bundle price + savings row */}
        <div className={`rounded-xl border ${colors.border} ${colors.bg} p-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className={`w-4 h-4 ${colors.text}`} />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bundle Price</p>
                <p className={`text-2xl font-bold tabular-nums ${colors.text}`}>
                  ${data.bundlePrice}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${colors.badge} mb-1`}>
                <span className="text-sm font-bold tabular-nums">{data.discountPercent}% off</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Customer saves{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ${savings}
                </span>
              </p>
            </div>
          </div>

          {/* Savings bar */}
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-2 rounded-full ${colors.savingsBg} transition-all`}
                style={{ width: `${data.discountPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Bundle price</span>
              <span className="text-[10px] text-muted-foreground">Full retail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
