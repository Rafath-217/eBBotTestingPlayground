import { useRef, useState } from 'react'

export default function BaasFAQPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = contentRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const orderCountRows = [
    ['0 orders', 'Protocol B returns no data; pipeline behaves like Protocol A only'],
    ['1-49 orders', 'Behavioral classifier returns null profile (minimum is 50); archetype overrides are skipped (minimum is 50)'],
    ['50-99 orders', 'Behavioral profile is computed; confidence is LOW (minimum for medium is 100)'],
    ['100-199 orders', 'Medium confidence; retention metrics queries may still run'],
    ['200-499 orders', 'Full queries including retention metrics; medium confidence'],
    ['500+ orders', 'High confidence possible (if pricing confidence is also high)'],
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-slate-800 dark:text-slate-200 leading-relaxed">

      {/* ─── Title + Copy ─── */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold">BaaS Analytics Pipeline &mdash; PM FAQ</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="mb-1 text-slate-500 dark:text-slate-400 italic text-sm">Updated: 2026-03-09</p>
      <p className="mb-3"><strong>Companion to:</strong> PM_HANDOFF.md</p>
      <p className="mb-4"><strong>When to use this doc:</strong> For specific questions about edge cases, debugging, and operational scenarios not covered in the handoff.</p>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── Getting Started ─── */}
      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>

      <h3 className="text-xl font-semibold mb-3">How do I trigger an analysis?</h3>
      <p className="mb-3">Send a POST request to <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">/api/analytics/analyze</code> with a JSON body containing:</p>
      <ul className="list-disc list-inside mb-3 space-y-2">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">url</code> &mdash; the store&apos;s public website URL</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopName</code> &mdash; the store&apos;s Shopify domain (e.g., <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">evelyn-bobbie.myshopify.com</code>)</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">appName</code> &mdash; which Zura app the store uses (e.g., <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">kite</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">fly</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">easyBundles</code>)</li>
      </ul>
      <p className="mb-6">All three fields are recommended for the fullest analysis. At minimum, either <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">url</code> or <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopName</code> is required. If <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">shopName</code> is provided, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">appName</code> is also required.</p>

      <h3 className="text-xl font-semibold mb-3">Can I run just the website audit without revenue data?</h3>
      <p className="mb-6">Yes. Use <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">POST /api/analytics/audit</code> with just <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{`{ "url": "https://example.com" }`}</code>. This runs Protocol A only and returns the website audit plus structural strategy positioning &mdash; no revenue data, no cross-validation.</p>

      <h3 className="text-xl font-semibold mb-3">Can I run just the revenue analysis without scraping?</h3>
      <p className="mb-6">Yes. Use <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">POST /api/analytics/auditData</code> with <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{`{ "shopName": "store.myshopify.com", "appName": "kite" }`}</code>. This runs Protocol B only.</p>

      <h3 className="text-xl font-semibold mb-3">How long does a full analysis take?</h3>
      <p className="mb-3">Typically 2-5 minutes. Most time is spent on:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Headless browser scraping (~10-30 seconds)</li>
        <li>ShopifyQL queries (~30-60 seconds, with 3-second delays between queries)</li>
        <li>AI synthesis calls (~10-20 seconds each, 5 AI calls total)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Can I re-run the pipeline for the same store?</h3>
      <p className="mb-6">Yes. Each run creates a new record in the database. Previous runs are preserved and accessible via the history endpoints.</p>

      <h3 className="text-xl font-semibold mb-3">How do I view past results?</h3>
      <p className="mb-6"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">GET /api/analytics/history</code> returns paginated results (default 20 per page). <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">GET /api/analytics/history/:id</code> returns a single run&apos;s complete data.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── How Does X Work? ─── */}
      <h2 className="text-2xl font-semibold mb-4">How Does X Work?</h2>

      <h3 className="text-xl font-semibold mb-3">How does the pipeline decide which app to use for the access token?</h3>
      <p className="mb-6">The <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">appName</code> parameter maps to a specific database. Each Zura app (kite, fly, easyBundles, giftkart, checkoutWiz, giftLab) has its own MongoDB database with encrypted access tokens. The pipeline looks up the store&apos;s token in the corresponding app&apos;s database and decrypts it using AES-256-GCM.</p>

      <h3 className="text-xl font-semibold mb-3">How does pricing confidence get determined?</h3>
      <p className="mb-6">Pricing confidence is determined during the Auditor (Protocol A) stage based on how the anchor price was sourced. The <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">admin_api</code> source yields the highest confidence. If only <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">products_json</code> or <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">structured_html</code> sourcing methods are available, confidence may be lower. When pricing confidence is &quot;low&quot;, strategic positioning returns null growth lever and constraint &mdash; which cascades to produce less specific strategies.</p>

      <h3 className="text-xl font-semibold mb-3">How does the pipeline handle international currencies?</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Detection:</strong> The auditor uses a 5-level currency detection cascade (meta tags, HTML content patterns, Shopify data)</li>
        <li><strong>Comma-decimal formats:</strong> EUR, CHF, SEK, NOK, DKK, PLN, CZK, HUF, RON, TRY, BRL, ZAR all parse &quot;7,40&quot; as 7.40 (not 740)</li>
        <li><strong>High-denomination scales:</strong> JPY (~150x), KRW (~1300x), IDR (~15000x), VND (~25000x), HUF (~350x), CLP (~900x), INR (~80x) are handled with scaled price bands</li>
        <li><strong>Currency symbols:</strong> USD ($), EUR, GBP, AED, CAD (CA$), AUD (A$) have explicit symbol mappings</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">How does the &quot;blended&quot; anchor price work?</h3>
      <p className="mb-3">When both Protocol A and Protocol B produce an anchor price, and:</p>
      <ul className="list-disc list-inside mb-3 space-y-2">
        <li>The join rate is at least 50% (enough products matched to trust the data)</li>
        <li>The divergence is 35% or less (they&apos;re in the same ballpark)</li>
        <li>No hard override applies (no single product dominates &gt;50% of revenue)</li>
      </ul>
      <p className="mb-3">Then the final anchor = 60% x Protocol B anchor + 40% x Protocol A anchor.</p>
      <p className="mb-6">The weighting favors revenue data because it reflects actual buying behavior, while catalog prices reflect what&apos;s listed (not necessarily what sells).</p>

      <h3 className="text-xl font-semibold mb-3">How are existing bundles detected and analyzed?</h3>
      <p className="mb-3">During Protocol A, the auditor scans the product catalog for bundle indicators (keywords in titles, product types, tags). If bundles are detected with medium or high confidence, the Metrics Engine runs a &quot;bundle performance&quot; analysis that:</p>
      <ol className="list-decimal list-inside mb-3 space-y-2">
        <li>Classifies each bundle into a pillar using keyword matching</li>
        <li>Checks if bundle prices are above or below the free shipping threshold</li>
        <li>Checks if bundle prices are above or below the store AOV</li>
        <li>If Protocol B ran, matches bundles to revenue data and calculates their revenue share</li>
        <li>Identifies pillar gaps (which of the 8 pillars are not covered by existing bundles)</li>
      </ol>
      <p className="mb-6">This information is passed to the Strategy Architect, which is instructed to focus on uncovered pillars and avoid duplicating existing bundles. At least 1 of the 3 strategies must be type &quot;optimize&quot; for stores with existing bundles.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Edge Cases ─── */}
      <h2 className="text-2xl font-semibold mb-4">Edge Cases</h2>

      <h3 className="text-xl font-semibold mb-3">What happens if Protocol B gets ACCESS_DENIED?</h3>
      <p className="mb-3">This is expected for EasyBundles stores (and any app without the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> Shopify scope). The pipeline handles it gracefully:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Protocol B is caught in a try/catch and marked as non-fatal</li>
        <li>The pipeline continues with Protocol A data only</li>
        <li>Cross-validation does not run</li>
        <li>Behavioral classifier does not run (no order data)</li>
        <li>Strategies are generated from structural data only</li>
        <li>Confidence is LOW throughout</li>
        <li>Decision log records &quot;Protocol B skipped: ACCESS_DENIED&quot;</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What happens with a brand-new store that has very few orders?</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Order Count</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What Changes</th>
          </tr>
        </thead>
        <tbody>
          {orderCountRows.map(([count, changes], i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{count}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{changes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">What if the website has no free shipping threshold?</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Behavioral gap is null (cannot compute threshold minus AOV)</li>
        <li>AOV bridge opportunity is not flagged</li>
        <li>Strategic positioning adjusts: for &quot;single_anchor_attachment&quot;, the primary constraint becomes &quot;attachment_opportunity&quot; instead of &quot;cart_threshold_friction&quot;</li>
        <li>Reflection does not check bundle price vs threshold (the check auto-passes)</li>
        <li>Pain point identification skips &quot;free shipping gap&quot; and moves to the next check (inventory risk, retention, etc.)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What if the store has no products in its catalog?</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Anchor price will be null</li>
        <li>Pricing confidence will be &quot;low&quot;</li>
        <li>Strategic positioning returns null diagnosis (&quot;Insufficient data for reliable strategic positioning&quot;)</li>
        <li>Cross-validation&apos;s join rate will be 0%</li>
        <li>Strategies will use generic product references instead of actual catalog products</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What happens when the AI generates strategies with discount &gt; 30%?</h3>
      <p className="mb-6">The Reflection node catches this deterministically (hard check). It fails the strategy and produces a constraint like: &quot;Strategy 2: discount must be 30% or below. Current: 35%.&quot; The Strategy Architect retries with this constraint. If it fails 3 times total, the pipeline proceeds with the best-effort strategies.</p>

      <h3 className="text-xl font-semibold mb-3">What if all 3 strategies fail reflection?</h3>
      <p className="mb-6">After 3 attempts (initial + 2 retries), the pipeline proceeds with whatever strategies were generated on the last attempt. The decision log records &quot;Reflection FAILED after 3 attempts. Proceeding with best effort strategies.&quot;</p>

      <h3 className="text-xl font-semibold mb-3">What happens when a single product dominates revenue?</h3>
      <p className="mb-3">If one product has over 50% of total revenue:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>The anchor price is hard-overridden to that product&apos;s catalog price</li>
        <li>The archetype is likely to be &quot;single_anchor_attachment&quot; (if top1Share &gt;40% or HHI &gt;2000 triggers Rule 4)</li>
        <li>That product becomes the hero product</li>
        <li>Strategies will likely focus on attachment bundles around it</li>
      </ol>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Monitoring and Operations ─── */}
      <h2 className="text-2xl font-semibold mb-4">Monitoring and Operations</h2>

      <h3 className="text-xl font-semibold mb-3">How do I tell if a pipeline run succeeded?</h3>
      <p className="mb-3">Check the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">status</code> field in the response or database record:</p>
      <ul className="list-disc list-inside mb-3 space-y-2">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">&quot;running&quot;</code> &mdash; still in progress</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">&quot;completed&quot;</code> &mdash; all stages finished successfully</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">&quot;failed&quot;</code> &mdash; an error occurred (check the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">error</code> field)</li>
      </ul>
      <p className="mb-6">Also check <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">agentsExecuted</code> &mdash; a full successful run should list all 15 agents.</p>

      <h3 className="text-xl font-semibold mb-3">What timing data is available?</h3>
      <p className="mb-3">The <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">agentTimings</code> object shows milliseconds and token usage for each AI agent:</p>
      <ul className="list-disc list-inside mb-3 space-y-2">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">planner.durationMs</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">auditor.durationMs</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">auditor.inputTokens</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">auditor.outputTokens</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">analyst.durationMs</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">analyst.inputTokens</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">analyst.outputTokens</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">crossValidator.durationMs</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">metricsEngine.durationMs</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">classifier.durationMs</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">classifier.inputTokens</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">classifier.outputTokens</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">strategyArchitect.durationMs</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">strategyArchitect.inputTokens</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">strategyArchitect.outputTokens</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reflection.durationMs</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reflection.inputTokens</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reflection.outputTokens</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">strategyComposer.durationMs</code></li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reportCompiler.durationMs</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reportCompiler.inputTokens</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reportCompiler.outputTokens</code></li>
      </ul>
      <p className="mb-3">If reflection retried, there will be additional keys like <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">strategyArchitect_retry1</code> and <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">reflection_retry1</code>.</p>
      <p className="mb-6">Total pipeline time is in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">durationMs</code> at the top level.</p>

      <h3 className="text-xl font-semibold mb-3">How do I debug a failed run?</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>Check the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">error</code> field for the error message</li>
        <li>Check <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">agentsExecuted</code> to see how far the pipeline got before failing</li>
        <li>Check <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">decisionLog</code> for the full sequence of routing decisions</li>
        <li>Look at <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">agentTimings</code> to see if any step timed out</li>
        <li>If the server crashed, check logs (<code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PORT=3002 node server.js &gt; /tmp/baas_server.log 2&gt;&amp;1</code>)</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">Can thresholds or rules be changed without code changes?</h3>
      <p className="mb-6">No. All thresholds (50-order minimum, 35% divergence, 30% discount cap, etc.) are hardcoded constants in the respective node files. Changing them requires a code change and server restart. There is no configuration file or admin UI for threshold management.</p>

      <h3 className="text-xl font-semibold mb-3">How much does each pipeline run cost in AI tokens?</h3>
      <p className="mb-6">A typical full run uses approximately 30,000-40,000 input tokens and 10,000-15,000 output tokens across 5 AI calls (Auditor synthesis, Analyst synthesis, Industry Classifier, Strategy Architect, Reflection, Report Compiler). Token usage per call is tracked in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">agentTimings</code>.</p>

      <h3 className="text-xl font-semibold mb-3">How do I clear all history?</h3>
      <p className="mb-6"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">DELETE /api/analytics/history</code> removes all pipeline run records. <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">DELETE /api/analytics/history/:id</code> removes a single run.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── "What If...?" Scenarios ─── */}
      <h2 className="text-2xl font-semibold mb-4">&quot;What If...?&quot; Scenarios</h2>

      <h3 className="text-xl font-semibold mb-3">What if we wanted to add a new app (e.g., a new Zura product)?</h3>
      <p className="mb-6">A new entry would need to be added to the app database service with the app&apos;s MongoDB connection string and encryption key. The planner and controller would automatically support it &mdash; no pipeline logic changes needed.</p>

      <h3 className="text-xl font-semibold mb-3">What if we wanted to change the number of strategies from 3 to 5?</h3>
      <p className="mb-6">The Strategy Architect&apos;s Zod schema currently requires <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">.min(1).max(3)</code> strategies. The prompt also asks for &quot;TOP 3.&quot; Both would need to change, plus the Reflection node&apos;s pass/fail logic (which currently considers &quot;1 of 3 with issues&quot; as tolerable), and the Report Compiler&apos;s template.</p>

      <h3 className="text-xl font-semibold mb-3">What if we wanted to add a new pillar to the framework?</h3>
      <p className="mb-6">Add it to the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">BUNDLING_PILLARS</code> object in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">constants/pillars.js</code>. Then update <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ALL_PILLARS</code> in the Metrics Engine (for bundle performance pillar coverage), and update the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PILLAR_KEYWORD_MAP</code> (for classifying existing bundles). The Strategy Architect and Industry Classifier would automatically see it in their prompts.</p>

      <h3 className="text-xl font-semibold mb-3">What if the Strategy Architect consistently generates bad strategies?</h3>
      <p className="mb-3">First check the Reflection decision log to see what is failing. Common issues:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Bundle price below free shipping threshold (the AI is ignoring the threshold)</li>
        <li>Discount above 30% (the AI is too aggressive with discounts)</li>
        <li>Products referenced that don&apos;t exist in the catalog (the AI is hallucinating products)</li>
      </ul>
      <p className="mb-6">The Reflection node adds specific constraints for each failure, so the retry should address the issue. If the same issue persists across 3 attempts, it may indicate a problem with the prompt or the input data quality.</p>

      <h3 className="text-xl font-semibold mb-3">What if we wanted real-time streaming of pipeline progress?</h3>
      <p className="mb-6">Currently the pipeline saves results progressively to MongoDB after each stage. A frontend could poll the history endpoint to see partial results. True streaming (WebSocket or Server-Sent Events) would require changes to the controller&apos;s response mechanism.</p>

      </div>
    </div>
  )
}
