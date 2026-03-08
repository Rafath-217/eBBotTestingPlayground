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
        <h1 className="text-3xl font-bold">Store Profiling -- PM Handoff</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-500 dark:text-slate-400">
        <p className="mb-1"><strong>Audience</strong>: Product managers, non-technical stakeholders</p>
        <p className="mb-0"><strong>Related docs</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_FAQ_PROFILING.md</code> (Q&amp;A), <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_HANDOFF_ONBOARDING.md</code> (how onboarding uses these profiles), <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">README.md</code> (technical)</p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── Quick Reference ─── */}
      <h2 className="text-2xl font-semibold mb-4">Quick Reference: Profiling Thresholds</h2>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Value</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Plain English</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Products analyzed per store (max)', '1,000', 'We look at up to 1,000 products'],
            ['Orders analyzed per store (max)', '50,000', 'Safety cap for very large stores'],
            ['Performance window', '60 days', 'All sales metrics use a rolling 2-month window'],
            ['Low price band', 'Under $25 median', 'Affordable / impulse-buy products'],
            ['High price band', 'Over $100 median', 'Premium / considered-purchase products'],
            ['Small store', 'Under 100 SKUs', ''],
            ['Large store', 'Over 500 SKUs', ''],
            ['Low catalog diversity', 'Under 0.3', 'Most products are the same type'],
            ['High catalog diversity', '0.3 or above', 'Products spread across multiple types'],
            ['Strong tier: bundle contribution', '12%+', 'Bundles drive at least 12% of total revenue'],
            ['Strong tier: attach rate', '5%+', 'At least 5% of orders include a bundle'],
            ['Strong tier: stability', '0.6+', 'Revenue is consistent month to month'],
            ['Strong tier: revenue floor', '$50,000 / 60 days', 'Must be a meaningfully-sized store'],
            ['Moderate tier: bundle contribution', '5%+', 'Only this one condition'],
          ].map(([what, value, plain], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{what}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{value}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{plain}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── What Is Store Profiling? ─── */}
      <h2 className="text-2xl font-semibold mb-4">What Is Store Profiling?</h2>
      <p className="mb-4">
        The store profiling pipeline analyzes the top ~100 Shopify stores that use EasyBundles and builds a structured profile for each one. These profiles become our <strong>reference library</strong> -- the database of successful stores that new stores get compared against during onboarding.
      </p>
      <p className="mb-4">
        Think of it like building a database of healthy patients at a doctor's office. We measure every vital sign so that when a new patient walks in, we can compare them to similar healthy patients and prescribe the right treatment.
      </p>
      <p className="mb-4">
        The pipeline runs <strong>5 jobs in order</strong>:
      </p>
      <pre className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-4 text-sm font-mono mb-8 overflow-x-auto">
        <code>{`Job 1: What does this store sell?       (catalog)
Job 2: How is it performing?            (60-day sales)
Job 3: How are its bundles doing?       (bundle revenue)
Job 4: What bundle strategy does it use?(bundle config)
Job 5: What type of store is it?        (archetype + audit)
     ↓
Stored as REFERENCE profiles`}</code>
      </pre>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Running Example ─── */}
      <h2 className="text-2xl font-semibold mb-4">Running Example</h2>
      <p className="mb-4">
        Throughout this doc we'll follow: <strong>83a38c-0c.myshopify.com</strong> -- a German candy and beverage shop.
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <tbody>
          {[
            ['Products', '223 SKUs, median price $4.99'],
            ['Sales', '$2,403 over 60 days, 59 orders, $40.73 average order'],
            ['Customer behavior', '78% of orders have 3+ items, 17% repeat rate'],
            ['Industry', 'Food & Gourmet / Beverages'],
            ['Store type', 'MID_HIGH_COMP (mid-size catalog, diverse products)'],
          ].map(([field, value]) => (
            <tr key={field}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{field}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 1 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 1: "What Does This Store Sell?"</h2>

      <h3 className="text-xl font-semibold mb-3 mt-6">What happens</h3>
      <p className="mb-4">
        We pull the store's product catalog from Shopify and analyze it across four dimensions: pricing, catalog diversity, industry, and store type.
      </p>

      <h3 className="text-xl font-semibold mb-3">What counts as a "product"</h3>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>Only active products</strong> -- draft and archived products are completely ignored</li>
        <li>We analyze up to <strong>1,000 products</strong> per store (if they have more, we use the first 1,000)</li>
        <li>If a store has <strong>zero active products</strong>, this job fails and we move on</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">How pricing works</h3>
      <p className="mb-4">
        For each product, we take the <strong>cheapest variant's price</strong> (e.g., if a shirt comes in S/$10, M/$15, L/$20, we use $10). This gives the most conservative view of the store's pricing.
      </p>
      <p className="mb-2"><strong>What's excluded from pricing:</strong></p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Variants priced at $0.00 (free gifts, test products) are filtered out</li>
        <li>Products where ALL variants are $0 are excluded from price math (but still counted in the SKU total)</li>
      </ul>
      <p className="mb-2">We then compute:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>Median price</strong> -- the "typical" product price. We use the median (middle value) instead of the average so that one expensive gift set in a store full of $5 candies doesn't skew the number.</li>
        <li><strong>Price band</strong> -- a simple label:</li>
      </ul>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Band</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Rule</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Example stores</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Low', 'Median price under $25', 'Candy shops, accessories'],
            ['Mid', 'Median price $25-$100', 'Apparel, skincare'],
            ['High', 'Median price over $100', 'Furniture, luxury goods'],
          ].map(([band, rule, example]) => (
            <tr key={band}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{band}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{rule}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{example}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">
        <strong>83a38c-0c</strong>: Median $4.99 = <strong>Low</strong> price band.
      </p>

      <h3 className="text-xl font-semibold mb-3">How catalog diversity is measured</h3>
      <p className="mb-4">
        We look at how a store's products are spread across different product types. Think of it this way:
      </p>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-500 dark:text-slate-400">
        <p className="mb-1"><strong>Store A</strong> sells 100 products, all coffee. Diversity = 0 (no variety at all).</p>
        <p className="mb-1"><strong>Store B</strong> sells 100 products: 25 coffees, 25 mugs, 25 cookies, 25 gift sets. Diversity = 1.0 (maximum variety).</p>
        <p className="mb-0"><strong>Most real stores</strong> fall somewhere in the 0.3-0.7 range.</p>
      </blockquote>
      <p className="mb-4">
        We call this the <strong>catalog diversity score</strong> (0 to 1). Products with no type assigned are grouped under "Other."
      </p>
      <p className="mb-2"><strong>Why this matters for bundling:</strong></p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>High diversity (0.3+)</strong>: Natural fit for mix-and-match bundles -- customers can combine products from different categories</li>
        <li><strong>Low diversity (under 0.3)</strong>: Better suited for volume discounts -- "buy more of the same thing, save more"</li>
      </ul>
      <p className="mb-6">
        <strong>83a38c-0c</strong>: Diversity score of 0.42 (moderate). They sell candy, beverages, snacks, and gift sets, but candy dominates.
      </p>

      <h3 className="text-xl font-semibold mb-3">How industry is classified</h3>
      <p className="mb-4">
        An AI classifies the store into one of <strong>50 predefined industries</strong> (e.g., "Beauty &amp; Cosmetics," "Food &amp; Gourmet," "Fashion &amp; Apparel") using a two-step process:
      </p>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li><strong>First pass</strong>: The AI looks at product types and sample product titles, then picks an industry + sub-industry</li>
        <li><strong>Verification pass</strong>: A second AI call reviews the first answer, either confirms or corrects it, and assigns a confidence score (0-100%)</li>
      </ol>
      <p className="mb-4">
        If the two passes disagree, the verification pass wins. If someone on our team has <strong>manually verified</strong> a store's industry, the AI step is skipped on future runs.
      </p>
      <p className="mb-6">
        <strong>83a38c-0c</strong>: Food &amp; Gourmet / Beverages, 95% confidence. Both AI passes agreed.
      </p>

      <h3 className="text-xl font-semibold mb-3">How stores are bucketed into types (archetypes)</h3>
      <p className="mb-4">
        Every store gets an <strong>archetype</strong> -- a label that summarizes "what kind of store is this?" based on catalog size, diversity, and price band:
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Archetype</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Who fits here</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Typical examples</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Default bundle type</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['SMALL_LOW_COMP', 'Small catalog (<100 SKUs), single-product focus', 'DTC supplement brand', 'Volume Discount'],
            ['SMALL_HIGH_COMP', 'Small catalog, diverse products', 'Curated boutique, gift shop', 'Fixed Bundle Price'],
            ['MID_HIGH_COMP', 'Mid-size catalog (100-500 SKUs), diverse', 'Most mid-market Shopify stores', 'Mix & Match'],
            ['LARGE_LOW_PRICE', 'Large catalog (500+ SKUs), low price point', 'High-volume discount retailers', 'Volume Discount'],
            ['MID_LARGE_HIGH_COMP', 'Everything else', 'Large diverse catalogs', 'Mix & Match'],
          ].map(([arch, who, typical, bundle]) => (
            <tr key={arch}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{arch}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{who}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{typical}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{bundle}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-4">
        <strong>Why Large stores don't use diversity</strong>: When you have 500+ products, almost every store has high diversity just by volume. So for large stores, we use the price band instead to differentiate.
      </p>
      <p className="mb-4">
        <strong>Why "everything else" for MID_LARGE_HIGH_COMP</strong>: This is the catch-all bucket. It captures mid-size stores with low diversity and large stores with higher price points. The Mix &amp; Match default works broadly for these.
      </p>
      <p className="mb-8">
        <strong>83a38c-0c</strong>: 223 SKUs (Mid) + 0.42 diversity (High) = <strong>MID_HIGH_COMP</strong>.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 2 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 2: "How Is This Store Performing?"</h2>

      <h3 className="text-xl font-semibold mb-3 mt-6">What happens</h3>
      <p className="mb-4">
        We pull the store's order data from Shopify for the last 60 days and compute sales metrics, customer behavior, and product-level performance.
      </p>

      <h3 className="text-xl font-semibold mb-3">Which orders count (and which don't)</h3>
      <p className="mb-4">Not every Shopify order makes it into our analysis:</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Order type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Counted?</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Why</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Paid orders', 'YES', 'Core revenue data'],
            ['Cancelled but paid (no refund issued)', 'YES', 'The payment was real revenue'],
            ['Fully refunded orders', 'NO', 'Money was returned'],
            ['Partially refunded orders', 'NO', 'Excluded to keep data clean'],
            ['Pending / authorized (not yet paid)', 'NO', "Payment hasn't cleared"],
            ['Test orders', 'NO', 'Not real transactions'],
          ].map(([type, counted, why], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{type}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{counted}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">
        <strong>In plain English</strong>: We only count orders where money actually changed hands <strong>and stayed</strong> with the merchant.
      </p>

      <h3 className="text-xl font-semibold mb-3">What we measure</h3>

      <h4 className="text-lg font-semibold mb-2">Revenue &amp; orders</h4>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">83a38c-0c</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Total revenue (60d)', 'Sum of all qualifying order totals', '$2,403.08'],
            ['Total orders (60d)', 'Count of qualifying orders', '59'],
            ['Average order value (AOV)', 'Revenue divided by orders', '$40.73'],
          ].map(([metric, meaning, value], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{metric}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="text-lg font-semibold mb-2">Customer behavior</h4>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">83a38c-0c</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Repeat rate', 'What % of orders come from returning customers', '16.95%'],
            ['First-time AOV', "Average spend for a customer's first-ever order", '$40.58'],
            ['Repeat AOV', 'Average spend for returning customer orders', '$41.46'],
          ].map(([metric, meaning, value], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{metric}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="text-lg font-semibold mb-2">Revenue concentration</h4>
      <p className="mb-4">
        What percentage of total revenue comes from the <strong>single best-selling product</strong>. Under 15% = healthy. Over 25% = "hero product" dependency.
      </p>
      <p className="mb-6">
        <strong>83a38c-0c</strong>: 14.22% -- healthy, no single product dominates.
      </p>

      <h4 className="text-lg font-semibold mb-2">Basket size (units per order)</h4>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Category</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Definition</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">83a38c-0c</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Single-item orders', '1 unit total', '5 orders (8%)'],
            ['Two-item orders', 'Exactly 2 units', '8 orders (14%)'],
            ['Multi-item orders', '3 or more units', '46 orders (78%)'],
          ].map(([cat, def_, val], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{cat}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{def_}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">
        This metric drives the highest-priority decision in the onboarding recommendation engine.
      </p>

      <h4 className="text-lg font-semibold mb-2">ABC product grading</h4>
      <p className="mb-2">Products ranked by 60-day revenue, split into three tiers:</p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Grade</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Which products</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Purpose</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">83a38c-0c</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['A', 'Top 20% by count', 'Revenue drivers -- picked first for bundles', '30 products'],
            ['B', 'Next 30%', 'Solid mid-tier', '31 products'],
            ['C', 'Bottom 50%', 'Long tail -- bundled with bestsellers to drive discovery', '52 products'],
          ].map(([grade, which, purpose, val], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{grade}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{which}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{purpose}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-mono">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 3 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 3: "How Well Are Their Bundles Doing?"</h2>

      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-500 dark:text-slate-400">
        <p><strong>Note</strong>: Only runs for <strong>reference stores</strong> (stores already using bundles). New stores skip this.</p>
      </blockquote>

      <h3 className="text-xl font-semibold mb-3">What happens</h3>
      <p className="mb-4">
        Reads from our internal analytics database to measure how well the store's EasyBundles perform over a 60-day window.
      </p>

      <h3 className="text-xl font-semibold mb-3">How cancelled orders are handled here</h3>
      <p className="mb-2"><strong>Different from Job 2:</strong></p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>Job 2</strong>: Cancelled/refunded orders are filtered out at the Shopify level -- we never see them</li>
        <li><strong>Job 3</strong>: We start with total revenue and <strong>subtract</strong> cancelled order revenue ourselves</li>
      </ul>
      <p className="mb-6">
        Same end result -- cancelled orders don't inflate metrics -- different mechanism.
      </p>

      <h3 className="text-xl font-semibold mb-3">What we measure</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Metric</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it means</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Bundle revenue (60d)', 'Total bundle revenue after subtracting cancellations'],
            ['Bundle orders (60d)', 'Total bundle orders'],
            ['Bundle revenue contribution', 'Bundle revenue as % of total store revenue'],
            ['Attach rate', 'Bundle orders as % of total store orders'],
            ['Stability score', 'How consistent bundle revenue is month-over-month'],
          ].map(([metric, meaning], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{metric}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-6">
        <strong>Stability score</strong>: Ratio of the smaller month to the larger month (last 2 full months). Score of 1.0 = perfectly stable. Score of 0 = one month had zero revenue.
      </p>

      <h3 className="text-xl font-semibold mb-3">Success tiers</h3>
      <p className="mb-2">
        <strong>Strong</strong> (ALL 4 must be true): 12%+ bundle contribution, 5%+ attach rate, 0.6+ stability, $50k+ total revenue.
      </p>
      <p className="mb-2">
        <strong>Moderate</strong>: 5%+ bundle contribution only.
      </p>
      <p className="mb-8">
        <strong>Weak</strong>: Everything else.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 4 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 4: "What Bundle Strategy Are They Using?"</h2>

      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-500 dark:text-slate-400">
        <p><strong>Note</strong>: Only runs for <strong>reference stores</strong>. New stores skip this.</p>
      </blockquote>

      <h3 className="text-xl font-semibold mb-3">What happens</h3>
      <p className="mb-4">
        Reads the store's bundle configurations, classifies each one by type and pattern, and determines the dominant strategy.
      </p>

      <h3 className="text-xl font-semibold mb-3">Bundle type classification (priority order -- first match wins)</h3>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Type</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it is</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Mix & Match', 'Customer picks from a curated selection'],
            ['Subscription', 'Recurring delivery'],
            ['Add-on / Free Gift', '"Add X to get Y free"'],
            ['Buy X Get Y', '"Buy 2 get 1 free"'],
            ['Fixed Bundle Price', '"This bundle for $49.99"'],
            ['Volume Discount', '"Buy 2 for 10% off, 3 for 20% off"'],
            ['Tiered Discount', '"Spend $50 for 10% off, $100 for 15% off"'],
            ['Classic', 'Simple bundle with flat discount'],
          ].map(([type, desc], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{type}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-semibold mb-3">Dominant strategy</h3>
      <p className="mb-8">
        Determined by <strong>most revenue</strong> over last 2 months. If no revenue data, falls back to most common type by count.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Job 5 ─── */}
      <h2 className="text-2xl font-semibold mb-2">Job 5: Store Audit -- "What Problems Does This Store Have?"</h2>

      <p className="mb-4">
        After all data is collected, we run <strong>6 automated health checks</strong>:
      </p>

      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-4">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Check</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it detects</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Triggers when</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Recommends</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Dead weight inventory', 'Too many products not earning', 'Bottom 50% < 15% of revenue', 'Mix & Match'],
            ['Low bundle adoption', 'Bundles not contributing enough', 'Bundle revenue < 15%', 'Add-on bundles'],
            ['Repeat customer drop', 'Returning customers spending less', 'Repeat AOV < first-time AOV', 'Volume discount'],
            ['Hero product dependency', 'Over-reliance on few bestsellers', 'Top 20% > 80% of revenue', 'Fixed bundle'],
            ['Low basket size', 'Customers buying single items', '60%+ single-item orders', 'Volume discount'],
          ].map(([check, detects, triggers, recommends], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-semibold">{check}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{detects}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{triggers}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{recommends}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-4">
        The most severe problem becomes the primary recommendation. Confidence = gap between #1 and #2 severity.
      </p>

      </div>
    </div>
  )
}
