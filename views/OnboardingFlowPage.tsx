import { useRef, useState } from 'react'

export default function OnboardingFlowPage() {
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
        <h1 className="text-3xl font-bold">Onboarding -- PM Handoff</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 text-slate-500 dark:text-slate-400 italic">
        <p><strong>Audience</strong>: Product managers, non-technical stakeholders</p>
        <p><strong>Related docs</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_FAQ_ONBOARDING.md</code> (Q&amp;A), <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_HANDOFF_PROFILING.md</code> (how reference profiles are built), <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">README.md</code> (technical)</p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── Glossary ─── */}
      <h2 className="text-2xl font-semibold mb-4">Glossary</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Term</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['SKU', 'Stock Keeping Unit -- one sellable product. A store with 223 SKUs has 223 products.'],
            ['AOV', 'Average Order Value -- total revenue divided by total orders.'],
            ['Archetype', 'A label describing what kind of store this is, based on catalog size, product variety, and price. See "Store Types" below.'],
            ['Catalog diversity', 'How spread out a store\u2019s products are across different types (0 = everything is the same type, 1.0 = maximum variety).'],
            ['Revenue concentration', 'What percentage of total revenue comes from the single best-selling product. Under 15% = healthy spread. Over 25% = over-reliance on one product.'],
            ['Product grades (A/B/C)', 'Products ranked by 60-day revenue. Grade A = products accounting for the top 80% of cumulative revenue (bestsellers). Grade B = next 15% (mid-tier). Grade C = final 5% (long tail -- low sellers that can be bundled with bestsellers for discovery).'],
            ['Success tier', 'A rating of how well a store\u2019s bundles are performing: Strong, Moderate, or Weak. See "Success Tiers" below.'],
            ['Reference store', 'A store in our database that\u2019s already using EasyBundles and has been profiled. These are the "healthy patients" we compare new stores against.'],
            ['Dominant strategy', 'The bundle type generating the most revenue for a reference store over the last 2 months. This is what the store "votes" for during the voting layer.'],
            ['Priority waterfall', 'A checklist of conditions tried one by one, top to bottom. The first condition that\u2019s true makes the decision; the rest are skipped.'],
            ['Decision trace', 'An internal audit log that records every step the system took to reach its recommendation. Used for debugging, not shown to merchants.'],
          ] as [string, string][]).map(([term, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{term}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Quick Reference ─── */}
      <h2 className="text-2xl font-semibold mb-4">Quick Reference: Onboarding Thresholds</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Plain English</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Minimum orders for full recommendation', '50', 'Below this, store gets a simpler starter bundle'],
            ['Behavioral override (hard)', '60%+ of orders have 3+ items', 'Automatic volume discount -- no further analysis'],
            ['Behavioral signal (supporting)', '50%+ of orders have 3+ items', 'Supports voting decision if votes are split'],
            ['Behavioral signal (mild)', '30%+ of orders have 3+ items', 'Logged for awareness, no action taken'],
            ['Vote supermajority', '60%+ agreement', 'Matched stores must mostly agree on a strategy'],
            ['Success filter: contribution', '20%+ bundle revenue', 'Alternative way to pass (besides "Strong" tier)'],
            ['Success filter: minimum matches', '3', 'Need at least 3 successful matches to trust the filter'],
            ['Matching weight: catalog size', '40%', 'Proportional difference matters (50 vs 100 is bigger gap than 500 vs 550)'],
            ['Matching weight: catalog diversity', '40%', 'How similar the product variety is'],
            ['Matching weight: price', '20%', 'How similar the typical product prices are'],
          ] as [string, string, string][]).map(([what, value, plain], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{what}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{plain}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What Is Onboarding? ─── */}
      <h2 className="text-2xl font-semibold mb-4">What Is Onboarding?</h2>
      <p className="mb-3">
        When a merchant installs EasyBundles, the onboarding system analyzes their store in real-time and recommends a bundle strategy -- including which bundle type to use, which products to include, and what pricing to set.
      </p>
      <p className="mb-3">
        <strong>What triggers it</strong>: Automatic when the merchant installs the app. No manual steps needed.
      </p>
      <p className="mb-6">
        <strong>How long it takes</strong>: A few seconds to a couple of minutes, depending on catalog size and order volume. The merchant sees a loading animation during analysis.
      </p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 mb-8 text-sm font-mono overflow-x-auto">
        <code>{`NEW STORE INSTALLS
     |
Phase 0: Is the data reliable?          (quality check)
Phase 1: Run catalog + sales analysis   (profile the store)
Phase 2: Find similar reference stores  (matching)
Phase 3: Recommend bundle strategy      (decision engine)
     |
Show 7-step onboarding journey to merchant`}</code>
      </pre>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Two Running Examples ─── */}
      <h2 className="text-2xl font-semibold mb-4">Two Running Examples</h2>
      <p className="mb-6">We&apos;ll follow two stores to illustrate different paths through the system:</p>

      <p className="mb-3"><strong>Store A: 83a38c-0c.myshopify.com</strong> -- German candy and beverage shop</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <tbody>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Products</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">223 SKUs, median price $4.99</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Sales</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">$2,403 over 60 days, 59 orders, $40.73 AOV</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Customer behavior</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">78% of orders have 3+ items, 17% repeat rate</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Store type</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">MID_HIGH_COMP (mid-size, diverse)</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Result</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Volume Discount (behavioral override)</td></tr>
        </tbody>
      </table>

      <p className="mb-3"><strong>Store B</strong> (hypothetical) -- US skincare boutique</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <tbody>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Products</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">85 SKUs, median price $42</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Sales</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">$18,200 over 60 days, 312 orders, $58.33 AOV</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Customer behavior</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">22% of orders have 3+ items, 24% repeat rate</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Store type</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">SMALL_HIGH_COMP (small, diverse)</td></tr>
          <tr><td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Result</td><td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed Bundle Price (reference stores voted)</td></tr>
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Store Types (Archetypes) ─── */}
      <h2 className="text-2xl font-semibold mb-4">Store Types (Archetypes)</h2>
      <p className="mb-6">Every store gets assigned one of five archetypes based on three characteristics: how many products they sell, how varied those products are, and how much they cost.</p>

      <h3 className="text-xl font-semibold mb-3">How assignment works</h3>
      <p className="mb-3"><strong>Step 1 -- Catalog size:</strong></p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li>Under 100 SKUs = Small</li>
        <li>100-500 SKUs = Mid</li>
        <li>Over 500 SKUs = Large</li>
      </ul>

      <p className="mb-3"><strong>Step 2 -- Product variety (catalog diversity):</strong></p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li>Under 0.3 = Low (most products are the same type)</li>
        <li>0.3 or above = High (products span multiple types)</li>
      </ul>

      <p className="mb-3"><strong>Step 3 -- Price band</strong> (based on median product price):</p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li>Under $25 = Low price</li>
        <li>$25-$100 = Mid price</li>
        <li>Over $100 = High price</li>
      </ul>

      <p className="mb-3"><strong>Step 4 -- Match to archetype:</strong></p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Archetype</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Who fits</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Default bundle</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['SMALL_LOW_COMP', 'Small catalog, low variety', 'DTC supplement brand (80 SKUs, all vitamins)', 'Volume Discount'],
            ['SMALL_HIGH_COMP', 'Small catalog, diverse products', 'Curated gift shop (60 SKUs across candles, jewelry, home decor)', 'Fixed Bundle Price'],
            ['MID_HIGH_COMP', 'Mid-size, diverse (most common)', 'Beauty store with skincare, makeup, tools (250 SKUs)', 'Mix & Match'],
            ['LARGE_LOW_PRICE', 'Large catalog, low prices', 'Bulk accessories retailer (800 SKUs, median $8)', 'Volume Discount'],
            ['MID_LARGE_HIGH_COMP', 'Everything else (catch-all)', 'Large diverse catalog or mid-size with low variety', 'Mix & Match'],
          ] as [string, string, string, string][]).map(([archetype, who, example, bundle], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{archetype}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{who}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{example}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{bundle}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3"><strong>Why &quot;COMP&quot;?</strong> Short for &quot;complementarity&quot; -- how well different products go together. High diversity = high complementarity = products naturally pair well in bundles.</p>
      <p className="mb-3"><strong>Why Large stores ignore diversity:</strong> With 500+ products, almost every store has high diversity just by volume. So for large stores, price band differentiates instead.</p>
      <p className="mb-3"><strong>Store A</strong>: 223 SKUs (Mid) + 0.42 diversity (High) = <strong>MID_HIGH_COMP</strong></p>
      <p className="mb-8"><strong>Store B</strong>: 85 SKUs (Small) + 0.65 diversity (High) = <strong>SMALL_HIGH_COMP</strong></p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Success Tiers ─── */}
      <h2 className="text-2xl font-semibold mb-4">Success Tiers</h2>
      <p className="mb-6">These tiers rate how well a store&apos;s existing bundles are performing. They matter because we only want to learn from stores where bundles are actually working.</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tier</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Requirements</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Plain English</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Strong</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">ALL four: 12%+ bundle revenue share, 5%+ of orders include a bundle, 0.6+ month-over-month stability, $50k+ total revenue in 60 days</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bundles are a proven, stable revenue driver at meaningful scale</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Moderate</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Just one: 5%+ bundle revenue share</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bundles are doing something, but maybe not consistently</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Weak</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Everything else</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bundles aren&apos;t contributing meaningfully</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-3"><strong>Why is Strong so strict?</strong> The $50k revenue floor prevents tiny stores with misleading percentages from becoming references. A $200/month store where one lucky bundle = 25% is noise, not signal. All four conditions must be true simultaneously.</p>
      <p className="mb-8"><strong>Why is Moderate so loose?</strong> It&apos;s a softer label -- &quot;bundles are at least on the radar.&quot; The gap between Strong and Moderate is deliberate.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Phase 0 ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 0: Is This Data Reliable?</h2>
      <p className="mb-6">Before recommending anything, we check data quality.</p>

      <h3 className="text-xl font-semibold mb-3">Outlier removal</h3>
      <p className="mb-3">We look for abnormally large orders that would skew metrics -- for example, a $10,000 wholesale order in a store that normally does $40 orders.</p>
      <p className="mb-3"><strong>How we detect outliers</strong>: We calculate two thresholds and use whichever is lower:</p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li>5x the value below which 95% of orders fall (catching statistical extremes)</li>
        <li>10x the median (typical) order value</li>
      </ul>
      <p className="mb-3"><strong>Example</strong>: Typical order is $100, 95% of orders are under $300.</p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li>Threshold 1: $300 x 5 = $1,500</li>
        <li>Threshold 2: $100 x 10 = $1,000</li>
        <li>We use $1,000 (the lower one). Anything above is excluded.</li>
      </ul>
      <p className="mb-3"><strong>What gets recalculated after removing outliers:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>Total revenue, total orders, AOV</li>
        <li>Revenue concentration</li>
        <li>Repeat customer AOV (capped if it&apos;s more than 5x the cleaned AOV -- prevents one big repeat order from skewing the metric)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Test product detection</h3>
      <p className="mb-6">We scan product titles for keywords: &quot;test,&quot; &quot;upsell,&quot; &quot;free gift,&quot; &quot;placeholder,&quot; &quot;dummy,&quot; &quot;sample,&quot; &quot;digital product,&quot; &quot;bundle product from,&quot; &quot;check upsell.&quot; These are <strong>flagged for awareness</strong> but are NOT automatically excluded from product selection or revenue metrics. The flag is logged in the decision trace for internal review.</p>

      <h3 className="text-xl font-semibold mb-3">Minimum data threshold</h3>
      <p className="mb-3"><strong>If the store has fewer than 50 orders in 60 days</strong> (including stores with zero orders), it&apos;s flagged as <strong>LOW_SAMPLE</strong> and goes straight to a starter bundle. The full recommendation engine is skipped entirely.</p>
      <p className="mb-6"><strong>Why 50?</strong> Below this, metrics like repeat rate and revenue concentration bounce around too much. We&apos;d rather give a safe default than a recommendation based on unreliable data.</p>
      <p className="mb-3"><strong>Store A</strong>: 59 orders, 0 outliers, 0 test products. Verdict: <strong>OK</strong> -- proceed to full analysis.</p>
      <p className="mb-8"><strong>Store B</strong>: 312 orders, 2 outliers removed ($1,847 and $2,103 wholesale orders). Verdict: <strong>OK</strong>.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Phase 1 ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 1: Build the Store&apos;s Profile</h2>
      <p className="mb-3">We analyze the store&apos;s catalog and recent sales (same process described in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_HANDOFF_PROFILING.md</code>, Jobs 1-2). This produces:</p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>Catalog metrics: SKU count, median price, price band, catalog diversity score</li>
        <li>Sales metrics: revenue, orders, AOV, repeat rate, revenue concentration</li>
        <li>Customer behavior: basket size breakdown (single-item, two-item, multi-item orders)</li>
        <li>Product grades: A (top 80% of revenue), B (next 15%), C (bottom 5%)</li>
        <li>Archetype assignment</li>
      </ul>
      <p className="mb-6"><strong>Jobs 3 and 4 are skipped</strong> -- the new store doesn&apos;t have bundles yet, so there&apos;s nothing to measure.</p>
      <p className="mb-3"><strong>Store A</strong>: MID_HIGH_COMP, $4.99 median, 0.42 diversity, 78% multi-item orders.</p>
      <p className="mb-8"><strong>Store B</strong>: SMALL_HIGH_COMP, $42 median, 0.65 diversity, 22% multi-item orders.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Phase 2 ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 2: Find Similar Successful Stores</h2>

      <h3 className="text-xl font-semibold mb-3">Step 1: Get candidates</h3>
      <p className="mb-3">We query our reference library for stores with the <strong>exact same archetype</strong>. Only stores tagged as &quot;REFERENCE&quot; (those that have been profiled by our pipeline) qualify.</p>
      <p className="mb-3"><strong>Store A</strong>: 18 reference stores found with archetype MID_HIGH_COMP.</p>
      <p className="mb-6"><strong>Store B</strong>: 7 reference stores found with archetype SMALL_HIGH_COMP.</p>

      <h3 className="text-xl font-semibold mb-3">Step 2: Score similarity</h3>
      <p className="mb-3">Each candidate is scored on three dimensions, producing a 0-100% similarity score:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Dimension</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Weight</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it measures</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">How it&apos;s calculated</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Catalog size</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">40%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">How similar the product counts are</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Proportional (logarithmic) -- the gap between 50 and 100 SKUs matters more than 500 vs 550</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Catalog diversity</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">40%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">How similar the product variety is</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Direct difference between diversity scores</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Price</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">20%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">How similar the typical product prices are</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Difference in median prices, scaled</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-6"><strong>If data is missing:</strong> A null diversity score defaults to 0.5 (middle of range). Two $0 stores both default to 0.5 for price.</p>
      <p className="mb-6">The top 5 candidates by similarity score are selected.</p>

      <h3 className="text-xl font-semibold mb-3">Step 3: Filter for success</h3>
      <p className="mb-3">We filter to stores that are actually succeeding with bundles:</p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li><strong>&quot;Strong&quot; success tier</strong> (all 4 criteria), OR</li>
        <li><strong>20%+ of revenue from bundles</strong> (alternative path for Moderate-tier stores with high bundle contribution)</li>
      </ul>
      <p className="mb-3"><strong>If 3 or more pass</strong>: Use the top 3 from the successful pool.</p>
      <p className="mb-6"><strong>If fewer than 3 pass</strong>: Fall back to the top 3 by structural similarity, ignoring success. We note that the success filter didn&apos;t have enough matches.</p>

      <p className="mb-3"><strong>Store A</strong>: All 5 top matches passed. Top 3 selected:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Similarity</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tier</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Revenue %</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Their Strategy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">city-pop</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">93.15%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Moderate</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">65.48%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed bundle price</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">uniko-2</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">85.61%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Moderate</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">32.19%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Classic</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">handsomescent</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">84.15%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Strong</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">59.89%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Volume discount</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-3"><strong>Store B</strong>: 4 of 5 passed. Top 3 selected:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Similarity</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tier</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Revenue %</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Their Strategy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">glow-studio</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">91.2%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Strong</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">28.4%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed bundle price</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">luxe-bath</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">87.8%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Moderate</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">22.1%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed bundle price</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">handmade-co</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">83.5%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Moderate</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">35.7%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed bundle price</td>
          </tr>
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Phase 3 ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 3: Recommend a Bundle Strategy</h2>
      <p className="mb-6">The recommendation engine uses a <strong>priority waterfall</strong> -- a checklist of 5 conditions, tried one by one from top to bottom. As soon as one condition is true, that becomes the recommendation and we stop checking. Think of it like a doctor&apos;s triage: check the most obvious thing first, then progressively subtler signals.</p>

      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 mb-8 text-sm font-mono overflow-x-auto">
        <code>{`Layer 1: Not enough data?          --> Starter bundle (skip everything)
Layer 2: Archetype-specific match? --> Pattern-based recommendation
Layer 3: Customers buy multiples?  --> Volume discount (behavioral override)
Layer 4: Reference stores agree?   --> Majority vote
Layer 5: Nothing fired?            --> Archetype default (always produces a result)`}</code>
      </pre>

      {/* ─── Layer 1 ─── */}
      <h3 className="text-xl font-semibold mb-3">Layer 1: Not enough data --&gt; Starter bundle</h3>
      <p className="mb-3">If LOW_SAMPLE (under 50 orders), skip the entire waterfall and give a starter bundle based on archetype:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Archetype</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Pitch</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Pricing</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['SMALL_LOW_COMP', 'Volume Discount', '"Buy 2 get 10% off"', '2 units = 10% off'],
            ['SMALL_HIGH_COMP', 'Fixed Bundle Price', '"Curated starter set -- 3 complementary products"', '10-15% off retail'],
            ['MID_HIGH_COMP', 'Mix & Match', '"Pick any 3 -- curated mix-and-match"', '15-20% off retail'],
            ['LARGE_LOW_PRICE', 'Volume Discount', '"Stock up & save -- buy more, pay less"', '2 units = 10% off, 3 units = 15% off'],
            ['MID_LARGE_HIGH_COMP', 'Mix & Match', '"Build your own bundle -- pick 3+"', '15-20% off retail'],
          ] as [string, string, string, string][]).map(([archetype, type, pitch, pricing], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{archetype}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{type}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 italic">{pitch}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{pricing}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mb-3"><strong>Product selection for starter bundles:</strong> For Volume Discount starters, we pick the single top product by 60-day revenue. For all other starters (Fixed Bundle, Mix &amp; Match), we pick up to 3 products by revenue. If the store has zero sales, the bundle is created with no pre-selected products -- the merchant picks them manually.</p>
      <p className="mb-3">No matching, no behavioral analysis, no voting.</p>
      <p className="mb-3"><strong>Store A</strong>: 59 orders -- above threshold. Layer 1 does NOT fire.</p>
      <p className="mb-8"><strong>Store B</strong>: 312 orders -- above threshold. Layer 1 does NOT fire.</p>

      {/* ─── Layer 2 ─── */}
      <h3 className="text-xl font-semibold mb-3">Layer 2: Archetype-specific patterns</h3>
      <p className="mb-6"><strong>Only 2 of 5 archetypes have rules here.</strong> The other 3 (SMALL_LOW_COMP, SMALL_HIGH_COMP, LARGE_LOW_PRICE) skip directly to Layer 3.</p>

      <h4 className="text-lg font-semibold mb-3">MID_HIGH_COMP patterns</h4>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Pattern</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What we&apos;re looking for</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Premium curated</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">High prices (over $100 median) + revenue spread across many products (under 15% concentration) + customers spend 1.8x+ the typical product price per order</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Customers are buying premium items and mixing them. A curated fixed bundle feels like a luxury selection.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed Bundle Price</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Inventory tail</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Revenue concentration 25%+ (one product dominates)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">A few bestsellers carry the store. Mix &amp; Match bundles help spread sales to underperforming products.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Mix &amp; Match</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Shade catalog</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">High diversity (0.5+) + low prices (under $25 median)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Lots of affordable, varied products (like a cosmetics brand with many shades/flavors). Customers naturally want to try many. Wider product pool works best.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Mix &amp; Match with 20-50 products</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-6"><strong>These are checked in order. First match wins.</strong></p>

      <h4 className="text-lg font-semibold mb-3">MID_LARGE_HIGH_COMP patterns</h4>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Pattern</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What we&apos;re looking for</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Cart builder</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">200+ SKUs + high diversity (0.5+) + low concentration (under 15%) + 40%+ multi-item orders</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Large, diverse store where customers already browse and build carts. Give them a flexible &quot;pick your own&quot; experience.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Mix &amp; Match with tiered pricing (pick 2 = 10%, pick 3 = 15%, pick 5 = 20%)</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-3"><strong>Why archetype patterns are checked before behavioral override:</strong> A MID_HIGH_COMP store matching &quot;premium curated&quot; with 70% multi-item orders gets the premium curated recommendation, NOT volume discount. The archetype pattern is considered a more specific signal.</p>
      <p className="mb-3"><strong>Store A</strong>: MID_HIGH_COMP, but none of the three patterns match (median $4.99 is not high price, concentration is 14.22% which is under 25%, and diversity is 0.42 which is under 0.5). Layer 2 does NOT fire. Proceed to Layer 3.</p>
      <p className="mb-8"><strong>Store B</strong>: SMALL_HIGH_COMP -- no rules for this archetype. Layer 2 skipped. Proceed to Layer 3.</p>

      {/* ─── Layer 3 ─── */}
      <h3 className="text-xl font-semibold mb-3">Layer 3: Customers already buy multiples --&gt; Volume discount</h3>
      <p className="mb-3">We check what percentage of orders contain 3 or more items:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Signal strength</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Threshold</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What happens</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Override</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">60%+</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><strong>Automatic volume discount.</strong> No further layers checked.</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Supporting</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">50-59%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Does NOT override, but supports the vote winner in Layer 4 if votes are split</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Mild</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">30-49%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Logged for awareness, no action taken</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">None</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Under 30%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No signal</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-6"><strong>Why 60%?</strong> At this level, buying multiple items is the dominant behavior, not a minority pattern. We&apos;re very confident volume discounts will work.</p>
      <p className="mb-3"><strong>Store A</strong>: 78% of orders have 3+ items --&gt; <strong>Override fired --&gt; Volume Discount.</strong> Layers 4-5 not evaluated. Done.</p>
      <p className="mb-8"><strong>Store B</strong>: 22% of orders have 3+ items --&gt; No signal. Proceed to Layer 4.</p>

      {/* ─── Layer 4 ─── */}
      <h3 className="text-xl font-semibold mb-3">Layer 4: Let the reference stores vote</h3>
      <p className="mb-3"><strong>What &quot;voting&quot; means:</strong> Each reference store that passed the success filter has a <strong>dominant strategy</strong> -- the bundle type that generates the most revenue for them over the last 2 months. For example, if a reference store earns 60% of its bundle revenue from Mix &amp; Match bundles and 40% from Volume Discounts, its dominant strategy is Mix &amp; Match. That&apos;s its &quot;vote.&quot;</p>
      <p className="mb-6">We tally up all the votes from successful matches (up to 5 stores -- everyone who passed the success filter gets a vote) and check if there&apos;s a clear winner.</p>
      <p className="mb-3"><strong>Example:</strong> 4 successful matches. 3 use Fixed Bundle Price, 1 uses Mix &amp; Match. That&apos;s 75% agreement on Fixed Bundle Price --&gt; supermajority --&gt; recommend Fixed Bundle Price.</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Scenario</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What happens</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">60%+ agree on the same strategy (supermajority)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Use that strategy. High confidence.</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No supermajority + strong behavioral signal (50%+ multi-item orders)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Keep whichever strategy got the most votes, but flag as &quot;behavior-supported&quot; with lower confidence. The behavioral signal tips the scale.</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No supermajority + no behavioral support</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No consensus -- fall through to Layer 5</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-8"><strong>Store B</strong>: All 3 matched stores use Fixed Bundle Price --&gt; 100% agreement --&gt; <strong>Fixed Bundle Price selected.</strong> High confidence.</p>

      {/* ─── Layer 5 ─── */}
      <h3 className="text-xl font-semibold mb-3">Layer 5: Archetype default (final fallback)</h3>
      <p className="mb-3">Same as the starter bundle table in Layer 1. Uses the archetype&apos;s default bundle type. Always produces a result.</p>
      <p className="mb-8">If even the archetype config lookup fails (shouldn&apos;t happen), the hardcoded final fallback is Fixed Bundle Price.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Product Selection ─── */}
      <h2 className="text-2xl font-semibold mb-4">Product Selection</h2>
      <p className="mb-6">After deciding the bundle type, we select specific products. <strong>Products are ranked by 60-day revenue, then assigned grades:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li><strong>Grade A</strong> (bestsellers): Products accounting for the top 80% of cumulative revenue</li>
        <li><strong>Grade B</strong> (mid-tier): Products accounting for the next 15% of cumulative revenue</li>
        <li><strong>Grade C</strong> (long tail): Products accounting for the bottom 5% of cumulative revenue</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">How many products per bundle type</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade A</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade B</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade C</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fixed Bundle Price</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">2</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">0</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">5</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Mix &amp; Match</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">2</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">2</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">1</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">5</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Volume Discount</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">0</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">0</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Special selection rules</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Rule</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">When it applies</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What changes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Cart builder</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">MID_LARGE_HIGH_COMP with 200+ SKUs and high diversity</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Larger pool of 20-50 products (Grade A + upper half of Grade B)</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Shade catalog</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">MID_HIGH_COMP with Mix &amp; Match, low prices, high diversity</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Widest pool -- up to 50 products from Grade A + B + upper half of Grade C</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Viability override</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fewer than 3 products have any revenue AND we planned a Fixed Bundle</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Switch to Volume Discount using however many revenue-generating products are available (up to 3)</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">What about starter bundles (zero/low sales)?</h3>
      <p className="mb-3">If the store has some sales data: pick the top 1-3 products by revenue.</p>
      <p className="mb-6">If the store has zero sales: create the bundle template with no pre-selected products. The merchant chooses.</p>
      <p className="mb-3"><strong>Store A</strong>: Volume Discount -- 3 Grade A products selected.</p>
      <p className="mb-8"><strong>Store B</strong>: Fixed Bundle Price -- 3 Grade A + 2 Grade B products selected.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Pricing ─── */}
      <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">How it&apos;s priced</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store A example</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store B example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Volume Discount</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Buy 2 = 10% off, Buy 3 = 20% off</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Buy 2 = 10% off, Buy 3 = 20% off</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">--</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Fixed Bundle Price</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3 products at 12.5% below combined retail</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">--</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3 x $42 x 0.875 = ~$110.25</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Mix &amp; Match</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3 products at 22.5% below combined retail</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">--</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">--</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">Tiered Discount</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Spend-based: 1x median order = 10% off, 1.5x = 15%, 2x = 20%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">$41 = 10%, $61 = 15%, $81 = 20%</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">--</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-8"><strong>Note on Tiered Discount and Add-on types:</strong> These are uncommon onboarding outputs. They can only appear if reference stores using these strategies vote for them in Layer 4. The starter bundles (Layer 1) and archetype defaults (Layer 5) never produce them. In practice, the vast majority of onboarding recommendations are Volume Discount, Fixed Bundle Price, or Mix &amp; Match.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What the Merchant Sees ─── */}
      <h2 className="text-2xl font-semibold mb-4">What the Merchant Sees</h2>
      <p className="mb-6">The onboarding UI shows a <strong>7-step journey</strong> with a loading animation:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Step</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What&apos;s shown</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['1. Catalog Analysis', '"You have 223 products, prices ranging from $2 to $9"'],
            ['2. Sales Analysis', '"59 orders, $2,403 revenue, $40.73 average order"'],
            ['3. Store Matching', '"We found 3 similar successful stores"'],
            ['4. Strategy Recommendation', 'Copy varies by which layer fired (see below)'],
            ['5. Product Selection', '"Here are the products we\'d include" with grade breakdown'],
            ['6. Pricing', 'Mechanism-specific pricing display'],
            ['7. Bundle Ready', 'CTA button: "Review your bundle"'],
          ] as [string, string][]).map(([step, shown], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{step}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{shown}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">How the recommendation copy changes</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Decision source</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What the merchant reads</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Confidence label</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Behavioral override (Layer 3)', '"78% of your orders already have 3+ items -- volume discounts are a natural fit"', 'High'],
            ['Premium curated (Layer 2)', '"Your customers spend $X per order, 1.8x your product price -- a curated bundle fits"', 'High'],
            ['Inventory tail (Layer 2)', '"Your revenue is concentrated in a few products -- mix & match spreads the love"', 'High'],
            ['Cart builder (Layer 2)', '"With 200+ products and 40%+ multi-item orders, a mix & match is ideal"', 'High'],
            ['Reference store vote (Layer 4)', '"Similar successful stores use this strategy"', 'Validated'],
            ['Archetype default (Layer 5)', '"Based on your store profile, we recommend..."', 'Good'],
            ['Starter bundle (Layer 1)', '"Your store is ready for its first bundle"', 'Starting point'],
            ['No sales data', '"No sales data yet -- we\'ll use your catalog structure"', 'Starting point'],
          ] as [string, string, string][]).map(([source, copy, confidence], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{source}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 italic">{copy}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">What about zero-match stores?</h3>
      <p className="mb-8">If no reference stores are found for the archetype, Step 3 shows &quot;Using your catalog profile&quot; instead of match results, and the system proceeds to Layer 5 (archetype default).</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── After the Recommendation ─── */}
      <h2 className="text-2xl font-semibold mb-4">After the Recommendation</h2>
      <p className="mb-6">The merchant sees a &quot;Review your bundle&quot; button. They can modify products, pricing, and settings through the bundle creation UI -- they&apos;re not locked into our suggestion.</p>

      <h3 className="text-xl font-semibold mb-3">Current limitations</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Limitation</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Impact</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">One-time recommendation</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Does not auto-update if the store&apos;s data changes over time</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Known gap</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No feedback loop</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">We don&apos;t track whether merchants accept, modify, or reject recommendations</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Known gap</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No adoption metrics</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Decision trace stored internally for debugging, but no dashboard for recommendation quality</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Known gap</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">What&apos;s stored internally</h3>
      <p className="mb-8">Every recommendation generates a full <strong>decision trace</strong> -- a step-by-step log of what the system checked, what thresholds were hit or missed, and why it made its decision. This is for engineering debugging only and is not exposed to merchants or in any dashboard.</p>

      </div>
    </div>
  )
}
