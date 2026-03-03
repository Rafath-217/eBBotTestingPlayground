import { useRef, useState } from 'react'

export default function StoreProfilingFAQPage() {
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
        <h1 className="text-3xl font-bold">Store Profiling -- Frequently Asked Questions</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <hr className="border-slate-200 dark:border-slate-700 mb-8 mt-4" />

      <div ref={contentRef}>

      {/* ─── Understanding Store Profiling ─── */}
      <h2 className="text-2xl font-semibold mb-6">Understanding Store Profiling</h2>

      <h3 className="text-xl font-semibold mb-3">What is store profiling? What does it do?</h3>
      <p className="mb-6">
        Store profiling is how we learn about your store so we can recommend the best bundle strategy for you. We look at your products, your sales data, and how your customers shop -- then we match you with similar successful stores to figure out what kind of bundles will work best.
      </p>

      <h3 className="text-xl font-semibold mb-3">How does the system analyze my store?</h3>
      <p className="mb-6">
        We run a series of checks in order. First we look at what you sell (your product catalog). Then we look at how your store has been performing over the last 60 days. If you already have bundles, we measure how well they are doing. Finally, we put it all together to figure out your store type and make a recommendation.
      </p>

      <h3 className="text-xl font-semibold mb-3">What data do you look at from my store?</h3>
      <p className="mb-6">
        We pull two things from Shopify: your active products (titles, prices, and product types) and your recent order history (order totals, number of items, and customer information). We do not look at customer personal details, payment information, or anything outside of products and orders.
      </p>

      <h3 className="text-xl font-semibold mb-3">How do you figure out what industry my store is in?</h3>
      <p className="mb-6">
        We use AI to look at your product types and product names, then classify your store into an industry like "Beauty and Cosmetics" or "Food and Gourmet." The AI runs twice -- once to make a guess, and again to double-check itself. If the system gets it wrong, it can be corrected manually and future updates will respect that correction.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is a "store archetype"? Why does it matter?</h3>
      <p className="mb-6">
        An archetype is a shorthand for what kind of store you are. It is based on three things: how many products you have, how diverse your catalog is, and your price range. For example, a small boutique with varied products is a different archetype than a large discount store with thousands of items. Your archetype helps us match you with similar stores and pick the right bundle strategy.
      </p>

      <h3 className="text-xl font-semibold mb-3">How do you measure how diverse my product catalog is?</h3>
      <p className="mb-6">
        We look at the different types of products you sell and how evenly they are spread out. If you only sell one type of product (say, just candles), your diversity is low. If you sell candles, soaps, lotions, and gift sets in roughly equal amounts, your diversity is high. We call this your "complementarity score" and it runs from 0 to 1.
      </p>

      <h3 className="text-xl font-semibold mb-3">What does "complementarity score" mean in simple terms?</h3>
      <p className="mb-6">
        It measures how much variety your product catalog has. A score close to 0 means almost everything in your store is the same type of product. A score close to 1 means you have a wide range of different product types. Stores with higher scores tend to do well with mix-and-match bundles, while lower-score stores often do better with volume discounts.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is "price band" and how is mine determined?</h3>
      <p className="mb-6">
        Price band is a simple grouping based on your typical product price. If most of your products are under $25, you are in the "low" band. Between $25 and $100 is "mid." Over $100 is "high." We use the middle-of-the-road price (the median) rather than the average, so one expensive item does not throw off the result.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Performance Metrics ─── */}
      <h2 className="text-2xl font-semibold mb-6">Performance Metrics</h2>

      <h3 className="text-xl font-semibold mb-3">What does "60-day performance" mean?</h3>
      <p className="mb-6">
        It means we look at a rolling window of the last 60 days of your store's sales data. This gives us a recent, up-to-date picture of how your store is doing right now, rather than relying on all-time numbers that might not reflect your current situation.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is AOV and why does it matter for bundles?</h3>
      <p className="mb-6">
        AOV stands for Average Order Value -- it is how much a typical customer spends per order. It matters because bundles are designed to increase this number. If your AOV is $40 and your typical product costs $10, that tells us customers already buy about 4 items per order, which is a great sign for volume discount bundles.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is repeat rate and what is a good number?</h3>
      <p className="mb-6">
        Repeat rate is the percentage of your orders that come from returning customers. If 20% of your orders are from people who have bought before, your repeat rate is 20%. Anything above 15-20% is solid. Higher repeat rates mean you have loyal customers who may respond well to bundle offers.
      </p>

      <h3 className="text-xl font-semibold mb-3">What does "revenue concentration" mean? Is high concentration good or bad?</h3>
      <p className="mb-6">
        Revenue concentration tells you how much of your total revenue comes from your single best-selling product. If one product accounts for 30% or more of your revenue, that is high concentration -- it means you are heavily dependent on one item. That is risky, and bundles that pair your hero product with other items can help spread revenue around.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is ABC analysis? What are Grade A, B, and C products?</h3>
      <p className="mb-6">
        ABC analysis ranks all your products by how much revenue they bring in, then splits them into three groups. Grade A is your top 20% of products -- your heavy hitters. Grade B is the next 30% -- solid performers. Grade C is the bottom 50% -- products that sell but do not contribute much revenue individually. We use this to pick the best products for your recommended bundles.
      </p>

      <h3 className="text-xl font-semibold mb-3">What does "units per order" tell you about my store?</h3>
      <p className="mb-6">
        It shows how many items customers typically put in a single order. We break it down into one-item orders, two-item orders, and three-or-more-item orders. If most of your customers already buy multiple items, that is a strong signal that volume discount bundles will work well for your store.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Bundle Success ─── */}
      <h2 className="text-2xl font-semibold mb-6">Bundle Success</h2>

      <h3 className="text-xl font-semibold mb-3">How do you know if bundles are working for a store?</h3>
      <p className="mb-6">
        We look at a few things together: what percentage of the store's revenue comes from bundles, what percentage of orders include a bundle, how consistent the bundle revenue is month over month, and whether the store has enough overall sales volume for the numbers to be meaningful.
      </p>

      <h3 className="text-xl font-semibold mb-3">What does "strong," "moderate," or "weak" bundle success mean?</h3>
      <p className="mb-6">
        These are tiers we assign to each store based on bundle performance. "Strong" means bundles contribute at least 12% of revenue, at least 5% of orders include a bundle, performance is stable month to month, and the store has significant sales volume. "Moderate" means bundles contribute at least 5% of revenue. "Weak" means bundles have not yet gained meaningful traction.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is attach rate?</h3>
      <p className="mb-6">
        Attach rate is the percentage of your total orders that include a bundle. If you had 100 orders last month and 15 of them included a bundle product, your attach rate is 15%. A higher attach rate means bundles are becoming a regular part of how your customers shop.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is bundle revenue contribution?</h3>
      <p className="mb-6">
        It is the percentage of your total store revenue that comes from bundle sales. If your store made $10,000 last month and $2,000 of that came from bundles, your bundle revenue contribution is 20%. This is one of the most important numbers for measuring whether bundles are actually moving the needle for your business.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Bundle Strategy ─── */}
      <h2 className="text-2xl font-semibold mb-6">Bundle Strategy</h2>

      <h3 className="text-xl font-semibold mb-3">What types of bundles does the system recognize?</h3>
      <p className="mb-6">
        The system recognizes several types: classic bundles (a fixed set of products sold together), mix-and-match (customers pick their own items), volume discounts (buy more, save more), tiered discounts (spend more, save more), fixed-price bundles (everything in the box for one price), buy-X-get-Y deals, addon or free gift bundles, and subscription bundles.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is the difference between "classic" and "mix and match"?</h3>
      <p className="mb-6">
        A classic bundle is a pre-built set of products -- you pick exactly which items go together and the customer buys them as a package. Mix and match lets the customer choose their own items from a selection you define. Classic works well when you know which products pair best. Mix and match works well when you want customers to explore your catalog.
      </p>

      <h3 className="text-xl font-semibold mb-3">What is a volume discount bundle?</h3>
      <p className="mb-6">
        A volume discount bundle rewards customers for buying more of the same or similar items. For example: buy 2 and get 10% off, buy 3 and get 20% off. It is one of the most effective bundle types for stores where customers already tend to buy multiple items.
      </p>

      <h3 className="text-xl font-semibold mb-3">What does "dominant strategy" mean?</h3>
      <p className="mb-6">
        It is simply the bundle type that is generating the most revenue for a store. If a store runs three different kinds of bundles but the volume discount bundles bring in the most money, then volume discount is their dominant strategy. We use this to understand what is actually working, not just what a store has set up.
      </p>

      <h3 className="text-xl font-semibold mb-3">How does the system figure out which bundle type works best for my store?</h3>
      <p className="mb-6">
        It uses a layered approach. First, it checks your shopping patterns -- if most of your customers already buy 3 or more items, volume discounts are recommended right away. Then it looks at your store archetype and any specific patterns in your data. Finally, it checks what bundle types are working for similar stores. The strongest signal wins.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Store Matching and Recommendations ─── */}
      <h2 className="text-2xl font-semibold mb-6">Store Matching and Recommendations</h2>

      <h3 className="text-xl font-semibold mb-3">How does the system find stores similar to mine?</h3>
      <p className="mb-6">
        It looks at stores that share your archetype (similar catalog size, product diversity, and price range). Then it scores each one based on how close they are to you across those dimensions. Stores in the same or related industries get priority. The closest matches are used to inform your recommendation.
      </p>

      <h3 className="text-xl font-semibold mb-3">Why does my recommendation come from other stores' success?</h3>
      <p className="mb-6">
        Because the best predictor of what will work for your store is what is already working for stores like yours. Rather than guessing, we look at real data from similar stores that have been running bundles successfully. If volume discounts are driving 30% of revenue for stores that look like yours, that is a strong signal it will work for you too.
      </p>

      <h3 className="text-xl font-semibold mb-3">How many reference stores are used?</h3>
      <p className="mb-6">
        We typically match you against up to 5 similar stores, then narrow it down to the top 3 that have proven bundle success. These top matches are the ones that inform your bundle recommendation.
      </p>

      <h3 className="text-xl font-semibold mb-3">What if there are no similar stores?</h3>
      <p className="mb-6">
        If we cannot find enough stores with proven bundle success that match your profile, we fall back to a sensible default based on your store archetype. Every archetype has a default bundle type that works as a solid starting point, so you always get a recommendation even if your store is unique.
      </p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Data and Privacy ─── */}
      <h2 className="text-2xl font-semibold mb-6">Data and Privacy</h2>

      <h3 className="text-xl font-semibold mb-3">What Shopify permissions do you need?</h3>
      <p className="mb-6">
        We need access to read your products and your orders. For some stores, we also use reporting access to pull sales data more efficiently. We never modify your products, orders, or any other store data -- we only read what we need to build your profile and make a recommendation.
      </p>

      <h3 className="text-xl font-semibold mb-3">Is my store data shared with other stores?</h3>
      <p className="mb-6">
        No. Your individual store data is never shown to other store owners. We do use aggregated, anonymized patterns from successful stores to make recommendations, but no one can see your specific revenue numbers, product details, or customer information.
      </p>

      <h3 className="text-xl font-semibold mb-3">How often is my profile updated?</h3>
      <p className="mb-6">
        Your product catalog information is refreshed weekly. Your sales performance data is updated daily using a rolling 60-day window, so it always reflects your most recent trends. Bundle performance metrics are updated alongside the daily run.
      </p>

      <h3 className="text-xl font-semibold mb-3">Can I change my industry classification manually?</h3>
      <p className="mb-6">
        Yes. If the system classified your store incorrectly, the industry can be updated manually. Once corrected, the system will remember your preference and will not overwrite it with an automated guess on future updates.
      </p>

      </div>
    </div>
  )
}
