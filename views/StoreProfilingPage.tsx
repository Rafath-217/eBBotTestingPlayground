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
        and what bundle strategy it runs. These profiles serve two purposes:
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-1">
        <li><strong>REFERENCE data</strong> -- The top stores become the "reference library" that new stores get compared against during onboarding.</li>
        <li><strong>Onboarding recommendations</strong> -- When a new store installs, we run a subset of these jobs on the fly, match the new store to similar reference stores, and recommend a bundle type and product selection.</li>
      </ol>
      <p className="mb-4">
        The pipeline is made up of <strong>5 sequential jobs</strong> (Jobs 1-4 build data, Job 5 synthesizes it), orchestrated by <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runAll()</code> in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ebCalculateSuccessMetrics.service.js</code>:
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
        The data model lives in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">storeModelingProfile.model.js</code>.
        Each store gets a single document identified by <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopName</code>.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Running Example ─── */}
      <h2 className="text-2xl font-semibold mb-4">Running Example: 83a38c-0c.myshopify.com</h2>

      <p className="mb-4">
        Throughout this document we will use a real store to illustrate each job's output. Here is the store at a glance:
      </p>

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
        This is a German candy and beverage store -- low price points, moderate product diversity, and customers who buy
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
        <strong>Source:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runStructuralJob()</code> in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ebCalculateSuccessMetrics.service.js</code>, lines ~96-228.
      </p>

      <h3 className="text-xl font-semibold mb-3">How it works</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Fetch products</strong> -- Paginate through the Shopify Products API (<code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopify.product.list</code>), fetching up to 1,000 active products in batches of 250.</li>
        <li><strong>Extract prices</strong> -- For each product, take the minimum variant price (the cheapest variant). Filter out zero/null prices. Sort ascending.</li>
        <li><strong>Compute price statistics</strong> -- Median, P25, P75, and price band.</li>
        <li><strong>Compute complementarity</strong> -- Build a frequency map of <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">product_type</code> values, then run normalized Shannon entropy over it.</li>
        <li><strong>Classify industry</strong> -- Two-pass Gemini LLM classification (classify, then verify). Skip if the store's industry has been manually verified.</li>
        <li><strong>Upsert</strong> -- Save all structural fields to the profile document.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">Store example: 83a38c-0c.myshopify.com</h3>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-4 overflow-x-auto">
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
      <p className="mb-6">
        The LLM classified this store as Food &amp; Gourmet / Beverages with 95% confidence. The verification pass agreed with the initial classification.
      </p>

      <h3 className="text-xl font-semibold mb-3">Key concepts explained</h3>

      <h4 className="text-lg font-semibold mb-2">Price analysis: median, P25, P75, priceBand</h4>
      <p className="mb-2">
        We use the <strong>median</strong> product price rather than the mean because a single $500 gift set in a store
        full of $5 candies would skew the average. The median gives you the "typical" product price.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>P25</strong> (25th percentile): 25% of products cost less than this. For 83a38c-0c, P25 = $2.00.</li>
        <li><strong>P75</strong> (75th percentile): 75% of products cost less than this. For 83a38c-0c, P75 = $8.99.</li>
        <li><strong>priceBand</strong>: A simple bucket derived from the median price:
          <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
            <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">"low"</code> -- median &lt; $25</li>
            <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">"mid"</code> -- median $25-$100</li>
            <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">"high"</code> -- median &gt; $100</li>
          </ul>
        </li>
      </ul>
      <p className="mb-4">
        At $4.99 median, 83a38c-0c is firmly in the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">"low"</code> band. This is typical for candy and beverage stores.
      </p>
      <p className="mb-2">The thresholds are defined in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">config.js</code>:</p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-6 overflow-x-auto">
        <code>{`PRICE_BANDS: {
  low: 25,   // median < $25 -> "low"
  high: 100, // median > $100 -> "high", else "mid"
}`}</code>
      </pre>

      <h4 className="text-lg font-semibold mb-2">Complementarity Score (Shannon entropy)</h4>
      <p className="mb-2">
        The complementarity score measures <strong>how diverse</strong> a store's catalog is, using normalized Shannon entropy over the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">product_type</code> distribution.
      </p>
      <p className="mb-2">
        Think of it as a "surprise meter." If every product in the store is the same type (e.g., all "Candy"), there is zero surprise -- complementarity = 0. If products are evenly spread across many types (e.g., "Candy", "Beverages", "Snacks", "Gift Sets"), there is maximum surprise -- complementarity approaches 1.0.
      </p>
      <p className="mb-2">The math (from <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">utils.js</code>):</p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-4 overflow-x-auto">
        <code>{`function normalizedEntropy(freqMap) {
  const values = Object.values(freqMap).filter((v) => v > 0);
  if (values.length <= 1) return 0;

  const total = values.reduce((a, b) => a + b, 0);
  const maxEntropy = Math.log2(values.length);

  let entropy = 0;
  for (const count of values) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }

  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}`}</code>
      </pre>
      <p className="mb-4">
        The key insight: the raw Shannon entropy is divided by <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">log2(N)</code> where N is the number of unique product types. This normalizes the score to 0-1 regardless of how many types exist.
      </p>
      <p className="mb-4">
        For 83a38c-0c, the score is <strong>0.4227</strong> -- moderate diversity. The store has several product types (candy, beverages, snacks, etc.) but some types dominate more than others.
      </p>
      <p className="mb-6">
        <strong>Why this matters for bundling:</strong> High-complementarity stores (score &gt;= 0.3) are natural fits for cross-category bundles (mix &amp; match). Low-complementarity stores work better with volume discounts on the same product.
      </p>

      <h4 className="text-lg font-semibold mb-2">Industry Classification (2-pass LLM)</h4>
      <p className="mb-2">
        Industry is classified by Gemini 2.0 Flash in two passes:
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li><strong>First pass</strong> (<code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">classifyIndustryLLM</code>): Given the top product types and a sample of product titles, classify into one of ~40 predefined industries (e.g., "Beauty &amp; Cosmetics", "Food &amp; Gourmet", "Fashion &amp; Apparel") plus a sub-industry.</li>
        <li><strong>Second pass</strong> (<code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">verifyIndustryLLM</code>): Given the same data plus the first pass's answer, either confirm or correct the classification. This produces a confidence score (0-1).</li>
      </ol>
      <p className="mb-2">
        If the two passes disagree, the verification pass wins. The system logs whether verification agreed or disagreed.
      </p>
      <p className="mb-2">
        If a store's industry has been <strong>manually verified</strong> (via the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">industryVerified</code> flag), the LLM step is skipped entirely on subsequent runs.
      </p>
      <p className="mb-4">
        For 83a38c-0c, both passes agreed: Food &amp; Gourmet / Beverages at 0.95 confidence.
      </p>
      <p className="mb-6">
        The industry classification feeds into the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">INDUSTRY_ADJACENCY</code> map in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">config.js</code>, which defines which industries are considered "similar" (e.g., "Food &amp; Gourmet" is adjacent to "Coffee &amp; Tea" and "Beverages"). This is used during store matching.
      </p>

      <h4 className="text-lg font-semibold mb-2">Archetype Assignment</h4>
      <p className="mb-2">
        The archetype is a structural bucket that summarizes "what kind of store is this?" based on three inputs: SKU count, complementarity score, and price band.
      </p>
      <p className="mb-2">The logic (from <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">getArchetypeId()</code>):</p>
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

      <p className="mb-4">
        For 83a38c-0c: 223 SKUs is "MID", complementarity 0.4227 is "HIGH" (&gt;= 0.3), so the archetype is <strong>MID_HIGH_COMP</strong>.
      </p>
      <p className="mb-8">
        Note: for LARGE stores (&gt;500 SKUs), the complementarity score is replaced by priceBand in the decision. This is because at scale, complementarity loses discriminating power -- almost every large store has high entropy.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 2 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 2: Performance Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"How is this store performing?"</p>

      <h3 className="text-xl font-semibold mb-3">What it does</h3>
      <p className="mb-4">
        Job 2 measures the store's sales performance over a rolling 60-day window. It fetches order data from Shopify, computes revenue rollups, customer behavior metrics, and product-level revenue for ABC analysis.
      </p>
      <p className="mb-4">
        <strong>Source:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runShopifyPerformanceJob()</code> in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ebCalculateSuccessMetrics.service.js</code>, lines ~564-668.
      </p>

      <h3 className="text-xl font-semibold mb-3">Data paths: ShopifyQL vs REST</h3>
      <p className="mb-4">There are two ways to get order data from Shopify:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
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
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">ShopifyQL</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">read_reports scope</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Fast (pre-aggregated)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Daily revenue + orders + unique customers + product revenue</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">REST</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">Basic scope</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Slow (raw orders)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Everything above PLUS order histogram, units per order, first-time vs repeat AOV</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-2">
        The system checks at startup which stores have <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> scope (via <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">getStoresWithReadReports()</code>). Stores with it use ShopifyQL; the rest fall back to REST.
      </p>
      <p className="mb-2">
        ShopifyQL returns pre-aggregated daily data, so it cannot compute order-level metrics like the histogram or units-per-order. These fields retain their last REST-computed values for ShopifyQL stores.
      </p>
      <p className="mb-6">
        83a38c-0c has <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> scope and used <strong>ShopifyQL</strong>.
      </p>

      <h3 className="text-xl font-semibold mb-3">60-day metrics</h3>
      <p className="mb-4">
        After daily data is fetched and stored in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">storeDailyPerformance</code>, the system computes rolling 60-day aggregates via <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">computeAndSaveRollingMetrics()</code>:
      </p>

      <h4 className="text-lg font-semibold mb-2">Store example: 83a38c-0c.myshopify.com</h4>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-6 overflow-x-auto">
        <code>{`totalRevenue60:          $2,403.08
totalOrders60:           59
aov60:                   $40.73
repeatRate60:            0.1695  (16.95%)
revenueConcentration60:  0.1422  (14.22%)
firstTimeAOV60:          $40.58
repeatAOV60:             $41.46`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-3">Key concepts explained</h3>

      <h4 className="text-lg font-semibold mb-2">AOV (Average Order Value)</h4>
      <p className="mb-2">
        Simply <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">totalRevenue60 / totalOrders60</code>. For 83a38c-0c: $2,403.08 / 59 = $40.73.
      </p>
      <p className="mb-6">
        This is important context: the median product price is $4.99 but the AOV is $40.73, meaning customers buy roughly 8 items per order on average. This is a strong signal that volume discounts will work.
      </p>

      <h4 className="text-lg font-semibold mb-2">Repeat rate</h4>
      <p className="mb-2">
        <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">repeatRate60 = (totalOrders60 - uniqueCustomers) / totalOrders60</code>
      </p>
      <p className="mb-6">
        If a store has 59 orders from 49 unique customers, repeat rate = (59-49)/59 = 16.95%. Higher repeat rates suggest loyal customers who may respond well to bundles.
      </p>

      <h4 className="text-lg font-semibold mb-2">Revenue concentration</h4>
      <p className="mb-2">
        <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">revenueConcentration60 = maxProductRevenue / totalRevenue60</code>
      </p>
      <p className="mb-6">
        This measures how much of the store's revenue comes from a single product. At 14.22%, 83a38c-0c has a well-distributed revenue -- no single product dominates. High concentration (&gt;25%) suggests a "hero product" store that might benefit from mix-and-match bundles to drive discovery of other products.
      </p>

      <h4 className="text-lg font-semibold mb-2">ABC analysis</h4>
      <p className="mb-2">
        Products are ranked by revenue and split into three grades:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>Grade A</strong> (top 20% of SKUs): The revenue drivers. For 83a38c-0c, 30 SKUs generate the bulk of revenue.</li>
        <li><strong>Grade B</strong> (next 30% of SKUs): Solid mid-tier products. 31 SKUs.</li>
        <li><strong>Grade C</strong> (bottom 50% of SKUs): The long tail. 52 SKUs with minimal individual revenue.</li>
      </ul>
      <p className="mb-4">
        The ABC split is computed in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">computeAbcAnalysis()</code>. It is used during onboarding to select which products go into the recommended bundle -- Grade A products are picked first.
      </p>
      <p className="mb-2">From the onboarding trace for 83a38c-0c:</p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-6 overflow-x-auto">
        <code>{`ABC Analysis:
  Total products with revenue: 113
  Grade A: 30 products (26.5%)
  Grade B: 31 products (27.4%)
  Grade C: 52 products (46.0%)`}</code>
      </pre>

      <h4 className="text-lg font-semibold mb-2">Units per order</h4>
      <p className="mb-2">
        Counts how many line item units each order contains:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>oneItemOrders</strong>: Orders with 1 unit total</li>
        <li><strong>twoItemOrders</strong>: Orders with exactly 2 units</li>
        <li><strong>threePlusOrders</strong>: Orders with 3+ units</li>
      </ul>
      <p className="mb-6">
        For 83a38c-0c: 46 out of 59 orders (78%) contained 3+ items. This is a very strong multi-item signal, which is why the onboarding system triggered a behavioral override to recommend volume discounts.
      </p>

      <h4 className="text-lg font-semibold mb-2">Incremental fetch</h4>
      <p className="mb-2">
        Job 2 uses smart incremental fetching. On subsequent runs, it only fetches days since <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">lastPerformanceUpdateAt</code>, rather than re-fetching the full 60-day window. The rolling metrics are always recomputed from all stored daily snapshots within the 60-day window.
      </p>
      <p className="mb-8">
        Special case: if a previous run resulted in $0 revenue (likely a data issue), the system does a full 60-day backfill instead of an incremental fetch.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 3 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 3: Bundle Success Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"How well are bundles doing?"</p>

      <h3 className="text-xl font-semibold mb-3">What it does</h3>
      <p className="mb-4">
        Job 3 measures how well the store's existing bundles perform. Unlike Jobs 1-2 which talk to Shopify, Job 3 reads from the internal <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleAnalytics</code> database -- our own tracking of bundle orders and revenue.
      </p>
      <p className="mb-4">
        <strong>Source:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runEbMetricsJob()</code> in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ebCalculateSuccessMetrics.service.js</code>, lines ~674-789.
      </p>

      <h3 className="text-xl font-semibold mb-3">Metrics computed</h3>
      <p className="mb-4">
        The job reads monthly revenue and order data from <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleAnalytics</code>, covering a 60-day window approximated by three calendar months (current month pro-rated, previous month full, month before that partially):
      </p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li><strong>bundleRevenue60</strong>: Total bundle revenue over the 60-day window (net of cancellations)</li>
        <li><strong>bundleOrders60</strong>: Total bundle orders over the window</li>
        <li><strong>bundleRevenueContribution60</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleRevenue60 / totalRevenue60</code> -- what percentage of total store revenue comes from bundles</li>
        <li><strong>attachRate60</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleOrders60 / totalOrders60</code> -- what percentage of orders include a bundle</li>
        <li><strong>stabilityScore60</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">min(netMonth1, netMonth2) / max(netMonth1, netMonth2)</code> -- how consistent bundle revenue is month-over-month. A score of 1.0 means perfectly stable; 0.0 means one month had zero revenue.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Store example: 83a38c-0c.myshopify.com</h3>
      <p className="mb-2">
        83a38c-0c is a <strong>new store</strong> being onboarded, so it does not yet have EB metrics. During onboarding, Jobs 3 and 4 are skipped (they are only relevant for existing REFERENCE stores). The EB metrics for 83a38c-0c would all be zero/null at onboarding time.
      </p>
      <p className="mb-6">
        However, its <strong>matched reference stores</strong> have these metrics. For example, handsomescent.myshopify.com (the top "strong" match) has <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleRevenueContribution60 = 0.5989</code> (59.89% of revenue from bundles).
      </p>

      <h3 className="text-xl font-semibold mb-3">Success Tier classification</h3>
      <p className="mb-4">
        Each store is assigned an <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ebSuccessTier</code> based on its EB metrics, via <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">computeSuccessTier()</code>:
      </p>
      <p className="mb-2"><strong>Strong</strong> -- All four conditions must be met:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleRevenueContribution60 &gt;= 0.12</code> (12%)</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">attachRate60 &gt;= 0.05</code> (5%)</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">stabilityScore60 &gt;= 0.6</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">totalRevenue60 &gt;= $50,000</code></li>
      </ul>
      <p className="mb-2"><strong>Moderate</strong> -- Just one condition:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleRevenueContribution60 &gt;= 0.05</code> (5%)</li>
      </ul>
      <p className="mb-4"><strong>Weak</strong> -- Everything else.</p>
      <p className="mb-2">These thresholds are defined in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">config.js</code>:</p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-4 overflow-x-auto">
        <code>{`SUCCESS_TIER: {
  strong: {
    bundleRevenueContribution: 0.12,
    attachRate: 0.05,
    stability: 0.6,
    minRevenue: 50000,
  },
  moderate: {
    bundleRevenueContribution: 0.05,
  },
}`}</code>
      </pre>
      <p className="mb-8">
        The "strong" tier is intentionally strict -- it requires meaningful bundle revenue contribution, consistent performance, customer adoption, AND a minimum revenue floor. This ensures that reference stores recommended during onboarding are genuinely successful, not just small stores with high percentages.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 4 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 4: Bundle Strategy Analysis</h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 italic mb-4">"What strategy are they using?"</p>

      <h3 className="text-xl font-semibold mb-3">What it does</h3>
      <p className="mb-4">
        Job 4 reads the store's actual bundle configurations from the database and classifies each bundle by type, pattern, and discount structure. It then produces a store-level summary of the dominant strategy.
      </p>
      <p className="mb-4">
        <strong>Source:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">service.runBundleStrategyJob()</code> in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ebCalculateSuccessMetrics.service.js</code>, lines ~1004-1302.
      </p>

      <h3 className="text-xl font-semibold mb-3">Bundle type classification</h3>
      <p className="mb-3">
        Each bundle is classified via <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">normalizeBundleType()</code>. The input is the raw <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleType</code> field from the database (e.g., "FULLPAGE_BUNDLE", "MIX_AND_MATCH"), plus the bundle's configuration details.
      </p>
      <p className="mb-3">The full classification table:</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
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
            ['FULLPAGE_BUNDLE', 'discount rules have getsQuantity', 'bxgy'],
            ['FULLPAGE_BUNDLE', 'discountMode = FIXED_BUNDLE_PRICE', 'fixedBundlePrice'],
            ['FULLPAGE_BUNDLE', 'boxSelection.rules.length >= 2', 'volumeDiscount'],
            ['FULLPAGE_BUNDLE', '>=2 amount rules', 'tieredDiscount'],
            ['FULLPAGE_BUNDLE', '>=2 quantity rules', 'volumeDiscount'],
            ['FULLPAGE_BUNDLE', 'everything else', 'classic'],
            ['null/undefined', '--', 'classic'],
          ].map(([raw, cond, norm], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{raw}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cond}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{norm}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mb-6">
        The order matters -- the first matching condition wins. This means a FULLPAGE_BUNDLE with addon products enabled is always classified as <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">addonFreeGift</code>, even if it also has volume discount rules.
      </p>

      <h3 className="text-xl font-semibold mb-3">Pattern detection</h3>
      <p className="mb-2">
        Each bundle's products are analyzed to determine the cross-sell pattern, via <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">classifyBundlePattern()</code>:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li><strong>same-category</strong>: All products share the same <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">product_type</code></li>
        <li><strong>cross-category</strong>: Products span multiple product types, none dominant</li>
        <li><strong>upsell-addon</strong>: One dominant product type (&gt;60% of products) plus add-ons from other types</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Store-level summary</h3>
      <p className="mb-2">The job aggregates across all active bundles to produce:</p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-4 overflow-x-auto">
        <code>{`bundleStrategySummary: {
  totalActiveBundles: Number,
  bundleTypes: { classic: 3, mixAndMatch: 2, ... },
  dominantStrategy: String,        // type driving most revenue
  avgDiscountPercent: Number,
  avgProductsPerBundle: Number,
  topBundlePattern: String,        // most common pattern
  revenueShareByType: {
    classic: { share, revenue, subtypes: { fixedBundlePrice: {...}, ... } },
    mixAndMatch: { share, revenue },
  },
}`}</code>
      </pre>
      <p className="mb-6">
        The <strong>dominant strategy</strong> is determined by revenue first -- whichever bundle type generates the most 2-month revenue wins. If no revenue data exists, it falls back to the most common type by count.
      </p>

      <h3 className="text-xl font-semibold mb-3">Store example</h3>
      <p className="mb-2">
        Like Job 3, 83a38c-0c is a new store with no existing bundles. But its matched reference stores show their strategies:
      </p>
      <ul className="list-disc list-inside mb-8 space-y-1">
        <li>city-pop.myshopify.com: dominant strategy = <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">fixedBundlePrice</code></li>
        <li>uniko-2.myshopify.com: dominant strategy = <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">classic</code></li>
        <li>handsomescent.myshopify.com: dominant strategy = <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">volumeDiscount</code></li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 5 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 5: Archetype + Store Audit</h2>

      <p className="mb-4">
        Job 5 runs after all data is collected. It:
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li>
          <strong>Assigns the archetype</strong> using the same <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">getArchetypeId()</code> logic described in Job 1, but also computes <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">defaultBundleType</code> -- the subtype with the highest revenue from <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">revenueShareByType</code>.
        </li>
        <li>
          <strong>Runs a store audit</strong> (<code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">runAudit()</code>) that detects specific problems in the store's data (e.g., "hero product dependency", "low basket size") and recommends a bundle type to address them.
        </li>
      </ol>
      <p className="mb-4">
        The audit result is stored in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">storeAudit</code> with a list of detected problems, their severities, and a primary problem + recommended bundle type.
      </p>

      </div>
    </div>
  )
}
