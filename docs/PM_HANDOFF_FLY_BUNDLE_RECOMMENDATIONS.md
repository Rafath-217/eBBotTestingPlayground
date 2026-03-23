*Updated: 2026-03-23*

# Fly Bundle Recommendations -- PM Handoff

**Audience:** Product managers, merchant success, anyone who needs to understand what this system does without reading code.

**Related docs:** PM_FAQ_FLY_BUNDLE_RECOMMENDATIONS.md (edge cases and operations)

---

## Glossary

| Term | Meaning |
|------|---------|
| **FBT** | Frequently Bought Together -- products customers buy in the same order. The system identifies these patterns from real purchase history. |
| **Trigger product** | The "main" product in an FBT pairing. When a customer views or adds this product to their cart, the system recommends companion products alongside it. |
| **Companion product** | A product recommended alongside a trigger. Example: a phone case recommended when a customer views a phone. |
| **Custom pool** | A set of 4-8 related products that a customer can mix-and-match from. Example: "Pick any 3 soaps from these 6." |
| **Fixed bundle** | A pre-curated combination of 2-3 specific products sold together. Example: "Shampoo + Conditioner + Brush." |
| **Volume discount** | A "buy more, save more" offer on a single product. Example: "Buy 2 for 5% off, buy 3 for 10% off." |
| **Organic order** | An order placed by a customer without any bundle app involvement -- represents natural buying behavior. |
| **Fly-attributed order** | An order that came through the Fly bundle app. These are excluded from analysis to avoid circular recommendations. |
| **Lift** | How much more likely two products are to be bought together compared to random chance. A lift of 3.0 means 3x more likely than random. |
| **Co-frequency** | The number of orders in which two specific products both appeared. |
| **Bundleable product** | A product that qualifies for bundle recommendations -- not a gift card, service, donation, or test product. |
| **Recommendable product** | A bundleable product that is also active (not draft/archived) and has a valid price greater than zero. |
| **MVR** | Minimum Viable Recommendation -- the system's guarantee that every store gets at least one actionable recommendation, even with limited data. |
| **Tier** | A data quality classification (1-6) that determines what kind of recommendations the system can produce. Lower is better. |
| **Product grouping** | How the system organizes products into categories for pool generation. Uses a 5-strategy chain from best to worst. |
| **Variant pair** | Two products that are actually different versions of the same product (e.g., "T-Shirt Red" and "T-Shirt Blue"). The system blocks these from being bundled together. |
| **Suppression** | Removing an FBT pairing because it fails a quality check -- for example, a very cheap accessory paired with an expensive product that customers rarely buy together. |
| **Coherence gate** | An AI review step that checks whether a bundle makes sense from a merchandising perspective. |
| **Functional group** | Products that serve the same purpose (e.g., all moisturizers). Used to prevent recommending substitutes together. |
| **Template** | The visual layout and configuration the Fly app uses to display a bundle to the customer. |
| **PB** | Pre-curated Bundles -- the system's classification for stores better suited to curated product combinations. |
| **QB** | Quantity Breaks -- the system's classification for stores where "buy more, save more" on single products works better. |
| **IQR** | Interquartile Range -- a statistical method used to identify and trim price outliers from pools. |

---

## Quick Reference

| Setting | Value | Plain English |
|---------|-------|---------------|
| Max FBT triggers per store | 8 | Up to 8 products can each have their own "customers also bought" widget |
| Max companions per trigger | 4 | Each trigger shows up to 4 recommended companion products |
| Max custom pools | 4 | Up to 4 mix-and-match pools per store |
| Max fixed bundles | 12 | Up to 12 pre-curated bundle suggestions per store |
| FBT pair cap | 200 | Analyze up to 200 co-purchase pairs (downstream quality filters handle the rest) |
| FBT minimum co-occurrences | 3 | Products must appear together in at least 3 orders to be considered |
| FBT minimum lift | 1.0 | The pairing must be at least as likely as random chance |
| FBT price compatibility | 0.3x - 3x | Products must be within roughly 1/3 to 3x of each other's price |
| QB self-bundler threshold | 10% | A product qualifies as a "self-bundler" if 10%+ of its orders include multiple units |
| QB minimum orders | 3 | Product needs at least 3 orders to qualify for QB analysis |
| Pool minimum products | 4 | A category needs at least 4 products with orders to become a pool |
| Pool price spread cap | 5x | The most expensive product in a pool can be at most 5x the cheapest |
| Organic order threshold (high confidence) | 50+ | Store's recommendations are considered high-confidence |
| Organic order threshold (moderate) | 20-49 | Moderate confidence in recommendations |
| Low organic fallback | 1-19 | Uses all orders (including Fly-attributed) with lower confidence |
| Tier 1: Full data | 20+ organic orders + recommendations | Best case -- strong signals |
| Tier 5: Tiny catalog | Fewer than 10 products | Entire catalog offered as one pool |
| Tier 6: Near-empty | Fewer than 3 products | Volume discount only |
| Product fetch cap | 10,000 | Safety limit for very large stores |
| Order fetch cap | 1,000 | Recent order history used for analysis |
| LLM batch size | 500 | Maximum products sent to AI classifier at once |
| LLM cache duration | 1 hour | Classification results are cached to avoid repeated AI calls |
| Coherence cache | 30 minutes | Bundle coherence scores are cached |
| Volume discount tiers | Buy 2: 5% off, Buy 3: 10% off, Buy 5: 15% off | Default discount structure |

---

## What Is Fly Bundle Recommendations?

Fly Bundle Recommendations is an automated system that analyzes a Shopify store's product catalog and purchase history, then generates specific bundle recommendations the merchant can use to increase average order value. The system runs as a background job -- a request triggers it, and results are available in the run history when complete (typically 1-2 minutes). The output includes four types of recommendations: FBT triggers (upsell widgets), custom pools (mix-and-match), fixed bundles (pre-curated sets), and volume discounts (buy-more-save-more). Every recommendation includes a confidence level, reasoning trace, and suggested template configuration for the Fly app frontend.

---

## Running Examples

### Example A: "So Sweet Shop UK" -- a large candy store with good data

- ~9,300 products (imported candy, snacks, drinks), ~3,000 recommendable (active with valid prices)
- ~1,000 orders fetched, all organic
- 54% multi-item order rate -- strong co-purchase signal
- **Expected path:** Tier 1, tag-based grouping, 8 FBT triggers, 4 custom pools, 12 fixed bundles

### Example B: "New Tiny Candle Shop" -- a small store with 7 products and 5 orders

- 7 active products, all candles
- 5 total orders, 0 organic (all came through Fly)
- No product types assigned
- **Expected path:** Tier 5 (tiny catalog), uses all orders, single "complete catalog" pool, volume discounts as fallback

We will trace both examples through the pipeline below.

---

## Core Concepts

### The Four Recommendation Formats

| Format | What the merchant sets up | What the customer sees | Best for |
|--------|--------------------------|----------------------|----------|
| **FBT Trigger** (BUNDLE_UPSELL) | Widget on product page: "Customers also bought..." | Companion products shown when viewing/adding the trigger product | Stores with multi-item order history |
| **Custom Pool** (CUSTOM_BUNDLE) | "Pick any 3 from this set" | Mix-and-match selection from a curated group | Stores with deep product categories |
| **Fixed Bundle** (CUSTOM_BUNDLE) | "Buy these 2-3 products together" | Pre-curated set, ready to add to cart | Stores where specific combos are popular |
| **Volume Discount** (VOLUME_BUNDLE) | "Buy 2+ for a discount" | Quantity selector with tiered pricing | Products customers already buy in multiples |

### Data Quality Tiers

The system classifies each store into a tier based on how much usable data it has. This determines which recommendation types are possible.

| Tier | Label | Condition | What the store gets |
|------|-------|-----------|-------------------|
| 1 | Full data | 20+ organic orders AND at least 1 recommendation generated | All four formats, highest confidence |
| 2 | Weak grouping | Orders exist but primary pipeline produced no recommendations | Fallback pools from product groups + volume discounts |
| 3 | Low organic | Fewer than 20 organic orders | Uses all orders (lower confidence), still generates all formats |
| 4 | Products only | Zero orders | Collection/tag/price-based pools + volume discounts only |
| 5 | Tiny catalog | Fewer than 10 active products | Entire catalog as one pool + volume discounts |
| 6 | Near-empty | Fewer than 3 active products | Volume discounts only |

**Example A** (candy store): Tier 1 -- 1,000 organic orders, strong co-purchase signals.
**Example B** (candle shop): Tier 5 -- only 7 products, so the entire catalog becomes one pool.

### Confidence Levels

Every recommendation carries a confidence label that tells the merchant how strong the evidence is.

| Confidence | Meaning | When it appears |
|------------|---------|----------------|
| **high** | Strong evidence from purchase history | FBT: average lift >= 2.0 with strong/moderate companions. Pool: 20+ total orders and 6+ products. Bundle: triangle pattern with lift >= 2.0. |
| **medium** | Moderate evidence, worth trying | FBT: lift >= 1.5 OR strong companion. Pool: 5+ total orders. Bundle: pair with lift >= 1.5. Also assigned when sample size is low (caps upward from high). |
| **exploratory** | Limited evidence, test and learn | Everything else -- heuristic fallbacks, pool-derived, bridge bundles, or very new data. |

### Organic vs Fly-Attributed Orders

The system separates "organic" orders (placed without Fly involvement) from "Fly-attributed" orders (placed through the bundle app). This prevents circular reasoning -- you would not want to recommend bundles based on purchases that were already driven by bundles.

**How the organic threshold works:**

| Organic order count | Strategy | Confidence |
|--------------------|----------|------------|
| 50+ | Use organic orders only | High |
| 20-49 | Use organic orders only | Moderate |
| 1-19 | Use ALL orders (organic weighted 2x) | Low |
| 0 | Use ALL orders | Very low |

**Example A:** 1,000 organic orders -- uses organic only, high confidence.
**Example B:** 0 organic orders -- uses all 5 orders (all Fly-attributed), very low confidence.

---

## The Pipeline Flow

When a request hits the `/recommend` endpoint, the system returns immediately with a run ID and processes in the background. Here is what happens step by step:

### Step 1: Resolve Store Context

The system needs two things: a Shopify access token and a list of Fly-attributed order IDs to exclude.

- If the request includes an access token, it uses that. Otherwise, it looks up the token from the Fly production database (encrypted, AES-256-GCM).
- If the request includes order IDs to exclude, it uses those. Otherwise, it fetches all Fly-attributed order IDs from the database.

### Step 2: Fetch Store Data

Three parallel API calls to Shopify:
1. **Products** -- full catalog (up to 10,000), paginated at 250 per page with 500ms delay between pages
2. **Orders** -- recent order history (up to 1,000), all statuses
3. **Shop info** -- store name and Shopify plan

If zero products are found, the run fails with an error.

### Step 3: Classify Products

Not every product should be in a bundle. The system uses a two-stage classifier:

**Stage 1 -- Deterministic rules** (fast, no AI):
- Hard exclude: gift cards, services, fees, returns, carrier bags, digital products (by product type)
- Hard exclude: products with "hide-recommendation" or "smart-cart-hide-bundle-options" tags
- Hard exclude: exact title matches like "Test Product", "Gift Card"
- Hard exclude: title patterns like "Shipping Protection", "Donation", "Tip"
- Hard exclude: inactive/draft/archived products (cannot be recommended regardless)
- Hard exclude: $0 products with 0-1 variants (placeholders or free add-ons)
- Clear include: active product with price > $0, at least one variant, and a usable title
- Everything else: ambiguous -- sent to Stage 2

**Stage 2 -- AI classification** (Gemini 2.0 Flash):
- Ambiguous products are batched (up to 500 at a time) and sent to an AI model
- The AI classifies them as bundleable or non-bundleable
- Results are cached for 1 hour
- If the AI fails, all ambiguous products default to bundleable (safe fallback)
- In practice, most stores send very few products to Stage 2 because the deterministic rules handle ~95%+ of products

**Example A:** 9,346 products fetched. 6,282 excluded deterministically (inactive, $0, placeholders). 3,064 bundleable, all also recommendable. 0 sent to AI classifier.
**Example B:** 7 products, 0 excluded, 7 bundleable, 7 recommendable.

### Step 4: Determine Order Strategy

Based on the organic order count, the system decides whether to use only organic orders or all orders (see the table in Core Concepts above).

**Example A:** 300 organic -- uses organic orders only.
**Example B:** 0 organic -- uses all orders.

### Step 5: Build the Execution Universe

From the bundleable products, the system filters to "recommendable" products:
- Must be active (not draft or archived)
- Must have at least one variant with a price above zero

All expensive analysis stages operate on this smaller set.

### Step 6: Compute Store Signals

Nine signals are computed from the recommendable products and orders:

| Signal | What it measures |
|--------|-----------------|
| skuCount | Number of active products |
| avgVariantDepth | Average number of variants per product |
| complementarity | How evenly distributed products are across types (0 = one type, 1 = maximally diverse) |
| uniqueProductTypes | Number of distinct product types |
| priceSpread | How wide the price range is relative to the median |
| pairablePct | Percentage of products that have at least one product within 0.67x-1.5x of their price |
| organicOrderCount | Number of orders not attributed to Fly |
| organicSinglePct | Percentage of organic orders with only one product type |
| organicMultiQtyPct | Percentage of organic orders where a customer bought multiple units of the same product |
| organicAvgUnits | Average total items per organic order |

### Step 7: Group Products

Products are organized into groups for custom pool generation. The system tries strategies in this order, using the first one that meets quality thresholds:

| Priority | Strategy | Quality threshold | Quality label |
|----------|----------|-------------------|---------------|
| 1st | Product type | 60%+ products have meaningful types AND 2+ groups | High |
| 2nd | Shopify Collections | 30%+ products assigned AND 2+ groups (fetches up to 15 collections via API) | High |
| 3rd | Filtered tags | 30%+ products assigned AND 2+ groups (noise tags like "sale", "new", season codes are excluded) | Medium |
| 4th | Title clustering | 20%+ products assigned AND 2+ groups (shared word sequences in product titles) | Medium |
| 5th | Price bands | Always works (splits into 3-4 percentile buckets) | Low |

**Example A:** Tag-based grouping (product types were unreliable for this candy store) -- medium quality.
**Example B:** Only 7 candles, all the same type -- falls to price bands.

### Step 8: Detect Product Type Quality

The system checks whether merchant-assigned product types are actually useful:
- **Brand-as-type detection:** If a product type matches the vendor name (e.g., type="Nike" for all Nike products), it is flagged as a brand name, not a category. These types are demoted because they do not help group products meaningfully.
- **Broad-but-valid detection:** If products within a type have very different titles (average title similarity below 15%), the type is flagged as overly broad.

### Step 9: Classify PB vs QB

A scoring system determines whether the store is better suited for pre-curated bundles (PB) or quantity breaks (QB):

**PB Score** (catalog structure):
- High pairability (90%+): +2 points
- Many product types (8+): +2 points, (4+): +1 point
- Large catalog (100+): +2 points, (50+): +1 point

**QB Score** (order behavior):
- High single-item rate (70%+): +2 points
- Multi-quantity buying (20%+): +2 points, (10%+): +1 point
- High units per order (3+): +1 point
- Small catalog (under 50): +1 point

If PB score >= QB score, the store is classified as PB (tie goes to PB). Confidence is based on the margin between scores.

### Step 10: Detect QB Candidates

Products where customers naturally buy multiple units are identified. A product qualifies if:
- It appears in at least 3 orders
- 10% or more of those orders include 2+ units of that product

### Step 11: Analyze FBT (Frequently Bought Together)

The system finds product pairs that appear together in orders:

1. **Count co-occurrences** -- for every pair of products that appeared in the same order, count how many orders they share
2. **Filter by minimum support** -- pairs must appear together in at least 3 orders
3. **Calculate metrics** -- support (fraction of all orders), confidence (conditional probability), lift (vs random chance), composite score (lift weighted by log of frequency)
4. **Check price compatibility** -- products must be within 0.3x to 3x of each other
5. **Classify strength** -- Strong (10+ orders, 5%+ of multi-item orders, lift 1.5+), Moderate (5+ orders, 2%+, lift 1.2+), Weak (3+ orders), or Noise
6. **Deduplicate by title** -- variant titles (e.g., "Soap Rose" and "Soap Lavender") are collapsed, keeping the highest-scoring version
7. **Cap at 200 pairs** -- sorted by composite score

**Ghost product filtering:** Products that appear in orders but are not in the current catalog (discontinued, deleted) are excluded from pair generation. This prevents "ghost" products from consuming pair slots.

**Example A:** 8 FBT triggers with pairs like Monster Energy flavors, Fanta varieties, and Chewits flavors. 54% multi-item order rate provides strong co-purchase signal.
**Example B:** Only 5 orders with 7 products -- 0 qualifying pairs (need 3+ shared orders per pair).

### Step 12: Build Functional Groups

Products that serve the same function are grouped together. This prevents the system from recommending substitutes together (e.g., two different moisturizers in the same bundle).

The functional grouper uses co-purchase data and title/type/vendor signals to identify functional equivalences. Products that are frequently bought separately but rarely together are potential substitutes.

### Step 13: Generate FBT Triggers

This is where the system creates "customers also bought" recommendations. For each qualifying FBT pair:

**Direction assignment** (who is trigger, who is companion):
1. Check if there is enough data (co-frequency >= 4 OR both products have 15+ orders)
2. If yes, use confidence asymmetry -- if P(B|A) is 1.5x or more than P(A|B), A is the trigger
3. If no clear asymmetry, the product with more orders is the trigger

**Suppression rules** (the pair is removed if):
- The companion costs more than 5x the trigger AND they are bought together less than 10% of the time
- The trigger is a low-cost accessory (below 25% of the store median price) AND the companion is above the median AND they are bought together less than 10% of the time
- The directional confidence is below 3%

**Quality layers applied after direction assignment:**
- Variant detection blocks pairing different colors/sizes of the same product (using handle prefix and title diff-token analysis; product-type-based detection is deferred to post-grouping diversity for FBT)
- AI eligibility classifier (Gemini) removes promotional items, mystery boxes, gift sets, samples, and non-shoppable products from being triggers. Works in all languages.
- Substitute filtering prevents showing two products that serve the same function as companions for the same trigger
- Same-format penalty deprioritizes companions with very similar names to the trigger
- Companion cap of 4 per trigger
- LLM coherence gate removes bundles that do not make merchandising sense

**Example A:** 8 FBT triggers generated -- e.g., "Monster Ultra Zero Blue Hawaiian Can" with companion "Monster Energy Ultra Wild Passion Can", "Chewits Blue Raspberry Stick" with companions "Chewits Sweet Cherry Stick" and "Chewits Cola Stick".
**Example B:** 0 FBT triggers -- not enough order data.

### Step 14: Generate Custom Pools

Products are grouped into "pick N from this set" pools:

**Single-category pools:**
- A product group needs 4+ products with at least 1 order each
- Products are sorted by order count, top 8 selected
- IQR-based price outlier trimming removes extreme prices (if the pool still has 4+ products after trimming)
- Hard price spread cap: the most expensive product cannot be more than 5x the cheapest
- Default pick count: 3

**Cross-category pools:**
- The system finds product type pairs that co-occur in FBT data (e.g., "soap" and "lotion" frequently bought together)
- Top 2-4 products from each type form the pool, pick count of 2
- Same price coherence rules apply

**Example A:** 4 pools -- category-based groupings from tags, pick 3 from each.
**Example B:** 0 pools -- too few products with orders.

### Step 15: Generate Fixed Bundles

Pre-curated 2-3 product combinations, generated in six phases:

1. **Build FBT graph** -- create a network of product connections from co-purchase pairs
2. **Seed 2-product bundles** -- top co-purchase pairs become bundle candidates
3. **Expand to 3-product bundles** -- find triangles (all three products bought together) and bridges (connected through a shared partner)
4. **Score and rank** -- triangles get a +5 bonus, 3-product bundles get +3, order volume adds up to +5
5. **LLM coherence gate** -- AI reviews bundles for merchandising plausibility (block / weak / pass)
6. **Deduplicate** -- no exact duplicates, no bundles with 2/3 product overlap, no product appears in more than one fixed bundle

If FBT data is insufficient, heuristic fallbacks generate bundles from the most popular products.

**Example A:** 12 fixed bundles -- sourced from FBT pairs, FBT bridges, and pool-derived combinations.
**Example B:** 0 FBT-seeded bundles, but the MVR guarantee generates heuristic bundles from the 7 candles.

### Step 16: Apply MVR Guarantee

The Minimum Viable Recommendation guarantee ensures every store gets something:

- **Tier 2+, no pools:** Generate collection pools from product groups (up to 4)
- **Tier 4+ OR (Tier 2+ with no pools and no fixed bundles):** Generate volume discount fallbacks for the top 5 most-ordered products
- **Tier 5, no pools:** Entire catalog becomes one pool (up to 10 products, pick 3)

Volume discount tiers: Buy 2 for 5% off, Buy 3 for 10% off, Buy 5 for 15% off.

**Example A:** Tier 1, MVR not needed -- primary pipeline produced strong results.
**Example B:** Tier 5 -- entire 7-candle catalog becomes one pool (pick 3), plus volume discounts on the top candles.

### Step 17: Select Templates

Every recommendation gets a suggested Fly app template configuration with 5 layers:

1. **Layout** -- which template to use (e.g., vertical stacked cards vs horizontal carousel)
2. **Design skin** -- visual styling (elegant design for all)
3. **Variant display** -- how to show product options (swatch for colors with images, label for sizes, dropdown for many options)
4. **Discount type** -- percentage off, fixed amount off, or no discount
5. **Advanced configuration** -- quantity selector, compared price visibility

### Step 18: Build Store Trace and Save

A human-readable narrative trace is generated explaining every decision the system made. This trace is written in plain English (not technical jargon) so merchant support teams can explain why a specific recommendation was or was not made.

The full result is saved to the database as a history record.

---

## Outputs

### What the API Returns Immediately

When you call `/recommend`, you get back:
- `runId` -- the ID to check for results later
- `estimatedMinutes` -- how long it will take (based on average of recent runs, default 2 minutes)

### What the History Record Contains

Once the run completes, the full result includes:

| Section | What it contains |
|---------|-----------------|
| recommendation.bundleStrategy | All four recommendation formats with products, pricing, reasoning |
| recommendation.pb | PB/QB classification score and reasoning |
| recommendation.qb | QB candidate products and their multi-buy rates |
| recommendation.fbt | Raw FBT co-purchase pairs with metrics |
| signals | The 9 store signals used for classification |
| mvr | Tier, order strategy, recommendation strength, product grouping info, data quality hints |
| quality | Variant block log, suppression log, direction log, eligibility log, substitute log |
| classification | How many products were excluded and why |
| storeTrace | Plain English narrative of every decision |
| stats | Timing, product/order counts, AI token usage |

### Recommendation Strength

The overall recommendation strength for a store is:
- **strong** -- at least one high-confidence recommendation
- **moderate** -- at least one medium-confidence recommendation
- **early** -- all recommendations are exploratory
- **none** -- no recommendations generated (should not happen due to MVR)

---

## What the Merchant Sees

The merchant does not interact with this system directly. The pipeline output is consumed by the Fly app dashboard, which presents:

1. **Suggested bundles** -- the specific product combinations to offer, with suggested templates
2. **Format advice** -- which bundle format to prioritize (FBT, custom, volume, etc.)
3. **Data quality hints** -- actionable suggestions like "Add product types to improve grouping" or "More organic orders will strengthen recommendations"
4. **Confidence indicators** -- how much trust to place in each recommendation

---

## Understanding the Output

### What does it mean when an FBT trigger has only 1 companion?

When you see a trigger with just 1 companion (e.g., "Toothbrush -> Toothpaste"), it means one of these things:

**The store genuinely has thin co-purchase data for that product.** The trigger product was bought with only one other product 3+ times. This is normal for:
- Small stores with fewer than 100 orders
- Stores where customers typically buy one item per visit (e.g., furniture, electronics)
- New products that have not accumulated enough order history yet
- Niche products with a small customer base

**What to tell the merchant:** "This recommendation is based on real purchase data -- customers who buy [trigger] frequently also buy [companion]. As more customers purchase, additional companions may appear in future pipeline runs."

**What NOT to tell the merchant:** "The system isn't working properly." A 1-companion trigger is a valid recommendation. It means the system found exactly one strong co-purchase signal. That is better than guessing.

### What does the companion count tell you?

| Companions | What it means | Example |
|-----------|--------------|---------|
| 1 | One strong pairing exists. Either the store has limited data, or this product genuinely has one clear complement. | "Phone Case -> Screen Protector" |
| 2-3 | Multiple products pair well with the trigger. Good diversity. This is the sweet spot. | "Shampoo -> Conditioner, Hair Mask, Brush" |
| 4 (max) | The trigger is a "hub" product that customers combine with many others. Very strong signal. | "Foundation -> Primer, Concealer, Setting Spray, Brush" |

### What does "weak" / "moderate" / "strong" strength mean?

These labels describe how confident we are in a specific pairing:

| Strength | What it means in plain English | Should the merchant use it? |
|----------|-------------------------------|---------------------------|
| **strong** | Many customers buy these together (10+ shared orders), and they buy them together much more than random chance would predict (lift 1.5+). Rock-solid signal. | Yes, absolutely. Feature this prominently. |
| **moderate** | A meaningful pattern exists (5+ shared orders, lift 1.2+). Good signal but not overwhelming. | Yes. Good for "Customers also bought" widgets. |
| **weak** | The products were bought together at least 3 times, but the pattern is not yet strong. Could be real signal or could be coincidence with more data needed. | Yes, but treat as a suggestion to test, not a guarantee. |

**Important:** "Weak" does NOT mean "bad recommendation." It means "we have limited evidence." Many weak recommendations turn out to be excellent sellers -- they just have not had enough orders yet to statistically prove themselves. In stores with large catalogs (500+ products), almost all pairs will be "weak" because the co-purchase frequency is spread across many product combinations.

### What does it mean when a store gets 0 FBT triggers?

Four stores in our validation produced 0 FBT triggers. This is correct behavior, not a bug:

| Reason | Example | What to tell the merchant |
|--------|---------|--------------------------|
| **Zero orders** | Brand new store, no purchase history | "Run the pipeline again after you've had 50+ orders. FBT needs purchase history to work." |
| **Very few orders** | Store with 9 orders -- not enough for any pair to appear 3+ times | "You need more order volume. FBT recommendations will appear after ~50-100 orders." |
| **Single-item orders** | Shoe store where 96% of orders are one pair of shoes | "Your customers typically buy one product at a time. Consider volume discounts instead of FBT." The pipeline will suggest volume discounts and custom pools as alternatives. |
| **Dormant / inactive store** | Store on "dormant" Shopify plan | "Your store plan may be limiting API access. Check your Shopify plan status." |

The pipeline ALWAYS generates something -- even with 0 FBT triggers, it falls back to fixed bundles (from product grouping) and volume discounts. The merchant is never left with zero recommendations.

### What does the confidence level (high / medium / exploratory) mean?

This is the overall confidence for the entire trigger, not individual pairs:

| Confidence | Plain English | What to tell the merchant |
|-----------|--------------|--------------------------|
| **high** | Strong purchase data backs this. Multiple companions with good lift scores. The system is confident this will perform well. | "This is a data-backed recommendation. We strongly suggest setting this up." |
| **medium** | Decent data, but could be stronger. Maybe one strong companion and one borderline one, or good patterns but from limited data. | "This looks promising based on your purchase data. Worth setting up and monitoring performance." |
| **exploratory** | Limited data. This is the system's best guess given what is available -- a starting point, not a certainty. | "This is a suggested starting point. Set it up, monitor for 2-4 weeks, and re-run the pipeline to get updated recommendations." |

---

## Limitations

### Data and Coverage

1. **Order history cap at 1,000** -- very high-volume stores may not use their full order history. This cap exists to prevent long API pagination times. For most stores, 1,000 recent orders is sufficient.
2. **No real-time updates** -- recommendations are generated on demand, not continuously. A store must re-run the pipeline to get updated recommendations after significant sales activity.
3. **New stores with no orders** -- Tier 4-6 recommendations are based solely on the product catalog. No co-purchase data means no FBT triggers and lower confidence. The MVR guarantee still produces custom pools and volume discounts.
4. **Relies on Shopify product metadata** -- stores with poor product types, missing tags, and no collections will get lower-quality grouping (price bands as a last resort). Merchants can improve recommendations by assigning product types.

### AI and Classification

5. **AI eligibility classification is the primary classifier.** An LLM (Gemini 2.0 Flash) classifies all products as normal, promo/mystery, bundle/gift set, or non-shoppable. It handles multiple languages and context-aware edge cases (e.g., "Mystery Ranch Backpack" is a brand, not a mystery box). If Gemini is unavailable, a deterministic regex fallback handles English titles. Cost: ~$0.008 per store on average.
6. **Rare LLM false positives (~1%)** -- the AI occasionally misclassifies products. Example: "Bartons Million Dollar Bar Dark Chocolate" was flagged as promo because "Million Dollar" sounded promotional. These are rare (1 out of 98 promo classifications in our largest test store) but can happen. The product is excluded from triggers but can still appear as a companion.
7. **AI classification can fail entirely** -- if the Gemini API is down for an extended period, the regex fallback handles English titles but non-English stores lose eligibility filtering. Products default to "normal" (included), which is safe but may let through some promo/bundle items.

### FBT Quality

8. **Scent/flavor variants can appear as FBT companions (~6% of triggers)** -- when a store sells the same product in multiple scents or flavors (e.g., "Deodorant Surf" and "Deodorant Wild"), the system may recommend them together because customers genuinely buy multiple scents. These are technically co-purchased but are variants of the same product, not complementary products. Affected store types: body care (scents), candy (flavors), lash/beauty (styles). The system catches color and size variants but does not yet detect scent or flavor variants.
9. **Product + Refill pairing** -- the system may recommend a product alongside its own refill pouch (e.g., "Liquid Hand Soap" -> "Liquid Hand Soap Refill Pouch"). This is sometimes useful (practical pairing) but can look redundant.
10. **Direction assignment can fragment multi-companion triggers** -- the system decides which product is the "trigger" for each pair independently. A mid-tier product can be the trigger in one pair but companion in another, splitting what could be a 3-companion trigger into two 1-companion triggers. This is statistically correct per-pair but can reduce the richness of individual trigger widgets.
11. **Stores with 500+ products and limited orders may show all "weak" strength** -- this is a mathematical reality, not a bug. With many products and limited orders, co-purchase frequency is spread thin. The recommendations are still valid -- "weak" means limited evidence, not bad quality.

### Pricing and Configuration

12. **The system does not generate pricing** -- it suggests discount types and structures (e.g., "10% off") but does not calculate optimal profit-maximizing prices. Merchants should set prices based on their margins.
13. **Volume discount tiers are static** -- always Buy 2 for 5% off, Buy 3 for 10% off, Buy 5 for 15% off. No dynamic tier calculation based on margin data.
14. **Fixed bundles have a product-reuse cap of 1** -- each product can only appear in one fixed bundle. This limits total fixed bundles for stores with few products.

### Performance

15. **Large stores (5,000+ products) take 4-7 minutes** -- the pipeline fetches the full catalog, classifies all products with AI, and analyzes co-purchase patterns. A 9,000-product store takes ~4 minutes. A 7,000-product store takes ~7 minutes. The main time cost is Shopify API pagination and AI eligibility classification.
16. **Stores with high product churn show ghost line items** -- if a store frequently discontinues products, order history references products that no longer exist. The system filters these out automatically but the FBT signal is thinner as a result. Re-running the pipeline periodically helps as newer orders reference current products.

---

## Known Quality Metrics (22-store final validation, 2026-03-23)

| Metric | Value |
|--------|-------|
| Stores producing FBT triggers | 18 of 22 (82%) |
| Average FBT products per trigger | 3.24 |
| Average companions per trigger | 2.24 |
| FBT triggers with GOOD quality | 84% |
| FBT triggers with variant problem | ~6% (7 of 119) |
| FBT triggers with mixed quality | ~8% |
| Total recommendations per store (avg) | ~20 |
| AI classifier tokens per run (avg) | 254 (near zero -- most products classified deterministically) |
| AI eligibility tokens per run (avg) | 81,449 (~$0.008 per store) |
| Pipeline time: small store (<500 products) | 6-90s |
| Pipeline time: medium store (500-2000) | 80-120s |
| Pipeline time: large store (2000-10000) | 120-420s |

### Recommendation counts by format (across 22 stores)

| Format | Stores with this format | Avg count per store |
|--------|------------------------|-------------------|
| FBT Triggers | 18 (82%) | 6.6 |
| Fixed Bundles | 22 (100%) | 8.5 |
| Custom Pools | 20 (91%) | 3.2 |
| Volume Discounts | 4 (18%) | 4.5 |

### What "no FBT triggers" means for a store

If a store produces 0 FBT triggers, it ALWAYS produces other recommendation types instead. No store is ever left with zero recommendations. The fallback chain is: FBT -> Fixed Bundles (heuristic) -> Custom Pools -> Volume Discounts -> Catalog Pool (entire catalog as one pool).
