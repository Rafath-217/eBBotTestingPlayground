import { useState } from 'react'
import Markdown from 'react-markdown'
import { ChevronDown, CheckCircle2, Truck, Package, FileText, BarChart3 } from 'lucide-react'
import { getScoreColor } from '../../utils'
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '../ui'

interface ResultDisplayProps {
  data: unknown
}

export default function ResultDisplay({ data }: ResultDisplayProps) {
  const [strategyOpen, setStrategyOpen] = useState(false)

  const d = data as Record<string, unknown>
  const resultObj = d?.result as Record<string, unknown> | undefined
  const audit = (resultObj?.audit || d?.audit || d) as Record<string, unknown> | undefined
  const strategy = (resultObj?.strategy || d?.strategy || null) as string | null
  const shopName = (d?.shopName as string) || '—'

  if (!audit) return null

  const score = audit.score as number | undefined
  const shipping = audit.shipping as Record<string, unknown> | undefined
  const merch = audit.merchandising as Record<string, unknown> | undefined

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Audit Complete — {shopName}
        </CardTitle>
        {score != null && (
          <Badge className={cn('text-sm', getScoreColor(score))}>
            {score}/10
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Shipping */}
        {shipping ? (
          <Section icon={<Truck className="w-4 h-4 text-slate-500 dark:text-slate-400" />} title="Shipping">
            <InfoRow
              label="Free Shipping"
              value={
                shipping.hasFreeShipping
                  ? `Yes${shipping.threshold ? ` (over $${shipping.threshold})` : ''}`
                  : 'No'
              }
            />
            {typeof shipping.notes === 'string' && shipping.notes && <InfoRow label="Notes" value={shipping.notes} />}
          </Section>
        ) : null}

        {/* Merchandising */}
        {merch ? (
          <Section icon={<Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />} title="Merchandising">
            <div className="flex flex-wrap gap-2">
              <MerchBadge label="Bundles" active={!!merch.hasBundles} />
              <MerchBadge label="Kits" active={!!merch.hasKits} />
              <MerchBadge label="Gift Sets" active={!!merch.hasGiftSets} />
            </div>
            {Array.isArray(merch.navItems) && merch.navItems.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Navigation Items</p>
                <div className="flex flex-wrap gap-1.5">
                  {(merch.navItems as string[]).map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        ) : null}

        {/* Summary */}
        {typeof audit.summary === 'string' && audit.summary ? (
          <Section icon={<FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />} title="Summary">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {audit.summary}
            </p>
          </Section>
        ) : null}

        {/* Strategy Report */}
        {strategy && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <button
              onClick={() => setStrategyOpen(!strategyOpen)}
              className="flex items-center gap-2 w-full text-left group"
            >
              <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                Strategy Report
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-slate-400 ml-auto transition-transform',
                  strategyOpen && 'rotate-180'
                )}
              />
            </button>

            {strategyOpen && (
              <div className="mt-4 prose text-sm text-slate-700 dark:text-slate-300 max-w-none">
                <Markdown>{strategy}</Markdown>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-muted-foreground min-w-[100px]">{label}:</span>
      <span className="text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  )
}

function MerchBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'outline'} className="gap-1">
      {active ? '✅' : '❌'} {label}
    </Badge>
  )
}
