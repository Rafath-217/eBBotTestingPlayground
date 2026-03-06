import { useRef, useState } from 'react'

export default function BundleSetupTestingGuidePage() {
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
        <h1 className="text-3xl font-bold">AI Bundle Setup Pipeline</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-1">PM Testing Guide</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Last updated: 2026-03-06</p>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── 1. What This Pipeline Does ─── */}
      <h2 className="text-2xl font-semibold mb-4">1. What This Pipeline Does</h2>
      <p className="mb-8">
        When a merchant types what kind of bundle they want (for example, &quot;Buy 3 get 10% off&quot; or &quot;Pick 10 meals, then 5 drinks&quot;), the AI pipeline reads that text, figures out the bundle structure, discount type, and quantity rules, then produces a ready-to-use bundle configuration. The merchant does not need to fill in forms or understand discount logic -- the pipeline handles it automatically.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 2. What The Pipeline Can Do ─── */}
      <h2 className="text-2xl font-semibold mb-4">2. What The Pipeline Can Do (Supported Scenarios)</h2>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Scenario</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example Merchant Input</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What You Should See</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Simple percentage discount', '"Buy 3 get 10% off"', 'Single-step bundle, percentage mode, minimum quantity of 3, 10% discount'],
            ['Tiered percentage discount', '"Buy 3 get 10% off, Buy 5 get 20% off"', 'Single-step bundle, percentage mode, two discount tiers at quantities 3 and 5'],
            ['Fixed dollar off', '"$5 off when you buy 2 items"', 'Single-step bundle, fixed dollar off mode, $5 discount at quantity 2'],
            ['Fixed bundle price', '"5 items for $99"', 'Single-step bundle, fixed bundle price mode, exact quantity of 5, total price $99'],
            ['Spend-based discount', '"Spend $100 get 10% off"', 'Single-step bundle, percentage mode, threshold based on dollar amount ($100) rather than item count'],
            ['Multi-step bundle', '"Pick meals then drinks"', 'Two-step bundle where the customer selects from meals first, then drinks'],
            ['Multi-step with quantities', '"Pick 10 meals, then 5 drinks"', 'Two-step bundle with exact quantity of 10 on step 1 and exact quantity of 5 on step 2'],
            ['Multi-step without quantities', '"Step 1: Entrees. Step 2: Sides."', 'Two-step bundle where each step defaults to a minimum of 1 item (not 2). The merchant can adjust later'],
            ['Per-category rules', '"Select 2 converse and 3 nike for 15% off"', 'Single-step bundle with quantity rules targeted to each category individually (2 from Converse, 3 from Nike)'],
            ['BXGY / BOGO', '"Buy 2 get 1 free"', 'Single-step bundle with BXGY mode, buy quantity of 2, free quantity of 1, discount applied to lowest-priced item. Note: "Buy 2 get 10% off" is NOT BXGY -- that is a regular percentage discount'],
            ['BXGY with partial discount', '"Buy 2 get 1 at 50% off"', 'Single-step bundle with BXGY mode, buy quantity of 2, get quantity of 1, discount of 50% (not free)'],
            ['Vague input', '"Build a bundle"', 'Single-step bundle with sensible defaults -- minimum quantity of 2, default discount tiers applied'],
            ['No discount mentioned', '"Create a mix and match bundle"', 'Single-step bundle with no specific discount, minimum quantity of 2'],
            ['Exact quantity', '"Customers must select exactly 4 items"', 'Single-step bundle with an exact quantity constraint of 4 (not a minimum, not a range -- exactly 4)'],
            ['Quantity range', '"Select 2-4 items"', 'Single-step bundle with a minimum of 2 and a maximum of 4'],
            ['Implied discount, no amount', '"Buy 2 or more and enjoy extra savings"', 'Single-step bundle, quantity of 2, discount flagged as unspecified so defaults are applied'],
            ['Goal statement', '"I want to increase average order value"', 'Single-step bundle with minimum quantity of 2 and default discount tiers -- the pipeline does its best with vague intent'],
          ] as [string, string, string][]).map(([scenario, input, expected], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{scenario}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 italic">{input}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{expected}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 3. Known Limitations ─── */}
      <h2 className="text-2xl font-semibold mb-4">3. What The Pipeline Cannot Do (Known Limitations)</h2>
      <ul className="list-disc list-inside mb-8 space-y-3">
        <li>
          <strong>Free shipping discounts.</strong> The pipeline only handles item-level discounts (percentage off, dollar off, fixed price, BXGY). It cannot configure shipping-based promotions.
        </li>
        <li>
          <strong>Subscription or recurring bundles.</strong> One-time purchase bundles only. No subscription logic, no recurring billing.
        </li>
        <li>
          <strong>Geo-restrictions or market-specific bundles.</strong> The pipeline does not support targeting bundles to specific countries, regions, or Shopify markets.
        </li>
        <li>
          <strong>Per-product individual discounts.</strong> You cannot assign different discounts to different products within the same bundle. The discount applies uniformly to the entire bundle. For example, &quot;10% off shirts but 20% off pants&quot; is not supported.
        </li>
        <li>
          <strong>Date scheduling.</strong> No start dates, end dates, or expiry logic. The bundle is always-on once created.
        </li>
        <li>
          <strong>UI customization.</strong> The pipeline produces a bundle configuration, not a visual design. Colors, fonts, layout, and CSS are outside its scope.
        </li>
        <li>
          <strong>Product title awareness is partial.</strong> The Structure LLM receives up to 30 product titles and can use them to group products into steps or categories (via productGroupHints). However, the Discount and Rules LLMs do not see product titles -- they only receive merchant text and category context. So the pipeline can understand &quot;put the Red Hoodie in step 1&quot; for structure purposes, but cannot apply title-specific discount or quantity rules like &quot;10% off only on the Red Hoodie.&quot;
        </li>
        <li>
          <strong>Mixing discount types in one bundle.</strong> The pipeline picks one discount mode per bundle. It cannot combine percentage off and fixed dollar off in the same bundle.
        </li>
        <li>
          <strong>Item-specific BXGY is not supported.</strong> &quot;Buy a hoodie, get joggers 50% off&quot; (naming specific products for buy and get) will fall back to defaults rather than producing a BXGY rule.
        </li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 4. How To Read The Output ─── */}
      <h2 className="text-2xl font-semibold mb-4">4. How To Read The Output</h2>
      <p className="mb-6">
        Every pipeline run returns a few key fields alongside the bundle configuration itself. Here is what they mean.
      </p>

      <h3 className="text-xl font-semibold mb-3">Status</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>
          <strong>status: AUTO</strong> -- The pipeline handled everything automatically. The bundle configuration is complete and ready to use. This is the ideal outcome.
        </li>
        <li>
          <strong>status: ERROR</strong> -- The pipeline failed entirely. Safe defaults are applied so the merchant still gets a usable bundle, but it will be generic. Check the flags to see which parts fell back to defaults.
        </li>
      </ul>
      <p className="mb-6">
        There is no intermediate status. The pipeline either succeeds fully (AUTO) or fails (ERROR). In both cases the merchant gets a usable bundle.
      </p>

      <h3 className="text-xl font-semibold mb-3">Flags</h3>
      <p className="mb-3">Flags are a quick way to see if the pipeline fell back on defaults anywhere.</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>
          <strong>SAFE_DEFAULT_USED: true</strong> -- The AI could not understand the bundle structure from the merchant&apos;s text. A single-step bundle with one category was used as a fallback.
        </li>
        <li>
          <strong>DEFAULT_RULE_APPLIED: true</strong> -- No quantity rules were found or extracted. A default minimum of 2 items was applied (or minimum of 1 per step for multi-step bundles).
        </li>
        <li>
          <strong>MULTI_STEP_MISSING_STEPS: true</strong> -- The AI detected a multi-step bundle but could not determine what the steps should be.
        </li>
      </ul>
      <p className="mb-6">
        When all flags are false or absent, the pipeline understood the merchant&apos;s input fully.
      </p>

      <h3 className="text-xl font-semibold mb-3">Decision Summary</h3>
      <p className="mb-3">
        Every pipeline run includes a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">_decisionSummary</code> -- a plain-English explanation of what happened and why. It covers three areas:
      </p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li><strong>Structure</strong> -- Why the pipeline chose a single-step or multi-step bundle.</li>
        <li><strong>Discount</strong> -- What discount was extracted, or if defaults were applied.</li>
        <li><strong>Rules</strong> -- How quantity limits were determined.</li>
      </ul>
      <p className="mb-6">
        Each line shows both the AI&apos;s reasoning (what the LLM thought) and the system&apos;s action (what the deterministic layer did). This is the first thing to check if the output looks wrong.
      </p>

      <h3 className="text-xl font-semibold mb-3">Decision Trace</h3>
      <p className="mb-3">The structured version of the decision summary. Each section has:</p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li>
          <strong>llmReasoning</strong> -- what the AI said in its own words (e.g., &quot;Merchant wants a tiered percentage discount: 10% at 3, 20% at 5&quot;)
        </li>
        <li>
          <strong>pattern</strong> -- the deterministic path taken (e.g., &quot;EXTRACTED&quot;)
        </li>
        <li>
          <strong>reason</strong> -- the system&apos;s explanation (e.g., &quot;discountMode=PERCENTAGE with 2 rules; passthrough from LLM&quot;)
        </li>
      </ul>
      <p className="mb-6">
        If something looks wrong in the output, the decision summary and trace are the first place to check.
      </p>

      <h3 className="text-xl font-semibold mb-3">Pattern Tags (new)</h3>
      <p className="mb-3">
        Every pipeline run is automatically tagged with a set of pattern labels that describe its characteristics. These tags are used for filtering in the pipeline history dashboard. Examples:
      </p>
      <ul className="list-disc list-inside mb-3 space-y-1">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">structure:single_step</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">structure:multi_step</code> -- the bundle type</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">discount:percentage</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">discount:bxgy</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">discount:fixed_amount</code> -- the discount mode detected</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">rules:gte</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">rules:equal_to</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">rules:category_level</code> -- the kinds of quantity rules applied</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">input:empty_text</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">input:collections_only</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">input:products_only</code> -- what the merchant provided</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">pipeline:has_fallback</code> -- at least one LLM failed and a fallback was used</li>
      </ul>
      <p className="mb-8">
        You can filter pipeline history by one or more pattern tags to find runs matching a specific scenario (e.g., all BXGY runs, or all runs with empty merchant text).
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 5. Edge Cases ─── */}
      <h2 className="text-2xl font-semibold mb-4">5. Edge Cases To Watch For</h2>
      <ul className="list-disc list-inside mb-8 space-y-3">
        <li>
          <strong>Conflicting numbers in merchant text.</strong> If the merchant writes &quot;Buy 2... 3 for $10,&quot; the pipeline prioritizes the number associated with the price or discount. In this case, 3 wins because it is tied to the $10 price point.
        </li>
        <li>
          <strong>Very short text (under 10 characters).</strong> Inputs like &quot;bundle&quot; or &quot;deal&quot; may not give the AI enough context. Expect default values to kick in. The bundle will still be valid but generic.
        </li>
        <li>
          <strong>Very long text (over 200 characters).</strong> The pipeline handles long text without issue, but it may get flagged as &quot;complex&quot; in internal churn reports.
        </li>
        <li>
          <strong>Text with URLs or images.</strong> The pipeline only processes plain text. URLs, image links, and HTML are ignored.
        </li>
        <li>
          <strong>Misspellings.</strong> The AI handles common misspellings well. &quot;Minimun&quot; for &quot;minimum&quot; or &quot;percnt&quot; for &quot;percent&quot; will typically still be understood.
        </li>
        <li>
          <strong>Multiple discount types mentioned.</strong> If a merchant writes &quot;10% off or $5 off,&quot; the pipeline picks one mode. It does not mix percentage and fixed dollar discounts in the same bundle. Typically the first clearly stated pattern wins.
        </li>
        <li>
          <strong>BXGY phrasing variations.</strong> &quot;Buy 2 get 1 free,&quot; &quot;3 for 2,&quot; and &quot;BOGO&quot; are all recognized as Buy-X-Get-Y. However, &quot;Buy a hoodie, get joggers 50% off&quot; (item-specific BXGY) is not supported and will fall back to defaults.
        </li>
        <li>
          <strong>&quot;Buy X get Y% off&quot; is NOT BXGY.</strong> The pipeline now correctly distinguishes &quot;Buy 2 get 1 free&quot; (BXGY) from &quot;Buy 2 get 10% off&quot; (percentage discount). The presence of a percent sign makes it a regular percentage discount, not a BXGY deal.
        </li>
        <li>
          <strong>Collections vs. products.</strong> When the merchant selects only collections, each collection becomes a category in the bundle. When they select only individual products, products are grouped by product type. When they select both, individual products may land in a generic &quot;Other&quot; category.
        </li>
        <li>
          <strong>Per-category rules require matching collections.</strong> If a merchant writes &quot;2 converse and 3 nike&quot; but the selected collections are named &quot;Converse Shoes&quot; and &quot;Nike Shoes,&quot; the pipeline matches them. But if collections have unrelated names, per-category rules will not apply and step-level rules are used instead.
        </li>
        <li>
          <strong>Multi-step bundles default to 1 item per step.</strong> When the merchant creates a multi-step bundle but does not specify quantities for each step, each step defaults to a minimum of 1 item (not 2). This is intentional -- for multi-step bundles, the overall bundle quantity matters more than per-step minimums. Single-step bundles still default to a minimum of 2.
        </li>
        <li>
          <strong>BXGY discount values are capped at 100%.</strong> If the AI extracts a nonsensical discount above 100%, it is automatically capped to 100% (free). Invalid or missing BXGY discount values default to 100% (free).
        </li>
        <li>
          <strong>Locale-formatted numbers.</strong> The pipeline handles European-style number formats like &quot;149,50&quot; (comma as decimal separator) or &quot;1.299,00&quot; (period as thousands separator). These are normalized automatically.
        </li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 6. Testing Checklist ─── */}
      <h2 className="text-2xl font-semibold mb-4">6. Testing Checklist</h2>
      <ul className="space-y-2 mb-8">
        {[
          'Simple single-step with percentage discount ("Buy 3 get 10% off")',
          'Tiered discount with multiple tiers ("Buy 3 get 10%, Buy 5 get 20%")',
          'Fixed dollar off ("$5 off at 2 items")',
          'Fixed bundle price ("5 items for $99")',
          'Spend-based discount ("Spend $100 get 10% off")',
          'Multi-step bundle with 2 or more steps ("Pick meals then drinks")',
          'Multi-step with explicit quantities per step ("Pick 10 meals, then 5 drinks")',
          'Multi-step without quantities -- each step should default to minimum 1 ("Step 1: Entrees. Step 2: Sides.")',
          'BXGY / Buy X Get Y ("Buy 2 get 1 free")',
          'BXGY with partial discount ("Buy 2 get 1 at 50% off")',
          'BXGY vs percentage disambiguation ("Buy 2 get 10% off" should be PERCENTAGE, not BXGY)',
          'Vague input that should still produce a valid bundle ("Build a bundle")',
          'Empty or near-empty input (single word like "bundle")',
          'Collections-only bundle (no individual products selected, only collections)',
          'Products-only bundle (no collections selected, only individual products)',
          'Per-category rules with named groups ("2 converse and 3 nike")',
          'Very long merchant text (200+ characters with detailed instructions)',
          'Bundle with many collections (6 or more selected)',
          'Exact quantity constraint ("Customers must select exactly 4 items")',
          'Range constraint ("Select 2-4 items")',
          'No discount mentioned ("Create a mix and match bundle")',
          'Conflicting numbers in text ("Buy 2... 3 for $10")',
          'Status is AUTO for clean inputs and ERROR only when the pipeline fails entirely',
          'Decision summary and decision trace are present and readable in the output',
          'Pattern tags are present in pipeline history logs and can be used to filter runs',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" disabled className="mt-1 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      </div>
    </div>
  )
}
