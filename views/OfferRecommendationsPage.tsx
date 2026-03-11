import { useRef, useState } from 'react'

export default function OfferRecommendationsPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = contentRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const thCls = 'border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold'
  const tdCls = 'border border-slate-300 dark:border-slate-600 px-3 py-2'

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-slate-800 dark:text-slate-200 leading-relaxed">

      {/* ─── Title + Copy ─── */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold">Offer Recommendation Test Results by Shopify Plan</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

        {/* ─── How the Recommender Works ─── */}
        <h2 className="text-2xl font-semibold mb-4">How the Recommender Works (for non-technical teammates)</h2>

        <ol className="list-decimal list-inside mb-6 space-y-2">
          <li>When a store installs the app, we pull their product catalog and last 60 days of order history from Shopify.</li>
          <li>From that data, we calculate six behavioral signals about the store -- things like how often customers buy multiple items, how many customers come back to buy again, and whether revenue is concentrated in a few hero products or spread across the catalog.</li>
          <li>We compare those signals against patterns we learned from 49 successful stores where we already know which discount strategy generated the most revenue.</li>
          <li>Each of the five offer types (percentage discount, fixed dollar off, fixed bundle price, buy-X-get-Y, and subscription) gets a score based on how well the store&apos;s behavior matches stores that succeeded with that strategy.</li>
          <li>We also decide whether flat (one discount level) or tiered (escalating discounts for buying more) is better for each offer, based on the store&apos;s specific signals.</li>
          <li>The offers are ranked from best to worst. Each recommendation comes with a confidence level (high, medium, or low) that reflects how strongly the data supports it.</li>
          <li>Stores with fewer than 50 orders are flagged as &quot;low data&quot; -- their recommendations are directional guesses, not confident predictions.</li>
          <li>Two of the five offer types (buy-X-get-Y and subscription) are only recommended for industries where they make sense -- for example, subscription is suggested for consumable categories like supplements, pet food, and coffee.</li>
          <li>Every recommendation includes a plain-English reason explaining why it fits the store, plus a starter template (e.g., &quot;Buy 2 get 10% off, buy 3 get 15% off&quot;) so the merchant knows exactly what to set up.</li>
          <li>The whole process is deterministic -- no AI guessing at the ranking stage. The same store data will always produce the same recommendations.</li>
        </ol>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Basic Plan ─── */}
        <h2 className="text-2xl font-semibold mb-4">Basic Plan (3 stores)</h2>

        {/* iw2k70-1v */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://iw2k70-1v.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">iw2k70-1v</a> (Jewelry, 20 orders, LOW DATA)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>82% of revenue comes from the top product. Fixed amount discounts drive add-on purchases alongside bestsellers. With revenue concentrated in a few products, a simple flat dollar-off keeps the offer focused.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>95% of orders are single-item purchases. Percentage discounts on bundles give these customers a clear incentive to add more. A flat percentage is straightforward -- one clear discount, no complexity.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>A fixed bundle price simplifies the purchase decision -- customers see one clear price for the whole bundle.</td>
            </tr>
          </tbody>
        </table>

        {/* autism-grown-up */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://autism-grown-up.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">autism-grown-up</a> (Books &amp; Education, 452 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>21% repeat purchase rate -- returning customers respond well to percentage discounts because the savings scale with their cart. A simple flat percentage is easy for returning customers to understand.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>First-time customers spend 79% more than returning ones. A fixed dollar-off discount gives new customers a concrete savings number. Tiered dollar-off savings give escalating incentives that work well for high-spending new customers.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 12%). Fixed bundle pricing works well when customers already explore multiple products.</td>
            </tr>
          </tbody>
        </table>

        {/* the-housewarming-project */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://the-housewarming-project.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">the-housewarming-project</a> (Gifts &amp; Personalization, 202 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>60% repeat purchase rate -- returning customers respond well to percentage discounts because the savings scale with their cart. A simple flat percentage is easy for returning customers to understand and builds on trust.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 1%). Fixed bundle pricing works well when customers already explore multiple products.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>First-time customers spend 79% more than returning ones. Tiered dollar-off savings give escalating incentives that work well for high-spending new customers.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Buy X Get Y</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Buy 1 bestseller, get a complementary item 50% off</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Buy X Get Y is effective in Gifts &amp; Personalization for introducing customers to new products alongside items they already want.</td>
            </tr>
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Professional Plan ─── */}
        <h2 className="text-2xl font-semibold mb-4">Professional Plan (7 stores)</h2>

        {/* ga74dv-pf */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://ga74dv-pf.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ga74dv-pf</a> (Baby &amp; Kids, 104 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 9%). Fixed bundle pricing works well when customers already explore multiple products. One price for the whole bundle -- simple, clean.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>40% of orders are single-item purchases. Percentage discounts on bundles give these customers a clear incentive to add more.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>First-time customers spend 18% more than returning ones. A fixed dollar-off discount reduces purchase hesitation for new customers.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Buy X Get Y</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Buy 1 bestseller, get a complementary item 50% off</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Buy X Get Y is effective in Baby &amp; Kids for introducing customers to new products alongside items they already want.</td>
            </tr>
          </tbody>
        </table>

        {/* b2ef69-07 */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://b2ef69-07.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">b2ef69-07</a> (Personal Care &amp; Grooming, 588 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>62% of orders already have 3+ items -- customers naturally buy in bundles. A fixed bundle price (&quot;get all 3 for $X&quot;) matches this behavior perfectly.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>The catalog has a healthy long tail (bottom 50% of products contribute 13% of revenue), so tiered discounts encourage customers to explore more products at higher quantities.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved, which can feel more tangible than a percentage.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Personal Care &amp; Grooming products are often consumable. Subscription discounts lock in recurring revenue from customers who reorder naturally.</td>
            </tr>
          </tbody>
        </table>

        {/* jxsmgi-gz */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://jxsmgi-gz.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">jxsmgi-gz</a> (Beauty &amp; Cosmetics, 47 orders, LOW DATA)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>13% repeat purchase rate -- returning customers respond to percentage discounts. The catalog long tail (bottom 50% = 9% of revenue) means tiered discounts encourage exploring more products.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>71% of orders have 3+ items -- customers naturally buy in bundles. Tiered bundle pricing lets them choose their level and naturally upsell.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved, which can feel more tangible than a percentage.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>13% repeat rate shows customers come back. A subscription offer converts that repeat behavior into predictable recurring revenue.</td>
            </tr>
          </tbody>
        </table>

        {/* thilakawardhana */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://thilakawardhana.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">thilakawardhana</a> (Fashion &amp; Apparel, 4,802 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>22% repeat purchase rate -- returning customers respond well to percentage discounts because the savings scale with their cart. A simple flat percentage is easy for returning customers.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 1%). Fixed bundle pricing works well when customers already explore multiple products.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved. Tiered amounts give a clear reason to add one more item.</td>
            </tr>
          </tbody>
        </table>

        {/* back-bone-bmx */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://back-bone-bmx.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">back-bone-bmx</a> (Fashion &amp; Apparel, 171 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>50% of orders are single-item purchases. Percentage discounts on bundles give these customers a clear incentive to add more. Tiered discounts encourage exploring more products.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 11%). Tiered bundle pricing lets customers choose their level.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved, which can feel more tangible than a percentage.</td>
            </tr>
          </tbody>
        </table>

        {/* 160f41-52 */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://160f41-52.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">160f41-52</a> (Beauty &amp; Cosmetics, 4,053 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>A fixed bundle price simplifies the purchase decision. Tiered bundle pricing lets customers choose their level and naturally upsell.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>46% of orders are single-item purchases. Tiered quantity breaks motivate both new and returning customers to buy more.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>41% of revenue comes from the top product. Fixed amount discounts drive add-on purchases alongside bestsellers. A simple flat dollar-off keeps the offer focused.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>Beauty &amp; Cosmetics products are often consumable. Subscription discounts lock in recurring revenue from customers who reorder naturally.</td>
            </tr>
          </tbody>
        </table>

        {/* b6cn1r-uy */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://b6cn1r-uy.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">b6cn1r-uy</a> (Beauty &amp; Cosmetics, 96 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>51% repeat purchase rate -- returning customers respond well to percentage discounts. The catalog long tail (bottom 50% = 20% of revenue) means tiered discounts encourage exploring more products.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>51% repeat rate shows customers come back. A subscription offer converts that repeat behavior into predictable recurring revenue.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>29% of revenue from the top product. Tiered fixed amounts give customers a clear reason to add one more item.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Buy X Get Y</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Buy 1 bestseller, get a complementary item 50% off</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>With 29% of revenue in the top product, Buy X Get Y lets you pair that bestseller with complementary items to drive trial.</td>
            </tr>
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Unlimited (Advanced) Plan ─── */}
        <h2 className="text-2xl font-semibold mb-4">Unlimited (Advanced) Plan (9 stores)</h2>

        {/* plato-pet */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://plato-pet.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">plato-pet</a> (Pet Supplies, 1,548 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>13% repeat purchase rate -- returning customers respond to percentage discounts. The catalog long tail (bottom 50% = 11% of revenue) means tiered discounts encourage exploring more products.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>43% of revenue from the top product. Fixed amount discounts drive add-on purchases alongside bestsellers. A flat dollar-off keeps the offer focused.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>13% repeat rate shows customers come back. A subscription offer converts that into predictable recurring revenue.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>A fixed bundle price simplifies the purchase decision. Tiered pricing lets customers choose their level and naturally upsell.</td>
            </tr>
          </tbody>
        </table>

        {/* terragentle-com */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://terragentle-com.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">terragentle-com</a> (Baby &amp; Kids, 1,277 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 get 10% off, buy 3 get 15% off, buy 4+ get 20% off</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>24% repeat purchase rate -- returning customers respond well to percentage discounts. Repeat customers spend close to first-timers, so tiered quantity breaks motivate both groups.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>A fixed bundle price simplifies the purchase decision. Tiered pricing lets customers choose their level.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value. Tiered amounts give a clear reason to add one more item.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Buy X Get Y</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Buy 1 bestseller, get a complementary item 50% off</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Buy X Get Y is effective in Baby &amp; Kids for introducing customers to new products alongside items they already want.</td>
            </tr>
          </tbody>
        </table>

        {/* tjgg6m-bi */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://tjgg6m-bi.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">tjgg6m-bi</a> (Supplements &amp; Vitamins, 0 orders, LOW DATA)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Revenue is spread across the catalog. Fixed bundle pricing works well when customers explore multiple products. One price for the whole bundle -- simple, clean.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Supplements &amp; Vitamins products are often consumable. Subscription discounts lock in recurring revenue from customers who reorder naturally.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Percentage discounts are versatile and easy for customers to understand, making them a strong default.</td>
            </tr>
          </tbody>
        </table>

        {/* b33205-40 */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://b33205-40.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">b33205-40</a> (Health &amp; Wellness, 116 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>56% of revenue from the top product. Fixed amount discounts drive add-on purchases alongside bestsellers. First-time customers spend 77% more than repeats, so tiered savings work especially well for high-spending new customers.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>23% repeat purchase rate -- returning customers respond well to percentage discounts. A simple flat percentage is easy for returning customers and builds on trust.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>87% of orders already have 3+ items -- customers naturally buy in bundles. A fixed bundle price matches this behavior perfectly.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>23% repeat rate shows customers come back. A subscription offer converts that into predictable recurring revenue.</td>
            </tr>
          </tbody>
        </table>

        {/* gdn1qq-jb */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://gdn1qq-jb.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">gdn1qq-jb</a> (Coffee &amp; Tea, 0 orders, LOW DATA)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Revenue is spread across the catalog. Fixed bundle pricing works well when customers explore multiple products.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Coffee &amp; Tea products are often consumable. Subscription discounts lock in recurring revenue from customers who reorder naturally.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Percentage discounts are versatile and easy for customers to understand, making them a strong default.</td>
            </tr>
          </tbody>
        </table>

        {/* 7b3c7a-4 */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://7b3c7a-4.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">7b3c7a-4</a> (Automotive &amp; Motorcycle, 159 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>40% repeat purchase rate -- returning customers respond well to percentage discounts because the savings scale with their cart. A simple flat percentage is easy and builds on trust.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>21% of revenue from the top product. First-time customers spend 32% more than repeats, so tiered dollar-off savings give escalating incentives for high-spending new customers.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>A fixed bundle price simplifies the purchase decision. Tiered pricing gives customers flexible options at pre-set price points.</td>
            </tr>
          </tbody>
        </table>

        {/* cranel */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://cranel.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">cranel</a> (Supplements &amp; Vitamins, 2,441 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>29% repeat purchase rate -- returning customers respond well to percentage discounts. A simple flat percentage is easy for returning customers and builds on trust.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Buy 2 save $5, buy 3 save $10, buy 4+ save $15</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>62% of revenue from the top product. Fixed amount discounts drive add-on purchases alongside bestsellers. Tiered amounts give a clear reason to add one more item.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>29% repeat rate shows customers come back. A subscription offer converts that into predictable recurring revenue.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Tiered</td>
              <td className={tdCls}>Pick 2 for $29, pick 3 for $39, pick 4 for $49</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>A fixed bundle price simplifies the purchase decision. Tiered pricing gives customers flexible options.</td>
            </tr>
          </tbody>
        </table>

        {/* nailberry-london */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://nailberry-london.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">nailberry-london</a> (Beauty &amp; Cosmetics, 4,182 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>38% of orders are single-item purchases. Percentage discounts on bundles give these customers a clear incentive to add more. A flat percentage is straightforward -- one clear discount, no complexity.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 8%). Fixed bundle pricing works well when customers already explore multiple products.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Subscription</td>
              <td className={tdCls}>--</td>
              <td className={tdCls}>Subscribe &amp; save 15% on every delivery</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>11% repeat rate shows customers come back. A subscription offer converts that into predictable recurring revenue.</td>
            </tr>
            <tr>
              <td className={tdCls}>4</td>
              <td className={tdCls}>Buy X Get Y</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Buy 1 bestseller, get a complementary item 50% off</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Buy X Get Y is effective in Beauty &amp; Cosmetics for introducing customers to new products alongside items they already want.</td>
            </tr>
          </tbody>
        </table>

        {/* mortantra-store */}
        <h3 className="text-xl font-semibold mb-3"><a href="https://mortantra-store.myshopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">mortantra-store</a> (Jewelry, 593 orders)</h3>
        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Rank</th>
              <th className={thCls}>Offer Type</th>
              <th className={thCls}>Variant</th>
              <th className={thCls}>Template</th>
              <th className={thCls}>Confidence</th>
              <th className={thCls}>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>1</td>
              <td className={tdCls}>Fixed Bundle Price</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get all 3 for $49</td>
              <td className={tdCls}>High</td>
              <td className={tdCls}>Revenue is spread across the catalog (top product is only 1%). Fixed bundle pricing works well when customers already explore multiple products. One price for the whole bundle -- simple, clean.</td>
            </tr>
            <tr>
              <td className={tdCls}>2</td>
              <td className={tdCls}>Percentage Discount</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Get 15% off when you buy this bundle</td>
              <td className={tdCls}>Medium</td>
              <td className={tdCls}>51% of orders are single-item purchases. Percentage discounts on bundles give these customers a clear incentive to add more.</td>
            </tr>
            <tr>
              <td className={tdCls}>3</td>
              <td className={tdCls}>Fixed Amount Off</td>
              <td className={tdCls}>Flat</td>
              <td className={tdCls}>Save $10 on this bundle</td>
              <td className={tdCls}>Low</td>
              <td className={tdCls}>Fixed amount discounts give customers a concrete dollar value saved, which can feel more tangible than a percentage.</td>
            </tr>
          </tbody>
        </table>

        <hr className="border-slate-200 dark:border-slate-700 mb-8" />

        {/* ─── Pipeline Timing ─── */}
        <h2 className="text-2xl font-semibold mb-4">Pipeline Timing</h2>

        <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className={thCls}>Plan</th>
              <th className={thCls}>Stores</th>
              <th className={thCls}>Avg Time</th>
              <th className={thCls}>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCls}>Basic</td>
              <td className={tdCls}>3</td>
              <td className={tdCls}>31.9s</td>
              <td className={tdCls}>Basic stores don&apos;t have <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> scope, always use REST API</td>
            </tr>
            <tr>
              <td className={tdCls}>Professional</td>
              <td className={tdCls}>7</td>
              <td className={tdCls}>61.3s</td>
              <td className={tdCls}>Mixed -- some cached, some on-the-fly. High-order stores (4,800 orders) take 230s</td>
            </tr>
            <tr>
              <td className={tdCls}>Unlimited</td>
              <td className={tdCls}>9</td>
              <td className={tdCls}>37.7s</td>
              <td className={tdCls}>All have <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">read_reports</code> scope, but ShopifyQL returned 0 orders for all -- fell back to REST</td>
            </tr>
          </tbody>
        </table>

        <p className="mb-6">Stores with an existing profile return in 1-6 seconds. On-the-fly stores (no profile) take 11-230 seconds depending on order count.</p>

      </div>
    </div>
  )
}
