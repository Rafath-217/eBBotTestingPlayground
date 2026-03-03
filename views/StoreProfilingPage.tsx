import { useRef, useState } from 'react'

export default function StoreProfilingPage() {
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
        <h1 className="text-3xl font-bold">Store Modeling Profile</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">How We Build the Top 50</p>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── Overview ─── */}
      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      <p className="mb-4">
        The store modeling pipeline profiles the top Shopify stores that use EasyBundles, producing a structured
        profile for each one. The goal: understand what a store sells, how it performs, how well its bundles work,
        and what bundle strategy it runs.
      </p>
      <p className="mb-4">Two purposes:</p>
      <ol className="list-decimal list-inside mb-4 space-y-1">
        <li><strong>Reference data</strong> -- The top stores become the "reference library" that new stores get compared against during onboarding.</li>
        <li><strong>Onboarding recommendations</strong> -- When a new store installs, we run a subset of these jobs on the fly, match the new store to similar reference stores, and recommend a bundle type and product selection.</li>
      </ol>
      <p className="mb-4">
        Pipeline is 5 sequential jobs (Jobs 1-4 build data, Job 5 synthesizes), orchestrated by <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runAll()</code>:
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Job</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Name</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Data Source</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What It Produces</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">1</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Structural</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Shopify Products API</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">SKU count, prices, industry, complementarity, archetype</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">2</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Performance</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">ShopifyQL or REST Orders</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">60-day revenue, AOV, repeat rate, ABC analysis</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">EB Metrics</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">bundleAnalytics DB</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bundle revenue contribution, attach rate, success tier</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">4</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bundle Strategy</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">stepsConfiguration + mixAndMatch DBs</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bundle types, patterns, dominant strategy</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">5</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Archetype + Audit</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Computed from Jobs 1-4</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Archetype ID, store audit problems</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-8">
        Data model lives in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">storeModelingProfile.model.js</code>.
        Each store gets a single document identified by <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopName</code>.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Running Example ─── */}
      <h2 className="text-2xl font-semibold mb-4">Running Example: 83a38c-0c.myshopify.com</h2>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Field</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['shopName', '83a38c-0c.myshopify.com'],
            ['Industry', 'Food & Gourmet / Beverages'],
            ['SKU count', '223'],
            ['Median price', '$4.99'],
            ['Price band', 'low'],
            ['Complementarity', '0.4227'],
            ['Archetype', 'MID_HIGH_COMP'],
            ['60-day revenue', '$2,403.08'],
            ['60-day orders', '59'],
            ['AOV', '$40.73'],
            ['Repeat rate', '16.95%'],
          ].map(([field, value]) => (
            <tr key={field}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{field}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-8">
        A German candy and beverage store -- low price points, moderate product diversity, and customers who buy
        multiple items per order (78% of orders contain 3+ items).
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 1 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 1: Structural Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"What does this store sell?"</p>

      <h3 className="text-xl font-semibold mb-3">What it does</h3>
      <p className="mb-4">
        Job 1 answers the catalog question. It fetches every active product from Shopify, computes price statistics,
        measures how diverse the catalog is, classifies the store's industry via LLM, and determines which structural
        archetype the store belongs to.
      </p>
      <p className="mb-4">
        Source: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runStructuralJob()</code>, lines ~96-228.
      </p>

      <h3 className="text-xl font-semibold mb-3">How it works</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Fetch products</strong> -- Paginate through the Shopify Products API, fetching up to 1,000 active products in batches of 250.</li>
        <li><strong>Extract prices</strong> -- For each product, take the minimum variant price. Filter out zero/null prices.</li>
        <li><strong>Compute price statistics</strong> -- Median, P25, P75, and price band.</li>
        <li><strong>Compute complementarity</strong> -- Normalized Shannon entropy over product_type distribution.</li>
        <li><strong>Classify industry</strong> -- Two-pass Gemini LLM classification (classify, then verify).</li>
        <li><strong>Upsert</strong> -- Save all structural fields to the profile document.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">Example output</h3>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-6 overflow-x-auto">
        <code>{`skuCount:                 223
medianProductPrice:       $4.99
priceP25:                 $2.00
priceP75:                 $8.99
priceBand:                "low"
industry:                 "Food & Gourmet"
subIndustry:              "Beverages"
classificationConfidence: 0.95
complementarityScore:     0.4227`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-3">Price analysis: median, P25, P75, priceBand</h3>
      <p className="mb-2">
        We use the <strong>median</strong> product price rather than the mean because a single $500 gift set in a store
        full of $5 candies would skew the average.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>P25</strong> (25th percentile): 25% of products cost less than this. For 83a38c-0c, P25 = $2.00.</li>
        <li><strong>P75</strong> (75th percentile): 75% of products cost less than this. For 83a38c-0c, P75 = $8.99.</li>
        <li><strong>priceBand</strong>: "low" (median &lt; $25), "mid" ($25-$100), "high" (&gt; $100). At $4.99, this store is "low".</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Complementarity Score (Shannon entropy)</h3>
      <p className="mb-2">
        Measures how diverse a store's catalog is, using normalized Shannon entropy over product_type distribution.
        Think of it as a "surprise meter." Score 0 = all same type, score 1 = maximum diversity. For 83a38c-0c,
        0.4227 = moderate diversity. High (&gt;=0.3) = cross-category bundles. Low = volume discounts.
      </p>

      <h3 className="text-xl font-semibold mb-3">Industry Classification (2-pass LLM)</h3>
      <p className="mb-2">
        <strong>Pass 1:</strong> Gemini classifies into ~40 predefined industries + sub-industry.
      </p>
      <p className="mb-2">
        <strong>Pass 2:</strong> Verification pass confirms or corrects, produces confidence score (0-1).
      </p>
      <p className="mb-4">
        If passes disagree, verification wins. Manually verified stores skip LLM entirely.
      </p>

      <h3 className="text-xl font-semibold mb-3">Archetype Assignment</h3>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-4 overflow-x-auto">
        <code>{`size = skuCount < 100 ? "SMALL" : skuCount <= 500 ? "MID" : "LARGE"
comp = complementarityScore < 0.3 ? "LOW" : "HIGH"`}</code>
      </pre>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Archetype</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Conditions</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Typical store</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['SMALL_LOW_COMP', '<100 SKUs, comp <0.3', 'Single-product brand, supplements'],
            ['SMALL_HIGH_COMP', '<100 SKUs, comp >=0.3', 'Curated boutique, gift shop'],
            ['MID_HIGH_COMP', '100-500 SKUs, comp >=0.3', 'Mid-size store with variety'],
            ['LARGE_LOW_PRICE', '>500 SKUs, priceBand="low"', 'High-volume discount store'],
            ['MID_LARGE_HIGH_COMP', 'Everything else', 'Large diverse catalog'],
          ].map(([arch, cond, typical]) => (
            <tr key={arch}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{arch}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cond}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{typical}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-8">
        For 83a38c-0c: 223 SKUs = "MID", complementarity 0.4227 = "HIGH", so archetype = <strong>MID_HIGH_COMP</strong>.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 2 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 2: Performance Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"How is this store performing?"</p>

      <h3 className="text-xl font-semibold mb-3">Data paths: ShopifyQL vs REST</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Path</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Requires</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Speed</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Data richness</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">ShopifyQL</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">read_reports scope</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fast</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Daily revenue + orders + unique customers + product revenue</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">REST</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">Basic scope</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Slow</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Everything above PLUS order histogram, units per order, first-time vs repeat AOV</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">60-day metrics example</h3>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-6 overflow-x-auto">
        <code>{`totalRevenue60:          $2,403.08
totalOrders60:           59
aov60:                   $40.73
repeatRate60:            0.1695  (16.95%)
revenueConcentration60:  0.1422  (14.22%)
firstTimeAOV60:          $40.58
repeatAOV60:             $41.46`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-3">Key concepts</h3>
      <ul className="list-disc list-inside mb-8 space-y-3">
        <li>
          <strong>AOV</strong>: totalRevenue / totalOrders. At $4.99 median but $40.73 AOV, customers buy ~8 items per order.
        </li>
        <li>
          <strong>Repeat rate</strong>: (orders - uniqueCustomers) / orders. 59 orders, 49 unique = 16.95%.
        </li>
        <li>
          <strong>Revenue concentration</strong>: maxProductRevenue / totalRevenue. 14.22% = well-distributed. &gt;25% = "hero product" store.
        </li>
        <li>
          <strong>ABC analysis</strong>: Grade A (top 20% SKUs), Grade B (next 30%), Grade C (bottom 50%). Grade A picked first for bundles.
        </li>
        <li>
          <strong>Units per order</strong>: 78% of orders have 3+ items -- strongest signal for behavioral override to volume discounts.
        </li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 3 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 3: Bundle Success Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"How well are bundles doing?"</p>

      <p className="mb-4">
        Reads from internal <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleAnalytics</code> database
        (not Shopify). 60-day window.
      </p>

      <p className="mb-2">
        <strong>Metrics:</strong> bundleRevenue60, bundleOrders60, bundleRevenueContribution60 (bundleRevenue/totalRevenue),
        attachRate60 (bundleOrders/totalOrders), stabilityScore60 (min(month1,month2)/max(month1,month2)).
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Success Tier Classification</h3>
      <ul className="list-disc list-inside mb-4 space-y-3">
        <li>
          <strong>Strong</strong>: ALL of: bundleRevenueContribution &gt;= 12%, attachRate &gt;= 5%, stabilityScore &gt;= 0.6, totalRevenue &gt;= $50,000
        </li>
        <li>
          <strong>Moderate</strong>: bundleRevenueContribution &gt;= 5%
        </li>
        <li>
          <strong>Weak</strong>: Everything else
        </li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 4 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 4: Bundle Strategy Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"What strategy are they using?"</p>

      <p className="mb-4">
        Reads bundle configurations from database. Classifies each bundle by type, pattern, and discount structure.
      </p>

      <h3 className="text-xl font-semibold mb-3">Bundle type classification</h3>
      <p className="mb-3">
        Via <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">normalizeBundleType</code>, first match wins:
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Raw bundleType</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Condition</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Normalized type</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['MIX_AND_MATCH', '--', 'mixAndMatch'],
            ['SUBSCRIPTION_BUNDLE', '--', 'subscription'],
            ['FULLPAGE_BUNDLE', 'addonProducts.isEnabled', 'addonFreeGift'],
            ['FULLPAGE_BUNDLE', 'getsQuantity in rules', 'bxgy'],
            ['FULLPAGE_BUNDLE', 'FIXED_BUNDLE_PRICE', 'fixedBundlePrice'],
            ['FULLPAGE_BUNDLE', 'boxSelection rules >= 2', 'volumeDiscount'],
            ['FULLPAGE_BUNDLE', '>= 2 amount rules', 'tieredDiscount'],
            ['FULLPAGE_BUNDLE', '>= 2 quantity rules', 'volumeDiscount'],
            ['FULLPAGE_BUNDLE', 'default', 'classic'],
          ].map(([raw, cond, norm], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{raw}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cond}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{norm}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Pattern detection</h3>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>same-category</strong>: All products share same product_type</li>
        <li><strong>cross-category</strong>: Products span multiple types, none dominant</li>
        <li><strong>upsell-addon</strong>: One dominant type (&gt;60%) plus add-ons</li>
      </ul>

      <p className="mb-8">
        Dominant strategy = whichever type generates most 2-month revenue. Fallback = most common by count.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 5 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 5: Archetype + Store Audit</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">Synthesis of all collected data</p>

      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li>
          <strong>Assigns archetype</strong> using <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">getArchetypeId()</code> +
          computes <strong>defaultBundleType</strong> (highest revenue subtype from <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">revenueShareByType</code>).
        </li>
        <li>
          Runs <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">runAudit()</code> detecting problems
          (e.g., "dead zone below free shipping threshold", "hero product dependency") and recommends a bundle type.
        </li>
      </ol>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Data Model ─── */}
      <h2 className="text-2xl font-semibold mb-4">Data Model</h2>
      <p className="mb-2">
        Data model lives in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">storeModelingProfile.model.js</code>.
        Each store gets a single document identified by <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopName</code>.
        All 5 jobs upsert into the same document.
      </p>

      </div>
    </div>
  )
}
