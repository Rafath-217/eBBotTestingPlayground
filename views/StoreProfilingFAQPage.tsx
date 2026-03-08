import { useRef, useState } from 'react'

export default function StoreProfilingFAQPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = contentRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-slate-800 dark:text-slate-200 leading-relaxed">

      {/* ─── Title + Copy ─── */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold">Store Profiling -- PM FAQ</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 text-slate-500 dark:text-slate-400 italic">
        <p><strong>Audience</strong>: Product managers, non-technical stakeholders</p>
        <p><strong>Companion doc</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_HANDOFF_PROFILING.md</code></p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

        {/* ─── Data & Inputs ─── */}
        <h2 className="text-2xl font-semibold mb-4">Data &amp; Inputs</h2>

        <h3 className="text-xl font-semibold mb-3">What data do we pull from Shopify?</h3>
        <p className="mb-3">Two things:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li><strong>Product catalog</strong>: Active products only -- titles, prices, product types. Draft and archived products are ignored.</li>
          <li><strong>Order history</strong>: Last 60 days of paid orders -- order totals, item quantities, and customer IDs. No personal details, no payment info.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">What&apos;s the maximum data we pull per store?</h3>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Up to <strong>1,000 products</strong></li>
          <li>Up to <strong>50,000 orders</strong></li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Does the system count cancelled orders?</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Scenario</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Counted?</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Why</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['Cancelled AND refunded', 'NO', 'Money was returned'],
              ['Cancelled but NOT refunded', 'YES', 'Merchant kept the money'],
              ['Partially refunded', 'NO', 'Excluded to keep data clean'],
              ['Pending / not yet paid', 'NO', "Payment hasn't cleared"],
            ] as [string, string, string][]).map(([scenario, counted, why], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{scenario}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{counted}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mb-6">For bundle analytics specifically, we start with gross revenue and subtract cancelled order revenue. Same end result, different mechanism.</p>

        <h3 className="text-xl font-semibold mb-3">What about refunds?</h3>
        <p className="mb-6">Fully refunded and partially refunded orders are both excluded. We&apos;d rather undercount than overcount.</p>

        <h3 className="text-xl font-semibold mb-3">Do draft/archived products affect anything?</h3>
        <p className="mb-6">No. Only active Shopify products are analyzed. Draft and archived are invisible.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Metrics ─── */}
        <h2 className="text-2xl font-semibold mb-4">Metrics</h2>

        <h3 className="text-xl font-semibold mb-3">What is AOV?</h3>
        <p className="mb-6">Average Order Value -- revenue divided by orders. When AOV is much higher than the median product price, customers are buying multiple items (strong signal for volume discounts).</p>

        <h3 className="text-xl font-semibold mb-3">What is repeat rate?</h3>
        <p className="mb-6">Percentage of orders from returning customers. 59 orders from 49 unique customers = 10 repeats = 16.95%. Above 15-20% is solid.</p>

        <h3 className="text-xl font-semibold mb-3">What is revenue concentration?</h3>
        <p className="mb-3">What percentage of total revenue comes from the #1 product. Under 15% = healthy. Over 25% = hero product dependency.</p>
        <p className="mb-6"><strong>Different from ABC analysis</strong>: Concentration is about the single best seller. ABC ranks ALL products into three tiers for product selection.</p>

        <h3 className="text-xl font-semibold mb-3">What is the catalog diversity score?</h3>
        <p className="mb-3">How spread out products are across different types:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li><strong>0</strong>: Every product is the same type</li>
          <li><strong>0.3-0.5</strong>: Moderate variety</li>
          <li><strong>1.0</strong>: Maximum variety, evenly spread</li>
        </ul>
        <p className="mb-6">High diversity (0.3+) = natural fit for mix-and-match. Low diversity = better for volume discounts.</p>

        <h3 className="text-xl font-semibold mb-3">What is the stability score?</h3>
        <p className="mb-3">Ratio of the smaller month to the larger month (last 2 full months of bundle revenue):</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Month 1 = $1,000, Month 2 = $1,000 → stability = 1.0</li>
          <li>Month 1 = $1,000, Month 2 = $500 → stability = 0.5</li>
          <li>Either month = $0 → stability = 0</li>
        </ul>
        <p className="mb-6">We require 0.6+ for &quot;Strong&quot; tier.</p>

        <h3 className="text-xl font-semibold mb-3">What are Grade A / B / C products?</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Which products</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Used for</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['A', 'Top 20% by count', 'Picked first for bundles'],
              ['B', 'Next 30%', 'Secondary bundle products'],
              ['C', 'Bottom 50%', 'Bundled with bestsellers to drive discovery'],
            ] as [string, string, string][]).map(([grade, products, usage], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{grade}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{products}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mb-6"><strong>Why 20/30/50?</strong> Standard Pareto-inspired split. Top 20% typically drives 70-80% of revenue.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Store Types ─── */}
        <h2 className="text-2xl font-semibold mb-4">Store Types</h2>

        <h3 className="text-xl font-semibold mb-3">What are archetypes?</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Archetype</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Who fits</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Default bundle</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['SMALL_LOW_COMP', 'Small catalog, single-product focus', 'Volume Discount'],
              ['SMALL_HIGH_COMP', 'Small catalog, diverse products', 'Fixed Bundle Price'],
              ['MID_HIGH_COMP', 'Mid-size, diverse (most common)', 'Mix & Match'],
              ['LARGE_LOW_PRICE', 'Large catalog, low prices', 'Volume Discount'],
              ['MID_LARGE_HIGH_COMP', 'Everything else', 'Mix & Match'],
            ] as [string, string, string][]).map(([archetype, who, bundle], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{archetype}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{who}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{bundle}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-xl font-semibold mb-3">Why does the &quot;everything else&quot; archetype exist?</h3>
        <p className="mb-6">Catches less common combinations: mid-size stores with low diversity, large stores with higher price points. Mix &amp; Match default works broadly for these.</p>

        <h3 className="text-xl font-semibold mb-3">How is industry classified?</h3>
        <p className="mb-6">AI classifies into one of 50 industries using product types and titles. Runs twice (classify, then verify). Can be manually overridden.</p>

        <h3 className="text-xl font-semibold mb-3">Is industry used in store matching?</h3>
        <p className="mb-6"><strong>No.</strong> Matching is purely structural: catalog size (40%), diversity (40%), price (20%). Structurally similar stores benefit from similar strategies regardless of industry.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Success Tiers ─── */}
        <h2 className="text-2xl font-semibold mb-4">Success Tiers</h2>

        <h3 className="text-xl font-semibold mb-3">What makes a store &quot;Strong&quot;?</h3>
        <p className="mb-6">ALL four: 12%+ bundle contribution, 5%+ attach rate, 0.6+ stability, $50k+ revenue.</p>

        <h3 className="text-xl font-semibold mb-3">Why is the bar so high?</h3>
        <p className="mb-6">The $50k floor prevents tiny stores with misleading percentages from becoming reference stores. A $200/month store where one bundle = 25% is noise, not signal.</p>

        <h3 className="text-xl font-semibold mb-3">Why does &quot;Strong&quot; need all 4 but &quot;Moderate&quot; only needs 1?</h3>
        <p className="mb-6">&quot;Strong&quot; = gold standard for reference stores. Every signal must be positive. &quot;Moderate&quot; = softer label meaning &quot;bundles are doing something.&quot; The gap is deliberate.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Store Audit ─── */}
        <h2 className="text-2xl font-semibold mb-4">Store Audit</h2>

        <h3 className="text-xl font-semibold mb-3">What are the 6 health checks?</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Check</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Triggers when</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Recommends</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['Dead weight inventory', 'Bottom 50% < 15% of revenue', 'Mix & Match'],
              ['Low bundle adoption', 'Bundle revenue < 15%', 'Add-on bundles'],
              ['Repeat customer drop', 'Repeat AOV < first-time AOV', 'Volume discount'],
              ['Hero product dependency', 'Top 20% > 80% of revenue', 'Fixed bundle'],
              ['Low basket size', '60%+ single-item orders', 'Volume discount'],
            ] as [string, string, string][]).map(([check, trigger, recommends], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{check}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{trigger}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{recommends}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-xl font-semibold mb-3">How is the primary problem chosen?</h3>
        <p className="mb-6">Ranked by severity. #1 becomes the recommendation. Confidence = gap between #1 and #2. Big gap = confident. Small gap = competing problems.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Edge Cases ─── */}
        <h2 className="text-2xl font-semibold mb-4">Edge Cases</h2>

        <h3 className="text-xl font-semibold mb-3">Zero products?</h3>
        <p className="mb-6">Job 1 fails. Other jobs use previous data if it exists.</p>

        <h3 className="text-xl font-semibold mb-3">Zero orders?</h3>
        <p className="mb-6">Flagged as LOW_SAMPLE, gets a starter bundle based on catalog.</p>

        <h3 className="text-xl font-semibold mb-3">More than 1,000 products?</h3>
        <p className="mb-6">Only the first 1,000 are analyzed.</p>

        <h3 className="text-xl font-semibold mb-3">Currency differences?</h3>
        <p className="mb-6">Bundle analytics uses USD. Shopify prices stay in local currency. A $25 EUR store and $25 USD store are treated the same. Known simplification.</p>

        <h3 className="text-xl font-semibold mb-3">Timezone handling?</h3>
        <p className="mb-6">60-day window could be off by ~1 day. Negligible impact.</p>

        <h3 className="text-xl font-semibold mb-3">How often is the reference library updated?</h3>
        <p className="mb-6">Runs periodically on a configured schedule.</p>

      </div>
    </div>
  )
}
