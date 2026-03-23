*Updated: 2026-03-23*

# Fly Bundle Recommendations -- PM FAQ

**Audience:** Product managers, merchant success, operations teams.

**Companion to:** PM_HANDOFF_FLY_BUNDLE_RECOMMENDATIONS.md (read that first for full context)

---

## Getting Started

### How do I trigger a recommendation run for a store?

From the internal testing dashboard, go to the **Fly Strategy** page, enter the store's `.myshopify.com` name, and click Run. The system returns a run ID immediately and processes in the background. You can also trigger it via the API by POSTing to `/api/flyBundleRecommendations/recommend` with `{ "shopName": "store-name.myshopify.com" }`.

### How do I check if a run completed?

In the dashboard, the run history table shows status badges: **running**, **completed**, or **failed**. You can also poll the history detail API endpoint with the run ID. The dashboard auto-polls every 3 seconds until the result is ready or 5 minutes have passed.

### Can I re-run the pipeline for the same store?

Yes. Every run creates a new history entry. The latest run does not overwrite previous ones -- you can compare results over time. Re-running is recommended after significant changes to the store's catalog or after accumulating more orders.

### How long does a run take?

| Store size | Typical duration |
|-----------|-----------------|
| Small (<500 products) | 6-90 seconds |
| Medium (500-2,000 products) | 80-120 seconds |
| Large (2,000-10,000 products) | 2-7 minutes |

The main bottleneck is Shopify API pagination (250 products per page with a 500ms delay between pages) and AI eligibility classification.

### What if a run fails?

Check the error message in the history detail. Common causes:
- **"Zero products found"** -- the store's Shopify access token may be invalid or the store may have no active products
- **Network timeout** -- Shopify API was slow; retry the run
- **Invalid shop name** -- double-check the `.myshopify.com` domain spelling

---

## How Does X Work?

### How does the system decide which product is the trigger vs the companion?

See "Step 13: Generate FBT Triggers -- Direction assignment" in the handoff doc. In short: the product that is bought more often is usually the trigger, unless there is a strong asymmetry in conditional probability (one product predicts the other much better than vice versa).

### How does the system avoid recommending the same product in different colors?

The variant detection system compares Shopify handle prefixes and analyzes title differences. If two products share a handle root and differ only by a color/size token (e.g., "soap-bar-rose" vs "soap-bar-lavender"), they are treated as variants and blocked from being paired. **Known gap:** scent and flavor variants are not yet detected -- see Limitation #8 in the handoff.

### How does the AI eligibility classifier work?

All products go through a Gemini 2.0 Flash classification that labels each as: normal (include), promo/mystery (exclude from triggers), bundle/gift set (exclude from triggers), or non-shoppable (exclude entirely). This works across all languages. If the AI is unavailable, a regex fallback handles English titles. Products flagged by AI can still appear as companions in other bundles -- they are only blocked from being triggers.

### What are "data quality hints" and who sees them?

Data quality hints are actionable suggestions generated for the merchant, such as:
- "Add product types to your catalog to improve grouping quality"
- "You need more organic orders for higher-confidence recommendations"
- "Consider adding collections to organize your products"

These are stored in the `mvr.dataQualityHints` field and displayed by the Fly app dashboard. They help merchants understand what they can do to get better recommendations next time.

### How does the PB vs QB scoring work?

See "Step 9: Classify PB vs QB" in the handoff doc. The short version: PB (pre-curated bundles) wins for stores with diverse catalogs and high pairability. QB (quantity breaks) wins for stores where customers already buy multiple units of the same product and have smaller catalogs. Tie goes to PB.

---

## Edge Cases

### What happens if a store has products but zero orders?

The store is classified as **Tier 4** (Products only). No FBT triggers are possible because FBT requires purchase history. The system generates:
- Custom pools based on product grouping (collections, tags, or price bands)
- Volume discounts as a fallback
- All recommendations are marked **exploratory** confidence

### What happens if a store has only Fly-attributed orders and zero organic orders?

The system uses ALL orders (organic threshold = 0, confidence = "very low"). Fly-attributed orders are included rather than excluded. The recommendations carry lower confidence because the data may reflect bundle-influenced buying rather than natural behavior.

### What if a store has only 2 products?

**Tier 6** (Near-empty). The system cannot form pools or fixed bundles. Only volume discounts are generated (Buy 2 for 5% off, Buy 3 for 10% off, Buy 5 for 15% off) for whichever products have order history.

### What if all of a store's products are gift cards or services?

The product classifier excludes all of them. Zero recommendable products means the run either fails or produces no recommendations. The dashboard would show the classification breakdown explaining why everything was excluded.

### Can the same product appear in multiple recommendation formats?

Yes. A product can be an FBT trigger, appear in a custom pool, AND be part of a volume discount. The only exclusivity rule is for fixed bundles: a product can appear in at most one fixed bundle.

### What happens if Shopify rate-limits our API calls during a run?

The system paginates with a 500ms delay between pages specifically to avoid rate limiting. If a rate limit is hit, the specific API call fails and the run may produce an error. Retrying after a few minutes usually resolves this.

### What if a product was in orders but has since been deleted from Shopify?

These are "ghost products." They appear in order history but not in the current catalog. The system automatically filters them out during FBT analysis. This means some co-purchase signal is lost, but it prevents recommending products that no longer exist.

### Why would a store get volume discounts when it is classified as PB (not QB)?

The MVR guarantee overrides the PB/QB classification for fallback purposes. If a Tier 4+ store has no pools or fixed bundles, volume discounts are generated regardless of PB/QB classification to ensure the store gets at least something.

---

## Monitoring and Operations

### How do I see all recent runs across stores?

The Fly Strategy page in the dashboard has a history table with filters for: status, tier, recommendation strength, Shopify plan, date range, product count, order count, and organic order count. You can sort by any column.

### How do I provide feedback on a run's quality?

Each completed run has a feedback section where you can mark it as "correct", "incorrect", or "partially correct" with optional free-text notes. This feedback is stored with the run and can be used to track pipeline quality over time.

### What metrics should I watch for pipeline health?

| Metric | Healthy range | Concern if... |
|--------|---------------|---------------|
| Completion rate | 95%+ | More than 5% of runs fail |
| Avg run time (medium store) | 80-120s | Consistently over 3 minutes |
| MVR coverage (hasMinimumViable) | 100% | Any store gets zero recommendations |
| FBT trigger rate | 80%+ of stores with 50+ orders | Drops below 70% |
| Average recommendations per store | ~20 | Drops below 10 consistently |

### Can thresholds be changed?

All thresholds (co-occurrence minimum, lift minimum, price compatibility range, pool size limits, etc.) are defined in the backend pipeline code. Changing them requires a code change and deployment. There is no admin UI for threshold configuration. Contact engineering if a threshold needs adjustment.

### How do I debug why a specific product was excluded?

Check the run's `classification` section in the history detail. It shows:
- How many products were found total
- How many were excluded by deterministic rules (and why: gift card, $0, inactive, etc.)
- How many were sent to AI classification
- How many the AI excluded (and the category: promo, mystery, gift set, non-shoppable)

### How do I debug why an FBT pair was suppressed?

Check the run's `quality` section. It contains:
- **Variant block log** -- pairs blocked because they are variants of each other
- **Suppression log** -- pairs removed for price ratio or confidence violations
- **Direction log** -- which product became trigger and why
- **Eligibility log** -- products excluded by the AI classifier
- **Substitute log** -- pairs blocked because the products serve the same function

### Where does the store trace appear?

The `storeTrace` field in the run result contains a plain-English narrative of every decision. In the dashboard, this appears as a "Decision Trace" section with blue highlighting. It is designed to be readable by non-technical team members.

---

## "What If...?" Scenarios

### What if a merchant says "the recommendations don't match my store"?

1. Check the tier -- if Tier 4-6, the system had limited data to work with. Explain this to the merchant.
2. Check the grouping strategy -- if it fell to "price bands" (quality: low), the store lacks product types/tags/collections. Suggest the merchant add product metadata.
3. Check companion strength labels -- if all "weak", the store likely has many products relative to its orders. This will improve over time.
4. Check the store trace for specific decisions that may explain surprising results.

### What if a merchant wants to exclude specific products from recommendations?

The merchant can add the tag `hide-recommendation` or `smart-cart-hide-bundle-options` to any product in Shopify. On the next pipeline run, those products will be excluded by the deterministic classifier.

### What if we want to run the pipeline for every store automatically?

The pipeline currently runs on demand (triggered by a request). Scheduling automatic runs would require an engineering change to add a cron job or webhook trigger. The pipeline is designed to be idempotent -- running it multiple times for the same store is safe.

### What if a store has 10,000+ products?

The system has a safety cap at 10,000 products. Products beyond this limit are not fetched. For stores near this limit, the run will be slow (4-7 minutes) due to API pagination. The recommendations will still be valid -- they just may not include every product in the catalog.

### What if a store's orders are mostly returns or cancelled?

The system fetches orders of all statuses. Cancelled and returned orders are included in co-purchase analysis. This could slightly skew results for stores with very high return rates, but in practice the impact is minimal because the same pair patterns persist.

### What if a merchant asks why they got volume discounts instead of FBT?

Check the tier and order count. If the store is Tier 4+ (no orders) or has very few orders, FBT is not possible. Volume discounts are a fallback. Explain: "FBT recommendations need purchase history to identify what customers buy together. Your store does not have enough order data yet. Volume discounts work without order history because they are based on individual products."
