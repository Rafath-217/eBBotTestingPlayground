import { useRef, useState } from 'react'

export default function CaseStudy9cfda4Page() {
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
        <h1 className="text-3xl font-bold">Case Study: 9cfda4-f5.myshopify.com</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 text-slate-500 dark:text-slate-400 italic">
        Industry: Health &amp; Wellness | Archetype: SMALL_LOW_COMP | Date onboarded: 2026-03-03
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── The Store ─── */}
      <h2 className="text-2xl font-semibold mb-4">The Store</h2>
      <p className="mb-6">
        A high-volume health and wellness store specializing in nasal strips and sleep products. With only 21 products but over 4,400 orders in 60 days generating more than $150,000 in revenue, this is a focused, fast-moving catalog. Products come in color variants (Black, Pink, Transparent) across a few core product lines — nasal strips (Daily, Sport, Small), mouth tape, sleep masks, and prep cases. The store operates on the Shopify Professional plan and transacts in EUR.
      </p>

      {/* ─── Phase 0: Data Quality ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 0: Data Quality</h2>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Check</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Result</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Verdict', <strong key="v">OK</strong>],
            ['Outliers found', 'Yes'],
            ['Orders removed', '2'],
            ['Threshold used', 'min(P95 x 5, median x 10) = $325'],
            ['Test products detected', 'None'],
          ] as [string, React.ReactNode][]).map(([check, result], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{check}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3">Two unusually large orders above $325 were detected and removed. Here is how the metrics changed:</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Before Cleaning</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">After Cleaning</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Change</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Revenue (60-day)', '$152,536', '$151,506', '-$1,030'],
            ['Orders (60-day)', '4,426', '4,424', '-2'],
            ['AOV', '$34.46', '$34.25', '-$0.21'],
            ['Revenue concentration', '42.7%', '43.0%', '+0.3pp'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">
        The impact was minimal — the two outlier orders represented less than 1% of revenue. First-time AOV ($34.95) and repeat AOV ($28.51) were unchanged.
      </p>

      {/* ─── Phase 1: Store Profile ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 1: Store Profile</h2>
      <p className="mb-3">The system assigned the <strong>SMALL_LOW_COMP</strong> archetype based on three inputs:</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Input</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Bucket</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['SKU count', '21', 'SMALL (focused catalog)'],
            ['Complementarity score', '0 (0%)', 'LOW (products don\u2019t naturally pair)'],
            ['Price band', 'low ($21.99 median)', 'low'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3"><strong>Result:</strong> skuCount=21 maps to SMALL, complementarity=0.00 maps to LOW, yielding SMALL_LOW_COMP.</p>

      <p className="mb-3">
        This is noteworthy: despite having a $22 median price, the store lands in the &quot;low&quot; price band. The zero complementarity score reflects that the products are mostly variants of the same core items (nasal strips in different colors), not items that complement each other.
      </p>

      <p className="mb-3">Key metrics driving the recommendation:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>4,424 orders in 60 days — an extremely high-volume store</li>
        <li>Only 36% of orders contained 3+ items (not enough to trigger a volume discount override)</li>
        <li>43% revenue concentration — the top product accounts for nearly half of all revenue</li>
        <li>8% repeat rate — most customers are one-time buyers</li>
      </ul>

      {/* ─── Phase 2: Finding Similar Stores ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 2: Finding Similar Stores</h2>
      <p className="mb-6">
        The system queried <strong>6 reference stores</strong> with the same SMALL_LOW_COMP archetype — a much smaller pool than typical, reflecting that focused low-complementarity catalogs are less common.
      </p>

      <h3 className="text-xl font-semibold mb-3">Top 5 Matches by Similarity Score</h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              {['Store', 'Similarity', 'SKU Proximity', 'Complementarity Match', 'Price Match', 'Success Tier', 'Bundle Revenue Contribution', 'Dominant Strategy'].map(h => (
                <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ['humby-organics.myshopify.com', '87.2%', '84.6%', '87.9%', '91.0%', 'Weak', '0.7%', 'Classic'],
              ['the-farmers-dog-uk.myshopify.com', '86.8%', '83.4%', '85.7%', '95.5%', 'Strong', '43.5%', 'Classic'],
              ['justin-schmidt.myshopify.com', '82.2%', '89.6%', '84.1%', '63.7%', 'Strong', '28.9%', 'Fixed Bundle Price'],
              ['c69f09.myshopify.com', '79.7%', '89.3%', '73.4%', '73.3%', 'Moderate', '6.9%', 'Classic'],
              ['vpdtg1-11.myshopify.com', '78.4%', '79.1%', '100%', '33.9%', 'Moderate', '89.5%', 'Classic'],
            ] as string[][]).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">
                    {j === 1 ? <strong>{cell}</strong> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mb-6">
        The most similar store (humby-organics, 87.2%) was actually the weakest performer — only 0.7% bundle revenue contribution. The system needed to look deeper.
      </p>

      <h3 className="text-xl font-semibold mb-3">Success Filter</h3>
      <p className="mb-3">
        The filter required stores to have either a &quot;strong&quot; success tier or a bundle revenue contribution above 20%. <strong>3 out of 6 candidates passed</strong> — exactly the minimum required.
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Store', 'Success Tier', 'Bundle Revenue Contribution', 'Passed'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['humby-organics', 'Weak', '0.7%', 'No'],
            ['the-farmers-dog-uk', 'Strong', '43.5%', 'Yes'],
            ['justin-schmidt', 'Strong', '28.9%', 'Yes'],
            ['c69f09', 'Moderate', '6.9%', 'No'],
            ['vpdtg1-11', 'Moderate', '89.5% (threshold: 20%)', 'Yes'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">
        Note that humby-organics, despite being the closest match, was filtered out because its bundles generated almost no revenue. The system correctly prioritized proven success over raw similarity.
      </p>

      <h3 className="text-xl font-semibold mb-3">Final Matched Stores</h3>
      <p className="mb-3">The 3 stores that passed the success filter became the final matches:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>the-farmers-dog-uk</strong> — 86.8% similarity, 43.5% bundle contribution (Classic)</li>
        <li><strong>justin-schmidt</strong> — 82.2% similarity, 28.9% bundle contribution (Fixed Bundle Price)</li>
        <li><strong>vpdtg1-11</strong> — 78.4% similarity, 89.5% bundle contribution (Classic)</li>
      </ol>

      {/* ─── Phase 3: The Recommendation ─── */}
      <h2 className="text-2xl font-semibold mb-4">Phase 3: The Recommendation</h2>
      <p className="mb-6">The system walked through a waterfall of decision layers. Here is what happened at each step:</p>

      <h3 className="text-xl font-semibold mb-3">Layer 1: Units-Per-Order Behavioral Check</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Metric', 'Value', 'Threshold'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white dark:bg-slate-900">
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">3+ item order share</td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2"><strong>36%</strong></td>
            <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">Structural signal: 60%</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-3">
        With 1,616 out of 4,489 orders containing 3+ items, the signal was classified as &quot;mild&quot; (between 30% and 50%). This was not strong enough to trigger a behavioral override.
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Signal Level', 'Threshold', 'Store\u2019s Value', 'Triggered?'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['Structural', '60%', '36%', 'No'],
            ['Strong', '50%', '36%', 'No'],
            ['Mild', '30%', '36%', 'Yes (but does not override)'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Layer 2: Matched Stores Vote</h3>
      <p className="mb-3">Since no behavioral override fired, the system used the matched stores&apos; strategies to vote:</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Store', 'Vote', 'Weight'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['the-farmers-dog-uk', 'Classic', '1'],
            ['justin-schmidt', 'Fixed Bundle Price', '1'],
            ['vpdtg1-11', 'Classic', '1'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3"><strong>Vote tally:</strong> Classic = 2, Fixed Bundle Price = 1</p>
      <p className="mb-6"><strong>Winner:</strong> Classic (majority vote)</p>

      <h3 className="text-xl font-semibold mb-3">Layer 3: Vote Confidence</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Check', 'Value', 'Threshold'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['Vote share', '66.7% (2 of 3 voters)', '60%'],
            ['Behavioral signal', 'mild', '\u2014'],
            ['Trusted?', 'Yes', '\u2014'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">The Classic vote achieved 66.7% share, above the 60% confidence threshold. The system trusted the vote.</p>

      <h3 className="text-xl font-semibold mb-3">Layer 4: Viability Check</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Check', 'Value'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['Products with revenue data', '17'],
            ['Minimum required', '3'],
            ['Override needed?', 'No'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">The catalog had 17 products with sales data. The Fixed Bundle mechanism (mapped from Classic) was confirmed.</p>

      {/* ─── The Bundle ─── */}
      <h2 className="text-2xl font-semibold mb-4">The Bundle</h2>
      <p className="mb-6"><strong>Mechanism:</strong> Fixed Bundle (Curated Bundle at $57.72 — about 12.5% off buying separately)</p>

      <h3 className="text-xl font-semibold mb-3">Products Selected</h3>
      <p className="mb-3">
        The system used the &quot;standard&quot; selection rule, picking 3 Grade A and 2 Grade B products:
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Product', 'Revenue (Lifetime)', 'Grade'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['Nasal Strips - Daily, Transparent', '$65,160', 'A'],
            ['Nasal Strips - Daily, Black', '$43,074', 'A'],
            ['Nasal Strips - Sport, Black', '$24,062', 'A'],
            ['Mouth Tape - Daily, Black', '$13,586', 'B'],
            ['Sleepmask Black, 22 Momme Mulberry Silk', '$7,315', 'B'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">These were selected from a pool of 17 products with sales data: 4 Grade A, 6 Grade B, and 7 Grade C.</p>

      <h3 className="text-xl font-semibold mb-3">ABC Analysis</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Grade', 'SKU Count', 'Revenue Share'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['A', '3 (in profile) / 4 (in decision trace)', '65.5%'],
            ['B', '5 (in profile) / 6 (in decision trace)', '25.6%'],
            ['C', '9 (in profile) / 7 (in decision trace)', '8.9%'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">The revenue is heavily concentrated in a few products — the top 3 Grade A products drive nearly two-thirds of all revenue.</p>

      <h3 className="text-xl font-semibold mb-3">Pricing Logic</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-6">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {['Component', 'Value'].map(h => (
              <th key={h} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ['Pricing type', 'Fixed Bundle'],
            ['Suggested bundle price', '$57.72'],
            ['Discount', '12.5% off buying separately'],
            ['Calculation', '3 x $21.99 = $65.97 separately'],
          ] as string[][]).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ─── What the Merchant Saw ─── */}
      <h2 className="text-2xl font-semibold mb-4">What the Merchant Saw</h2>
      <p className="mb-3">The 7-step onboarding journey presented these messages:</p>

      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Analyzing your catalog</strong> — &quot;Found a focused catalog of 21 products. Your Health &amp; Wellness store has a median price of $22 with 0% complementarity — products are mostly standalone.&quot;</li>
        <li><strong>Analyzing your sales</strong> — &quot;4424 orders generating $151,506 in the last 60 days. Average order value of $34 with a 8% repeat rate. We cleaned 2 unusual orders to get an accurate picture.&quot;</li>
        <li><strong>Finding similar stores</strong> — &quot;Matched with 3 successful stores in your category. We found 6 stores with a similar profile and narrowed to 3 with proven bundle success. Your closest match has a 87% similarity score.&quot;</li>
        <li><strong>Building your strategy</strong> — &quot;Curated Bundle — validated by similar successful stores. Based on analysis of your store profile, Curated Bundle is the strongest strategy for your catalog shape and customer behavior.&quot;</li>
        <li><strong>Selecting products</strong> — &quot;5 products selected from 17 with sales data. 3 bestsellers and 2 strong performers — a proven mix.&quot;</li>
        <li><strong>Setting pricing</strong> — &quot;Bundle price: $58. That&apos;s 10-15% below buying each product separately — an easy yes for your customers.&quot;</li>
        <li><strong>Your bundle is ready</strong> — &quot;Your Health &amp; Wellness catalog of 21 products has strong bundling potential. We&apos;ve picked your best-performing products — 3 bestsellers and 2 complementary items.&quot;</li>
      </ol>

      <p className="mb-6">The estimated monthly upside shown was $18,938 — reflecting the store&apos;s high order volume.</p>

      {/* ─── Key Takeaway ─── */}
      <h2 className="text-2xl font-semibold mb-4">Key Takeaway</h2>
      <p className="mb-6">
        This case study demonstrates the <strong>successful matches voting</strong> path — the system&apos;s collaborative filtering approach. Unlike the behavioral override path (where a store&apos;s own data is so decisive it overrides everything), this store had a mild multi-item signal (36%) that was not strong enough to dictate the strategy. Instead, the system found 3 reference stores with proven bundle success and let them vote. Two out of three successful peers used Classic bundles, giving the system enough confidence (66.7%, above the 60% threshold) to recommend a Curated Bundle. The success filter was critical here: the most similar store overall (humby-organics at 87.2%) was filtered out because its bundles barely generated revenue, while a less similar but far more successful store (vpdtg1-11 at 78.4% similarity but 89.5% bundle contribution) was kept in. This shows the system correctly prioritizes &quot;what works&quot; over &quot;what looks similar.&quot;
      </p>

      </div>
    </div>
  )
}
