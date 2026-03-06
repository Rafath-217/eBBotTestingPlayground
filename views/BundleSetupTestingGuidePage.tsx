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
      <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">PM Testing Guide</p>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── 1. What This Pipeline Does ─── */}
      <h2 className="text-2xl font-semibold mb-4">1. What This Pipeline Does</h2>
      <p className="mb-4">
        When a merchant installs EasyBundles and taps <strong>"Set up with AI"</strong>, the pipeline:
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-1">
        <li>Reads the store's product catalog from Shopify.</li>
        <li>Optionally reads sales data (if the store granted <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code>).</li>
        <li>Asks Gemini (via three sequential LLM calls) to decide:
          <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
            <li><strong>Structure</strong> -- what bundle type and which products.</li>
            <li><strong>Discount</strong> -- what discount model and values.</li>
            <li><strong>Rules</strong> -- step-level rules, quantities, and conditions.</li>
          </ul>
        </li>
        <li>Assembles the three outputs into a single bundle configuration JSON.</li>
        <li>Sends that JSON to the backend, which creates the bundle in Shopify.</li>
      </ol>
      <p className="mb-8">
        <strong>Goal of testing:</strong> confirm the pipeline picks sensible products, a reasonable discount, and valid
        rules for a variety of store shapes.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 2. Supported Scenarios ─── */}
      <h2 className="text-2xl font-semibold mb-4">2. Supported Scenarios (what to test)</h2>
      <p className="mb-4">Each row is a scenario you can trigger from the dashboard.</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">#</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Scenario</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Merchant text example</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What to check</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['1', 'No merchant text', '(leave blank)', 'Pipeline infers bundle from catalog alone. Products should still make sense together.'],
            ['2', 'Generic request', '"I want a bundle"', 'Pipeline picks a default bundle type and products from the catalog.'],
            ['3', 'Specific products', '"Bundle my coffee beans and mugs"', 'The named products (or close matches) appear in the bundle.'],
            ['4', 'Specific collection', '"Make a bundle from my Summer Sale collection"', 'Products come from the named collection.'],
            ['5', 'Discount request', '"Give 15% off when they buy 3"', 'Discount type = percentage, value = 15, min qty = 3.'],
            ['6', 'BXGY / free gift', '"Buy 2 get 1 free"', 'Bundle type = BXGY or free gift; rules reflect 2+1 logic.'],
            ['7', 'Volume / tiered', '"10% off 2, 15% off 3, 20% off 5"', 'Multiple discount tiers with correct quantities and values.'],
            ['8', 'Fixed price bundle', '"Sell these 3 items together for $49.99"', 'Bundle type = fixedBundlePrice; price = 49.99.'],
            ['9', 'Mix-and-match', '"Let customers pick any 3 from this collection"', 'Bundle type = mixAndMatch; step with correct selectable qty.'],
            ['10', 'Subscription', '"Weekly subscription box of 5 snacks"', 'Bundle type includes subscription flag (if supported).'],
            ['11', 'Store with no sales data', '(any text, store has no read_reports scope)', 'Pipeline still works; discount is based on catalog only.'],
            ['12', 'Store with very few products', '(store has < 5 products)', 'Pipeline doesn\'t crash; may warn "not enough products."'],
          ] as [string, string, string, string][]).map(([num, scenario, text, check]) => (
            <tr key={num}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{num}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{scenario}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 italic">{text}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{check}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Tip: run scenarios 1-4 on at least 3 different store types (fashion, food, electronics) to catch catalog-shape issues.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 3. Known Limitations ─── */}
      <h2 className="text-2xl font-semibold mb-4">3. Known Limitations</h2>
      <ul className="list-disc list-inside mb-8 space-y-2">
        <li>
          <strong>Max products sent to LLM: 200.</strong> If the store has more, we send a representative sample. Occasionally the LLM picks a product from the sample that isn't ideal.
        </li>
        <li>
          <strong>Collection matching is fuzzy.</strong> If the merchant says "summer sale" but the collection is called "Summer 2024 Clearance," the pipeline may or may not find it.
        </li>
        <li>
          <strong>Currency formatting.</strong> The LLM sometimes returns discount values without currency context. The assembler normalises to the store's currency, but rounding can differ by 1 cent.
        </li>
        <li>
          <strong>Subscription bundles</strong> are partially supported. The pipeline can flag intent but the final bundle may not have subscription metadata yet.
        </li>
        <li>
          <strong>Non-English catalogs.</strong> Works well for Spanish, French, German. Quality drops for CJK languages -- the LLM may misinterpret product names.
        </li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 4. How To Read The Output ─── */}
      <h2 className="text-2xl font-semibold mb-4">4. How To Read The Output</h2>
      <p className="mb-4">
        After a run completes, expand the row in Pipeline History. You'll see:
      </p>

      <h3 className="text-xl font-semibold mb-3">Assembled Bundle Config</h3>
      <p className="mb-2">This is the final JSON sent to the backend. Key fields:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Field</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['bundleName', 'Display name for the bundle (shown to the customer).'],
            ['steps', 'Array of steps. Each step has products, min/max quantities, and optional rules.'],
            ['steps[].products', 'The products (id + title) selected for that step.'],
            ['steps[].rules', 'Discount rules: type (percentage, fixed_amount, bxgy), value, conditions.'],
            ['discountType', 'Top-level discount strategy: percentage | fixed_amount | tiered | bxgy | none.'],
            ['discountValue', 'The primary discount value (e.g., 15 for 15%).'],
          ] as [string, string][]).map(([field, meaning]) => (
            <tr key={field}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{field}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">LLM Reasoning (collapsible)</h3>
      <p className="mb-2">
        If present, shows the LLM's chain-of-thought for each call (Structure, Discount, Rules). Use this to understand <em>why</em> the LLM made a choice. Look for:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>Did it correctly identify the merchant's intent?</li>
        <li>Did it consider the right products/collections?</li>
        <li>Did the discount reasoning align with the merchant's request?</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Decision Summary (collapsible)</h3>
      <p className="mb-8">
        A short, human-readable summary of the pipeline's decisions. Useful for quick review without reading full JSON.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 5. Edge Cases ─── */}
      <h2 className="text-2xl font-semibold mb-4">5. Edge Cases to Watch For</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Edge case</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Expected behaviour</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Red flag</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Store has only 1 product', 'Pipeline should still create a bundle (possibly single-product with qty discount) or return a clear error.', 'Silent failure or empty bundle.'],
            ['Merchant asks for a product that doesn\'t exist', 'Pipeline falls back to catalog-based selection and may note "could not find exact match."', 'Pipeline crashes or picks random products.'],
            ['Merchant text is in a different language than the catalog', 'Pipeline should still work; LLM handles multilingual input.', 'Bundle name or products are garbled.'],
            ['Very large catalog (1000+ products)', 'Pipeline samples 200 products. Bundle should still be coherent.', 'Timeout or products that don\'t fit together.'],
            ['Merchant requests conflicting things ("free" + "20% off")', 'Pipeline picks the most reasonable interpretation.', 'Both discounts applied or neither.'],
            ['Store has no collections', 'Collection-based requests fall back to catalog search.', 'Error about missing collection.'],
          ] as [string, string, string][]).map(([edge, expected, red], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{edge}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{expected}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-red-600 dark:text-red-400">{red}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── 6. Testing Checklist ─── */}
      <h2 className="text-2xl font-semibold mb-4">6. Testing Checklist</h2>
      <p className="mb-4">For each test run, verify:</p>
      <ul className="space-y-2 mb-8">
        {[
          'Pipeline completed without error (status = completed).',
          'Bundle name is reasonable and not generic ("Bundle 1").',
          'Selected products make sense together (not random items).',
          'If merchant text mentioned specific products, those products (or close matches) are included.',
          'Discount type matches the merchant\'s request (or is reasonable if no request).',
          'Discount value is within a sensible range (not 0%, not 99%).',
          'Step quantities are logical (min <= max, not 0).',
          'Rules don\'t contradict each other.',
          'If the store has no sales data, the pipeline still produces a valid bundle.',
          'The assembled JSON is valid (no null fields where values are expected).',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-slate-300 dark:border-slate-600 text-xs font-mono flex-shrink-0">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      </div>
    </div>
  )
}
