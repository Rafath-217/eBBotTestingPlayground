import { useRef, useState } from 'react'

export default function BundleSetupPipelinePage() {
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
        <h1 className="text-3xl font-bold">Bundle Setup LLM Pipeline -- PM Handoff</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400 italic">Updated: 2026-03-18</p>
      <p className="mb-3"><strong>Audience:</strong> Product managers, non-technical stakeholders</p>
      <p className="mb-3"><strong>Related docs:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_FAQ_PIPELINE.md</code> (companion Q&amp;A), <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">README.md</code> (engineering reference)</p>
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
            ['Merchant text', 'The free-form description a merchant types to describe what kind of bundle they want (e.g., \u201cBuy 3 get 10% off\u201d or \u201cPick 10 meals then 5 drinks\u201d).'],
            ['Bundle', 'A grouped product offering on a Shopify store where customers select items and receive a discount.'],
            ['Step', 'A selection screen the customer sees. A single-step bundle has one screen; a multi-step bundle has two or more screens in sequence (e.g., \u201cPick meals\u201d then \u201cPick drinks\u201d).'],
            ['Category', 'A group of products within a step, usually corresponding to a Shopify collection or product type (e.g., \u201cNike Shoes\u201d or \u201cHoodies\u201d).'],
            ['Collection', 'A Shopify-native grouping of products, created by the merchant (e.g., \u201cSummer Sale\u201d, \u201cDark Chocolate\u201d).'],
            ['Product type', 'A label assigned to products in Shopify (e.g., \u201cHoodie\u201d, \u201cCookie\u201d). Used to auto-group products when collections are not provided.'],
            ['Discount mode', 'How the discount is calculated. See the \u201cDiscount Modes\u201d table below.'],
            ['Discount tier', 'A specific rule within a discount (e.g., \u201cBuy 3 items, get 10% off\u201d is one tier). A bundle can have multiple tiers.'],
            ['Condition / Rule', 'A quantity constraint on a step or category (e.g., \u201ccustomer must select at least 3 items\u201d or \u201ccustomer must select exactly 5\u201d).'],
            ['BXGY', '\u201cBuy X, Get Y\u201d -- a discount pattern where purchasing a certain number of items earns free or discounted additional items. Displayed as \u201cBOGO\u201d on the storefront.'],
            ['Bridging', 'When the system derives quantity rules from discount tiers because the merchant did not state explicit quantity requirements.'],
            ['Safe default', 'The fallback configuration used when an AI layer fails or returns no usable data. Ensures the system always produces a valid bundle.'],
            ['Pipeline', 'The end-to-end process that converts merchant text into a bundle configuration using three AI layers plus deterministic assembly.'],
            ['Decision trace', 'An audit log produced by every pipeline run, recording what decision was made at each stage and why.'],
            ['Fullpage bundle', 'A bundle that has its own dedicated page on the store.'],
            ['PDP bundle', 'A bundle embedded on an existing product detail page.'],
            ['Hint', 'A keyword or label returned by the Structure AI that helps the system match collections or products to the correct step. Collection hints use case-insensitive substring matching (e.g., hint \u201cmeal\u201d matches \u201cHot Meals\u201d). Product type hints use exact string matching.'],
            ['Product group hint', 'A more specific hint where the AI groups individual product titles under named categories, used when product types are unreliable. Product title matching is case-insensitive exact (e.g., \u201cBlue Hoodie\u201d matches \u201cblue hoodie\u201d but not \u201cBlue Hoodie XL\u201d). Maximum 10 groups per AI response. Hallucinated titles (titles that don\u2019t exist in the store) are silently filtered out.'],
            ['Hint discard', 'When the AI invents product titles that do not exist in the store\u2019s actual inventory, those titles are removed. The discarded titles are logged in the decision trace.'],
            ['Spam hint rejection', 'When the AI creates one group per product (e.g., 10 products into 10 groups of 1), the system rejects all hints and falls back to a single category. This fires when more than half the groups have 1 or fewer products AND total products exceed 5.'],
            ['Product type quality gate', 'A pre-AI filter that evaluates whether the store\u2019s product type data is reliable enough to send to the AI. If types are absent, uniform, or sparse (below 100% coverage), the AI only sees product titles instead.'],
            ['Collection enrichment', 'An optional pre-processing step that fetches actual products from Shopify collections before the AI runs. Gives the AI visibility into what products are inside each collection -- their types, titles, and prices.'],
            ['Collection splitting', 'When enrichment reveals that a single collection contains multiple distinct product groups, the system breaks it into separate categories (e.g., a \u201cSignature Set\u201d collection becomes \u201cCaps\u201d, \u201cLong Sleeves\u201d, \u201cBody Warmers\u201d).'],
            ['Category merger', 'A post-assembly cleanup that consolidates sparse AI-inferred categories into one when they create too many small UI sections. Only affects categories the AI inferred from product titles -- never touches categories from collections or product types.'],
            ['Pattern tag', 'A classification label automatically assigned to each pipeline run for filtering in the database (e.g., \u201cdiscount:bxgy\u201d, \u201cstructure:multi_step\u201d). See the Pattern Tags section below.'],
            ['Decision summary', 'A human-readable text block combining the AI\u2019s reasoning with the assembly layer\u2019s decisions for each stage. Included in every pipeline response.'],
            ['Price context', 'Product price information sent to the Discount AI to help it distinguish between per-item prices and total bundle prices (e.g., knowing products cost around $14 each helps the AI interpret \u201c$14\u201d correctly).'],
          ] as [string, string][]).map(([term, def], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{term}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{def}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Quick Reference ─── */}
      <h2 className="text-2xl font-semibold mb-4">Quick Reference</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Setting</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Plain English</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['AI model', 'Gemini 2.0 Flash', 'All three AI layers use the same Google model'],
            ['AI temperature', '0.0', 'Deterministic -- same input always gives the same output'],
            ['AI sampling parameters', 'topK=1, topP=0.1', 'Additional determinism controls; combined with temp 0.0, the output is maximally stable'],
            ['Max output tokens', '2048 (Structure, Discount), 1024 (Rules)', 'Maximum length of each AI response'],
            ['Response format', 'JSON only', 'All AI layers request structured JSON output (no free text)'],
            ['Max retries on rate limit', '2', 'Up to 3 total attempts per AI call (1 initial + 2 retries). Only rate-limit errors (HTTP 429) are retried. Timeouts are NOT retried -- they fail immediately.'],
            ['Retry delays', '1 second, then 2 seconds', 'Wait time between retry attempts'],
            ['Timeout per AI call', '30 seconds', 'After 30 seconds, the call is abandoned and NOT retried'],
            ['Default discount tiers (fallback)', 'Buy 2 = 5% off, Buy 3 = 10% off, Buy 4 = 15% off', 'Used when the Discount AI returns nothing usable'],
            ['Minimum quantity (single-step)', '2', 'If no quantity info exists at all, the system requires at least 2 items'],
            ['Minimum quantity (multi-step)', '1 per step', 'Each step requires at least 1 item'],
            ['Discount code prefix', '\u201cEasyBundle\u201d', 'All discount codes start with this prefix'],
            ['Max collections shown to AI', '30', 'If a merchant has more than 30 collections, only the first 30 are sent to the AI'],
            ['Max product types shown to AI', '20', 'Only the first 20 unique product types are sent'],
            ['Max product titles shown to AI', '30', 'Only the first 30 product titles are sent'],
            ['Max product group hints', '10', 'The AI can return at most 10 custom product groupings'],
            ['Max products fetched per collection (enrichment)', '30', 'Collections with more than 30 products are not enriched'],
            ['Spam hint threshold', '>5 products, >50% single-product groups', 'When exceeded, all product group hints are rejected'],
            ['Category merger threshold', 'Average 2 or fewer products per category, 3+ categories', 'Sparse AI-inferred categories get consolidated into one'],
            ['Valid discount modes', 'Percentage, Fixed, Fixed Bundle Price, BXGY', 'The four discount models the system supports'],
            ['Valid condition types', 'At least X, At most X, Exactly X', 'The three ways to constrain how many items a customer selects'],
          ] as [string, string, string][]).map(([setting, value, plain], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{setting}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{plain}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What Is the Bundle Setup LLM Pipeline? ─── */}
      <h2 className="text-2xl font-semibold mb-4">What Is the Bundle Setup LLM Pipeline?</h2>
      <p className="mb-6">The pipeline is an automated system that converts a merchant&apos;s plain-English description of a bundle into a fully structured bundle configuration ready for the Easy Bundle Builder storefront. The merchant types something like &quot;Buy 3 get 10% off, Buy 5 get 20% off&quot; along with their product collections, and the pipeline returns a complete bundle with steps, categories, discount rules, and quantity constraints -- typically within a few seconds. If any part of the AI fails, the system falls back to safe defaults so that a valid bundle is always produced.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Running Examples ─── */}
      <h2 className="text-2xl font-semibold mb-4">Running Examples</h2>
      <p className="mb-6">Throughout this document, we use three examples that exercise different paths through the system:</p>

      <h3 className="text-xl font-semibold mb-3">Example A: &quot;Simple Tiered Discount&quot;</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Merchant text:</strong> &quot;Buy 3 get 10% off, Buy 5 get 20% off&quot;</li>
        <li><strong>Collections provided:</strong> Summer Sale, Winter Collection</li>
        <li><strong>Products provided:</strong> none</li>
      </ul>
      <p className="mb-6">This example follows the most common path: single-step, percentage discount, rules bridged from discount tiers.</p>

      <h3 className="text-xl font-semibold mb-3">Example B: &quot;Multi-Step Meal Bundle&quot;</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Merchant text:</strong> &quot;First pick 10 meals, then pick 5 drinks. 15% off the whole bundle.&quot;</li>
        <li><strong>Collections provided:</strong> Hot Meals, Cold Meals, Soft Drinks, Smoothies</li>
        <li><strong>Products provided:</strong> none</li>
      </ul>
      <p className="mb-6">This example follows the multi-step path with hint-based distribution and explicit per-step quantities.</p>

      <h3 className="text-xl font-semibold mb-3">Example C: &quot;Buy X Get Y Free&quot;</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Merchant text:</strong> &quot;Buy 2 get 1 free&quot;</li>
        <li><strong>Collections provided:</strong> All Socks</li>
        <li><strong>Products provided:</strong> none</li>
      </ul>
      <p className="mb-6">This example follows the BXGY path where the Rules AI is skipped entirely and rules are determined by the assembly layer.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Core Concepts ─── */}
      <h2 className="text-2xl font-semibold mb-4">Core Concepts</h2>

      <h3 className="text-xl font-semibold mb-3">Bundle Structure Types</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">When used</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Customer experience</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">Single-step</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">The merchant describes one pool of products (most common)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Customer sees one selection screen with all products/categories</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">Multi-step</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">The merchant describes sequential selection from different groups (e.g., &quot;first meals, then drinks&quot;)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Customer moves through 2+ screens in order</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Discount Modes</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Mode</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Trigger in merchant text</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">How it works</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Percentage', '\u201cX% off\u201d, \u201csave X%\u201d', 'Customer gets a percentage discount based on quantity or spend', '\u201cBuy 3 get 10% off\u201d'],
            ['Fixed', '\u201c$X off\u201d, \u201csave $X\u201d', 'Customer gets a fixed dollar amount off', '\u201c2 for $5 off\u201d'],
            ['Fixed Bundle Price', '\u201cX items for $Y\u201d, \u201c$Y total\u201d', 'The entire bundle costs a fixed amount regardless of item prices', '\u201c5 items for $99\u201d'],
            ['BXGY', '\u201cBuy X get Y free\u201d, \u201cBOGO\u201d, \u201c3 for 2\u201d', 'Customer buys X items and gets Y items free (or at a discount)', '\u201cBuy 2 get 1 free\u201d'],
          ] as [string, string, string, string][]).map(([mode, trigger, how, example], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{mode}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{trigger}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{how}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{example}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Condition Types</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Condition</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">When used</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">At least X (greaterThanOrEqualTo)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Customer must select X or more items</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Default for percentage and fixed discounts</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">At most X (lessThanOrEqualTo)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Customer cannot select more than X items</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Used when merchant says &quot;up to X&quot; or &quot;X-Y range&quot;</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">Exactly X (equalTo)</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Customer must select exactly X items</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Used for fixed bundle price, or when merchant says &quot;exactly X&quot;</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Category Sources</h3>
      <p className="mb-3">Every category in the final output is tagged with where it came from. This determines how it behaves in cleanup and merger steps.</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Source</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Can be merged?</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Can be removed?</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['collection', 'Based on a merchant-selected Shopify collection', 'No', 'Only if empty'],
            ['productType', 'Grouped by Shopify product type field', 'No', 'Only if empty'],
            ['productGroupHint', 'Created from AI-inferred product title groups', 'Yes (if sparse)', 'Only if empty'],
            ['collectionSplit', 'Created by splitting a collection into sub-categories using enrichment data', 'No', 'Only if empty'],
            ['fallback', 'Placeholder when no inventory exists', 'Yes (if sparse)', 'Only if empty'],
          ] as [string, string, string, string][]).map(([source, meaning, merged, removed], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{source}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{merged}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{removed}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── The Flow ─── */}
      <h2 className="text-2xl font-semibold mb-4">The Flow</h2>
      <p className="mb-6">The pipeline processes a bundle in four phases, running in under a few seconds:</p>

      <h3 className="text-xl font-semibold mb-3">Phase 0: Pre-Processing (Collection Enrichment)</h3>
      <p className="mb-3">Before any AI calls, the system optionally enriches collection data. This only happens when:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>A Shopify connection is available (the request came through the app, not a direct API call)</li>
        <li>The merchant selected at least one collection</li>
        <li>Each collection has 30 or fewer products (larger collections are skipped)</li>
      </ol>
      <p className="mb-6">For each eligible collection, the system fetches the actual products from Shopify -- their titles, product types, prices, and variant details. This gives the AI visibility into what is inside each collection, rather than just seeing the collection name.</p>
      <p className="mb-3">The enriched product data is used in two ways:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Structure AI</strong> receives the product types and titles from inside collections, enabling it to suggest how to split or group products</li>
        <li><strong>Discount AI</strong> receives price context (price range across all products), helping it disambiguate phrases like &quot;$14 per item&quot; vs &quot;$14 total&quot;</li>
      </ul>
      <p className="mb-6">Importantly, the enriched data is only used for AI context and category splitting. The final bundle still references the original merchant-selected collections and products.</p>

      <h3 className="text-xl font-semibold mb-3">Phase 1: Parallel AI Extraction (Structure + Discount)</h3>
      <p className="mb-6">Two AI calls happen simultaneously because they are independent of each other.</p>

      <p className="mb-3"><strong>Structure AI</strong> reads the merchant text (plus collection/product inventory if available) and decides:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>Is this a single-step or multi-step bundle?</li>
        <li>If multi-step, what are the step labels?</li>
        <li>What keywords (&quot;hints&quot;) connect collections and product types to each step?</li>
      </ol>

      <p className="mb-3">Before the Structure AI runs, product type data goes through a <strong>quality gate</strong>. The system evaluates whether product types are reliable:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Product type quality</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What happens</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">100% of products have types, 2+ distinct types</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Types sent to AI (clean signal)</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Less than 100% coverage, or only 1 distinct type</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Types stripped; AI only sees product titles</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No products at all</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No inventory context sent</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-6">This prevents the AI from making bad grouping decisions based on unreliable type data.</p>

      <p className="mb-3">After the AI responds, two post-processing steps run:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Hallucination filtering:</strong> Any product titles the AI suggested that do not actually exist in the store are silently removed</li>
        <li><strong>Spam detection:</strong> If the AI created one group per product (e.g., 10 products in 10 groups of 1 each) and there are more than 5 total products, all hints are rejected</li>
      </ol>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Scenario</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Structure AI output</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['\u201cBuy 3 get 10% off\u201d', 'Single-step (no sequential flow described)'],
            ['\u201cFirst pick meals, then drinks\u201d', 'Multi-step with 2 steps, collection hints like \u201cmeals\u201d and \u201cdrinks\u201d'],
            ['\u201cCreate a multistep bundle\u201d (with 3 tea collections + 2 cookie collections)', 'Multi-step, AI creates steps from inventory: \u201cChoose Tea\u201d and \u201cChoose Cookies\u201d'],
            ['\u201cBuy 2 get 1 free\u201d', 'Single-step (BXGY does not imply multi-step unless different categories are named)'],
            ['AI call fails or times out', 'Defaults to single-step with empty steps'],
          ] as [string, string][]).map(([scenario, output], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{scenario}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{output}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6"><strong>Example A</strong> goes through here: the Structure AI sees &quot;Buy 3 get 10% off, Buy 5 get 20% off&quot; -- no sequential flow -- and returns single-step.</p>
      <p className="mb-6"><strong>Example B</strong> goes through here: the Structure AI detects &quot;First pick... then pick...&quot; and returns multi-step with hints like &quot;meals&quot; for hot meals/cold meals collections, &quot;drinks&quot; for soft drinks/smoothies.</p>

      <p className="mb-3"><strong>Discount AI</strong> reads the merchant text and extracts discount information using a strict priority chain:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Safety check:</strong> Is this a &quot;free gift&quot; with no purchase requirement? If yes, return nothing (the system does not support free gifts).</li>
        <li><strong>BXGY detection:</strong> Does the text describe a &quot;buy X get Y&quot; pattern? If yes, extract as BXGY mode with buy quantity, get quantity, and discount percentage.</li>
        <li><strong>Explicit extraction:</strong> Extract the discount mode and tiers from explicit numbers in the text.</li>
        <li><strong>Unspecified handling:</strong> If the text implies a discount but does not state the amount (e.g., &quot;Buy 2 and save&quot;), extract the quantity with the discount value marked as &quot;unspecified&quot; -- the assembly layer will fill in defaults.</li>
      </ol>

      <p className="mb-6">If products are available (either merchant-selected or from collection enrichment), the Discount AI also receives price context showing the number of products and their price range. This helps the AI distinguish between &quot;this number is a per-item price&quot; and &quot;this number is a total bundle price.&quot;</p>

      <p className="mb-3"><strong>Discount AI internal safeguards:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Invalid mode rejection:</strong> If the AI returns a discount mode not in the valid list (Percentage, Fixed, Fixed Bundle Price, BXGY), the entire output is rejected and defaults are applied.</li>
        <li><strong>Array response merging:</strong> Sometimes the AI returns a separate object for each tier instead of one object. The system automatically merges them and deduplicates rules (by buy/get quantities for BXGY, or by type + value + discount for other modes).</li>
        <li><strong>BXGY discount value handling:</strong> Values are capped at 100% (free). If the AI returns 0, a negative number, or a non-number, it defaults to 100% (free). Buy and get quantities must both be positive integers or the rule is dropped.</li>
        <li><strong>Rule type normalization:</strong> Each rule has a &quot;type&quot; (quantity or amount). If the AI returns an invalid type, it defaults to &quot;quantity&quot;. Amount type is used for spend-based discounts (e.g., &quot;Spend $100, get 10% off&quot;).</li>
        <li><strong>Markdown stripping:</strong> If the AI wraps its JSON output in markdown code fences, the system strips them before parsing.</li>
        <li><strong>Locale number normalization:</strong> Numbers in European format (e.g., &quot;149,50&quot;) are converted to standard decimal format (&quot;149.50&quot;). Thousands separators are also handled.</li>
      </ul>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Merchant text</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Discount mode</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tiers extracted</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['\u201cBuy 3 get 10% off, Buy 5 get 20% off\u201d', 'Percentage', '3 -> 10%, 5 -> 20%'],
            ['\u201c5 items for $99\u201d', 'Fixed Bundle Price', '5 -> $99'],
            ['\u201cSpend $100, get 10% off\u201d', 'Percentage (spend-based)', '$100 spend -> 10%'],
            ['\u201cBuy 2 get 1 free\u201d', 'BXGY', 'Buy 2, Get 1, 100% off (free)'],
            ['\u201cBuy 2 get 1 at 50% off\u201d', 'BXGY', 'Buy 2, Get 1, 50% off'],
            ['\u201cBuild your own bundle\u201d (no discount mentioned)', 'None', 'No tiers'],
            ['\u201cBuy 2 and save\u201d (no amount)', 'Percentage', '2 -> \u201cunspecified\u201d'],
            ['AI call fails', 'None', 'Falls back to default tiers (2->5%, 3->10%, 4->15%)'],
          ] as [string, string, string][]).map(([text, mode, tiers], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{text}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{mode}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{tiers}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6"><strong>Example A:</strong> Discount AI extracts Percentage mode with tiers 3-&gt;10% and 5-&gt;20%.</p>
      <p className="mb-6"><strong>Example C:</strong> Discount AI detects &quot;Buy 2 get 1 free&quot; as BXGY mode with buyQty=2, getQty=1, discountValue=100.</p>

      <h3 className="text-xl font-semibold mb-3">Phase 1.5: Build Categories (No AI -- Instant)</h3>
      <p className="mb-6">This is a deterministic (non-AI) step that takes the Structure AI&apos;s output and the merchant&apos;s actual inventory to build the product categories for each step.</p>

      <p className="mb-3"><strong>How categories are built depends on what inventory the merchant provided:</strong></p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Inventory provided</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Category creation strategy</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Collections only (single collection, with enrichment data)', 'If the AI identified sub-groups within the collection, split it into sub-categories. Otherwise, one category for the collection.'],
            ['Collections only (multiple collections)', 'One category per collection (e.g., 3 collections = 3 categories)'],
            ['Products only (no AI group hints)', 'One category per product type (products without a type go into \u201cOther\u201d)'],
            ['Products only (with AI-provided group hints)', 'One category per group hint, unmatched products fall back to type-based grouping'],
            ['Both collections and products', 'Collection-based categories first, then product-type or group-hint categories appended'],
            ['Neither', 'One empty category as placeholder'],
          ] as [string, string][]).map(([inv, strategy], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{inv}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{strategy}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6"><strong>Collection splitting:</strong> When the system has enriched a single collection (fetched its products), and the Structure AI identified sub-groups within it (via product type hints or product group hints), the collection is split into multiple categories. For example, a &quot;Signature Set&quot; collection containing caps, long sleeves, and body warmers becomes three separate categories. This only applies to single collections per step -- multiple collections are already meaningful categories and are not split.</p>

      <p className="mb-3"><strong>For multi-step bundles, distribution across steps uses a priority chain:</strong></p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Hint-based:</strong> If the Structure AI returned collection hints or product type hints for each step, match items to steps using those keywords (case-insensitive substring match for collections, exact string match for product types, case-insensitive exact title match for product group hints).</li>
        <li><strong>Even distribution (fallback):</strong> If no hints exist, split collections evenly across steps using round-robin by index. For example, 5 collections across 2 steps = 3 in Step 1 (indices 0-2) and 2 in Step 2 (indices 3-4).</li>
        <li><strong>Unmatched items:</strong> Any items that do not match any hint are spread evenly across all steps, always going to the step with the fewest items first (smallest-bucket-first). Ties are broken deterministically by step order (first step with the minimum count wins).</li>
        <li><strong>No-hint collapse:</strong> When there are products but no collections and no hints of any kind, the system collapses everything into the first step rather than duplicating identical categories across all steps.</li>
      </ol>

      <p className="mb-3">After distribution, the system cleans up:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Categories with no backing inventory (no collection, no products) are removed.</li>
        <li>Steps that have no inventory are removed (even if the AI gave them labels), as long as at least one step would remain.</li>
      </ul>

      <p className="mb-6"><strong>Example A:</strong> Two collections (Summer Sale, Winter Collection) become two categories in a single step: &quot;Summer Sale&quot; and &quot;Winter Collection&quot;.</p>
      <p className="mb-6"><strong>Example B:</strong> Four collections are distributed across two steps using hints. &quot;Hot Meals&quot; and &quot;Cold Meals&quot; match &quot;meals&quot; -&gt; Step 1. &quot;Soft Drinks&quot; and &quot;Smoothies&quot; match &quot;drinks&quot; -&gt; Step 2.</p>
      <p className="mb-6"><strong>Structure AI returned null?</strong> When the AI fails completely, the system creates a single step with a single &quot;locked&quot; category containing all collections and all products merged together. This is the most conservative fallback.</p>

      <h3 className="text-xl font-semibold mb-3">Phase 2: Rules AI (Sequential)</h3>
      <p className="mb-6">The Rules AI determines quantity constraints for each step. It receives the merchant text plus the category structure built in Phase 1.5 and the discount output from Phase 1.</p>
      <p className="mb-6"><strong>Critical exception: BXGY skips this entirely.</strong> When the Discount AI returns BXGY mode, the Rules AI is not called at all. The assembly layer handles BXGY rules deterministically (see Phase 2.5).</p>

      <p className="mb-3">The Rules AI follows a priority system called &quot;The Golden Rule&quot;:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Fixed Bundle Price:</strong> The discount quantity wins over anything the merchant said. Rules are always &quot;exactly X&quot;.</li>
        <li><strong>Percentage or Fixed:</strong> The merchant text wins. Rules are usually &quot;at least X&quot;.</li>
        <li><strong>No discount mode:</strong> Follow merchant text if it has quantities; otherwise default to &quot;at least 2&quot;.</li>
      </ul>

      <p className="mb-3">The AI can also return <strong>per-category rules</strong> when the merchant names specific product groups with specific quantities (e.g., &quot;Select 2 Converse and 3 Nike&quot;). This only happens when:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>The merchant explicitly names distinct product groups with per-group quantities</li>
        <li>Category context confirms those groups exist as categories</li>
        <li>The step has more than one category</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">Phase 2.5: Deterministic Assembly</h3>
      <p className="mb-6">This is the final phase where all AI outputs are combined into a bundle configuration. There is no AI involved -- it is pure logic with fallbacks.</p>

      <p className="mb-3"><strong>Assembly uses a strict priority cascade for rules (first match wins):</strong></p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Priority</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Condition</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What happens</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">P1</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Discount mode is Fixed Bundle Price</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Force &quot;exactly X&quot; on all steps. For single-step with multiple tiers, one &quot;exactly X&quot; condition per tier (e.g., tiers at qty 1, 2, 3 produce three conditions). For multi-step, distribute the highest tier total across steps (e.g., 5 across 2 steps = 3+2). Exception: if multi-step and the Rules AI provided per-step rules, those LLM rules are used instead.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">&quot;1 for $39.99, 2 for $68, 3 for $94.99&quot; -&gt; exactly 1, exactly 2, exactly 3</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">P1.5</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Discount mode is BXGY</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Single-step: min qty = buyQty + getQty (minimum 2). Multi-step: Step 1 min = buyQty (minimum 2), Step 2 min = getQty (minimum 1, no floor of 2). Steps 3+ get default &quot;at least 2&quot;.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">&quot;Buy 2 get 1 free&quot; -&gt; at least 3 (single) or Step 1 at least 2, Step 2 at least 1 (multi)</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">P2</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Rules AI returned explicit conditions</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Use them directly. If per-category rules exist, apply to matching categories (case-insensitive exact match).</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">&quot;Select 2 Converse and 3 Nike&quot; -&gt; per-category rules</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">P3</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">No explicit rules, but discount tiers exist</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Single-step: bridge the minimum quantity from the lowest discount tier (floored at 2). Multi-step: default each step to at least 1 (discount tiers describe pricing, not per-step quantities).</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Discount says &quot;Buy 3 -&gt; 10%&quot;, so single-step minimum is at least 3. Multi-step: at least 1 per step.</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">P4</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Nothing at all</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Single-step: at least 2. Multi-step: at least 1 per step.</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Bare minimum fallback</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-3"><strong>Example A path through assembly:</strong></p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>P1 check: discount mode is Percentage, not Fixed Bundle Price -- skip.</li>
        <li>P1.5 check: not BXGY -- skip.</li>
        <li>P2 check: Rules AI was called. If it returned explicit conditions (e.g., &quot;at least 3&quot;), use them. If not, fall to P3.</li>
        <li>P3: Discount tiers exist (3-&gt;10%, 5-&gt;20%). Bridge from lowest tier: minimum = at least 3.</li>
      </ol>

      <p className="mb-3"><strong>Example B path through assembly:</strong></p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>P1 check: Percentage mode -- skip.</li>
        <li>P1.5 check: not BXGY -- skip.</li>
        <li>P2 check: Rules AI returned per-step rules (equalTo 10 for meals, equalTo 5 for drinks). Use them directly.</li>
      </ol>

      <p className="mb-3"><strong>Example C path through assembly:</strong></p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>P1 check: not Fixed Bundle Price -- skip.</li>
        <li>P1.5 check: BXGY mode detected. Single-step bundle. Min qty = buyQty(2) + getQty(1) = 3. Rule becomes &quot;at least 3&quot;. The assembly layer also sets &quot;discountTarget&quot; to &quot;CHEAPEST_ITEM&quot; for single-step.</li>
      </ol>

      <p className="mb-3"><strong>Per-category rule matching:</strong> When the Rules AI returns rules with category labels (e.g., &quot;Converse Shoes&quot;), the assembly matches them to actual categories by exact name (case-insensitive). The matching works as follows:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>If no labels match any actual category in any step, the system falls back to treating ALL rules as step-level.</li>
        <li>Within each step, rules are either ALL category-level or ALL step-level -- never mixed (<strong>mutual exclusivity enforcement</strong>). If a step has at least one category with matched rules, the step-level rules for that step are cleared (set to empty). Steps where no categories matched receive the step-level rules instead.</li>
        <li>Rules AI invalid conditions: If a rule has a condition not in the valid list (&quot;at least&quot;, &quot;at most&quot;, &quot;exactly&quot;), that entire rule is dropped.</li>
      </ul>

      <p className="mb-6"><strong>Rule deduplication:</strong> Each step can have at most one &quot;at least&quot; rule and one &quot;at most&quot; rule. When duplicates exist: the lowest &quot;at least&quot; value is kept (safest minimum) and the highest &quot;at most&quot; value is kept (safest maximum). &quot;Exactly&quot; rules can have multiple values.</p>

      <p className="mb-3"><strong>Category merger (post-assembly cleanup):</strong> After rules are applied, the system checks single-step bundles for sparse AI-inferred categories. If all of these conditions are true, the categories are merged into one:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>The bundle has exactly one step</li>
        <li>The step was not collapsed from a failed multi-step attempt</li>
        <li>There are 3 or more categories</li>
        <li>Average products per category is 2 or fewer</li>
        <li>No category is locked or has per-category conditions</li>
        <li>All categories came from AI inference (product group hints or fallback) -- never from collections, product types, or collection splits</li>
      </ul>
      <p className="mb-6">This prevents the UI from showing many tiny sections (e.g., 6 categories with 1 product each) when the AI over-segmented the products.</p>

      <p className="mb-3"><strong>Discount assembly:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>If the Discount AI returned valid rules, they pass through with the discount code prefix &quot;EasyBundle&quot; attached.</li>
        <li>If the Discount AI returned nothing usable, the system applies default tiers: Buy 2 = 5% off, Buy 3 = 10% off, Buy 4 = 15% off.</li>
        <li>&quot;Unspecified&quot; discount values are filled in: if there is one tier, the discount is set to 10%; if there are multiple tiers, discounts increment by 5% (5%, 10%, 15%, etc.).</li>
        <li>BXGY discount values are capped at 100% (the maximum is &quot;free&quot;).</li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Outputs ─── */}
      <h2 className="text-2xl font-semibold mb-4">Outputs</h2>
      <p className="mb-6">Every pipeline run produces:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Output field</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Bundle config', 'The complete bundle with steps, categories, conditions, and discount configuration'],
            ['Status', '\u201cAUTO\u201d for normal runs, \u201cERROR\u201d if the entire pipeline crashed'],
            ['Flags', 'Indicators of which fallbacks were used (see table below)'],
            ['Decision trace', 'Per-stage decisions showing what pattern was detected and why'],
            ['Decision summary', 'Human-readable multi-line text combining the AI\u2019s reasoning with the system\u2019s pattern classification'],
            ['Debug info', 'Raw AI outputs for all three layers, plus error indicators'],
          ] as [string, string][]).map(([field, desc], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{field}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Flags</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Flag</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['SAFE_DEFAULT_USED', 'The Structure AI returned null or failed; the system used a single-step single-category fallback'],
            ['DEFAULT_RULE_APPLIED', 'No rules were found from any source; the system applied the hard default (at least 2 for single-step, at least 1 per step for multi-step)'],
            ['MULTI_STEP_MISSING_STEPS', 'The Structure AI said \u201cmulti-step\u201d but did not provide any step definitions; the system created 2 generic steps'],
            ['DUPLICATE_STEP_IDS_DETECTED', 'Validation warning: two steps had the same identifier'],
            ['EMPTY_STEP_LABELS_DETECTED', 'Validation warning: one or more steps had no label'],
          ] as [string, string][]).map(([flag, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{flag}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What the User Sees ─── */}
      <h2 className="text-2xl font-semibold mb-4">What the User Sees</h2>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Merchant</strong> opens the bundle creation interface and types a description of the bundle they want.</li>
        <li>The merchant optionally selects Shopify collections and/or individual products to include.</li>
        <li>The merchant clicks a button to generate the bundle.</li>
        <li>The pipeline runs (typically 2-5 seconds) and returns a fully configured bundle.</li>
        <li>The bundle appears in the dashboard ready for review and publishing.</li>
        <li>If the pipeline encounters issues, the bundle still appears with safe defaults -- the merchant can manually adjust.</li>
      </ol>

      <p className="mb-3">The pipeline supports two bundle display types:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Fullpage bundle:</strong> Dedicated page with step navigation, landing page, filters, search, and a summary page.</li>
        <li><strong>PDP bundle (Product Detail Page):</strong> Embedded within an existing product page, more compact.</li>
      </ul>
      <p className="mb-6">The transformer layer converts the pipeline output into the correct format for whichever display type is selected. For BXGY bundles, the internal &quot;BXGY&quot; label is converted to &quot;BOGO&quot; for the frontend.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Limitations ─── */}
      <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>No free gifts.</strong> The system explicitly rejects &quot;free gift with purchase&quot; patterns (e.g., &quot;Free cleaning cloth with every order&quot;). These require a different configuration approach.</li>
        <li><strong>Single discount mode per bundle.</strong> A bundle cannot mix percentage and fixed-amount discounts. If the merchant text has mixed modes, only the majority mode is kept.</li>
        <li><strong>BXGY is limited to 2 meaningful steps.</strong> For multi-step BXGY, Step 1 is the &quot;trigger&quot; (buy, minimum = buyQty, floor of 2) and Step 2 is the &quot;reward&quot; (get, minimum = getQty, floor of 1 -- note: Step 2 does NOT have a floor of 2, unlike other contexts). Steps 3 and beyond receive a generic &quot;at least 2&quot; default.</li>
        <li><strong>AI context limits.</strong> Only 30 collections, 20 product types, and 30 product titles are sent to the AI. Large stores may have inventory that is not visible to the pipeline.</li>
        <li><strong>Collection enrichment limits.</strong> Only collections with 30 or fewer products are enriched. Requires a Shopify connection -- direct API calls without a shop name skip enrichment. Enrichment is also skipped when no Shopify client is available (e.g., regression testing scripts).</li>
        <li><strong>Product type quality gate may be aggressive.</strong> Stores with less than 100% product type coverage will have types stripped entirely, even if most products have good types. This is intentional -- partial types create worse AI output than no types.</li>
        <li><strong>Collection splitting only works for single collections.</strong> When a step has multiple collections, they are kept as separate categories without splitting. Splitting is designed for the common case where a merchant selects one broad collection.</li>
        <li><strong>Per-category rules require exact label match.</strong> If the Rules AI returns a category label that does not exactly match any built category (case-insensitive), the per-category rules are discarded and the system falls back to step-level rules.</li>
        <li><strong>No spend-based conditions.</strong> While the Discount AI can extract spend-based thresholds (e.g., &quot;Spend $100, get 10% off&quot;), the rules system bridges these to &quot;amount&quot; type conditions which the storefront interprets.</li>
        <li><strong>Hallucination filtering is title-exact only.</strong> The system removes AI-hallucinated product titles but does not verify collection hints or product type hints against actual inventory.</li>
      </ol>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Retry and Error Behavior ─── */}
      <h2 className="text-2xl font-semibold mb-4">Retry and Error Behavior (Detailed)</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Error type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Is it retried?</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What happens after failure</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Rate limit (HTTP 429, \u201cResource exhausted\u201d)', 'Yes -- up to 2 retries (delays: 1s, then 2s)', 'Slack notification sent, AI layer returns default output'],
            ['Timeout (30 seconds exceeded)', 'No -- fails immediately, no retry', 'Slack notification sent, AI layer returns default output'],
            ['JSON parse failure', 'No', 'Slack notification sent with raw output snippet, AI layer returns default output'],
            ['Other API errors', 'No', 'Slack notification sent, AI layer returns default output'],
            ['Unhandled exception in assembly', 'No', 'Entire pipeline returns ERROR status with empty steps and default discount tiers'],
          ] as [string, string, string][]).map(([error, retried, after], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{error}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{retried}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">When an individual AI layer fails, the pipeline continues with safe defaults for that layer. Only an unhandled exception in the pipeline runner itself causes an ERROR status.</p>
      <p className="mb-6"><strong>Error fallback structure:</strong> On total pipeline crash, the response is: empty steps, Percentage discount mode with default tiers (2-&gt;5%, 3-&gt;10%, 4-&gt;15%), status &quot;ERROR&quot;, empty flags, empty decision trace.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Pattern Tags Reference ─── */}
      <h2 className="text-2xl font-semibold mb-4">Pattern Tags Reference</h2>
      <p className="mb-6">Every pipeline run is automatically tagged with classification labels for database filtering. These tags are assigned based on the pipeline inputs and outputs:</p>

      <h3 className="text-xl font-semibold mb-3">Structure tags</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tag</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['structure:single_step', 'AI returned single-step'],
            ['structure:multi_step', 'AI returned multi-step'],
            ['structure:has_collection_hints', 'AI returned collection keyword hints for at least one step'],
            ['structure:has_product_type_hints', 'AI returned product type hints for at least one step'],
            ['structure:has_product_group_hints', 'AI returned named product groupings for at least one step'],
            ['structure:has_hint_discards', 'Some AI-suggested product titles were filtered out (hallucinations)'],
            ['structure:collection_split', 'At least one collection was split into sub-categories using enrichment data'],
          ] as [string, string][]).map(([tag, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{tag}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Discount tags</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tag</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['discount:percentage', 'Percentage discount mode'],
            ['discount:fixed_amount', 'Fixed dollar amount discount mode'],
            ['discount:fixed_bundle_price', 'Fixed bundle price mode'],
            ['discount:bxgy', 'Buy X Get Y mode'],
            ['discount:no_rules', 'AI returned no discount rules'],
            ['discount:single_rule', 'AI returned exactly 1 discount tier'],
            ['discount:tiered', 'AI returned 2+ discount tiers'],
          ] as [string, string][]).map(([tag, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{tag}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Rules tags</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tag</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['rules:no_rules', 'No rules returned or rules disabled'],
            ['rules:equal_to', 'At least one \u201cexactly X\u201d condition'],
            ['rules:gte', 'At least one \u201cat least X\u201d condition'],
            ['rules:lte', 'At least one \u201cat most X\u201d condition'],
            ['rules:category_level', 'Rules applied to individual categories (not step-level)'],
            ['rules:step_level', 'Rules applied at step level'],
            ['rules:global', 'Rules applied globally (not tied to a step index)'],
          ] as [string, string][]).map(([tag, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{tag}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Input tags</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tag</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['input:empty_text', 'Merchant text was empty'],
            ['input:collections_only', 'Only collections provided (no products)'],
            ['input:products_only', 'Only products provided (no collections)'],
            ['input:mixed_inventory', 'Both collections and products provided'],
          ] as [string, string][]).map(([tag, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{tag}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Pipeline tags</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tag</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['pipeline:gemini_error', 'At least one AI call had an error'],
            ['pipeline:has_fallback', 'At least one AI layer used a fallback/error output'],
          ] as [string, string][]).map(([tag, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{tag}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Decision Trace (Detailed) ─── */}
      <h2 className="text-2xl font-semibold mb-4">Decision Trace (Detailed)</h2>
      <p className="mb-6">Every pipeline run returns a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">decision_trace</code> object and a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">_decisionSummary</code> text.</p>

      <p className="mb-3"><strong>Decision trace structure:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>structure:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{`{ pattern, reason, llmReasoning }`}</code> -- what the Structure AI decided and why</li>
        <li><strong>discount:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{`{ pattern, reason, llmReasoning }`}</code> -- what the Discount AI decided and why</li>
        <li><strong>rules:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{`{ pattern, reason, llmReasoning }`}</code> -- what the Rules assembly decided and why</li>
        <li><strong>fallbacks_used:</strong> list of fallback flags triggered (e.g., [&quot;SAFE_DEFAULT_USED&quot;])</li>
      </ul>

      <p className="mb-3"><strong>Decision summary</strong> is a human-readable multi-line text combining the AI&apos;s own reasoning text with the system&apos;s pattern classification. Example:</p>
      <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded text-sm mb-8 overflow-x-auto"><code>{`Structure: The merchant describes two groups: meals and drinks, in sequence.
  -> MULTI_STEP_EXPLICIT: structureType=MULTI_STEP with 2 explicit steps
Discount: The merchant wants 15% off the whole bundle.
  -> EXTRACTED: discountMode=PERCENTAGE with 1 rule(s); passthrough from LLM
Rules: Per-step rules: 10 meals and 5 drinks.
  -> EXPLICIT_CONDITIONS: rulesOutput has 2 condition(s)`}</code></pre>

      <p className="mb-3"><strong>Decision patterns by stage:</strong></p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Stage</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Pattern</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Structure', 'SINGLE_STEP', 'AI returned single-step'],
            ['Structure', 'MULTI_STEP_EXPLICIT', 'AI returned multi-step with step definitions'],
            ['Structure', 'MULTI_STEP_DEFAULT_STEPS', 'AI said multi-step but gave no steps; 2 defaults created'],
            ['Structure', 'SAFE_DEFAULT_LOCKED', 'AI returned null; locked to single step + single category'],
            ['Discount', 'EXTRACTED', 'AI returned valid discount rules'],
            ['Discount', 'BXGY_EXTRACTED', 'AI returned valid BXGY rules'],
            ['Discount', 'DEFAULT_TIERS', 'No usable rules; defaults applied (2->5%, 3->10%, 4->15%)'],
            ['Rules', 'EXPLICIT_CONDITIONS', 'Rules AI returned usable conditions'],
            ['Rules', 'EXPLICIT_CONDITIONS_WITH_CATEGORY_LABELS', 'Rules with per-category labels matched'],
            ['Rules', 'BRIDGED_FROM_DISCOUNT', 'No rules from AI; bridged minimum from lowest discount tier'],
            ['Rules', 'MULTI_STEP_DEFAULT_GTE1', 'Multi-step with no per-step rules; defaulted each step to at least 1'],
            ['Rules', 'FIXED_BUNDLE_PRICE_ENFORCED', 'Fixed Bundle Price forced \u201cexactly X\u201d'],
            ['Rules', 'FIXED_BUNDLE_PRICE_TIERED', 'Tiered Fixed Bundle Price with multiple \u201cexactly X\u201d conditions'],
            ['Rules', 'BXGY_SINGLE_STEP', 'BXGY single-step rules deterministically applied'],
            ['Rules', 'BXGY_MULTI_STEP', 'BXGY multi-step rules deterministically applied'],
            ['Rules', 'DEFAULT_APPLIED', 'No rules from any source; hard default applied'],
          ] as [string, string, string][]).map(([stage, pattern, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{stage}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{pattern}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Transformer Layer (Detailed) ─── */}
      <h2 className="text-2xl font-semibold mb-4">Transformer Layer (Detailed)</h2>
      <p className="mb-6">The transformer converts the internal pipeline output into the frontend-ready payload. Key behaviors:</p>

      <p className="mb-3"><strong>Bundle display types:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Fullpage bundle</strong> -- dedicated page with step navigation, landing page, filters, search, summary page. Categories include collection data, product data, and step-level conditions.</li>
        <li><strong>PDP bundle (Product Detail Page)</strong> -- embedded within an existing product page. More compact structure with category ranking and slightly different condition format.</li>
        <li><strong>Product Page bundle</strong> -- similar to PDP but with a different discount text template (no BOGO text rules).</li>
      </ul>

      <p className="mb-6"><strong>Category ID generation:</strong> Each category gets a randomly generated 5-digit numeric ID (e.g., &quot;category47382&quot;). These IDs are generated at transform time and are not deterministic.</p>

      <p className="mb-3"><strong>BXGY frontend shape:</strong> For BXGY bundles, each discount rule is transformed to:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>The &quot;buy&quot; quantity is placed in the rule&apos;s <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">value</code> field</li>
        <li>The &quot;get&quot; quantity is placed in a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">getsQuantity</code> field</li>
        <li>Discount type is always &quot;percentage&quot;</li>
        <li>Discount applies to &quot;lowest_priced&quot; item (single-step) or &quot;latest_added&quot; item (multi-step)</li>
        <li>The internal &quot;BXGY&quot; label is converted to &quot;BOGO&quot; for the frontend</li>
      </ul>

      <p className="mb-3"><strong>Condition format differs by bundle type:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Fullpage: conditions are a flat array of rule objects</li>
        <li>PDP/Product Page: conditions are wrapped in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{`{ isEnabled, rules: [...] }`}</code></li>
      </ul>

      <p className="mb-6"><strong>Discount text templates:</strong> The transformer generates pre-formatted discount messaging text for the storefront (e.g., &quot;Add 2 product(s) to save 10%!&quot;). These are templated with placeholders that the frontend fills in dynamically.</p>

      <p className="mb-6"><strong>Progress bar data:</strong> Generated from discount rules. Each tier gets a progress bar entry with title (e.g., &quot;3 Pack&quot;), subtitle (e.g., &quot;Save 10%&quot;), and a randomly generated 3-digit rule ID.</p>

      <p className="mb-6"><strong>Collection-split categories:</strong> Categories created by splitting collections carry their own enriched product data. During transformation, the collection reference is removed and products are used directly.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Database Logging ─── */}
      <h2 className="text-2xl font-semibold mb-4">Database Logging</h2>
      <p className="mb-6">Every pipeline run (unless <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">skipLogging: true</code> is passed) is logged to a MongoDB collection with:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Field</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Content</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['input', 'Merchant text, products array, collections array'],
            ['llmOutputs', 'Raw AI outputs for all three layers (structure, discount, rules)'],
            ['assembledResult', 'The final assembled bundle config'],
            ['trace', 'Step-by-step timing and decisions (summarized)'],
            ['totalDurationMs', 'End-to-end pipeline duration in milliseconds'],
            ['shopName', 'The merchant\u2019s store name'],
            ['source', 'Where the request came from (defaults to \u201cNON-APP\u201d for internal calls)'],
            ['geminiError', 'Boolean: did any AI call fail?'],
            ['geminiErrorLLMsFailed', 'Array of which AI layers failed (e.g., [\u201cstructure\u201d, \u201cdiscount\u201d])'],
            ['patternTags', 'Array of classification tags for filtering (see Pattern Tags section)'],
          ] as [string, string][]).map(([field, content], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{field}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{content}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Slack Notifications ─── */}
      <h2 className="text-2xl font-semibold mb-4">Slack Notifications</h2>
      <p className="mb-6">The pipeline sends Slack notifications in the following situations:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Situation</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What the notification contains</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['AI call fails after all retries', 'AI layer name, error type (TIMEOUT, RETRY_EXHAUSTED, API_ERROR), error message'],
            ['AI call fails with unexpected error', 'AI layer name, error type (UNEXPECTED), error message'],
            ['JSON parse failure for AI response', 'AI layer name, error type (PARSE_ERROR), raw output snippet (first 300 characters)'],
            ['Unhandled assembly layer error', 'Raw AI outputs that caused the failure'],
            ['Unhandled pipeline runner error', 'Merchant text that caused the failure'],
          ] as [string, string][]).map(([situation, contents], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{situation}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{contents}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── API Endpoints ─── */}
      <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Method</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Path</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">POST</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">/run</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Run the pipeline with merchant text, collections, and products</td>
          </tr>
          <tr>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">POST</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">/rerun</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Re-run the pipeline using stored input from a previous run (by run ID). Uses full original data from the database, avoiding data loss from frontend truncation. Always skips logging.</td>
          </tr>
        </tbody>
      </table>

      </div>
    </div>
  )
}
