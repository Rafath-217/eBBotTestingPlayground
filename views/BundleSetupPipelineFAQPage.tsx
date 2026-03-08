import { useRef, useState } from 'react'

export default function BundleSetupPipelineFAQPage() {
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
        <h1 className="text-3xl font-bold">Bundle Setup LLM Pipeline -- PM FAQ</h1>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 text-slate-500 dark:text-slate-400 italic">
        <p><strong>Audience:</strong> Product managers, non-technical stakeholders</p>
        <p><strong>Companion doc:</strong> <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">PM_HANDOFF_PIPELINE.md</code> (full pipeline walkthrough)</p>
      </blockquote>
      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      <div ref={contentRef}>

      {/* ─── Getting Started ─── */}
      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>

      <h3 className="text-xl font-semibold mb-3">How do I trigger the pipeline?</h3>
      <p className="mb-6">Send a POST request to the pipeline endpoint with at minimum a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">merchantText</code> field. Collections and products are optional but improve accuracy. The pipeline can be triggered from the bundle creation UI in the dashboard or through the internal API. The <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">merchantText</code> field is required -- if it is missing, the system returns a 400 error.</p>

      <h3 className="text-xl font-semibold mb-3">Can I re-run the pipeline on the same merchant text?</h3>
      <p className="mb-6">Yes. Every run is independent. You can re-run with the same text or modified text. Each run is logged separately in the database with its own trace, timing, and pattern tags.</p>

      <h3 className="text-xl font-semibold mb-3">Can I skip logging for a test run?</h3>
      <p className="mb-6">Yes. Pass <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">skipLogging: true</code> in the request body. The pipeline will run normally but will not write to the pipeline logs database.</p>

      <h3 className="text-xl font-semibold mb-3">How long does a pipeline run take?</h3>
      <p className="mb-6">Typically 2-5 seconds. The two main bottlenecks are the AI calls: Structure AI and Discount AI run in parallel (so the slower of the two determines Phase 1 timing), then Rules AI runs sequentially. Each AI call has a 30-second timeout. Assembly is instant.</p>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── How Does It Work? ─── */}
      <h2 className="text-2xl font-semibold mb-4">How Does It Work?</h2>

      <h3 className="text-xl font-semibold mb-3">What happens when the merchant provides no collections and no products?</h3>
      <p className="mb-6">The pipeline still works. The Structure AI makes its decision based on text alone (without inventory context, it cannot provide hints). The category builder creates a single empty placeholder category. The discount and rules layers work normally. The resulting bundle has one step with one empty category that the merchant can fill in manually.</p>

      <h3 className="text-xl font-semibold mb-3">What happens when the merchant provides only products, no collections?</h3>
      <p className="mb-6">Products are grouped by their product type. Each unique product type becomes a category. Products without a product type are grouped under &quot;Other&quot;. If the Structure AI returned product group hints (custom named groups), those take priority over type-based grouping.</p>

      <h3 className="text-xl font-semibold mb-3">What happens when the Structure AI says &quot;multi-step&quot; but does not provide step definitions?</h3>
      <p className="mb-6">The system creates two generic steps labeled &quot;Step 1&quot; and &quot;Step 2&quot; and sets the MULTI_STEP_MISSING_STEPS flag. Collections are evenly distributed across the two steps.</p>

      <h3 className="text-xl font-semibold mb-3">How does the system decide between single-step and multi-step?</h3>
      <p className="mb-6">The Structure AI looks for <strong>sequential connectors</strong> in the merchant text: &quot;first... then...&quot;, &quot;next&quot;, &quot;Step 1... Step 2...&quot;, numbered sequences, or the phrase &quot;multistep bundle&quot;. If no sequential flow is described, it defaults to single-step. It also checks inventory: if there is only 1 collection and 0 product types, it forces single-step even if the merchant asked for multi-step.</p>

      <h3 className="text-xl font-semibold mb-3">How does BXGY differ from regular percentage discounts?</h3>
      <p className="mb-3">BXGY (&quot;Buy X Get Y&quot;) is treated as a completely separate path:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>The Discount AI recognizes BXGY patterns (e.g., &quot;Buy 2 get 1 free&quot;, &quot;BOGO&quot;, &quot;3 for 2 deal&quot;).</li>
        <li>The Rules AI is <strong>not called</strong> -- it is skipped entirely for BXGY.</li>
        <li>The assembly layer determines the rules deterministically:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
            <li><strong>Single-step:</strong> Minimum quantity = buyQty + getQty (e.g., &quot;Buy 2 get 1 free&quot; = at least 3 items). Discount target is &quot;cheapest item.&quot;</li>
            <li><strong>Multi-step:</strong> Step 1 minimum = buyQty, Step 2 minimum = getQty. Discount target is &quot;step-targeted.&quot;</li>
          </ul>
        </li>
        <li>On the frontend, BXGY is displayed as &quot;BOGO&quot; (the label is converted by the transformer).</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3">What is the difference between &quot;Buy 2 get 1 free&quot; and &quot;Buy 2 get 10% off&quot;?</h3>
      <p className="mb-3">This is a critical distinction in how the Discount AI processes text:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>&quot;Buy 2 get 1 free&quot;</strong> -- the word after &quot;get&quot; is a <strong>number of items</strong> (1 free item). This is BXGY mode.</li>
        <li><strong>&quot;Buy 2 get 10% off&quot;</strong> -- the word after &quot;get&quot; is a <strong>percentage</strong>. This is Percentage mode, NOT BXGY.</li>
        <li><strong>Exception:</strong> &quot;Buy 5 from Collection A, get 30% off Collection B&quot; IS BXGY because different categories are named for buy vs. get (cross-category discount).</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What determines whether rules are applied per-category or per-step?</h3>
      <p className="mb-3">Per-category rules are used only when ALL of these are true:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li>The merchant explicitly names distinct product groups with per-group quantities (e.g., &quot;Select 2 Converse and 3 Nike&quot;)</li>
        <li>The Category Context confirms those groups exist as actual categories in the step</li>
        <li>The step has more than one category</li>
      </ol>
      <p className="mb-6">If any of those conditions is not met, rules are applied at the step level. Within each step, rules are always either entirely category-level or entirely step-level -- never a mix.</p>

      <h3 className="text-xl font-semibold mb-3">How does the &quot;Fixed Bundle Price&quot; mode work differently from other discounts?</h3>
      <p className="mb-3">Fixed Bundle Price is the strictest mode. The total quantity from the discount tier is treated as absolute:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Rules are always &quot;exactly X&quot; (not &quot;at least X&quot;).</li>
        <li>The merchant text quantity is <strong>ignored</strong> if it conflicts with the discount quantity.</li>
        <li>For multi-step: the total is distributed across steps with larger portions to earlier steps (e.g., 5 across 2 steps = 3 + 2).</li>
        <li>Per-category rules are never used with Fixed Bundle Price.</li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Edge Cases ─── */}
      <h2 className="text-2xl font-semibold mb-4">Edge Cases</h2>

      <h3 className="text-xl font-semibold mb-3">What if the merchant writes in a non-English format with commas as decimals?</h3>
      <p className="mb-3">The Discount AI and its normalizer handle locale-formatted numbers. For example:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>&quot;149,50&quot; (European format) is converted to &quot;149.50&quot;</li>
        <li>&quot;1.299,00&quot; (European thousands + decimal) is converted to &quot;1299&quot;</li>
        <li>&quot;$24.990&quot; (Chilean peso thousands, exactly 3 digits after last period) is converted to &quot;24990&quot;</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What if the merchant text has conflicting information?</h3>
      <p className="mb-3">The Discount AI has specific rules:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>If tiers mix different discount modes (e.g., some percentage, some fixed), only the majority mode is extracted and minority tiers are dropped.</li>
        <li>If text has conflicting numbers (e.g., &quot;Buy 2... 3 for $10&quot;), the AI prioritizes the number associated with the price or discount.</li>
        <li>If the Rules AI receives a discount quantity that conflicts with the merchant text, Fixed Bundle Price always wins; Percentage/Fixed defers to the merchant text.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What if a collection title does not match any of the AI&apos;s hints?</h3>
      <p className="mb-6">Unmatched collections are distributed to the step with the fewest items (smallest-bucket-first approach). This ensures no collection is lost -- it just may not land in the ideal step.</p>

      <h3 className="text-xl font-semibold mb-3">What if the merchant selects more than 30 collections?</h3>
      <p className="mb-6">Only the first 30 collections are shown to the Structure AI. The rest are still used in category building but the AI cannot provide hints for them. Those extra collections will be distributed using even distribution or smallest-bucket-first.</p>

      <h3 className="text-xl font-semibold mb-3">What if all three AI layers fail?</h3>
      <p className="mb-3">If the entire pipeline crashes (not individual AI failures, but an unhandled exception), it returns:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Empty steps</li>
        <li>Percentage discount mode with default tiers (Buy 2 = 5%, Buy 3 = 10%, Buy 4 = 15%)</li>
        <li>Status: &quot;ERROR&quot;</li>
        <li>A Slack notification is sent to the engineering team</li>
      </ul>
      <p className="mb-3">If individual AI layers fail but the pipeline itself does not crash:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Structure AI failure: single-step, single locked category (SAFE_DEFAULT_USED flag)</li>
        <li>Discount AI failure: default tiers applied</li>
        <li>Rules AI failure: rules bridged from discount tiers, or hard default (at least 2)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What happens with &quot;Buy 2 and save&quot; where no discount amount is stated?</h3>
      <p className="mb-3">The Discount AI extracts the quantity (2) with a special &quot;UNSPECIFIED&quot; marker for the discount value. The assembly layer then fills in defaults:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>If it is the only tier: discount is set to 10%</li>
        <li>If there are multiple &quot;UNSPECIFIED&quot; tiers: discounts increment by 5% (5%, 10%, 15%, etc.)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What happens when product types are empty for all products?</h3>
      <p className="mb-6">All products are grouped under a single &quot;Other&quot; category. If there is only one product type group (even if it is &quot;Other&quot;), a single category is created with all products in it. The label is set to null (not &quot;Other&quot;) when all products share the same type. When there are multiple types including &quot;Other&quot;, the &quot;Other&quot; group keeps its label.</p>

      <h3 className="text-xl font-semibold mb-3">Does the system retry when an AI call times out?</h3>
      <p className="mb-6"><strong>No.</strong> Timeouts are NOT retried. Only rate-limit errors (HTTP 429 / &quot;Resource exhausted&quot;) are retried (up to 2 times with delays of 1 second then 2 seconds). When a timeout occurs, the system immediately returns that AI layer&apos;s default output and sends a Slack notification. This is intentional -- if the model is slow, retrying would just make the user wait longer.</p>

      <h3 className="text-xl font-semibold mb-3">What happens if the Discount AI returns an invalid discount mode?</h3>
      <p className="mb-6">If the AI returns a discount mode not in the valid list (Percentage, Fixed, Fixed Bundle Price, BXGY), the entire discount output is rejected and the system applies default tiers (Buy 2 = 5%, Buy 3 = 10%, Buy 4 = 15%).</p>

      <h3 className="text-xl font-semibold mb-3">What if the Discount AI returns 0% or a negative discount for BXGY?</h3>
      <p className="mb-6">BXGY discount values must be between 1 and 100. If the AI returns 0, a negative number, or a non-number, the system defaults to 100% (free). Values above 100 are capped at 100.</p>

      <h3 className="text-xl font-semibold mb-3">What if the AI returns its response in an unexpected format?</h3>
      <p className="mb-3">The system handles several format issues automatically:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>If the AI wraps JSON in markdown code fences, the system strips them.</li>
        <li>If the Discount AI returns an array of separate objects (one per tier) instead of a single object, the system merges them and deduplicates rules.</li>
        <li>If the AI returns extra fields beyond what&apos;s expected, they are ignored.</li>
        <li>If JSON parsing fails entirely, a Slack notification is sent and the default output is used.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What happens with more than 2 steps in a BXGY bundle?</h3>
      <p className="mb-3">BXGY is designed for 2 steps maximum. If there are more:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Step 1 (trigger): minimum = buyQty (floor of 2)</li>
        <li>Step 2 (reward): minimum = getQty (floor of 1, NOT 2)</li>
        <li>Steps 3+: receive a generic &quot;at least 2&quot; default</li>
      </ul>
      <p className="mb-6">This means Step 3 and beyond do not have BXGY-specific logic -- they behave like regular steps.</p>

      <h3 className="text-xl font-semibold mb-3">How is the &quot;unspecified discount&quot; path different from &quot;no discount&quot;?</h3>
      <p className="mb-3">&quot;No discount&quot; means the merchant didn&apos;t mention any discount at all (e.g., &quot;Build your own bundle&quot;). The system applies default tiers.</p>
      <p className="mb-6">&quot;Unspecified discount&quot; means the merchant mentioned a discount but didn&apos;t state the amount (e.g., &quot;Buy 2 and save&quot;). The system extracts the quantity (2) and fills in default values: 10% if there&apos;s only one tier, or incrementing by 5% for multiple tiers (5%, 10%, 15%, etc.).</p>

      <h3 className="text-xl font-semibold mb-3">What determines how categories are removed after distribution?</h3>
      <p className="mb-3">Two cleanup passes happen after distribution in multi-step bundles:</p>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Empty categories removed:</strong> Any category that has no backing collection and no products is deleted from its step. Remaining categories are re-numbered.</li>
        <li><strong>Empty steps removed:</strong> Any step that was auto-generated (not explicitly named by the AI) AND has no real categories is removed. Steps with labels from the AI are always kept, even if empty.</li>
      </ol>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── Monitoring and Operations ─── */}
      <h2 className="text-2xl font-semibold mb-4">Monitoring and Operations</h2>

      <h3 className="text-xl font-semibold mb-3">How do I see what the pipeline decided?</h3>
      <p className="mb-3">Every pipeline run returns a <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">decision_trace</code> object with three sections:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Structure:</strong> What pattern was detected (e.g., &quot;SINGLE_STEP&quot;, &quot;MULTI_STEP_EXPLICIT&quot;), the reason, and the AI&apos;s own reasoning text.</li>
        <li><strong>Discount:</strong> What pattern was detected (e.g., &quot;EXTRACTED&quot;, &quot;DEFAULT_TIERS&quot;, &quot;BXGY_EXTRACTED&quot;), the reason, and the AI&apos;s reasoning.</li>
        <li><strong>Rules:</strong> What pattern was detected (e.g., &quot;EXPLICIT_CONDITIONS&quot;, &quot;BRIDGED_FROM_DISCOUNT&quot;, &quot;DEFAULT_APPLIED&quot;, &quot;BXGY_SINGLE_STEP&quot;), the reason, and the AI&apos;s reasoning.</li>
        <li><strong>Fallbacks used:</strong> A list of any fallback flags that were triggered.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">How do I know if the AI is making mistakes?</h3>
      <p className="mb-3">Look at the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">flags</code> object and the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">_debug</code> section in the response:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">flags.SAFE_DEFAULT_USED = true</code> means the Structure AI failed</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">_debug.geminiError = true</code> means at least one AI call had an error</li>
        <li><code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">_debug.geminiErrorLLMsFailed</code> lists which AI layers failed (e.g., [&quot;structure&quot;, &quot;discount&quot;])</li>
      </ul>
      <p className="mb-6">Pipeline runs are also logged to MongoDB with pattern tags that can be queried for analysis (e.g., &quot;discount:bxgy&quot;, &quot;pipeline:has_fallback&quot;, &quot;structure:has_hint_discards&quot;).</p>

      <h3 className="text-xl font-semibold mb-3">Can thresholds be changed?</h3>
      <p className="mb-3">The following values are configurable in the pipeline configuration file but require a code change and redeployment:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Default discount tiers (currently 2→5%, 3→10%, 4→15%)</li>
        <li>Minimum quantity (currently 2 for single-step, 1 for multi-step)</li>
        <li>Retry count and delays</li>
        <li>Timeout per AI call</li>
        <li>AI model name</li>
        <li>AI temperature, topK, topP, and max output tokens</li>
        <li>Discount code prefix</li>
        <li>Context limits (max collections, product types, product titles)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">How do I debug a specific pipeline run?</h3>
      <p className="mb-3">Every run is logged to the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">bundleSetupLlmPipelineLogs</code> collection in MongoDB with:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Full input (merchant text, products, collections)</li>
        <li>All three AI outputs (raw)</li>
        <li>The assembled result</li>
        <li>A trace with timing for each phase</li>
        <li>Pattern tags for filtering</li>
        <li>Error information if any AI failed</li>
        <li>The shop name and source</li>
      </ul>
      <p className="mb-6">You can filter logs by pattern tags like &quot;discount:bxgy&quot;, &quot;structure:multi_step&quot;, &quot;pipeline:gemini_error&quot;, &quot;rules:category_level&quot;, etc. See the &quot;Pattern Tags Reference&quot; section in the Handoff doc for the full list of available tags.</p>

      <h3 className="text-xl font-semibold mb-3">What notifications does the pipeline send?</h3>
      <p className="mb-3">The pipeline sends Slack notifications when:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>An AI call fails after all retries (with error type and details)</li>
        <li>An unhandled error occurs in the assembly layer</li>
        <li>An unhandled error occurs in the main pipeline runner</li>
        <li>JSON parsing fails for an AI response</li>
      </ul>

      <hr className="border-slate-200 dark:border-slate-700 mb-8" />

      {/* ─── "What If...?" ─── */}
      <h2 className="text-2xl font-semibold mb-4">&quot;What If...?&quot;</h2>

      <h3 className="text-xl font-semibold mb-3">What if we want to add a new discount mode?</h3>
      <p className="mb-6">The discount mode would need to be added to the valid discount modes list in the pipeline configuration (currently: Percentage, Fixed, Fixed Bundle Price, BXGY). The Discount AI prompt would need new examples for the mode. The assembly layer would need a new handler in the rules resolver priority cascade. The transformer would need to map the internal mode name to whatever the frontend expects.</p>

      <h3 className="text-xl font-semibold mb-3">What if a merchant wants different discount types per step in multi-step?</h3>
      <p className="mb-6">This is not supported. The entire bundle uses one discount mode. Each step shares the same discount configuration. The system enforces this -- even if the AI somehow extracted different modes, only one mode propagates through assembly.</p>

      <h3 className="text-xl font-semibold mb-3">What if a merchant types a URL instead of a description?</h3>
      <p className="mb-6">The AI treats it as any other input. The Structure AI would likely return single-step (no sequential flow detected). The Discount AI would likely return null (no discount pattern found), resulting in default tiers. The Rules AI would return the default &quot;at least 2&quot;. The bundle would be created with safe defaults.</p>

      <h3 className="text-xl font-semibold mb-3">What if we need to support a new language?</h3>
      <p className="mb-6">The AI model (Gemini 2.0 Flash) has multilingual capabilities. The prompts are in English but the merchant text can be in any language the model understands. Number extraction and locale formatting are already handled. However, collection hints and product type hints depend on the AI understanding the language of the merchant&apos;s inventory titles.</p>

      <h3 className="text-xl font-semibold mb-3">What if we change the AI model?</h3>
      <p className="mb-6">The model is configured centrally. Changing it requires updating one field per AI layer in the pipeline configuration. All three layers currently use the same model (&quot;gemini-2.0-flash&quot;) but they can use different models. The prompts are model-agnostic but may need tuning for a different model&apos;s strengths.</p>

      <h3 className="text-xl font-semibold mb-3">What if multiple BXGY tiers are returned (e.g., &quot;Buy 2 get 1 free, Buy 4 get 2 free&quot;)?</h3>
      <p className="mb-6">The system uses the <strong>lowest tier</strong> for minimum quantity calculation. In this example, the lowest buy quantity is 2, so the minimum is derived from Buy 2 Get 1. The additional tiers are preserved in the discount rules for the frontend to display progressively.</p>

      <h3 className="text-xl font-semibold mb-3">How are category IDs generated in the final output?</h3>
      <p className="mb-6">Category IDs are randomly generated 5-digit numbers at transform time (e.g., &quot;category47382&quot;). They are not deterministic -- re-running the pipeline on the same input will produce different category IDs. This does not affect functionality since the IDs are only used as internal keys.</p>

      <h3 className="text-xl font-semibold mb-3">What does the decision trace look like for a BXGY run?</h3>
      <p className="mb-3">For a &quot;Buy 2 get 1 free&quot; single-step run:</p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>Structure:</strong> pattern = &quot;SINGLE_STEP&quot;</li>
        <li><strong>Discount:</strong> pattern = &quot;BXGY_EXTRACTED&quot;, reason = &quot;BXGY with 1 tier(s)&quot;</li>
        <li><strong>Rules:</strong> pattern = &quot;BXGY_SINGLE_STEP&quot;, reason = &quot;gte 3 from lowest BXGY tier (buy=2, get=1), target=CHEAPEST_ITEM&quot;</li>
        <li><strong>fallbacks_used:</strong> [] (no fallbacks needed)</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">What are the three bundle display types?</h3>
      <ol className="list-decimal list-inside mb-6 space-y-2">
        <li><strong>Fullpage bundle</strong> -- dedicated page with step navigation, landing page, filters, search, and summary</li>
        <li><strong>PDP bundle</strong> -- embedded on a product detail page, more compact, with category ranking</li>
        <li><strong>Product Page bundle</strong> -- similar to PDP but with different discount text templates (no BOGO-specific text rules)</li>
      </ol>
      <p className="mb-6">The pipeline output is the same for all three types; only the transformer layer formats the output differently.</p>

      <h3 className="text-xl font-semibold mb-3">How do I tell if hint discards happened?</h3>
      <p className="mb-6">Check the decision trace for a &quot;hintDiscards&quot; entry. It contains the count and details of which product titles were removed from which group hints. In database logs, look for the <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">structure:has_hint_discards</code> pattern tag.</p>

      <h3 className="text-xl font-semibold mb-3">What is the &quot;locked&quot; category?</h3>
      <p className="mb-6">When the Structure AI fails completely (returns null), the system creates a single &quot;locked&quot; category that merges ALL collections and ALL products into one bucket. This is the most conservative fallback -- it ensures every item is included, but the merchant will need to manually organize them into proper categories. The SAFE_DEFAULT_USED flag is set to true in this case.</p>

      </div>
    </div>
  )
}
