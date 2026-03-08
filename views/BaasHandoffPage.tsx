import { useRef, useState } from 'react'

export default function BaasHandoffPage() {
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
        <h1 className="text-3xl font-bold">BaaS Analytics Pipeline — PM Handoff</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 text-slate-500 dark:text-slate-400 italic">
        <p><strong>Audience:</strong> Product Managers, non-technical stakeholders</p>
        <p><strong>Related docs:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_FAQ.md</code> (companion), <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">ONBOARDING.md</code> (developer reference)</p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

        {/* ─── Glossary ─── */}
        <h2 className="text-2xl font-semibold mb-4">Glossary</h2>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Term</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Definition</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['AOV', 'Average Order Value — the average dollar amount a customer spends per order.'],
              ['Protocol A', 'The website scraping step. A headless browser visits the store\u2019s public website and extracts product prices, shipping thresholds, navigation structure, and widget presence. Runs for every store.'],
              ['Protocol B', 'The revenue data step. Uses the store\u2019s Shopify API access to query real sales data (orders, revenue, product performance). Only runs when the store\u2019s app has the right permissions.'],
              ['Archetype', 'A label the pipeline assigns to describe the store\u2019s pricing/product structure. Examples: "bulk_consumable" (sells consumable products in volume), "single_anchor_attachment" (one hero product plus accessories), "curated_catalog" (balanced product mix).'],
              ['Anchor Price', 'The representative product price for a store — the price point most of the store\u2019s revenue gravitates toward. Used as the economic baseline for all bundle pricing.'],
              ['Free Shipping Threshold', 'The cart total a customer must reach to get free shipping (e.g., "Free shipping on orders over $75").'],
              ['Behavioral Gap', 'The dollar gap between a store\u2019s free shipping threshold and its actual AOV. If the threshold is $75 and AOV is $55, the behavioral gap is $20.'],
              ['Cross-Validation', 'The step that compares Protocol A findings (website scraping) against Protocol B findings (revenue data) to catch mismatches and arrive at the most accurate picture.'],
              ['Hero Product', 'The single product generating the most revenue for a store.'],
              ['HHI', 'Herfindahl-Hirschman Index — a measure of revenue concentration. Low HHI (under 500) means revenue is spread across many products. High HHI (over 2000) means revenue is dominated by a few products.'],
              ['Join Rate', 'The percentage of revenue products that could be matched to catalog products during cross-validation. A low join rate (under 50%) means the data match is unreliable.'],
              ['Pillar', 'One of 8 bundling strategy types in the framework (e.g., "AOV Bridge", "Routine Builder"). Each pillar addresses a different business problem.'],
              ['Hidden Revenue Driver', 'A non-physical product (subscription, gift card, ticket, digital download) that appears in the top revenue products. These skew pricing data if not accounted for.'],
              ['Reflection', 'A quality gate that checks whether the AI-generated strategies meet hard rules (bundle price above shipping threshold, discount under 30%) before they pass through.'],
              ['Pricing Confidence', 'How reliable the pipeline considers the store\u2019s price data to be. Three levels: low, medium, high. Low confidence triggers reduced analysis.'],
              ['Grade C Products', 'The bottom tier in ABC inventory analysis — slow-moving products that tie up capital.'],
              ['Bundle Performance', 'An analysis of the store\u2019s existing bundles (if any), including whether they are priced correctly and which pillars they cover.'],
            ] as [string, string][]).map(([term, def], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold whitespace-nowrap">{term}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{def}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Quick Reference: Key Thresholds ─── */}
        <h2 className="text-2xl font-semibold mb-4">Quick Reference: Key Thresholds</h2>
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
              ['Minimum orders for behavioral analysis', '50', 'Stores with fewer than 50 orders get no behavioral profile — structural analysis only.'],
              ['Minimum orders for retention metrics', '200', 'The planner skips retention queries for stores under 200 orders.'],
              ['Anchor divergence override', '> 35%', 'If Protocol A and Protocol B anchor prices differ by more than 35%, Protocol B wins.'],
              ['Anchor divergence blend', '<= 35%', 'When both anchors exist, differ by 35% or less, and join rate is above 50%, the final price is 60% Protocol B + 40% Protocol A.'],
              ['Low join rate threshold', '< 50%', 'Below this, the pipeline keeps Protocol A anchor because the revenue match is unreliable.'],
              ['Archetype override: flat revenue', 'top1Share < 15% AND HHI < 500', 'If Protocol A said "single_anchor_attachment" but revenue is actually flat, override to "curated_catalog".'],
              ['Archetype override: concentrated revenue', 'top1Share > 40% OR HHI > 2000', 'If Protocol A said "curated_catalog" but revenue is actually concentrated, override to "single_anchor_attachment".'],
              ['Order count guard for archetype override', '< 50 orders', 'No revenue-based archetype overrides below 50 orders.'],
              ['Hero product minimum share', '5%', 'Top product needs at least 5% of total revenue to be considered the hero product.'],
              ['Maximum discount allowed', '30%', 'Reflection fails any strategy with a discount above 30%.'],
              ['Bundle price vs threshold', 'Must exceed threshold', 'Reflection fails any strategy where the bundle price is at or below the free shipping threshold.'],
              ['Maximum reflection retries', '2', 'If strategies fail the quality gate, the AI gets 2 more attempts (3 total).'],
              ['Inventory risk: high', '> 80%', 'Triggers "tail compression" secondary focus and inventory clearance projections.'],
              ['Confidence: high', '>= 500 orders AND high pricing confidence', 'Projection confidence is HIGH.'],
              ['Confidence: medium', '>= 100 orders', 'Projection confidence is MEDIUM (at minimum).'],
              ['Bundle multiple cap', '> 3.5x AOV', 'If the bundle midpoint price exceeds 3.5x the current AOV, adoption rates are dampened by 30%.'],
              ['Overlap dampener', '80%', 'When there are multiple strategies, revenue lift projections assume 80% independence between them (20% overlap).'],
              ['Hidden driver subscription threshold', '> 25% revenue share', 'Subscription/membership product with over 25% of revenue triggers "subscription_led" archetype.'],
              ['Hidden driver event threshold', '> 30% revenue share', 'Event/ticket product with over 30% of revenue triggers event-driven flagging.'],
              ['Hidden driver anchor override', '> 50% total hidden share', 'If non-physical products account for over 50% of revenue, Protocol B anchor always wins.'],
            ] as [string, string, string][]).map(([what, value, plain], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{what}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 whitespace-nowrap font-mono">{value}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{plain}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── What is the BaaS Analytics Pipeline? ─── */}
        <h2 className="text-2xl font-semibold mb-4">What is the BaaS Analytics Pipeline?</h2>
        <p className="mb-3">The BaaS Analytics Pipeline is a 15-step automated system that analyzes a Shopify store and produces actionable bundling strategies. You give it a store URL and/or store name, and it produces:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>A full website audit (navigation gaps, widget presence, shipping threshold, product catalog)</li>
          <li>A revenue data audit (if the store&apos;s app has API permissions)</li>
          <li>Cross-validated findings that reconcile website data against revenue data</li>
          <li>Three ranked bundling strategies with exact product names, prices, and discount math</li>
          <li>An executive-ready strategy report</li>
        </ol>
        <p className="mb-6">A full pipeline run takes 2-5 minutes depending on store size and data availability.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Running Examples ─── */}
        <h2 className="text-2xl font-semibold mb-4">Running Examples</h2>

        <h3 className="text-xl font-semibold mb-3">Example A: Evelyn Bobbie (full data, both protocols)</h3>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li><strong>Store type:</strong> Women&apos;s intimates brand with Kite app installed (has revenue access)</li>
          <li><strong>What happens:</strong> Both Protocol A (website scraping) and Protocol B (revenue data) run. Cross-validation compares them. The pipeline has 15 agents&apos; worth of data to work with.</li>
          <li><strong>Key numbers:</strong> Anchor price ~$44, threshold detected, ~1000+ orders — full behavioral analysis activates.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Example B: Sodii (website only, no revenue access)</h3>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li><strong>Store type:</strong> Sports nutrition brand with EasyBundles app installed (no revenue access)</li>
          <li><strong>What happens:</strong> Protocol A runs (website scraping). Protocol B attempts to query revenue data but gets ACCESS_DENIED because the EasyBundles app lacks the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> permission. Pipeline continues with Protocol A data only.</li>
          <li><strong>Key numbers:</strong> Anchor price from catalog only, no behavioral profile (no order data), confidence level is LOW, wider projection ranges.</li>
        </ul>
        <p className="mb-6">These two examples represent the two main paths through the pipeline. We will reference them throughout this document.</p>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Core Concepts ─── */}
        <h2 className="text-2xl font-semibold mb-4">Core Concepts</h2>

        <h3 className="text-xl font-semibold mb-3">The Two Protocols</h3>
        <p className="mb-3">Every pipeline run collects data from up to two sources:</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold"></th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Protocol A</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Protocol B</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['What it does', 'Visits the store\u2019s public website with a headless browser', 'Queries the store\u2019s Shopify API for real sales data'],
              ['Always runs?', 'Yes (if a URL is provided)', 'Only when the store has an access token with read_reports permission'],
              ['Data collected', 'Product prices, shipping threshold, navigation structure, PDP widgets, catalog products', 'Orders, revenue, AOV, product revenue ranking, return rates, retention metrics, co-purchase patterns'],
              ['Limitations', 'Only sees what\u2019s publicly visible; prices may not reflect actual sales behavior', 'Requires API permission; some apps (EasyBundles) don\u2019t have it'],
            ] as [string, string, string][]).map(([label, a, b], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{label}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{a}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-3"><strong>Example A (Evelyn Bobbie):</strong> Both protocols run. Protocol A scrapes the website, Protocol B queries 90 days of revenue data.</p>
        <p className="mb-6"><strong>Example B (Sodii):</strong> Protocol A runs. Protocol B fails with ACCESS_DENIED. The pipeline continues with website data only.</p>

        <h3 className="text-xl font-semibold mb-3">The 8-Pillar Bundling Framework</h3>
        <p className="mb-3">Every strategy the pipeline generates maps to one of 8 pillars:</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">#</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Pillar</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What It Solves</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['1', 'Liquidation Engine', 'Clearing slow-moving inventory', 'Stores with high Grade C stock'],
              ['2', 'AOV Bridge', 'Closing the gap to free shipping', 'Stores where AOV is below the shipping threshold'],
              ['3', 'Routine Builder', 'Building multi-product habits', 'Skincare, supplements, wellness'],
              ['4', 'Volume Driver', 'Increasing units per order', 'Consumables, basics, replenishable items'],
              ['5', 'Outfit Builder', 'Selling complete looks', 'Fashion, apparel'],
              ['6', 'Convenience Pack', 'Simplifying choice for new customers', 'Gift-heavy stores, complex catalogs'],
              ['7', 'Impulse Attach', 'Adding accessories at checkout', 'Electronics, fashion accessories'],
              ['8', 'Gifting Suite', 'Premium gift presentation', 'Holiday/occasion-driven stores'],
            ] as [string, string, string, string][]).map(([num, pillar, solves, bestFor], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{num}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{pillar}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{solves}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-xl font-semibold mb-3">Store Archetypes</h3>
        <p className="mb-3">The pipeline classifies each store into an archetype based on its pricing structure:</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Archetype</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What It Means</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Growth Strategy</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['bulk_consumable', 'Sells consumable products bought in volume', 'Volume-based bundles'],
              ['device_ecosystem', 'Sells a main product plus accessories/refills', 'Attachment-based bundles'],
              ['curated_catalog', 'Balanced product mix, no single dominant product', 'Multi-SKU curation'],
              ['single_anchor_attachment', 'One hero product drives most revenue', 'Accessory add-ons'],
              ['bundle_opportunity', 'Threshold exists but products are priced below it', 'Bridge bundles to hit threshold'],
              ['structural_mismatch', 'Threshold is set too high relative to product prices', 'Threshold rethink needed'],
              ['subscription_led', 'Subscription/membership products dominate revenue', 'Subscriber-exclusive bundles'],
            ] as [string, string, string][]).map(([archetype, meaning, strategy], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{archetype}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-xl font-semibold mb-3">Product Types</h3>
        <p className="mb-3">The pipeline classifies every product in the catalog into one of six categories:</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Type</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Examples</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Why It Matters</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['physical', 'T-shirts, supplements, electronics', 'The default; standard bundling applies'],
              ['subscription', 'Monthly box, subscription plan', 'If >25% of revenue, triggers subscription_led archetype'],
              ['digital', 'E-book, online course', 'Zero COGS; can be used as free bonuses'],
              ['ticket', 'Event ticket, parking pass, workshop', 'If >30% of revenue, triggers event-driven flagging'],
              ['membership', 'Club membership, VIP access', 'Same rules as subscription'],
              ['gift_card', 'Gift card, e-gift', 'Identified separately for upsell opportunities'],
            ] as [string, string, string][]).map(([type, examples, why], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{type}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{examples}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── The Flow ─── */}
        <h2 className="text-2xl font-semibold mb-4">The Flow</h2>

        <h3 className="text-xl font-semibold mb-3">Stage 0: Planner</h3>
        <p className="mb-3">The Planner checks what data is available and decides which stages to run.</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>If a URL is provided: Protocol A runs</li>
          <li>If a shop name + access token are available: Protocol B runs</li>
          <li>If both are available: &quot;full&quot; reasoning depth (all queries including co-purchase affinity)</li>
          <li>If order count is known and below 200: retention metrics queries are skipped</li>
          <li>If both Protocol A and B can run: they execute in sequence (Auditor first, then Analyst)</li>
        </ul>
        <p className="mb-3"><strong>Example A:</strong> Both URL and credentials available. Full depth. All 6 query types included.</p>
        <p className="mb-6"><strong>Example B:</strong> URL provided, credentials available but will fail at Protocol B. Planner plans both, but Protocol B fails gracefully.</p>

        <h3 className="text-xl font-semibold mb-3">Stage 1a: Website Auditor (Protocol A)</h3>
        <p className="mb-3">A headless browser visits the store and performs 6 operations:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Scrapes the homepage for content</li>
          <li>Detects the currency</li>
          <li>Extracts the shipping threshold (checks 6 regex patterns)</li>
          <li>Audits navigation for bundle-related terms (checks 18+ terms like &quot;bundle&quot;, &quot;kit&quot;, &quot;set&quot;)</li>
          <li>Audits the product detail page (PDP) for cross-sell widgets (checks 7 widget types)</li>
          <li>Fetches product prices from the Shopify Admin API (up to 2,500 products across 10 pages)</li>
        </ol>
        <p className="mb-3">The output includes: site overview, shipping analysis, navigation audit, PDP widget audit, price analysis (anchor price, price bands), catalog products with product IDs and handles, and a store archetype classification.</p>
        <p className="mb-3"><strong>All output is validated by a Zod schema.</strong> Any field not in the schema is silently dropped. This means new features must update the schema or their data gets lost.</p>
        <p className="mb-3"><strong>Example A:</strong> Detects $44 anchor price, finds a shipping threshold, identifies widget gaps, classifies the catalog.</p>
        <p className="mb-6"><strong>Example B:</strong> Detects pricing, threshold, catalog. No revenue data to compare against.</p>

        <h3 className="text-xl font-semibold mb-3">Stage 1b: Data Analyst (Protocol B)</h3>
        <p className="mb-3">Queries Shopify&apos;s API for real sales data over the last 90 days. Runs up to 11 queries:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Order aggregates (order count, total revenue, AOV)</li>
          <li>Currency detection</li>
          <li>Order size distribution (single-item vs multi-item orders)</li>
          <li>Product revenue ranking (which products generate the most revenue)</li>
          <li>ABC inventory classification (Grade A/B/C products)</li>
          <li>Return rates (1-item vs 3+ item orders)</li>
          <li>Retention metrics (new vs repeat customer AOV, repeat rate)</li>
          <li>Co-purchase affinity (which products are bought together)</li>
          <li>Attach rate (average items per order)</li>
          <li>Time to repeat (average days between repeat orders)</li>
        </ol>
        <p className="mb-3">There is a 3-second delay between queries to avoid Shopify rate limits, plus exponential backoff (2s, 4s, 8s) on throttling.</p>
        <p className="mb-3">After all queries, an AI (Gemini) synthesizes the raw data into a structured analysis.</p>
        <p className="mb-3"><strong>Example A:</strong> All queries run successfully. Returns 500+ orders, full ABC analysis, affinity data.</p>
        <p className="mb-6"><strong>Example B:</strong> Protocol B fails immediately with ACCESS_DENIED. Pipeline continues without revenue data.</p>

        <h3 className="text-xl font-semibold mb-3">Stage 1c: Cross-Validator</h3>
        <p className="mb-3"><strong>Only runs when Protocol B succeeded.</strong> Compares Protocol A and Protocol B findings using 4 deterministic algorithms (no AI):</p>

        <h4 className="text-lg font-semibold mb-3">Algorithm 1 — Anchor Price Reconciliation:</h4>
        <p className="mb-3">The pipeline has two anchor prices: one from scraping (Protocol A) and one from revenue data (Protocol B). The cross-validator decides which to trust:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Match revenue products to catalog products by title (exact match first, then fuzzy match)</li>
          <li>Calculate a revenue-weighted anchor: walk down the product list (by revenue), stop at the product where cumulative revenue hits 50%, and use that product&apos;s catalog price</li>
          <li>Check for hard overrides: if a single product has over 50% of all revenue, its catalog price becomes the anchor</li>
          <li>Reconciliation logic (checked in this exact order):
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>If Protocol A anchor is null: use Protocol B anchor</li>
              <li>If Protocol B anchor is null: keep Protocol A anchor</li>
              <li>If there is a hard override (single dominant product): use Protocol B anchor</li>
              <li>If join rate is below 50%: keep Protocol A anchor (unreliable match)</li>
              <li>If divergence exceeds 35%: use Protocol B anchor</li>
              <li>Otherwise: blend 60% Protocol B + 40% Protocol A</li>
            </ul>
          </li>
        </ol>

        <h4 className="text-lg font-semibold mb-3">Algorithm 2 — Archetype Override:</h4>
        <p className="mb-3">Revenue data can override the archetype assigned by Protocol A. Rules checked in order:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Subscription/membership product with &gt;25% revenue share: override to &quot;subscription_led&quot;</li>
          <li>Event/ticket product with &gt;30% revenue share: flag as event-driven</li>
          <li>Protocol A said &quot;single_anchor_attachment&quot; but revenue is flat (top1Share &lt;15%, HHI &lt;500): override to &quot;curated_catalog&quot;</li>
          <li>Protocol A said &quot;curated_catalog&quot; but revenue is concentrated (top1Share &gt;40% OR HHI &gt;2000): override to &quot;single_anchor_attachment&quot;</li>
          <li>No rule matches: keep Protocol A archetype</li>
        </ol>
        <p className="mb-6"><strong>Guard:</strong> If the store has fewer than 50 orders, ALL archetype overrides are skipped.</p>

        <h4 className="text-lg font-semibold mb-3">Algorithm 3 — Hidden Revenue Driver Detection:</h4>
        <p className="mb-6">Scans the top 10 revenue products. Any product with 10% or more revenue share that is classified as non-physical (subscription, ticket, digital, membership, gift card) is flagged as a hidden revenue driver.</p>

        <h4 className="text-lg font-semibold mb-3">Algorithm 4 — Hero Product Injection:</h4>
        <p className="mb-6">Identifies the top revenue product and matches it to the catalog for its product ID and handle. The hero product must have at least 5% revenue share to qualify.</p>

        <p className="mb-3"><strong>Example A:</strong> Cross-validator runs. Anchor prices from both protocols are compared. Perhaps Protocol A said $44 and Protocol B said $44 — they blend to $44 (no divergence). Hero product identified.</p>
        <p className="mb-6"><strong>Example B:</strong> Cross-validator does not run (Protocol B failed).</p>

        <h3 className="text-xl font-semibold mb-3">Stage 2: Metrics Engine</h3>
        <p className="mb-3">Deterministic math — no AI. Computes:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li><strong>Behavioral gap:</strong> Free shipping threshold minus AOV</li>
          <li><strong>Entry price gap:</strong> Free shipping threshold minus anchor price</li>
          <li><strong>Inventory risk score:</strong> (Grade C product count / total products) x 100 x 1.5, capped at 100</li>
          <li><strong>Retention risk score:</strong> Combines repeat rate penalty and AOV gap penalty (0-100 scale)</li>
          <li><strong>Revenue concentration index:</strong> HHI on top 10 products (0-10000 scale)</li>
          <li><strong>Potential bundle uplift:</strong> Starts at 15% of AOV, adds 5% for each of: behavioral gap exists, inventory risk &gt;30, strong product affinities. Capped at 30% of AOV.</li>
          <li><strong>Bundle performance</strong> (if existing bundles detected): Classifies existing bundles by pillar, compares bundle prices to threshold and AOV, measures revenue share</li>
        </ul>

        <p className="mb-3"><strong>Pain point priority</strong> (checked in this exact order):</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Free shipping gap (AOV below threshold)</li>
          <li>High inventory risk (risk score &gt; 25)</li>
          <li>Retention problem (repeat rate &lt; 20% or risk score &gt; 50)</li>
          <li>AOV bridge opportunity (close to threshold)</li>
          <li>No critical pain point (fallback)</li>
        </ol>

        <p className="mb-3"><strong>Example A:</strong> With full revenue data, calculates real AOV, behavioral gap, inventory risk, bundle uplift. Pain point identified.</p>
        <p className="mb-6"><strong>Example B:</strong> Without revenue data, many metrics are null. Pain point defaults to generic.</p>

        <h3 className="text-xl font-semibold mb-3">Stage 2b: Behavioral Classifier + Strategic Positioning + Execution Blueprint + Impact Simulation</h3>
        <p className="mb-3">These four agents run in sequence after the Metrics Engine:</p>

        <p className="mb-3"><strong>Behavioral Classifier</strong> (requires Protocol B, minimum 50 orders):</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>AOV tier: low (&lt;1.5x anchor), mid (1.5-3x), high (&gt;3x)</li>
          <li>Repeat gap: declining, growing, or stable</li>
          <li>Basket behavior: single_item_heavy (&gt;60% single-item orders) or multi_item_heavy</li>
          <li>Revenue concentration: top_heavy (top 20% of SKUs make &gt;70% revenue), long_tail (bottom 50% make &lt;10%), or balanced</li>
        </ul>

        <p className="mb-3"><strong>Strategic Positioning:</strong></p>
        <p className="mb-6">Maps archetype + behavioral profile to a growth lever and primary constraint. Each archetype has specific rules — for example, &quot;bulk_consumable&quot; with a declining repeat gap gets a &quot;retention&quot; growth lever instead of the default &quot;volume&quot; lever.</p>

        <p className="mb-3"><strong>Execution Blueprint:</strong></p>
        <p className="mb-6">Translates the growth lever into specific bundle formats, price target ranges, placement priorities, and KPIs to track. For example, &quot;single_anchor_attachment&quot; gets: accessory_add_on + threshold_unlock_bundle formats, placed on cart and PDP pages.</p>

        <p className="mb-3"><strong>Impact Simulation:</strong></p>
        <p className="mb-3">Computes per-strategy adoption rates, revenue lift ranges, and margin impact. Each bundle format has a base adoption range (e.g., multi_pack: 12-22%), which gets adjusted by:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Archetype affinity (15% boost if the format matches the archetype)</li>
          <li>Basket behavior (10% boost for multi-item, 10% reduction for single-item)</li>
          <li>Threshold proximity (10% boost if AOV is within 85% of threshold)</li>
          <li>Healthy store suppression (caps at 12-15% for stores already growing with large baskets)</li>
          <li>Bundle multiple cap (30% dampening if bundle price &gt; 3.5x AOV)</li>
        </ul>

        <p className="mb-3">Revenue lift = cohort size x price delta x adoption rate. Multiple strategies are dampened by 20% to account for overlap.</p>

        <p className="mb-3"><strong>Example A:</strong> Full behavioral profile computed. Strategic positioning identifies specific growth lever. Impact simulation produces per-strategy revenue lift projections with medium or high confidence.</p>
        <p className="mb-6"><strong>Example B:</strong> No behavioral profile (insufficient data). Strategic positioning falls back to structural-only mode. Impact simulation produces projections with low confidence and wider ranges.</p>

        <h3 className="text-xl font-semibold mb-3">Stage 3: Industry Classifier</h3>
        <p className="mb-3">Hybrid: deterministic keyword matching + AI refinement (Gemini). Classifies the store into one of 7 verticals:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>Fashion and Apparel</li>
          <li>Supplements and Beauty</li>
          <li>Home and Electronics</li>
          <li>Consumables (Food/Bev)</li>
          <li>Pet Supplies</li>
          <li>Sports and Outdoor</li>
          <li>General E-commerce (fallback)</li>
        </ol>
        <p className="mb-3">The deterministic pre-score counts keyword matches from 6 industry keyword lists (20-30 keywords each). If the top match scores 5+ keywords: high confidence. 2-4: medium. Below 2: low. The AI then refines, but cannot override a clear deterministic match.</p>
        <p className="mb-6">Each industry maps to recommended pillars and pillars to avoid. For example, Fashion gets outfitBuilder, conveniencePack, giftingSuite — and should avoid routineBuilder.</p>

        <h3 className="text-xl font-semibold mb-3">Stages 4-5: Strategy Architect + Reflection Loop</h3>

        <p className="mb-3"><strong>Strategy Architect</strong> (AI — Gemini):</p>
        <p className="mb-3">Generates exactly 3 bundling strategies with:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Pillar selection (from the 8-pillar framework)</li>
          <li>Bundle name and concept</li>
          <li>Exact offer mathematics (products, individual prices, combined retail, bundle price, discount percentage)</li>
          <li>Psychological trigger explanation</li>
          <li>Execution tool recommendation (Fly Bundles or Bundle Builder)</li>
          <li>Expected impact (AOV lift percentage, target metric)</li>
          <li>Strategy type: &quot;new&quot; or &quot;optimize&quot; (if the store has existing bundles, at least 1 must be &quot;optimize&quot;)</li>
        </ul>

        <p className="mb-6"><strong>Products used in strategies come from the actual catalog</strong> — the pipeline provides up to 20 real products with their actual prices. Post-generation, each product in the strategy is enriched with its product handle and product ID from the catalog.</p>

        <p className="mb-3"><strong>Reflection</strong> (Quality Gate):</p>
        <p className="mb-3">Two types of checks:</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Check Type</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What It Checks</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What Happens on Failure</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['Hard (deterministic)', 'Bundle price must exceed free shipping threshold', 'Strategy fails — triggers retry'],
              ['Hard (deterministic)', 'Discount must be 30% or below', 'Strategy fails — triggers retry'],
              ['Soft (AI-advised)', 'Does the bundle improve AOV?', 'Warning logged, does not block'],
              ['Soft (AI-advised)', 'Does it address the top pain point?', 'Warning logged, does not block'],
            ] as [string, string, string][]).map(([type, checks, result], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{type}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{checks}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{result}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-3">Pass/fail logic:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Zero hard failures: PASS (soft warnings are logged but don&apos;t block)</li>
          <li>1 strategy with 1-2 hard issues, other 2 are clean: PASS (minor issue in 1 of 3 is tolerable)</li>
          <li>Multiple strategies with hard issues: FAIL — retry with constraints</li>
        </ul>

        <p className="mb-3">If reflection fails, the Strategy Architect runs again with specific constraints from the failure. Maximum 2 retries (3 total attempts). After 3 failures, the pipeline proceeds with the best-effort strategies.</p>
        <p className="mb-6"><strong>For stores with existing bundles:</strong> Reflection also checks that at least 1 of 3 strategies has type &quot;optimize&quot;. If all are &quot;new&quot; despite existing bundles, this is flagged as an issue.</p>

        <h3 className="text-xl font-semibold mb-3">Stage 5b: Strategy Composer + Sales Summary Composer</h3>

        <p className="mb-3"><strong>Strategy Composer</strong> (deterministic):</p>
        <p className="mb-3">Produces a structured Markdown strategy report with sections ordered by a &quot;lens&quot; — the lens is chosen based on data quality:</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Lens</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">When It&apos;s Selected</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Section Order</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['capital_efficiency', 'High inventory risk + top-heavy revenue', 'Executive, Structural, Behavioral, Impact, Guardrails, Roadmap'],
              ['economic_opportunity', 'AOV lift potential >= 15%', 'Executive, Structural, Impact, Guardrails, Roadmap'],
              ['diagnostic', 'Primary constraint involves "friction"', 'Structural, Impact, Behavioral, Strategy, Guardrails, Roadmap'],
              ['archetype', 'No behavioral data available', 'Executive, Structural, Strategy, Guardrails, Roadmap'],
            ] as [string, string, string][]).map(([lens, when, order], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{lens}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{when}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{order}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6">The report includes a 90-day roadmap split into 3 phases (Launch, Expand, Optimize) with specific actions and KPI targets for each phase.</p>

        <p className="mb-3"><strong>Sales Summary Composer</strong> (deterministic):</p>
        <p className="mb-3">Produces a 1-page executive revenue summary designed for founders/decision-makers. Includes:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Headline revenue opportunity (with confidence label)</li>
          <li>Urgency statement (why act now)</li>
          <li>Root causes (up to 3, derived from behavioral signals)</li>
          <li>Priority move (the single highest-impact strategy)</li>
          <li>90-day impact projection (revenue, AOV lift, inventory impact)</li>
          <li>Credibility section (orders analyzed, revenue analyzed, confidence level)</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Stage 6: Report Compiler</h3>
        <p className="mb-3">The final AI step (Gemini). Takes all previous outputs and produces a professional executive-ready strategy document in Markdown. Structured as:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li><strong>Executive Thesis</strong> — 3 sentences: gap, impact, imperative</li>
          <li><strong>The Data Truth</strong> — Protocol A findings + Protocol B findings (if available)</li>
          <li><strong>Strategic Recommendations</strong> — 3 strategies with full offer mathematics tables</li>
          <li><strong>Financial Impact</strong> — Projected AOV lift, revenue opportunity, 90-day roadmap</li>
        </ol>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Outputs ─── */}
        <h2 className="text-2xl font-semibold mb-4">Outputs</h2>
        <p className="mb-3">The pipeline produces these key outputs (all stored in a single MongoDB document per run):</p>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Output</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['auditorResults', 'Website audit findings (site overview, shipping analysis, navigation audit, PDP widgets, price analysis, catalog products)'],
              ['analystResults', 'Revenue data analysis (orders, AOV, ABC grades, retention, affinities) — null if Protocol B failed'],
              ['crossValidation', 'Protocol A vs B reconciliation (anchor price, archetype, hero product, mismatches) — null if Protocol B didn\u2019t run'],
              ['metricsResult', 'Computed KPIs (AOV, behavioral gap, inventory risk, opportunities, pain points)'],
              ['behavioralProfile', 'Store behavior classification (AOV tier, repeat gap, basket behavior, revenue concentration) — null if under 50 orders'],
              ['strategicDiagnosis', 'Growth lever and primary constraint'],
              ['executionBlueprint', 'Bundle formats, price targets, placement priorities, KPIs to track'],
              ['impactProjection', 'Per-strategy adoption rates, revenue lift ranges, margin impact'],
              ['classifierResults', 'Industry vertical and recommended pillars'],
              ['strategyResults', '3 bundling strategies with offer mathematics, product names, prices, handles, and product IDs'],
              ['strategyReport', 'Structured Markdown strategy report with 90-day roadmap'],
              ['salesSummary', '1-page executive revenue summary'],
              ['reportResults', 'Professional Markdown executive report'],
              ['bundleIntelligence', 'Existing bundle detection, pillar coverage, revenue share'],
            ] as [string, string][]).map(([output, desc], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{output}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── What the User Sees ─── */}
        <h2 className="text-2xl font-semibold mb-4">What the User Sees</h2>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>User submits a store URL, shop name, and app name through the API</li>
          <li>Pipeline creates a &quot;running&quot; record in the database</li>
          <li>Results are saved progressively — if stage 6 fails, stages 0-5 results are already preserved</li>
          <li>Pipeline returns a JSON response with all outputs, timing data, and a decision log explaining every routing decision made</li>
        </ol>

        <p className="mb-3">The decision log is a plain-English audit trail. Example entries:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>&quot;RUN Auditor: url provided (https://evelynbobbie.com)&quot;</li>
          <li>&quot;RUN Analyst: shopName (evelyn-bobbie.myshopify.com) + accessToken available&quot;</li>
          <li>&quot;Cross-Validator: anchor blended, archetype override=false, hidden drivers=false&quot;</li>
          <li>&quot;Behavioral Classifier: aovTier=mid, repeatGap=growing, basket=multi_item_heavy&quot;</li>
          <li>&quot;Reflection PASSED on attempt 1.&quot;</li>
        </ul>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Limitations ─── */}
        <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li><strong>Protocol B requires specific app permissions.</strong> EasyBundles stores will always fall back to Protocol A only, because the EasyBundles app does not have the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> scope needed for ShopifyQL queries.</li>
          <li><strong>Product catalog is capped at 2,500 products.</strong> The Admin API pagination fetches up to 10 pages of 250 products each. Stores with larger catalogs will have an incomplete catalog view.</li>
          <li><strong>Revenue data covers 90 days only.</strong> All ShopifyQL queries use a 90-day window. Seasonal businesses may show skewed results.</li>
          <li><strong>Strategies are AI-generated.</strong> While the Reflection quality gate catches pricing and discount issues, the AI may still produce strategies that don&apos;t perfectly fit the store&apos;s brand positioning. Human review is recommended before implementation.</li>
          <li><strong>No real-time data.</strong> The pipeline uses a snapshot of the store at analysis time. Prices, products, and thresholds may change after the analysis.</li>
          <li><strong>Currency handling varies.</strong> The pipeline supports multiple currencies and handles comma-decimal formats (EUR, CHF, SEK, etc.) and high-denomination scales (JPY, KRW, IDR, etc.), but edge cases may exist for unusual currency formats.</li>
          <li><strong>Cross-validation depends on product title matching.</strong> The join between revenue products and catalog products uses title matching (exact then fuzzy). Products with very different names in Shopify admin vs the storefront may not match.</li>
          <li><strong>Bundle detection is keyword-based.</strong> Existing bundles are identified by title keywords (mystery, routine, volume, etc.). Bundles with non-standard naming may be misclassified or missed.</li>
        </ol>

      </div>
    </div>
  )
}
