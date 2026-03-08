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
    <div className="max-w-4xl mx-auto py-8 px-4 text-slate-800 dark:text-slate-200 leading-relaxed">

      {/* ─── Title + Copy ─── */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold">Onboarding -- PM FAQ</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 text-slate-500 dark:text-slate-400 italic">
        <p><strong>Audience</strong>: Product managers, non-technical stakeholders</p>
        <p><strong>Companion doc</strong>: <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_HANDOFF_ONBOARDING.md</code> (read that first -- this FAQ covers questions NOT answered there)</p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── Getting Started ─── */}
      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>

      <h3 className="text-xl font-semibold mb-3">How do I trigger onboarding for a specific store?</h3>
      <p className="mb-6">Onboarding runs automatically when a merchant installs EasyBundles. There&apos;s no manual trigger, button, or API call. To re-run onboarding for an existing store, engineering would need to do it manually -- there&apos;s no self-serve re-onboarding yet.</p>

      <h3 className="text-xl font-semibold mb-3">Can a merchant skip onboarding?</h3>
      <p className="mb-6">No. The 7-step journey is shown to every new merchant. However, they can ignore the recommendation and create their own bundle from scratch.</p>

      <h3 className="text-xl font-semibold mb-3">How long does onboarding take?</h3>
      <p className="mb-6">A few seconds to a couple of minutes, depending on catalog size and order volume. The merchant sees a loading animation while we analyze their store. There is no timeout -- if the Shopify API is slow, the merchant waits longer.</p>

      <h3 className="text-xl font-semibold mb-3">What happens if something goes wrong during onboarding?</h3>
      <p className="mb-6">If the system can&apos;t build a profile (e.g., Shopify API error, zero active products), the merchant gets a generic fallback recommendation based on their archetype. The error is logged internally but the merchant is not shown a failure screen.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── The Recommendation ─── */}
      <h2 className="text-2xl font-semibold mb-4">The Recommendation</h2>

      <h3 className="text-xl font-semibold mb-3">Can a merchant reject or modify the recommendation?</h3>
      <p className="mb-6">Yes. The recommendation is presented with a &quot;Review your bundle&quot; button. The merchant can change products, pricing, and settings through the bundle creation UI. They&apos;re not locked in.</p>

      <h3 className="text-xl font-semibold mb-3">Does the recommendation ever update after onboarding?</h3>
      <p className="mb-6">No. It&apos;s a one-time recommendation. If the store&apos;s data changes (new products, different sales patterns), the recommendation stays the same. The merchant would need to be re-onboarded manually by engineering.</p>

      <h3 className="text-xl font-semibold mb-3">How accurate is the recommendation?</h3>
      <p className="mb-6">We don&apos;t currently measure this. There&apos;s no tracking of whether merchants accept, modify, or reject recommendations, and no A/B testing of recommendation quality. The decision trace is stored for internal debugging, but there&apos;s no dashboard or success rate metric. This is a known gap.</p>

      <h3 className="text-xl font-semibold mb-3">What&apos;s the confidence label and what does it mean?</h3>
      <p className="mb-3">Every recommendation includes a confidence label shown to the merchant:</p>
      <table className="w-full border border-slate-300 dark:border-slate-600 text-sm mb-8">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">Label</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">When it appears</th>
            <th className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">What it signals</th>
          </tr>
        </thead>
        <tbody>
          {([
            ['Validated', 'Strong vote from reference stores (60%+ agreement)', 'System is very confident'],
            ['High', 'Behavioral override (60%+ multi-item) or archetype-specific pattern matched (e.g., premium curated, cart builder)', 'Strong evidence from data'],
            ['Good', 'Archetype default', 'Reasonable but not data-driven'],
            ['Starting point', 'Starter bundle (under 50 orders) or no sales data', 'Best guess, merchant should iterate'],
          ] as [string, string, string][]).map(([label, when, signal], i) => (
            <tr key={i}>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium">{label}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{when}</td>
              <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{signal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Store Matching ─── */}
      <h2 className="text-2xl font-semibold mb-4">Store Matching</h2>

      <h3 className="text-xl font-semibold mb-3">How many reference stores are in the library?</h3>
      <p className="mb-6">It varies by archetype. Common archetypes like MID_HIGH_COMP might have 15-20 reference stores. Less common ones might have 5-8. The reference library is rebuilt periodically by the profiling pipeline.</p>

      <h3 className="text-xl font-semibold mb-3">Why isn&apos;t industry used in matching?</h3>
      <p className="mb-6">Structurally similar stores benefit from similar bundle strategies regardless of industry. A mid-size diverse candy store and a mid-size diverse cosmetics store have more in common (for bundling purposes) than a candy store and a candy subscription box. Industry is classified for analytics but not used in the matching algorithm.</p>

      <h3 className="text-xl font-semibold mb-3">What if no reference stores match the archetype?</h3>
      <p className="mb-6">The recommendation skips the matching and voting layers entirely and falls through to the archetype default (Layer 5), which always produces a result. The merchant sees &quot;Using your catalog profile&quot; instead of &quot;We found X similar stores.&quot;</p>

      <h3 className="text-xl font-semibold mb-3">Why do we need 3 successful matches minimum?</h3>
      <p className="mb-6">Fewer than 3 is too small a sample to trust. If only 1 or 2 stores pass the success filter, their strategies might be coincidental rather than meaningful. With 3+, we have enough signal. Below that, we fall back to structural similarity without requiring success criteria.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Behavioral Signals ─── */}
      <h2 className="text-2xl font-semibold mb-4">Behavioral Signals</h2>

      <h3 className="text-xl font-semibold mb-3">Why is the behavioral override set at 60%?</h3>
      <p className="mb-6">At 60%+, buying 3+ items is the dominant behavior for that store -- it&apos;s what most customers do, not a minority pattern. Lower thresholds would catch stores where it&apos;s common but not dominant enough to guarantee volume discount success. 60% is conservative by design.</p>

      <h3 className="text-xl font-semibold mb-3">What does the 50% &quot;supporting&quot; signal actually do?</h3>
      <p className="mb-6">It only matters in Layer 4 (voting). Each reference store&apos;s &quot;vote&quot; is the bundle type generating the most revenue for them -- their dominant strategy. If the votes don&apos;t reach 60% agreement (e.g., 2 of 5 stores agree but the rest are split), the vote normally fails and falls through to Layer 5. But if the new store also has 50%+ multi-item orders, we keep whichever strategy got the most votes instead of falling through. The behavioral signal acts as a tiebreaker: &quot;the votes are split, but customer behavior supports this choice.&quot;</p>

      <h3 className="text-xl font-semibold mb-3">Do the layers interact? Can a store hit both a pattern match and a behavioral override?</h3>
      <p className="mb-6">No. The waterfall is strictly sequential. If Layer 2 fires (archetype pattern), Layers 3-5 are never evaluated. If Layer 3 fires (behavioral override), Layers 4-5 are never evaluated. Each layer either makes the decision or passes it to the next. This means a MID_HIGH_COMP store matching &quot;premium curated&quot; with 70% multi-item orders gets the premium curated recommendation -- the pattern is considered a more specific signal than the behavioral override.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Edge Cases ─── */}
      <h2 className="text-2xl font-semibold mb-4">Edge Cases</h2>

      <h3 className="text-xl font-semibold mb-3">What if a store has literally zero sales?</h3>
      <p className="mb-6">Same as any store with under 50 orders: flagged as LOW_SAMPLE, gets a starter bundle based on catalog structure alone. Product selection is empty -- the merchant picks products manually. The UI shows &quot;No sales data yet.&quot;</p>

      <h3 className="text-xl font-semibold mb-3">What about multi-currency stores?</h3>
      <p className="mb-6">All calculations use the prices as stored in Shopify (local currency). A $25 EUR store and a $25 USD store are treated the same. This is a known simplification -- no currency conversion is performed.</p>

      <h3 className="text-xl font-semibold mb-3">What if the store has 10,000 products?</h3>
      <p className="mb-6">Only the first 1,000 are analyzed. The rest are ignored. This cap exists for performance reasons.</p>

      <h3 className="text-xl font-semibold mb-3">What happens when reference stores all vote for different strategies?</h3>
      <p className="mb-6">No winner. The vote is discarded. Falls through to Layer 5 (archetype default). Even if one strategy is &quot;close&quot; to winning, no supermajority = no consensus. Note that all successful matches vote (up to 5 stores), not just the top 3.</p>

      <h3 className="text-xl font-semibold mb-3">Where do Tiered Discount and Add-on bundle types come from?</h3>
      <p className="mb-6">They&apos;re uncommon but possible onboarding outputs. They can only appear if reference stores using these strategies vote for them in Layer 4. The starter bundles (Layer 1), archetype patterns (Layer 2), and archetype defaults (Layer 5) never produce them. In practice, almost all onboarding recommendations are Volume Discount, Fixed Bundle Price, or Mix &amp; Match. You&apos;re more likely to see Tiered Discount and Add-on in the <strong>store audit</strong> system (Job 5 in profiling), which recommends them as fixes for specific problems in existing stores.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Monitoring & Operations ─── */}
      <h2 className="text-2xl font-semibold mb-4">Monitoring &amp; Operations</h2>

      <h3 className="text-xl font-semibold mb-3">What should I watch to know if onboarding is working well?</h3>
      <p className="mb-3">Currently, there are no PM-facing dashboards for onboarding quality. The key metrics you&apos;d want (but don&apos;t have yet):</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Recommendation acceptance rate</strong>: How often merchants use the recommendation vs. create from scratch</li>
        <li><strong>Modification rate</strong>: How much merchants change the recommendation before publishing</li>
        <li><strong>Bundle survival rate</strong>: Do merchants keep the recommended bundle active after 30/60/90 days?</li>
        <li><strong>Revenue attribution</strong>: Does the recommended bundle actually generate revenue?</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Can thresholds be changed?</h3>
      <p className="mb-6">Yes, but any change requires an engineering deployment. The thresholds (50-order minimum, 60% override, 60% vote supermajority, etc.) are configured in the codebase, not in a dashboard. If you want to experiment with different values, file an engineering request.</p>

      <h3 className="text-xl font-semibold mb-3">How do I debug a specific store&apos;s recommendation?</h3>
      <p className="mb-6">Ask engineering for the <strong>decision trace</strong> for that store. It&apos;s a step-by-step log showing every layer that was evaluated, what thresholds were checked, which reference stores were matched, and how the final decision was reached. It&apos;s stored internally after every onboarding run.</p>

      <h3 className="text-xl font-semibold mb-3">How often is the reference library updated?</h3>
      <p className="mb-6">The profiling pipeline runs periodically on a configured schedule. When it runs, it re-profiles the top ~100 EasyBundles stores and updates their reference data. New stores that have grown since the last run may be added to the reference library.</p>

      </div>
    </div>
  )
}
