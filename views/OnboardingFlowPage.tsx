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
    <div className="max-w-4xl mx-auto px-8 py-10 text-slate-800 dark:text-slate-200 leading-relaxed">

      <div className="flex items-start justify-between mb-2">
        <h1 className="text-3xl font-bold">Onboarding Flow</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">How New Stores Get Matched &amp; Recommended</p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ── Overview ── */}
      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      <p className="mb-4">
        When a new store installs EasyBundles, the onboarding flow (<code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">onboardNewStore.js</code>) runs a streamlined version of the profiling pipeline <strong>in real-time</strong>:
      </p>
      <p className="mb-4 font-medium">
        Flow: Phase 0 (Data Reliability) &rarr; Phase 1 (Build Profile) &rarr; Phase 2 (Find Matches) &rarr; Phase 3 (Recommend Strategy)
      </p>
      <p className="mb-8">
        <strong>Running Example:</strong> <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">83a38c-0c.myshopify.com</code> -- German candy &amp; beverage store, 223 SKUs, $4.99 median price, MID_HIGH_COMP archetype.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Phase 0 ── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 0: Data Reliability</h2>
      <p className="mb-4">Before making any recommendations, the system assesses data quality:</p>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li><strong>Outlier detection:</strong> Uses the order histogram to find orders above <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">min(P95 &times; 5, median &times; 10)</code> and removes them from metrics.</li>
        <li><strong>Test product filtering:</strong> Flags products matching patterns like &quot;test&quot;, &quot;upsell&quot;, &quot;free gift&quot;, &quot;placeholder&quot;.</li>
        <li><strong>Minimum order threshold:</strong> If &lt;50 orders, flags as LOW_SAMPLE and uses a simpler starter bundle instead of the full recommendation engine.</li>
      </ol>
      <p className="mb-8">
        <strong>For 83a38c-0c:</strong> reliability = &quot;OK&quot;, 0 flags, 0 outliers removed, 0 test products.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Phase 1 ── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 1: Build Profile</h2>
      <p className="mb-4">
        Runs <strong>Job 1</strong> (Structural) and <strong>Job 2</strong> (Performance) on the new store, then assigns an archetype. Jobs 3 and 4 are skipped (only relevant for existing REFERENCE stores).
      </p>
      <p className="mb-8">
        <strong>For 83a38c-0c:</strong> MID_HIGH_COMP archetype, 223 SKUs, complementarity 0.4227, price band &quot;low&quot;.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Phase 2 ── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 2: Find Matching Stores</h2>

      <h3 className="text-xl font-semibold mb-3">Step 1: Query candidates</h3>
      <p className="mb-4">Query all REFERENCE stores with the same archetype. For MID_HIGH_COMP, 18 found.</p>

      <h3 className="text-xl font-semibold mb-3">Step 2: Score candidates</h3>
      <p className="mb-4">Score each on three weighted axes:</p>
      <table className="w-full mb-6 border border-slate-300 dark:border-slate-600 text-sm">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-600">
            <th className="text-left px-4 py-2 font-semibold">Axis</th>
            <th className="text-left px-4 py-2 font-semibold">Weight</th>
            <th className="text-left px-4 py-2 font-semibold">How it works</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2">SKU Proximity</td>
            <td className="px-4 py-2">0.4</td>
            <td className="px-4 py-2">Log-scale distance between SKU counts</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2">Complementarity Similarity</td>
            <td className="px-4 py-2">0.4</td>
            <td className="px-4 py-2">1 - |diff| between complementarity scores</td>
          </tr>
          <tr>
            <td className="px-4 py-2">Price Proximity</td>
            <td className="px-4 py-2">0.2</td>
            <td className="px-4 py-2">Relative price difference</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-4">Take top 5 by score.</p>

      <h3 className="text-xl font-semibold mb-3">Step 3: Success filter</h3>
      <p className="mb-6">
        Keep only stores with ebSuccessTier = &quot;strong&quot; OR bundleRevenueContribution60 &gt;= 20%. If &gt;=3 pass, use those; otherwise fall back to top 3 structural matches.
      </p>

      <h3 className="text-xl font-semibold mb-3">Results for 83a38c-0c:</h3>
      <table className="w-full mb-4 border border-slate-300 dark:border-slate-600 text-sm">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-600">
            <th className="text-left px-4 py-2 font-semibold">Store</th>
            <th className="text-left px-4 py-2 font-semibold">Similarity</th>
            <th className="text-left px-4 py-2 font-semibold">Tier</th>
            <th className="text-left px-4 py-2 font-semibold">Bundle Contribution</th>
            <th className="text-left px-4 py-2 font-semibold">Dominant Strategy</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 font-mono text-sm">city-pop.myshopify.com</td>
            <td className="px-4 py-2">93.15%</td>
            <td className="px-4 py-2">moderate</td>
            <td className="px-4 py-2">65.48%</td>
            <td className="px-4 py-2">fixedBundlePrice</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 font-mono text-sm">uniko-2.myshopify.com</td>
            <td className="px-4 py-2">85.61%</td>
            <td className="px-4 py-2">moderate</td>
            <td className="px-4 py-2">32.19%</td>
            <td className="px-4 py-2">classic</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-mono text-sm">handsomescent.myshopify.com</td>
            <td className="px-4 py-2">84.15%</td>
            <td className="px-4 py-2">strong</td>
            <td className="px-4 py-2">59.89%</td>
            <td className="px-4 py-2">volumeDiscount</td>
          </tr>
        </tbody>
      </table>
      <p className="mb-8">All 5 top matches passed the success filter.</p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Phase 3 ── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 3: Recommend Strategy</h2>
      <p className="mb-4">
        The recommendation engine uses a <strong>layered decision process</strong>. Each layer is checked in order. The first one that fires wins:
      </p>
      <table className="w-full mb-6 border border-slate-300 dark:border-slate-600 text-sm">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-600">
            <th className="text-left px-4 py-2 font-semibold">Layer</th>
            <th className="text-left px-4 py-2 font-semibold">Name</th>
            <th className="text-left px-4 py-2 font-semibold">Rule</th>
            <th className="text-left px-4 py-2 font-semibold">Fired?</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2">1</td>
            <td className="px-4 py-2">LOW_SAMPLE Check</td>
            <td className="px-4 py-2">If &lt;50 orders, skip to starter template based on archetype alone</td>
            <td className="px-4 py-2">No</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2">2</td>
            <td className="px-4 py-2">Behavioral Override</td>
            <td className="px-4 py-2">If &gt;=60% of orders have 3+ items, override to volumeDiscount</td>
            <td className="px-4 py-2"><strong>YES</strong></td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2">3</td>
            <td className="px-4 py-2">Archetype Sub-rules</td>
            <td className="px-4 py-2">Archetype-specific logic (e.g., premium curated, inventory tail)</td>
            <td className="px-4 py-2">No</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2">4</td>
            <td className="px-4 py-2">Match Voting</td>
            <td className="px-4 py-2">Top 3 matched stores vote on dominant strategy. Majority wins</td>
            <td className="px-4 py-2">No</td>
          </tr>
          <tr>
            <td className="px-4 py-2">5</td>
            <td className="px-4 py-2">Archetype Default</td>
            <td className="px-4 py-2">Fallback: use archetype&apos;s default strategy from archetypeStrategyConfig</td>
            <td className="px-4 py-2">No</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Decision for 83a38c-0c:</h3>
      <p className="mb-3">The behavioral override fired:</p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 mb-4 text-sm font-mono overflow-x-auto">
        <code>{`78% of orders have 3+ items (threshold: 60%)
Signal: structural -> volumeDiscount`}</code>
      </pre>
      <p className="mb-2"><strong>Final recommendation:</strong> VOLUME_DISCOUNT with 3 Grade-A products:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Product 9957708169559 ($341.82 revenue)</li>
        <li>Product 9403273052503 ($109.90 revenue)</li>
        <li>Product 9716877132119 ($95.96 revenue)</li>
      </ul>
      <p className="mb-8"><strong>Pricing:</strong> Buy 2 get 10% off, Buy 3 get 20% off.</p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Decision Trace ── */}
      <h2 className="text-2xl font-semibold mb-4">Decision Trace (Auditability)</h2>
      <p className="mb-4">
        Every decision step is logged in <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">decisionTrace</code> and persisted in the profile&apos;s <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">onboardingResult</code> field. This makes the entire recommendation auditable.
      </p>

      <h3 className="text-xl font-semibold mb-3">What gets logged:</h3>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Why a store got the recommendation it did</li>
        <li>Which candidates were considered and their scores</li>
        <li>Which thresholds were checked</li>
        <li>Which rules fired and which didn&apos;t</li>
        <li>The full matched stores list with similarity scores</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Why it matters:</h3>
      <ul className="list-disc list-inside mb-8 space-y-1">
        <li>Debug unexpected recommendations</li>
        <li>Tune thresholds based on real outcomes</li>
        <li>Explain recommendations to store owners</li>
        <li>Track recommendation quality over time</li>
      </ul>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── End-to-End Summary ── */}
      <h2 className="text-2xl font-semibold mb-4">End-to-End Summary</h2>
      <ol className="list-decimal list-inside space-y-2 mb-10">
        <li><strong>Store Install</strong> -- New store installs EasyBundles</li>
        <li><strong>Phase 0</strong> -- Data reliability checks (outliers, test products, min orders)</li>
        <li><strong>Phase 1</strong> -- Run Job 1 (Structural) + Job 2 (Performance), assign archetype</li>
        <li><strong>Phase 2</strong> -- Query same-archetype references, score on 3 axes, success filter</li>
        <li><strong>Phase 3</strong> -- Layered decision: LOW_SAMPLE &rarr; Behavioral &rarr; Sub-rules &rarr; Voting &rarr; Default</li>
        <li><strong>Result</strong> -- Bundle type + product selection + pricing stored in onboardingResult</li>
      </ol>

      </div>
    </div>
  )
}
