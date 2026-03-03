import { useRef, useState } from 'react'

export default function OnboardingFAQPage() {
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
    <div className="max-w-4xl mx-auto px-8 py-10 text-slate-800 dark:text-slate-200 leading-relaxed">

      <div className="flex items-start justify-between mb-2">
        <h1 className="text-3xl font-bold">Onboarding FAQ</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
        Answers to common questions about what happens when you first install the app and how your personalized bundle recommendation is created.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ── Getting Started ── */}
      <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>

      <h3 className="text-lg font-semibold mb-2">What happens when I first install the app?</h3>
      <p className="mb-6">
        As soon as you install, we run a quick analysis of your Shopify store. We look at your product catalog, your recent sales, and how your customers shop. Based on all of that, we recommend a bundle type and set it up for you automatically.
      </p>

      <h3 className="text-lg font-semibold mb-2">How long does the onboarding process take?</h3>
      <p className="mb-6">
        About 20 to 30 seconds. You will see a progress screen with animated steps as we analyze your store. By the time you have finished reading the steps, your bundle is ready to review.
      </p>

      <h3 className="text-lg font-semibold mb-2">Do I need to do anything during onboarding?</h3>
      <p className="mb-6">
        Nope. Just sit back and watch. The system does everything automatically. You will be able to review and customize the results before anything goes live.
      </p>

      <h3 className="text-lg font-semibold mb-2">Can I redo the onboarding later?</h3>
      <p className="mb-8">
        The onboarding runs once when you first install. If your store changes significantly over time, our recommendations will continue to improve based on your updated sales data.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Analyzing Your Store ── */}
      <h2 className="text-2xl font-semibold mb-6">Analyzing Your Store</h2>

      <h3 className="text-lg font-semibold mb-2">What does &quot;analyzing your catalog&quot; mean?</h3>
      <p className="mb-6">
        We look at all the products in your store -- how many you have, what price range they fall into, and how well they complement each other. This helps us understand what kind of store you run and what type of bundle would make sense.
      </p>

      <h3 className="text-lg font-semibold mb-2">What does &quot;checking store performance&quot; mean?</h3>
      <p className="mb-6">
        We pull your sales data from the last 60 days. This includes things like total revenue, number of orders, average order value, and how often customers come back to buy again.
      </p>

      <h3 className="text-lg font-semibold mb-2">Why does it look at my order history?</h3>
      <p className="mb-6">
        Your order history tells us how your customers actually shop. For example, if most of your customers already buy 3 or more items per order, that is a strong signal that a volume discount bundle would work well. If customers tend to buy just one item, a different approach might be better.
      </p>

      <h3 className="text-lg font-semibold mb-2">What if I am a brand new store with very few orders?</h3>
      <p className="mb-6">
        No problem. If you have fewer than 50 orders in the last 60 days, we will set you up with a starter bundle based on your catalog and industry. As your sales grow, the recommendation becomes more tailored.
      </p>

      <h3 className="text-lg font-semibold mb-2">What does &quot;data quality check&quot; mean?</h3>
      <p className="mb-8">
        Before making any recommendations, we make sure your sales data is clean. We check for things like test orders, placeholder products, or unusually large one-off purchases that could skew the numbers. If we find anything unusual, we adjust the data so your recommendation is based on real customer behavior.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Finding Similar Stores ── */}
      <h2 className="text-2xl font-semibold mb-6">Finding Similar Stores</h2>

      <h3 className="text-lg font-semibold mb-2">How does the system find stores similar to mine?</h3>
      <p className="mb-6">
        We compare your store against a database of established stores that are already successfully using bundles. We look at catalog size, price range, and how complementary your products are. Stores that are most similar to yours on these dimensions are selected as your matches.
      </p>

      <h3 className="text-lg font-semibold mb-2">What makes two stores &quot;similar&quot;?</h3>
      <p className="mb-6">
        Three things matter most: how many products each store carries, the typical price point, and how well the products go together. A small boutique selling premium handbags would match with other small, high-priced accessory stores rather than a large discount variety shop.
      </p>

      <h3 className="text-lg font-semibold mb-2">Do I get to see which stores I was matched with?</h3>
      <p className="mb-6">
        We do not show you the names of the stores you were matched with, to protect everyone&apos;s privacy. However, you can see how many similar stores were found and how closely they matched your profile.
      </p>

      <h3 className="text-lg font-semibold mb-2">What if no similar stores are found?</h3>
      <p className="mb-8">
        If we cannot find close matches, we fall back to a recommendation based on your store type and catalog characteristics. The recommendation is still personalized -- it just relies more on your own data than on what worked for others.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Bundle Recommendation ── */}
      <h2 className="text-2xl font-semibold mb-6">Bundle Recommendation</h2>

      <h3 className="text-lg font-semibold mb-2">How does the system decide which bundle type to recommend?</h3>
      <p className="mb-6">
        It follows a priority system. First, it checks your customers&apos; shopping behavior (do they already buy in bulk?). Then it looks at your store&apos;s specific characteristics (price range, catalog diversity, revenue spread). Finally, it checks what bundle type has worked best for stores similar to yours. The first strong signal wins.
      </p>

      <h3 className="text-lg font-semibold mb-2">What if most of my customers already buy multiple items?</h3>
      <p className="mb-6">
        That is actually a great sign. If a large share of your orders already contain 3 or more items, the system will likely recommend a volume discount. Your customers are already buying in bulk -- a volume discount gives them an extra incentive to keep doing it.
      </p>

      <h3 className="text-lg font-semibold mb-2">What are the different bundle types I might get recommended?</h3>
      <p className="mb-2">There are several options:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Volume Discount</strong> -- &quot;Buy 2 get 10% off, Buy 3 get 20% off.&quot; Great when customers naturally buy multiples.</li>
        <li><strong>Mix and Match</strong> -- &quot;Pick any 3 items and save.&quot; Works well when you have lots of complementary products.</li>
        <li><strong>Curated Bundle</strong> -- A fixed set of products sold together at a discount. Ideal for premium or highly complementary catalogs.</li>
        <li><strong>Starter Bundle</strong> -- A simple introductory bundle for newer stores that are still building up sales data.</li>
      </ul>

      <h3 className="text-lg font-semibold mb-2">Why did I get &quot;volume discount&quot; instead of &quot;mix and match&quot;?</h3>
      <p className="mb-6">
        The system picks the type that best fits your customers&apos; actual behavior. If your order data shows that people already buy in quantity, volume discount is the stronger play. Mix and match works better when customers like to browse and combine different products.
      </p>

      <h3 className="text-lg font-semibold mb-2">Can I choose a different bundle type than what is recommended?</h3>
      <p className="mb-6">
        Yes. The recommendation is a starting point, not a locked-in decision. You can always change the bundle type, products, and pricing after onboarding.
      </p>

      <h3 className="text-lg font-semibold mb-2">What is a &quot;behavioral signal&quot;?</h3>
      <p className="mb-6">
        It is a pattern we detect in your order history. For example, if most of your orders have 3 or more items in them, that is a strong behavioral signal that your customers like to buy in bulk. We use these patterns to figure out the best bundle approach.
      </p>

      <h3 className="text-lg font-semibold mb-2">What does &quot;vote from similar stores&quot; mean?</h3>
      <p className="mb-8">
        When we find stores similar to yours, we look at which bundle type is working best for them. If most of your matches are succeeding with volume discount, that &quot;votes&quot; in favor of recommending volume discount for you too. It is like getting advice from store owners in your shoes.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Product Selection ── */}
      <h2 className="text-2xl font-semibold mb-6">Product Selection</h2>

      <h3 className="text-lg font-semibold mb-2">How does it pick which products go in my bundle?</h3>
      <p className="mb-6">
        We rank all your products by revenue over the last 60 days, then sort them into three tiers: your top sellers, your mid-range performers, and your long-tail items. The bundle type determines which tiers we pull from. Volume discount bundles, for example, focus on your top sellers.
      </p>

      <h3 className="text-lg font-semibold mb-2">What are Grade A, B, and C products?</h3>
      <p className="mb-2">It is our way of ranking your products by sales performance:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Grade A</strong> -- Your best sellers. These products drive the bulk of your revenue.</li>
        <li><strong>Grade B</strong> -- Solid mid-tier products. They sell consistently but are not your top earners.</li>
        <li><strong>Grade C</strong> -- Your long-tail items. Lower sales, but they can be great for discovery and variety in mix-and-match bundles.</li>
      </ul>

      <h3 className="text-lg font-semibold mb-2">Can I change the products after onboarding?</h3>
      <p className="mb-6">
        Absolutely. The products we select are a recommended starting point. You can swap out any product, add more, or remove ones that do not fit.
      </p>

      <h3 className="text-lg font-semibold mb-2">Why were only 3 products selected?</h3>
      <p className="mb-8">
        For volume discount bundles, we intentionally keep it focused. Three top-selling products give your customers a clear, simple offer. Other bundle types may include more products. You can always add more after setup.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Pricing ── */}
      <h2 className="text-2xl font-semibold mb-6">Pricing</h2>

      <h3 className="text-lg font-semibold mb-2">How is the bundle pricing determined?</h3>
      <p className="mb-6">
        Pricing is based on your bundle type and your typical product prices. For volume discounts, we use standard tier-based discounts. For curated bundles, we calculate a discounted price based on the combined value of the included products. The goal is to offer a meaningful discount that still protects your margins.
      </p>

      <h3 className="text-lg font-semibold mb-2">What does &quot;Buy 2 get 10% off, Buy 3 get 20% off&quot; mean?</h3>
      <p className="mb-6">
        It means customers get a bigger discount the more they buy. If they add 2 of the same product to their cart, they save 10%. If they add 3, they save 20%. This encourages larger orders and increases your average order value.
      </p>

      <h3 className="text-lg font-semibold mb-2">Can I change the pricing after setup?</h3>
      <p className="mb-8">
        Yes. The pricing we suggest is a starting point based on what works for stores like yours. You can adjust the discount percentages, change the tier thresholds, or set a completely custom price.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Results and Next Steps ── */}
      <h2 className="text-2xl font-semibold mb-6">Results and Next Steps</h2>

      <h3 className="text-lg font-semibold mb-2">What does the &quot;estimated monthly upside&quot; mean?</h3>
      <p className="mb-6">
        It is a rough estimate of how much additional revenue bundles could add to your store each month. We calculate it by looking at your current monthly revenue and the bundle performance of similar stores. Think of it as a realistic target, not a guarantee.
      </p>

      <h3 className="text-lg font-semibold mb-2">How accurate is the revenue estimate?</h3>
      <p className="mb-6">
        It is a ballpark figure, not a promise. The estimate is based on how well bundles have performed at similar stores. Your actual results will depend on factors like your traffic, your products, and how you promote the bundle. Most stores see meaningful results within the first few weeks.
      </p>

      <h3 className="text-lg font-semibold mb-2">What does &quot;your bundle is ready&quot; mean? Is it live?</h3>
      <p className="mb-6">
        It means the bundle has been created and configured, but it is not live yet. You will get a chance to review everything -- the products, the pricing, and the bundle type -- before publishing it to your store.
      </p>

      <h3 className="text-lg font-semibold mb-2">What should I do after onboarding?</h3>
      <p className="mb-8">
        Review the recommended bundle and make any adjustments you want. Once you are happy with it, publish it. After that, keep an eye on your bundle analytics to see how customers respond, and tweak the offer over time.
      </p>

      <hr className="border-slate-300 dark:border-slate-700 mb-8" />

      {/* ── Data and Privacy ── */}
      <h2 className="text-2xl font-semibold mb-6">Data and Privacy</h2>

      <h3 className="text-lg font-semibold mb-2">What data do you access from my Shopify store?</h3>
      <p className="mb-6">
        We access your product catalog (titles, prices, and categories) and your order data from the last 60 days (order totals, item quantities, and repeat purchase rates). We do not access customer personal information like names, emails, or addresses.
      </p>

      <h3 className="text-lg font-semibold mb-2">Is my data shared with other stores?</h3>
      <p className="mb-6">
        No. Your individual store data is never shared with or visible to other stores. When we find &quot;similar stores,&quot; we are comparing high-level characteristics like catalog size and price range -- not sharing your sales numbers or product details.
      </p>

      <h3 className="text-lg font-semibold mb-2">What permissions does the app need?</h3>
      <p className="mb-8">
        The app needs read access to your products and order reports. This allows us to analyze your catalog and sales performance. We only read data -- we never modify your products, orders, or store settings without your explicit action.
      </p>

      </div>
    </div>
  )
}
