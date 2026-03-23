import { useRef, useState } from 'react'

export default function FlyBundleRecommendationsPage() {
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
        <h1 className="text-3xl font-bold">Fly Bundle Recommendations &mdash; PM Handoff</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400 italic">Updated: 2026-03-23</p>
      <p className="mb-3"><strong>Audience:</strong> Product managers, merchant success, anyone who needs to understand what this system does without reading code.</p>
      <p className="mb-3"><strong>Related docs:</strong> PM_FAQ.md (edge cases and operations), ARCHITECTURE_V2.md (technical deep-dive)</p>
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
            ['FBT', 'Frequently Bought Together \u2014 products customers buy in the same order. The system identifies these patterns from real purchase history.'],
            ['Trigger product', 'The \u201cmain\u201d product in an FBT pairing. When a customer views or adds this product to their cart, the system recommends companion products alongside it.'],
            ['Companion product', 'A product recommended alongside a trigger. Example: a phone case recommended when a customer views a phone.'],
            ['Custom pool', 'A set of 4\u20138 related products that a customer can mix-and-match from. Example: \u201cPick any 3 soaps from these 6.\u201d'],
            ['Fixed bundle', 'A pre-curated combination of 2\u20133 specific products sold together. Example: \u201cShampoo + Conditioner + Brush.\u201d'],
            ['Volume discount', 'A \u201cbuy more, save more\u201d offer on a single product. Example: \u201cBuy 2 for 5% off, buy 3 for 10% off.\u201d'],
            ['Organic order', 'An order placed by a customer without any bundle app involvement \u2014 represents natural buying behavior.'],
            ['Fly-attributed order', 'An order that came through the Fly bundle app. These are excluded from analysis to avoid circular recommendations.'],
            ['Lift', 'How much more likely two products are to be bought together compared to random chance. A lift of 3.0 means 3x more likely than random.'],
            ['Co-frequency', 'The number of orders in which two specific products both appeared.'],
            ['Bundleable product', 'A product that qualifies for bundle recommendations \u2014 not a gift card, service, donation, or test product.'],
            ['Recommendable product', 'A bundleable product that is also active (not draft/archived) and has a valid price greater than zero.'],
            ['MVR', 'Minimum Viable Recommendation \u2014 the system\u2019s guarantee that every store gets at least one actionable recommendation, even with limited data.'],
            ['Tier', 'A data quality classification (1\u20136) that determines what kind of recommendations the system can produce. Lower is better.'],
            ['Product grouping', 'How the system organizes products into categories for pool generation. Uses a 5-strategy chain from best to worst.'],
            ['Variant pair', 'Two products that are actually different versions of the same product (e.g., \u201cT-Shirt Red\u201d and \u201cT-Shirt Blue\u201d). The system blocks these from being bundled together.'],
            ['Suppression', 'Removing an FBT pairing because it fails a quality check \u2014 for example, a very cheap accessory paired with an expensive product that customers rarely buy together.'],
            ['Coherence gate', 'An AI review step that checks whether a bundle makes sense from a merchandising perspective.'],
            ['Functional group', 'Products that serve the same purpose (e.g., all moisturizers). Used to prevent recommending substitutes together.'],
            ['Template', 'The visual layout and configuration the Fly app uses to display a bundle to the customer.'],
          ] as [string, string][]).map(([term, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{term}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
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
            ['Max FBT triggers per store', '8', 'Up to 8 products can each have their own \u201ccustomers also bought\u201d widget'],
            ['Max companions per trigger', '4', 'Each trigger shows up to 4 recommended companion products'],
            ['Max custom pools', '4', 'Up to 4 mix-and-match pools per store'],
            ['Max fixed bundles', '12', 'Up to 12 pre-curated bundle suggestions per store'],
            ['FBT pair cap', '200', 'Analyze up to 200 co-purchase pairs (downstream quality filters handle the rest)'],
            ['FBT minimum co-occurrences', '3', 'Products must appear together in at least 3 orders to be considered'],
            ['FBT minimum lift', '1.0', 'The pairing must be at least as likely as random chance'],
            ['FBT price compatibility', '0.3x - 3x', 'Products must be within roughly 1/3 to 3x of each other\u2019s price'],
            ['QB self-bundler threshold', '10%', 'A product qualifies as a \u201cself-bundler\u201d if 10%+ of its orders include multiple units'],
            ['QB minimum orders', '3', 'Product needs at least 3 orders to qualify for QB analysis'],
            ['Pool minimum products', '4', 'A category needs at least 4 products with orders to become a pool'],
            ['Pool price spread cap', '5x', 'The most expensive product in a pool can be at most 5x the cheapest'],
            ['Organic order threshold (high confidence)', '50+', 'Store\u2019s recommendations are considered high-confidence'],
            ['Organic order threshold (moderate)', '20\u201349', 'Moderate confidence in recommendations'],
            ['Low organic fallback', '1\u201319', 'Uses all orders (including Fly-attributed) with lower confidence'],
            ['Tier 1: Full data', '20+ organic orders + recommendations', 'Best case \u2014 strong signals'],
            ['Tier 5: Tiny catalog', 'Fewer than 10 products', 'Entire catalog offered as one pool'],
            ['Tier 6: Near-empty', 'Fewer than 3 products', 'Volume discount only'],
            ['Product fetch cap', '10,000', 'Safety limit for very large stores'],
            ['Order fetch cap', '1,000', 'Recent order history used for analysis'],
            ['LLM batch size', '500', 'Maximum products sent to AI classifier at once'],
            ['LLM cache duration', '1 hour', 'Classification results are cached to avoid repeated AI calls'],
            ['Coherence cache', '30 minutes', 'Bundle coherence scores are cached'],
            ['Volume discount tiers', 'Buy 2: 5% off, Buy 3: 10% off, Buy 5: 15% off', 'Default discount structure'],
          ] as [string, string, string][]).map(([setting, value, english], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{setting}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{english}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What Is Fly Bundle Recommendations? ─── */}
      <h2 className="text-2xl font-semibold mb-4">What Is Fly Bundle Recommendations?</h2>
      <p className="mb-6">Fly Bundle Recommendations is an automated system that analyzes a Shopify store&apos;s product catalog and purchase history, then generates specific bundle recommendations the merchant can use to increase average order value. The system runs as a background job &mdash; a request triggers it, and results are available in the run history when complete (typically 1&ndash;2 minutes). The output includes four types of recommendations: FBT triggers (upsell widgets), custom pools (mix-and-match), fixed bundles (pre-curated sets), and volume discounts (buy-more-save-more). Every recommendation includes a confidence level, reasoning trace, and suggested template configuration for the Fly app frontend.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Running Examples ─── */}
      <h2 className="text-2xl font-semibold mb-4">Running Examples</h2>

      <h3 className="text-xl font-semibold mb-3">Example A: &quot;So Sweet Shop UK&quot; &mdash; a large candy store with good data</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>~9,300 products (imported candy, snacks, drinks), ~3,000 recommendable (active with valid prices)</li>
        <li>~1,000 orders fetched, all organic</li>
        <li>54% multi-item order rate &mdash; strong co-purchase signal</li>
        <li><strong>Expected path:</strong> Tier 1, tag-based grouping, 8 FBT triggers, 4 custom pools, 12 fixed bundles</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Example B: &quot;New Tiny Candle Shop&quot; &mdash; a small store with 7 products and 5 orders</h3>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>7 active products, all candles</li>
        <li>5 total orders, 0 organic (all came through Fly)</li>
        <li>No product types assigned</li>
        <li><strong>Expected path:</strong> Tier 5 (tiny catalog), uses all orders, single &quot;complete catalog&quot; pool, volume discounts as fallback</li>
      </ul>

      <p className="mb-6">We will trace both examples through the pipeline below.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Core Concepts ─── */}
      <h2 className="text-2xl font-semibold mb-4">Core Concepts</h2>

      <h3 className="text-xl font-semibold mb-3">The Four Recommendation Formats</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Format</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What the merchant sets up</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What the customer sees</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Best for</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['FBT Trigger (BUNDLE_UPSELL)', 'Widget on product page: \u201cCustomers also bought...\u201d', 'Companion products shown when viewing/adding the trigger product', 'Stores with multi-item order history'],
            ['Custom Pool (CUSTOM_BUNDLE)', '\u201cPick any 3 from this set\u201d', 'Mix-and-match selection from a curated group', 'Stores with deep product categories'],
            ['Fixed Bundle (CUSTOM_BUNDLE)', '\u201cBuy these 2\u20133 products together\u201d', 'Pre-curated set, ready to add to cart', 'Stores where specific combos are popular'],
            ['Volume Discount (VOLUME_BUNDLE)', '\u201cBuy 2+ for a discount\u201d', 'Quantity selector with tiered pricing', 'Products customers already buy in multiples'],
          ] as [string, string, string, string][]).map(([format, merchant, customer, best], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{format}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{merchant}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{customer}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{best}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Data Quality Tiers</h3>
      <p className="mb-6">The system classifies each store into a tier based on how much usable data it has. This determines which recommendation types are possible.</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tier</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Label</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Condition</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What the store gets</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['1', 'Full data', '20+ organic orders AND at least 1 recommendation generated', 'All four formats, highest confidence'],
            ['2', 'Weak grouping', 'Orders exist but primary pipeline produced no recommendations', 'Fallback pools from product groups + volume discounts'],
            ['3', 'Low organic', 'Fewer than 20 organic orders', 'Uses all orders (lower confidence), still generates all formats'],
            ['4', 'Products only', 'Zero orders', 'Collection/tag/price-based pools + volume discounts only'],
            ['5', 'Tiny catalog', 'Fewer than 10 active products', 'Entire catalog as one pool + volume discounts'],
            ['6', 'Near-empty', 'Fewer than 3 active products', 'Volume discounts only'],
          ] as [string, string, string, string][]).map(([tier, label, condition, gets], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{tier}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{label}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{condition}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{gets}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3"><strong>Example A</strong> (candy store): Tier 1 &mdash; 1,000 organic orders, strong co-purchase signals.</p>
      <p className="mb-6"><strong>Example B</strong> (candle shop): Tier 5 &mdash; only 7 products, so the entire catalog becomes one pool.</p>

      <h3 className="text-xl font-semibold mb-3">Confidence Levels</h3>
      <p className="mb-6">Every recommendation carries a confidence label that tells the merchant how strong the evidence is.</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Confidence</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Meaning</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">When it appears</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['high', 'Strong evidence from purchase history', 'FBT: average lift >= 2.0 with strong/moderate companions. Pool: 20+ total orders and 6+ products. Bundle: triangle pattern with lift >= 2.0.'],
            ['medium', 'Moderate evidence, worth trying', 'FBT: lift >= 1.5 OR strong companion. Pool: 5+ total orders. Bundle: pair with lift >= 1.5. Also assigned when sample size is low (caps upward from high).'],
            ['exploratory', 'Limited evidence, test and learn', 'Everything else \u2014 heuristic fallbacks, pool-derived, bridge bundles, or very new data.'],
          ] as [string, string, string][]).map(([confidence, meaning, when], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{confidence}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{when}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Organic vs Fly-Attributed Orders</h3>
      <p className="mb-6">The system separates &quot;organic&quot; orders (placed without Fly involvement) from &quot;Fly-attributed&quot; orders (placed through the bundle app). This prevents circular reasoning &mdash; you would not want to recommend bundles based on purchases that were already driven by bundles.</p>
      <p className="mb-3"><strong>How the organic threshold works:</strong></p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Organic order count</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Strategy</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['50+', 'Use organic orders only', 'High'],
            ['20\u201349', 'Use organic orders only', 'Moderate'],
            ['1\u201319', 'Use ALL orders (organic weighted 2x)', 'Low'],
            ['0', 'Use ALL orders', 'Very low'],
          ] as [string, string, string][]).map(([count, strategy, confidence], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{count}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{strategy}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3"><strong>Example A:</strong> 1,000 organic orders &mdash; uses organic only, high confidence.</p>
      <p className="mb-6"><strong>Example B:</strong> 0 organic orders &mdash; uses all 5 orders (all Fly-attributed), very low confidence.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── The Pipeline Flow ─── */}
      <h2 className="text-2xl font-semibold mb-4">The Pipeline Flow</h2>
      <p className="mb-6">When a request hits the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">/recommend</code> endpoint, the system returns immediately with a run ID and processes in the background. Here is what happens step by step:</p>

      {/* ─── Step 1 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 1: Resolve Store Context</h3>
      <p className="mb-3">The system needs two things: a Shopify access token and a list of Fly-attributed order IDs to exclude.</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>If the request includes an access token, it uses that. Otherwise, it looks up the token from the Fly production database (encrypted, AES-256-GCM).</li>
        <li>If the request includes order IDs to exclude, it uses those. Otherwise, it fetches all Fly-attributed order IDs from the database.</li>
      </ul>

      {/* ─── Step 2 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 2: Fetch Store Data</h3>
      <p className="mb-3">Three parallel API calls to Shopify:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Products</strong> &mdash; full catalog (up to 10,000), paginated at 250 per page with 500ms delay between pages</li>
        <li><strong>Orders</strong> &mdash; recent order history (up to 1,000), all statuses</li>
        <li><strong>Shop info</strong> &mdash; store name and Shopify plan</li>
      </ol>
      <p className="mb-6">If zero products are found, the run fails with an error.</p>

      {/* ─── Step 3 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 3: Classify Products</h3>
      <p className="mb-3">Not every product should be in a bundle. The system uses a two-stage classifier:</p>

      <p className="mb-3"><strong>Stage 1 &mdash; Deterministic rules</strong> (fast, no AI):</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Hard exclude: gift cards, services, fees, returns, carrier bags, digital products (by product type)</li>
        <li>Hard exclude: products with &quot;hide-recommendation&quot; or &quot;smart-cart-hide-bundle-options&quot; tags</li>
        <li>Hard exclude: exact title matches like &quot;Test Product&quot;, &quot;Gift Card&quot;</li>
        <li>Hard exclude: title patterns like &quot;Shipping Protection&quot;, &quot;Donation&quot;, &quot;Tip&quot;</li>
        <li>Hard exclude: inactive/draft/archived products (cannot be recommended regardless)</li>
        <li>Hard exclude: $0 products with 0&ndash;1 variants (placeholders or free add-ons)</li>
        <li>Clear include: active product with price &gt; $0, at least one variant, and a usable title</li>
        <li>Everything else: ambiguous &mdash; sent to Stage 2</li>
      </ul>

      <p className="mb-3"><strong>Stage 2 &mdash; AI classification</strong> (Gemini 2.0 Flash):</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Ambiguous products are batched (up to 500 at a time) and sent to an AI model</li>
        <li>The AI classifies them as bundleable or non-bundleable</li>
        <li>Results are cached for 1 hour</li>
        <li>If the AI fails, all ambiguous products default to bundleable (safe fallback)</li>
        <li>In practice, most stores send very few products to Stage 2 because the deterministic rules handle ~95%+ of products</li>
      </ul>

      <p className="mb-3"><strong>Example A:</strong> 9,346 products fetched. 6,282 excluded deterministically (inactive, $0, placeholders). 3,064 bundleable, all also recommendable. 0 sent to AI classifier.</p>
      <p className="mb-6"><strong>Example B:</strong> 7 products, 0 excluded, 7 bundleable, 7 recommendable.</p>

      {/* ─── Step 4 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 4: Determine Order Strategy</h3>
      <p className="mb-3">Based on the organic order count, the system decides whether to use only organic orders or all orders (see the table in Core Concepts above).</p>
      <p className="mb-3"><strong>Example A:</strong> 300 organic &mdash; uses organic orders only.</p>
      <p className="mb-6"><strong>Example B:</strong> 0 organic &mdash; uses all orders.</p>

      {/* ─── Step 5 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 5: Build the Execution Universe</h3>
      <p className="mb-3">From the bundleable products, the system filters to &quot;recommendable&quot; products:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Must be active (not draft or archived)</li>
        <li>Must have at least one variant with a price above zero</li>
      </ul>
      <p className="mb-6">All expensive analysis stages operate on this smaller set.</p>

      {/* ─── Step 6 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 6: Compute Store Signals</h3>
      <p className="mb-3">Nine signals are computed from the recommendable products and orders:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Signal</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it measures</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['skuCount', 'Number of active products'],
            ['avgVariantDepth', 'Average number of variants per product'],
            ['complementarity', 'How evenly distributed products are across types (0 = one type, 1 = maximally diverse)'],
            ['uniqueProductTypes', 'Number of distinct product types'],
            ['priceSpread', 'How wide the price range is relative to the median'],
            ['pairablePct', 'Percentage of products that have at least one product within 0.67x\u20131.5x of their price'],
            ['organicOrderCount', 'Number of orders not attributed to Fly'],
            ['organicSinglePct', 'Percentage of organic orders with only one product type'],
            ['organicMultiQtyPct', 'Percentage of organic orders where a customer bought multiple units of the same product'],
            ['organicAvgUnits', 'Average total items per organic order'],
          ] as [string, string][]).map(([signal, measures], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{signal}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{measures}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ─── Step 7 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 7: Group Products</h3>
      <p className="mb-3">Products are organized into groups for custom pool generation. The system tries strategies in this order, using the first one that meets quality thresholds:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Priority</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Strategy</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Quality threshold</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Quality label</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['1st', 'Product type', '60%+ products have meaningful types AND 2+ groups', 'High'],
            ['2nd', 'Shopify Collections', '30%+ products assigned AND 2+ groups (fetches up to 15 collections via API)', 'High'],
            ['3rd', 'Filtered tags', '30%+ products assigned AND 2+ groups (noise tags like \u201csale\u201d, \u201cnew\u201d, season codes are excluded)', 'Medium'],
            ['4th', 'Title clustering', '20%+ products assigned AND 2+ groups (shared word sequences in product titles)', 'Medium'],
            ['5th', 'Price bands', 'Always works (splits into 3\u20134 percentile buckets)', 'Low'],
          ] as [string, string, string, string][]).map(([priority, strategy, threshold, label], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{priority}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{strategy}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{threshold}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3"><strong>Example A:</strong> Tag-based grouping (product types were unreliable for this candy store) &mdash; medium quality.</p>
      <p className="mb-6"><strong>Example B:</strong> Only 7 candles, all the same type &mdash; falls to price bands.</p>

      {/* ─── Step 8 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 8: Detect Product Type Quality</h3>
      <p className="mb-3">The system checks whether merchant-assigned product types are actually useful:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Brand-as-type detection:</strong> If a product type matches the vendor name (e.g., type=&quot;Nike&quot; for all Nike products), it is flagged as a brand name, not a category. These types are demoted because they do not help group products meaningfully.</li>
        <li><strong>Broad-but-valid detection:</strong> If products within a type have very different titles (average title similarity below 15%), the type is flagged as overly broad.</li>
      </ul>

      {/* ─── Step 9 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 9: Classify PB vs QB</h3>
      <p className="mb-3">A scoring system determines whether the store is better suited for pre-curated bundles (PB) or quantity breaks (QB):</p>

      <p className="mb-3"><strong>PB Score</strong> (catalog structure):</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>High pairability (90%+): +2 points</li>
        <li>Many product types (8+): +2 points, (4+): +1 point</li>
        <li>Large catalog (100+): +2 points, (50+): +1 point</li>
      </ul>

      <p className="mb-3"><strong>QB Score</strong> (order behavior):</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>High single-item rate (70%+): +2 points</li>
        <li>Multi-quantity buying (20%+): +2 points, (10%+): +1 point</li>
        <li>High units per order (3+): +1 point</li>
        <li>Small catalog (under 50): +1 point</li>
      </ul>

      <p className="mb-6">If PB score &gt;= QB score, the store is classified as PB (tie goes to PB). Confidence is based on the margin between scores.</p>

      {/* ─── Step 10 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 10: Detect QB Candidates</h3>
      <p className="mb-3">Products where customers naturally buy multiple units are identified. A product qualifies if:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>It appears in at least 3 orders</li>
        <li>10% or more of those orders include 2+ units of that product</li>
      </ul>

      {/* ─── Step 11 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 11: Analyze FBT (Frequently Bought Together)</h3>
      <p className="mb-3">The system finds product pairs that appear together in orders:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Count co-occurrences</strong> &mdash; for every pair of products that appeared in the same order, count how many orders they share</li>
        <li><strong>Filter by minimum support</strong> &mdash; pairs must appear together in at least 3 orders</li>
        <li><strong>Calculate metrics</strong> &mdash; support (fraction of all orders), confidence (conditional probability), lift (vs random chance), composite score (lift weighted by log of frequency)</li>
        <li><strong>Check price compatibility</strong> &mdash; products must be within 0.3x to 3x of each other</li>
        <li><strong>Classify strength</strong> &mdash; Strong (10+ orders, 5%+ of multi-item orders, lift 1.5+), Moderate (5+ orders, 2%+, lift 1.2+), Weak (3+ orders), or Noise</li>
        <li><strong>Deduplicate by title</strong> &mdash; variant titles (e.g., &quot;Soap Rose&quot; and &quot;Soap Lavender&quot;) are collapsed, keeping the highest-scoring version</li>
        <li><strong>Cap at 200 pairs</strong> &mdash; sorted by composite score</li>
      </ol>

      <p className="mb-3"><strong>Ghost product filtering:</strong> Products that appear in orders but are not in the current catalog (discontinued, deleted) are excluded from pair generation. This prevents &quot;ghost&quot; products from consuming pair slots.</p>
      <p className="mb-3"><strong>Example A:</strong> 8 FBT triggers with pairs like Monster Energy flavors, Fanta varieties, and Chewits flavors. 54% multi-item order rate provides strong co-purchase signal.</p>
      <p className="mb-6"><strong>Example B:</strong> Only 5 orders with 7 products &mdash; 0 qualifying pairs (need 3+ shared orders per pair).</p>

      {/* ─── Step 12 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 12: Build Functional Groups</h3>
      <p className="mb-3">Products that serve the same function are grouped together. This prevents the system from recommending substitutes together (e.g., two different moisturizers in the same bundle).</p>
      <p className="mb-6">The functional grouper uses co-purchase data and title/type/vendor signals to identify functional equivalences. Products that are frequently bought separately but rarely together are potential substitutes.</p>

      {/* ─── Step 13 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 13: Generate FBT Triggers</h3>
      <p className="mb-3">This is where the system creates &quot;customers also bought&quot; recommendations. For each qualifying FBT pair:</p>

      <p className="mb-3"><strong>Direction assignment</strong> (who is trigger, who is companion):</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>Check if there is enough data (co-frequency &gt;= 4 OR both products have 15+ orders)</li>
        <li>If yes, use confidence asymmetry &mdash; if P(B|A) is 1.5x or more than P(A|B), A is the trigger</li>
        <li>If no clear asymmetry, the product with more orders is the trigger</li>
      </ol>

      <p className="mb-3"><strong>Suppression rules</strong> (the pair is removed if):</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>The companion costs more than 5x the trigger AND they are bought together less than 10% of the time</li>
        <li>The trigger is a low-cost accessory (below 25% of the store median price) AND the companion is above the median AND they are bought together less than 10% of the time</li>
        <li>The directional confidence is below 3%</li>
      </ul>

      <p className="mb-3"><strong>Quality layers applied after direction assignment:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Variant detection blocks pairing different colors/sizes of the same product (using handle prefix and title diff-token analysis; product-type-based detection is deferred to post-grouping diversity for FBT)</li>
        <li>AI eligibility classifier (Gemini) removes promotional items, mystery boxes, gift sets, samples, and non-shoppable products from being triggers. Works in all languages.</li>
        <li>Substitute filtering prevents showing two products that serve the same function as companions for the same trigger</li>
        <li>Same-format penalty deprioritizes companions with very similar names to the trigger</li>
        <li>Companion cap of 4 per trigger</li>
        <li>LLM coherence gate removes bundles that do not make merchandising sense</li>
      </ul>

      <p className="mb-3"><strong>Example A:</strong> 8 FBT triggers generated &mdash; e.g., &quot;Monster Ultra Zero Blue Hawaiian Can&quot; with companion &quot;Monster Energy Ultra Wild Passion Can&quot;, &quot;Chewits Blue Raspberry Stick&quot; with companions &quot;Chewits Sweet Cherry Stick&quot; and &quot;Chewits Cola Stick&quot;.</p>
      <p className="mb-6"><strong>Example B:</strong> 0 FBT triggers &mdash; not enough order data.</p>

      {/* ─── Step 14 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 14: Generate Custom Pools</h3>
      <p className="mb-3">Products are grouped into &quot;pick N from this set&quot; pools:</p>

      <p className="mb-3"><strong>Single-category pools:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>A product group needs 4+ products with at least 1 order each</li>
        <li>Products are sorted by order count, top 8 selected</li>
        <li>IQR-based price outlier trimming removes extreme prices (if the pool still has 4+ products after trimming)</li>
        <li>Hard price spread cap: the most expensive product cannot be more than 5x the cheapest</li>
        <li>Default pick count: 3</li>
      </ul>

      <p className="mb-3"><strong>Cross-category pools:</strong></p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>The system finds product type pairs that co-occur in FBT data (e.g., &quot;soap&quot; and &quot;lotion&quot; frequently bought together)</li>
        <li>Top 2&ndash;4 products from each type form the pool, pick count of 2</li>
        <li>Same price coherence rules apply</li>
      </ul>

      <p className="mb-3"><strong>Example A:</strong> 4 pools &mdash; category-based groupings from tags, pick 3 from each.</p>
      <p className="mb-6"><strong>Example B:</strong> 0 pools &mdash; too few products with orders.</p>

      {/* ─── Step 15 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 15: Generate Fixed Bundles</h3>
      <p className="mb-3">Pre-curated 2&ndash;3 product combinations, generated in six phases:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Build FBT graph</strong> &mdash; create a network of product connections from co-purchase pairs</li>
        <li><strong>Seed 2-product bundles</strong> &mdash; top co-purchase pairs become bundle candidates</li>
        <li><strong>Expand to 3-product bundles</strong> &mdash; find triangles (all three products bought together) and bridges (connected through a shared partner)</li>
        <li><strong>Score and rank</strong> &mdash; triangles get a +5 bonus, 3-product bundles get +3, order volume adds up to +5</li>
        <li><strong>LLM coherence gate</strong> &mdash; AI reviews bundles for merchandising plausibility (block / weak / pass)</li>
        <li><strong>Deduplicate</strong> &mdash; no exact duplicates, no bundles with 2/3 product overlap, no product appears in more than one fixed bundle</li>
      </ol>

      <p className="mb-6">If FBT data is insufficient, heuristic fallbacks generate bundles from the most popular products.</p>

      <p className="mb-3"><strong>Example A:</strong> 12 fixed bundles &mdash; sourced from FBT pairs, FBT bridges, and pool-derived combinations.</p>
      <p className="mb-6"><strong>Example B:</strong> 0 FBT-seeded bundles, but the MVR guarantee generates heuristic bundles from the 7 candles.</p>

      {/* ─── Step 16 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 16: Apply MVR Guarantee</h3>
      <p className="mb-3">The Minimum Viable Recommendation guarantee ensures every store gets something:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Tier 2+, no pools:</strong> Generate collection pools from product groups (up to 4)</li>
        <li><strong>Tier 4+ OR (Tier 2+ with no pools and no fixed bundles):</strong> Generate volume discount fallbacks for the top 5 most-ordered products</li>
        <li><strong>Tier 5, no pools:</strong> Entire catalog becomes one pool (up to 10 products, pick 3)</li>
      </ul>

      <p className="mb-6">Volume discount tiers: Buy 2 for 5% off, Buy 3 for 10% off, Buy 5 for 15% off.</p>

      <p className="mb-3"><strong>Example A:</strong> Tier 1, MVR not needed &mdash; primary pipeline produced strong results.</p>
      <p className="mb-6"><strong>Example B:</strong> Tier 5 &mdash; entire 7-candle catalog becomes one pool (pick 3), plus volume discounts on the top candles.</p>

      {/* ─── Step 17 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 17: Select Templates</h3>
      <p className="mb-3">Every recommendation gets a suggested Fly app template configuration with 5 layers:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Layout</strong> &mdash; which template to use (e.g., vertical stacked cards vs horizontal carousel)</li>
        <li><strong>Design skin</strong> &mdash; visual styling (elegant design for all)</li>
        <li><strong>Variant display</strong> &mdash; how to show product options (swatch for colors with images, label for sizes, dropdown for many options)</li>
        <li><strong>Discount type</strong> &mdash; percentage off, fixed amount off, or no discount</li>
        <li><strong>Advanced configuration</strong> &mdash; quantity selector, compared price visibility</li>
      </ol>

      {/* ─── Step 18 ─── */}
      <h3 className="text-xl font-semibold mb-3">Step 18: Build Store Trace and Save</h3>
      <p className="mb-3">A human-readable narrative trace is generated explaining every decision the system made. This trace is written in plain English (not technical jargon) so merchant support teams can explain why a specific recommendation was or was not made.</p>
      <p className="mb-6">The full result is saved to the database as a history record.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Outputs ─── */}
      <h2 className="text-2xl font-semibold mb-4">Outputs</h2>

      <h3 className="text-xl font-semibold mb-3">What the API Returns Immediately</h3>
      <p className="mb-3">When you call <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">/recommend</code>, you get back:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">runId</code> &mdash; the ID to check for results later</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">estimatedMinutes</code> &mdash; how long it will take (based on average of recent runs, default 2 minutes)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What the History Record Contains</h3>
      <p className="mb-3">Once the run completes, the full result includes:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Section</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it contains</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['recommendation.bundleStrategy', 'All four recommendation formats with products, pricing, reasoning'],
            ['recommendation.pb', 'PB/QB classification score and reasoning'],
            ['recommendation.qb', 'QB candidate products and their multi-buy rates'],
            ['recommendation.fbt', 'Raw FBT co-purchase pairs with metrics'],
            ['signals', 'The 9 store signals used for classification'],
            ['mvr', 'Tier, order strategy, recommendation strength, product grouping info, data quality hints'],
            ['quality', 'Variant block log, suppression log, direction log, eligibility log, substitute log'],
            ['classification', 'How many products were excluded and why'],
            ['storeTrace', 'Plain English narrative of every decision'],
            ['stats', 'Timing, product/order counts, AI token usage'],
          ] as [string, string][]).map(([section, contents], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top"><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">{section}</code></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{contents}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Recommendation Strength</h3>
      <p className="mb-3">The overall recommendation strength for a store is:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>strong</strong> &mdash; at least one high-confidence recommendation</li>
        <li><strong>moderate</strong> &mdash; at least one medium-confidence recommendation</li>
        <li><strong>early</strong> &mdash; all recommendations are exploratory</li>
        <li><strong>none</strong> &mdash; no recommendations generated (should not happen due to MVR)</li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What the Merchant Sees ─── */}
      <h2 className="text-2xl font-semibold mb-4">What the Merchant Sees</h2>
      <p className="mb-3">The merchant does not interact with this system directly. The pipeline output is consumed by the Fly app dashboard, which presents:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Suggested bundles</strong> &mdash; the specific product combinations to offer, with suggested templates</li>
        <li><strong>Format advice</strong> &mdash; which bundle format to prioritize (FBT, custom, volume, etc.)</li>
        <li><strong>Data quality hints</strong> &mdash; actionable suggestions like &quot;Add product types to improve grouping&quot; or &quot;More organic orders will strengthen recommendations&quot;</li>
        <li><strong>Confidence indicators</strong> &mdash; how much trust to place in each recommendation</li>
      </ol>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Understanding the Output ─── */}
      <h2 className="text-2xl font-semibold mb-4">Understanding the Output</h2>

      <h3 className="text-xl font-semibold mb-3">What does it mean when an FBT trigger has only 1 companion?</h3>
      <p className="mb-3">When you see a trigger with just 1 companion (e.g., &quot;Toothbrush &rarr; Toothpaste&quot;), it means one of these things:</p>

      <p className="mb-3"><strong>The store genuinely has thin co-purchase data for that product.</strong> The trigger product was bought with only one other product 3+ times. This is normal for:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Small stores with fewer than 100 orders</li>
        <li>Stores where customers typically buy one item per visit (e.g., furniture, electronics)</li>
        <li>New products that haven&apos;t accumulated enough order history yet</li>
        <li>Niche products with a small customer base</li>
      </ul>

      <p className="mb-3"><strong>What to tell the merchant:</strong> &quot;This recommendation is based on real purchase data &mdash; customers who buy [trigger] frequently also buy [companion]. As more customers purchase, additional companions may appear in future pipeline runs.&quot;</p>
      <p className="mb-6"><strong>What NOT to tell the merchant:</strong> &quot;The system isn&apos;t working properly.&quot; A 1-companion trigger is a valid recommendation. It means the system found exactly one strong co-purchase signal. That&apos;s better than guessing.</p>

      <h3 className="text-xl font-semibold mb-3">What does the companion count tell you?</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Companions</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['1', 'One strong pairing exists. Either the store has limited data, or this product genuinely has one clear complement.', '\u201cPhone Case \u2192 Screen Protector\u201d'],
            ['2\u20133', 'Multiple products pair well with the trigger. Good diversity. This is the sweet spot.', '\u201cShampoo \u2192 Conditioner, Hair Mask, Brush\u201d'],
            ['4 (max)', 'The trigger is a \u201chub\u201d product that customers combine with many others. Very strong signal.', '\u201cFoundation \u2192 Primer, Concealer, Setting Spray, Brush\u201d'],
          ] as [string, string, string][]).map(([companions, meaning, example], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{companions}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{example}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">What does &quot;weak&quot; / &quot;moderate&quot; / &quot;strong&quot; strength mean?</h3>
      <p className="mb-3">These labels describe how confident we are in a specific pairing:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Strength</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means in plain English</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Should the merchant use it?</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['strong', 'Many customers buy these together (10+ shared orders), and they buy them together much more than random chance would predict (lift 1.5+). Rock-solid signal.', 'Yes, absolutely. Feature this prominently.'],
            ['moderate', 'A meaningful pattern exists (5+ shared orders, lift 1.2+). Good signal but not overwhelming.', 'Yes. Good for \u201cCustomers also bought\u201d widgets.'],
            ['weak', 'The products were bought together at least 3 times, but the pattern is not yet strong. Could be real signal or could be coincidence with more data needed.', 'Yes, but treat as a suggestion to test, not a guarantee.'],
          ] as [string, string, string][]).map(([strength, meaning, use], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{strength}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{use}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6"><strong>Important:</strong> &quot;Weak&quot; does NOT mean &quot;bad recommendation.&quot; It means &quot;we have limited evidence.&quot; Many weak recommendations turn out to be excellent sellers &mdash; they just haven&apos;t had enough orders yet to statistically prove themselves. In stores with large catalogs (500+ products), almost all pairs will be &quot;weak&quot; because the co-purchase frequency is spread across many product combinations.</p>

      <h3 className="text-xl font-semibold mb-3">What does it mean when a store gets 0 FBT triggers?</h3>
      <p className="mb-3">Four stores in our validation produced 0 FBT triggers. This is correct behavior, not a bug:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Reason</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What to tell the merchant</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Zero orders', 'Brand new store, no purchase history', '\u201cRun the pipeline again after you\u2019ve had 50+ orders. FBT needs purchase history to work.\u201d'],
            ['Very few orders', 'Store with 9 orders \u2014 not enough for any pair to appear 3+ times', '\u201cYou need more order volume. FBT recommendations will appear after ~50\u2013100 orders.\u201d'],
            ['Single-item orders', 'Shoe store where 96% of orders are one pair of shoes', '\u201cYour customers typically buy one product at a time. Consider volume discounts instead of FBT.\u201d The pipeline will suggest volume discounts and custom pools as alternatives.'],
            ['Dormant / inactive store', 'Store on \u201cdormant\u201d Shopify plan', '\u201cYour store plan may be limiting API access. Check your Shopify plan status.\u201d'],
          ] as [string, string, string][]).map(([reason, example, tell], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{reason}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{example}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{tell}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">The pipeline ALWAYS generates something &mdash; even with 0 FBT triggers, it falls back to fixed bundles (from product grouping) and volume discounts. The merchant is never left with zero recommendations.</p>

      <h3 className="text-xl font-semibold mb-3">What does the confidence level (high / medium / exploratory) mean?</h3>
      <p className="mb-3">This is the overall confidence for the entire trigger, not individual pairs:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Confidence</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Plain English</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What to tell the merchant</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['high', 'Strong purchase data backs this. Multiple companions with good lift scores. The system is confident this will perform well.', '\u201cThis is a data-backed recommendation. We strongly suggest setting this up.\u201d'],
            ['medium', 'Decent data, but could be stronger. Maybe one strong companion and one borderline one, or good patterns but from limited data.', '\u201cThis looks promising based on your purchase data. Worth setting up and monitoring performance.\u201d'],
            ['exploratory', 'Limited data. This is the system\u2019s best guess given what\u2019s available \u2014 a starting point, not a certainty.', '\u201cThis is a suggested starting point. Set it up, monitor for 2\u20134 weeks, and re-run the pipeline to get updated recommendations.\u201d'],
          ] as [string, string, string][]).map(([confidence, english, tell], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{confidence}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{english}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{tell}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Limitations ─── */}
      <h2 className="text-2xl font-semibold mb-4">Limitations</h2>

      <h3 className="text-xl font-semibold mb-3">Data &amp; Coverage</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Order history cap at 1,000</strong> &mdash; very high-volume stores may not use their full order history. This cap exists to prevent long API pagination times. For most stores, 1,000 recent orders is sufficient.</li>
        <li><strong>No real-time updates</strong> &mdash; recommendations are generated on demand, not continuously. A store must re-run the pipeline to get updated recommendations after significant sales activity.</li>
        <li><strong>New stores with no orders</strong> &mdash; Tier 4&ndash;6 recommendations are based solely on the product catalog. No co-purchase data means no FBT triggers and lower confidence. The MVR guarantee still produces custom pools and volume discounts.</li>
        <li><strong>Relies on Shopify product metadata</strong> &mdash; stores with poor product types, missing tags, and no collections will get lower-quality grouping (price bands as a last resort). Merchants can improve recommendations by assigning product types.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">AI &amp; Classification</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2" style={{ counterReset: 'list-item 4' }}>
        <li><strong>AI eligibility classification is the primary classifier.</strong> An LLM (Gemini 2.0 Flash) classifies all products as normal, promo/mystery, bundle/gift set, or non-shoppable. It handles multiple languages and context-aware edge cases (e.g., &quot;Mystery Ranch Backpack&quot; is a brand, not a mystery box). If Gemini is unavailable, a deterministic regex fallback handles English titles. Cost: ~$0.008 per store on average.</li>
        <li><strong>Rare LLM false positives (~1%)</strong> &mdash; the AI occasionally misclassifies products. Example: &quot;Bartons Million Dollar Bar Dark Chocolate&quot; was flagged as promo because &quot;Million Dollar&quot; sounded promotional. These are rare (1 out of 98 promo classifications in our largest test store) but can happen. The product is excluded from triggers but can still appear as a companion.</li>
        <li><strong>AI classification can fail entirely</strong> &mdash; if the Gemini API is down for an extended period, the regex fallback handles English titles but non-English stores lose eligibility filtering. Products default to &quot;normal&quot; (included), which is safe but may let through some promo/bundle items.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">FBT Quality</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2" style={{ counterReset: 'list-item 7' }}>
        <li><strong>Scent/flavor variants can appear as FBT companions (~6% of triggers)</strong> &mdash; when a store sells the same product in multiple scents or flavors (e.g., &quot;Deodorant Surf&quot; and &quot;Deodorant Wild&quot;), the system may recommend them together because customers genuinely buy multiple scents. These are technically co-purchased but are variants of the same product, not complementary products. Affected store types: body care (scents), candy (flavors), lash/beauty (styles). The system catches color and size variants but does not yet detect scent or flavor variants.</li>
        <li><strong>Product + Refill pairing</strong> &mdash; the system may recommend a product alongside its own refill pouch (e.g., &quot;Liquid Hand Soap&quot; &rarr; &quot;Liquid Hand Soap Refill Pouch&quot;). This is sometimes useful (practical pairing) but can look redundant.</li>
        <li><strong>Direction assignment can fragment multi-companion triggers</strong> &mdash; the system decides which product is the &quot;trigger&quot; for each pair independently. A mid-tier product can be the trigger in one pair but companion in another, splitting what could be a 3-companion trigger into two 1-companion triggers. This is statistically correct per-pair but can reduce the richness of individual trigger widgets.</li>
        <li><strong>Stores with 500+ products and limited orders may show all &quot;weak&quot; strength</strong> &mdash; this is a mathematical reality, not a bug. With many products and limited orders, co-purchase frequency is spread thin. The recommendations are still valid &mdash; &quot;weak&quot; means limited evidence, not bad quality.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">Pricing &amp; Configuration</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2" style={{ counterReset: 'list-item 11' }}>
        <li><strong>The system does not generate pricing</strong> &mdash; it suggests discount types and structures (e.g., &quot;10% off&quot;) but does not calculate optimal profit-maximizing prices. Merchants should set prices based on their margins.</li>
        <li><strong>Volume discount tiers are static</strong> &mdash; always Buy 2 for 5% off, Buy 3 for 10% off, Buy 5 for 15% off. No dynamic tier calculation based on margin data.</li>
        <li><strong>Fixed bundles have a product-reuse cap of 1</strong> &mdash; each product can only appear in one fixed bundle. This limits total fixed bundles for stores with few products.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">Performance</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2" style={{ counterReset: 'list-item 14' }}>
        <li><strong>Large stores (5,000+ products) take 4&ndash;7 minutes</strong> &mdash; the pipeline fetches the full catalog, classifies all products with AI, and analyzes co-purchase patterns. A 9,000-product store takes ~4 minutes. A 7,000-product store takes ~7 minutes. The main time cost is Shopify API pagination and AI eligibility classification.</li>
        <li><strong>Stores with high product churn show ghost line items</strong> &mdash; if a store frequently discontinues products, order history references products that no longer exist. The system filters these out automatically but the FBT signal is thinner as a result. Re-running the pipeline periodically helps as newer orders reference current products.</li>
      </ol>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Known Quality Metrics ─── */}
      <h2 className="text-2xl font-semibold mb-4">Known Quality Metrics (22-store final validation, 2026-03-23)</h2>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Stores producing FBT triggers', '18 of 22 (82%)'],
            ['Average FBT products per trigger', '3.24'],
            ['Average companions per trigger', '2.24'],
            ['FBT triggers with GOOD quality', '84%'],
            ['FBT triggers with variant problem', '~6% (7 of 119)'],
            ['FBT triggers with mixed quality', '~8%'],
            ['Total recommendations per store (avg)', '~20'],
            ['AI classifier tokens per run (avg)', '254 (near zero \u2014 most products classified deterministically)'],
            ['AI eligibility tokens per run (avg)', '81,449 (~$0.008 per store)'],
            ['Pipeline time: small store (<500 products)', '6\u201390s'],
            ['Pipeline time: medium store (500\u20132000)', '80\u2013120s'],
            ['Pipeline time: large store (2000\u201310000)', '120\u2013420s'],
          ] as [string, string][]).map(([metric, value], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{metric}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Recommendation counts by format (across 22 stores)</h3>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Format</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Stores with this format</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Avg count per store</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['FBT Triggers', '18 (82%)', '6.6'],
            ['Fixed Bundles', '22 (100%)', '8.5'],
            ['Custom Pools', '20 (91%)', '3.2'],
            ['Volume Discounts', '4 (18%)', '4.5'],
          ] as [string, string, string][]).map(([format, stores, avg], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold align-top">{format}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{stores}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{avg}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">What &quot;no FBT triggers&quot; means for a store</h3>
      <p className="mb-6">If a store produces 0 FBT triggers, it ALWAYS produces other recommendation types instead. No store is ever left with zero recommendations. The fallback chain is: FBT &rarr; Fixed Bundles (heuristic) &rarr; Custom Pools &rarr; Volume Discounts &rarr; Catalog Pool (entire catalog as one pool).</p>

      </div>
    </div>
  )
}
