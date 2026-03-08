import { useRef, useState } from 'react'

export default function CaseStudy83a38cPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = contentRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const topMatchesData = [
    { store: 'city-pop.myshopify.com', similarity: '93.2%', skuProx: '96.1%', compMatch: '86.8%', priceMatch: '100%', successTier: 'Moderate', bundleRevContrib: '65.5%', dominantStrategy: 'Fixed Bundle Price' },
    { store: 'uniko-2.myshopify.com', similarity: '85.6%', skuProx: '97.7%', compMatch: '93.7%', priceMatch: '45.4%', successTier: 'Moderate', bundleRevContrib: '32.2%', dominantStrategy: 'Classic' },
    { store: 'handsomescent.myshopify.com', similarity: '84.2%', skuProx: '94.5%', compMatch: '99.3%', priceMatch: '33.3%', successTier: 'Strong', bundleRevContrib: '59.9%', dominantStrategy: 'Volume Discount' },
    { store: '14daymani-ie.myshopify.com', similarity: '81.8%', skuProx: '96.5%', compMatch: '85.2%', priceMatch: '45.4%', successTier: 'Strong', bundleRevContrib: '27.8%', dominantStrategy: 'Mix &amp; Match' },
    { store: 'gellae.myshopify.com', similarity: '79.7%', skuProx: '97.3%', compMatch: '91.9%', priceMatch: '20.2%', successTier: 'Strong', bundleRevContrib: '51.2%', dominantStrategy: 'Classic' },
  ]

  const successFilterData = [
    { store: 'city-pop', successTier: 'Moderate', bundleRevContrib: '65.5% (threshold: 20%)', passed: 'Yes' },
    { store: 'uniko-2', successTier: 'Moderate', bundleRevContrib: '32.2% (threshold: 20%)', passed: 'Yes' },
    { store: 'handsomescent', successTier: 'Strong', bundleRevContrib: '59.9%', passed: 'Yes' },
    { store: '14daymani-ie', successTier: 'Strong', bundleRevContrib: '27.8%', passed: 'Yes' },
    { store: 'gellae', successTier: 'Strong', bundleRevContrib: '51.2%', passed: 'Yes' },
  ]

  const subRulesData = [
    { subRule: 'Premium Curated', condition: 'Price band = high', storeValue: 'low', required: 'high', triggered: 'No' },
    { subRule: 'Premium Curated', condition: 'Revenue concentration <15%', storeValue: '14.2%', required: '<15%', triggered: 'Yes (but price band failed)' },
    { subRule: 'Premium Curated', condition: 'AOV >= 1.8x median price', storeValue: '$40.73 vs $8.98', required: '>= $8.98', triggered: 'Yes (but price band failed)' },
    { subRule: 'Inventory Tail', condition: 'Revenue concentration >=25%', storeValue: '14.2%', required: '>=25%', triggered: 'No' },
    { subRule: 'Shade Catalog', condition: 'Complementarity >=0.5', storeValue: '0.42', required: '>=0.5', triggered: 'No' },
  ]

  const productsSelectedData = [
    { product: '1kg Wunschtute', revenue: '$341.82', grade: 'A' },
    { product: '500g Wunschtute', revenue: '$109.90', grade: 'A' },
    { product: '1kg Wunschbottle', revenue: '$95.96', grade: 'A' },
  ]

  const abcData = [
    { grade: 'A', skuCount: '23', revenueShare: '73.7%' },
    { grade: 'B', skuCount: '34', revenueShare: '19.9%' },
    { grade: 'C', skuCount: '56', revenueShare: '6.4%' },
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-slate-800 dark:text-slate-200 leading-relaxed">

      {/* ─── Title + Copy ─── */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold">Case Study: 83a38c-0c.myshopify.com</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-500 dark:text-slate-400">
        <p className="mb-0">Industry: Food &amp; Gourmet | Archetype: MID_HIGH_COMP | Date onboarded: 2026-03-02</p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

        {/* ─── The Store ─── */}
        <h2 className="text-2xl font-semibold mb-4">The Store</h2>
        <p className="mb-6">A German-language confectionery and sweets store selling chocolates, candies, freeze-dried snacks, ice cream, and baked goods. With 223 products and a median price of just under five euros, this is a high-volume, low-price-point catalog where customers tend to fill their carts with multiple items. The store operates in EUR currency.</p>

        {/* ─── Phase 0: Data Quality ─── */}
        <h2 className="text-2xl font-semibold mb-4">Phase 0: Data Quality</h2>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Check</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Verdict', 'OK'],
              ['Outliers found', 'No'],
              ['Orders removed', '0'],
              ['Test products detected', 'None'],
            ].map(([check, result], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{check}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><strong>{result}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6">The data was clean. Raw and cleaned metrics were identical — no adjustments were needed.</p>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Revenue (60-day)', '$2,403'],
              ['Orders (60-day)', '59'],
              ['AOV', '$40.73'],
              ['Revenue concentration', '14.2%'],
              ['First-time AOV', '$40.58'],
              ['Repeat AOV', '$41.46'],
            ].map(([metric, value], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{metric}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ─── Phase 1: Store Profile ─── */}
        <h2 className="text-2xl font-semibold mb-4">Phase 1: Store Profile</h2>
        <p className="mb-6">The system assigned the <strong>MID_HIGH_COMP</strong> archetype based on three inputs:</p>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Input</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bucket</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['SKU count', '223', 'MID (mid-size catalog)'],
              ['Complementarity score', '0.4227 (42%)', 'HIGH (products pair well together)'],
              ['Price band', 'low ($4.99 median)', 'low'],
            ].map(([input, value, bucket], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{input}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{bucket}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6"><strong>Result:</strong> skuCount=223 maps to MID, complementarity=0.42 maps to HIGH, yielding MID_HIGH_COMP.</p>

        <p className="mb-3">Key metrics driving the recommendation:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>78% of orders contained 3 or more items (46 out of 59 orders)</li>
          <li>Only 14% of the store&apos;s repeat customers — most buyers are one-time</li>
          <li>Revenue is spread broadly across products (14.2% concentration — no hero product dominating)</li>
        </ul>

        {/* ─── Phase 2: Finding Similar Stores ─── */}
        <h2 className="text-2xl font-semibold mb-4">Phase 2: Finding Similar Stores</h2>
        <p className="mb-6">The system queried <strong>18 reference stores</strong> with the same MID_HIGH_COMP archetype.</p>

        <h3 className="text-xl font-semibold mb-3">Top 5 Matches by Similarity Score</h3>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Similarity</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">SKU Proximity</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Complementarity Match</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Price Match</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Success Tier</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Revenue Contribution</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Dominant Strategy</th>
              </tr>
            </thead>
            <tbody>
              {topMatchesData.map((row, i) => (
                <tr key={i}>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.store}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><strong>{row.similarity}</strong></td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.skuProx}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.compMatch}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.priceMatch}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.successTier}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.bundleRevContrib}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2" dangerouslySetInnerHTML={{ __html: row.dominantStrategy }} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mb-3">Success Filter</h3>
        <p className="mb-6">The filter required stores to have either a &quot;strong&quot; success tier or a bundle revenue contribution above 20%. <strong>5 out of 18 candidates passed</strong> (minimum required: 3).</p>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Success Tier</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bundle Revenue Contribution</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Passed</th>
            </tr>
          </thead>
          <tbody>
            {successFilterData.map((row, i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.store}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.successTier}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.bundleRevContrib}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.passed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="text-xl font-semibold mb-3">Final Matched Stores</h3>
        <p className="mb-3">The top 3 from the success-filtered pool were selected:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li><strong>city-pop</strong> — 93.2% similarity, 65.5% bundle contribution (Fixed Bundle Price)</li>
          <li><strong>uniko-2</strong> — 85.6% similarity, 32.2% bundle contribution (Classic)</li>
          <li><strong>handsomescent</strong> — 84.2% similarity, 59.9% bundle contribution (Volume Discount)</li>
        </ol>

        {/* ─── Phase 3: The Recommendation ─── */}
        <h2 className="text-2xl font-semibold mb-4">Phase 3: The Recommendation</h2>
        <p className="mb-6">The system walked through a waterfall of decision layers. Here is what happened at each step:</p>

        <h3 className="text-xl font-semibold mb-3">Layer 1: Units-Per-Order Behavioral Check</h3>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Threshold</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3+ item order share</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><strong>78%</strong></td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Structural signal: 60%</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-3">With 46 out of 59 orders containing 3 or more items, the store showed a &quot;structural&quot; multi-item signal — the strongest level. The thresholds are:</p>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>60%+ = structural (strongest)</li>
          <li>50%+ = strong</li>
          <li>30%+ = mild</li>
        </ul>

        <p className="mb-6"><strong>Result:</strong> Structural signal detected. This triggers a behavioral override.</p>

        <h3 className="text-xl font-semibold mb-3">Layer 2: Archetype Sub-Rules</h3>
        <p className="mb-6">The system also evaluated archetype-specific sub-rules, but none triggered:</p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Sub-Rule</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Condition</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Store Value</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Required</th>
                <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Triggered?</th>
              </tr>
            </thead>
            <tbody>
              {subRulesData.map((row, i) => (
                <tr key={i}>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.subRule}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.condition}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.storeValue}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.required}</td>
                  <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.triggered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mb-6">None of the sub-rules passed all their conditions.</p>

        <h3 className="text-xl font-semibold mb-3">Layer 3: Behavioral Override (FINAL DECISION)</h3>
        <p className="mb-6">Because the 3+ item share (78%) exceeded the structural threshold (60%), the system applied a <strong>behavioral override</strong> and recommended <strong>Volume Discount</strong> — regardless of what the matched stores voted for.</p>
        <p className="mb-6">The logic: when nearly 4 out of 5 orders already contain multiple items, the customer behavior strongly signals that a &quot;buy more, save more&quot; approach will work.</p>

        <h3 className="text-xl font-semibold mb-3">Layer 4: Viability Check</h3>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Check</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Products with revenue data', '85'],
              ['Minimum required', '3'],
              ['Override needed?', 'No'],
            ].map(([check, value], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{check}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6">The catalog had 85 products with sales data — far above the 3-product minimum. The Volume Discount mechanism was confirmed.</p>

        {/* ─── The Bundle ─── */}
        <h2 className="text-2xl font-semibold mb-4">The Bundle</h2>
        <p className="mb-6"><strong>Mechanism:</strong> Volume Discount (Buy 2 get 10% off, Buy 3 get 20% off)</p>

        <h3 className="text-xl font-semibold mb-3">Products Selected</h3>
        <p className="mb-6">The system used the &quot;standard&quot; selection rule, picking 3 Grade A products:</p>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Product</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Revenue (60-day)</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade</th>
            </tr>
          </thead>
          <tbody>
            {productsSelectedData.map((row, i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.product}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.revenue}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6">These were selected from a pool of 113 products with sales data: 30 Grade A, 31 Grade B, and 52 Grade C.</p>

        <h3 className="text-xl font-semibold mb-3">ABC Analysis</h3>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">SKU Count</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Revenue Share</th>
            </tr>
          </thead>
          <tbody>
            {abcData.map((row, i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.grade}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.skuCount}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{row.revenueShare}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-6">The bottom 50% of products by revenue accounted for only 6.4% of total revenue — a typical long-tail distribution.</p>

        <h3 className="text-xl font-semibold mb-3">Pricing Logic</h3>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Tier</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Quantity</th>
              <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Discount</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['1', 'Buy 2', '10% off'],
              ['2', 'Buy 3', '20% off'],
            ].map(([tier, quantity, discount], i) => (
              <tr key={i}>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{tier}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{quantity}</td>
                <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{discount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ─── What the Merchant Saw ─── */}
        <h2 className="text-2xl font-semibold mb-4">What the Merchant Saw</h2>
        <p className="mb-3">The 7-step onboarding journey presented these messages:</p>
        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li><strong>Analyzing your catalog</strong> — &quot;Found 223 products across your store. Your Food &amp; Gourmet store has a median price of $5 with 42% complementarity — some natural product pairings.&quot;</li>
          <li><strong>Analyzing your sales</strong> — &quot;59 orders generating $2,403 in the last 60 days. Average order value of $41 with a 17% repeat rate.&quot;</li>
          <li><strong>Finding similar stores</strong> — &quot;Matched with 3 successful stores in your category. We found 18 stores with a similar profile and narrowed to 5 with proven bundle success. Your closest match has a 93% similarity score.&quot;</li>
          <li><strong>Building your strategy</strong> — &quot;Volume Discount — best fit for your store type. Based on analysis of your store profile, Volume Discount is the strongest strategy for your catalog shape and customer behavior.&quot;</li>
          <li><strong>Selecting products</strong> — &quot;3 products selected from 113 with sales data. All top performers — your highest revenue products.&quot;</li>
          <li><strong>Setting pricing</strong> — &quot;Buy 2 get 10% off, Buy 3 get 20% off. Volume pricing encourages customers to add one more item to their cart.&quot;</li>
          <li><strong>Your bundle is ready</strong> — &quot;Your 223-product Food &amp; Gourmet catalog is built for volume. At your current $1,202/mo, bundles could add an estimated $300/mo.&quot;</li>
        </ol>

        {/* ─── Key Takeaway ─── */}
        <h2 className="text-2xl font-semibold mb-4">Key Takeaway</h2>
        <p className="mb-6">This case study demonstrates the <strong>behavioral override</strong> path — the strongest signal in the recommendation waterfall. Even though the matched stores used a mix of strategies (Fixed Bundle Price, Classic, and Volume Discount), the system bypassed the voting process entirely because the store&apos;s own purchasing data told a clear story: 78% of orders already contained 3+ items. When customer behavior is this decisive, the system trusts the store&apos;s own data over what similar stores are doing. This is the right call — a Volume Discount directly rewards the behavior these customers are already exhibiting.</p>

      </div>
    </div>
  )
}
