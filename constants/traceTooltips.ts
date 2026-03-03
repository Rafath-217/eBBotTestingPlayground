export const TRACE_TOOLTIPS: Record<string, string> = {
  // ── STRUCTURAL_JOB ──
  "STRUCTURAL_JOB.skuCount":
    "Total number of active products in the store's Shopify catalog.",
  "STRUCTURAL_JOB.medianProductPrice":
    "Median price across all active products. Used to determine priceBand and pricing logic.",
  "STRUCTURAL_JOB.priceBand":
    "Price tier (low/mid/high) derived from the median product price. Influences archetype assignment and sub-rules.",
  "STRUCTURAL_JOB.industry":
    "Industry classification (e.g. Fashion & Apparel) inferred from product titles using an LLM.",
  "STRUCTURAL_JOB.complementarityScore":
    "Score from 0\u20131 measuring how likely customers are to buy different products together. Computed from co-purchase and catalog diversity signals.",

  // ── PERFORMANCE_JOB ──
  "PERFORMANCE_JOB.method":
    "Data collection method used \u2014 ShopifyQL (requires read_reports scope) or REST API fallback.",
  "PERFORMANCE_JOB.totalRevenue60":
    "Total store revenue over the rolling 60-day window, before outlier cleaning.",
  "PERFORMANCE_JOB.totalOrders60":
    "Total order count over the rolling 60-day window, before outlier cleaning.",
  "PERFORMANCE_JOB.aov60":
    "Average order value (totalRevenue60 / totalOrders60) over 60 days, before outlier cleaning.",
  "PERFORMANCE_JOB.repeatRate60":
    "Fraction of customers who placed more than one order in the 60-day window.",
  "PERFORMANCE_JOB.revenueConcentration60":
    "Fraction of total revenue attributed to the single highest-revenue product. High values indicate dependence on one SKU.",
  "PERFORMANCE_JOB.daysOfData":
    "Rolling window size in days used for performance metrics (default 60).",

  // ── ARCHETYPE_ASSIGNMENT ──
  "ARCHETYPE_ASSIGNMENT.inputs.sizeBucket":
    "Catalog size bucket: SMALL (<100 SKUs), MID (100\u2013500), or LARGE (>500).",
  "ARCHETYPE_ASSIGNMENT.inputs.compBucket":
    "Complementarity bucket: LOW (<0.3) or HIGH (>=0.3), based on complementarityScore.",
  "ARCHETYPE_ASSIGNMENT.result":
    "Final archetype ID (e.g. SMALL_HIGH_COMP) combining sizeBucket, compBucket, and priceBand. Drives strategy defaults and sub-rules.",
  "ARCHETYPE_ASSIGNMENT.reasoning":
    "Human-readable explanation of how the archetype was derived from the store's structural metrics.",

  // ── DATA_RELIABILITY ──
  "DATA_RELIABILITY.verdict":
    "Overall data quality verdict \u2014 OK (>=50 cleaned orders) or LOW_SAMPLE (<50). LOW_SAMPLE skips performance-driven logic and uses a starter bundle instead.",
  "DATA_RELIABILITY.flags":
    "List of data quality issues detected: outlier orders removed, test products found.",
  "DATA_RELIABILITY.changedMetrics":
    "Metrics that were adjusted during cleaning, showing before and after values. 'none' if no changes were needed.",
  "DATA_RELIABILITY.cleanedMetrics":
    "Performance metrics after outlier removal and test-product filtering. These cleaned values are used for all downstream decisions.",

  // ── CANDIDATE_POOL ──
  "CANDIDATE_POOL.totalReferenceQueried":
    "Number of REFERENCE-tier stores with the same archetype that were queried as potential matches.",
  "CANDIDATE_POOL.sameArchetypeCount":
    "Count of candidates sharing the store's archetype. Matching is restricted to same-archetype stores only.",

  // ── SCORING ──
  "SCORING.totalCandidatesScored":
    "Total number of reference stores scored by structural similarity. Top 5 are kept.",
  "SCORING.storeName":
    "Shop name of the reference store candidate.",
  "SCORING.similarityScore":
    "Composite similarity score (0\u20131) combining archetype, SKU count proximity, and price proximity.",
  "SCORING.componentScores.archetype":
    "Archetype match component \u2014 1.0 if same archetype, 0 otherwise.",
  "SCORING.componentScores.skuSimilarity":
    "SKU count similarity \u2014 closer SKU counts yield higher scores. Based on absolute difference.",
  "SCORING.componentScores.priceSimilarity":
    "Price similarity \u2014 based on difference between median product prices of the two stores.",

  // ── SUCCESS_FILTER ──
  "SUCCESS_FILTER.filterActivated":
    "Whether the success filter was used (true if >=3 candidates passed). When false, top 3 structural matches are used instead.",
  "SUCCESS_FILTER.passedCount":
    "Number of top-5 candidates that passed the success filter criteria.",
  "SUCCESS_FILTER.thresholds":
    "Criteria for passing: ebSuccessTier === 'strong' OR bundleRevenueContribution60 >= 20%.",

  // ── FINAL_MATCHES ──
  "FINAL_MATCHES.count":
    "Number of reference stores selected (up to 3).",
  "FINAL_MATCHES.selectedFrom":
    "Selection method \u2014 'successful_filter' if enough passed the success filter, otherwise 'top_structural' (closest by structure).",
  "FINAL_MATCHES.storeName":
    "Shop name of the matched reference store.",
  "FINAL_MATCHES.similarityScore":
    "Structural similarity score (0\u20131) for this match.",
  "FINAL_MATCHES.ebSuccessTier":
    "Bundle success tier of the reference store \u2014 strong, moderate, or weak \u2014 based on historical bundle revenue contribution.",
  "FINAL_MATCHES.dominantStrategy":
    "The bundle type that generated the most revenue for this reference store. Used in the voting step.",

  // ── UNITS_PER_ORDER_CHECK ──
  "UNITS_PER_ORDER_CHECK.threePlusShare":
    "Percentage of orders containing 3 or more items. High values indicate customers already buy in bulk.",
  "UNITS_PER_ORDER_CHECK.threshold":
    "Signal thresholds: >=60% = structural override to volumeDiscount, >=50% = strong (supports weak votes), >=30% = mild (logged only).",
  "UNITS_PER_ORDER_CHECK.triggered":
    "The behavioral signal level that was triggered: structural, strong, mild, or none.",

  // ── ARCHETYPE_SUBRULES ──
  "ARCHETYPE_SUBRULES.conditions":
    "Individual conditions evaluated for this sub-rule, each showing the actual value, required threshold, and whether it passed.",
  "ARCHETYPE_SUBRULES.pass":
    "Whether all conditions for this sub-rule were met, causing it to trigger and set the strategy.",

  // ── MATCHES_VOTE ──
  "MATCHES_VOTE.voteTally":
    "Bundle type votes from successful reference stores \u2014 each store votes for its dominant strategy. Object maps bundleType to vote count.",
  "MATCHES_VOTE.winner":
    "The bundle type that received the most votes from successful reference stores.",
  "MATCHES_VOTE.voteType":
    "Vote result type \u2014 'unanimous' (single option), 'majority' (clear winner), or 'close' (tied or close).",

  // ── ABC_ANALYSIS ──
  "ABC_ANALYSIS.totalProducts":
    "Number of products with non-zero revenue in the 60-day window, after filtering test/outlier products.",
  "ABC_ANALYSIS.gradeDistribution.A":
    "Grade A \u2014 top products whose cumulative revenue accounts for <=80% of total. Highest priority for bundle inclusion.",
  "ABC_ANALYSIS.gradeDistribution.B":
    "Grade B \u2014 products in the 80\u201395% cumulative revenue band. Included in larger bundles and mix-and-match pools.",
  "ABC_ANALYSIS.gradeDistribution.C":
    "Grade C \u2014 bottom products in the 95\u2013100% cumulative revenue band. Generally excluded unless catalog rule applies.",

  // ── VIABILITY_CHECK ──
  "VIABILITY_CHECK.validRevenueSKUs":
    "Number of products with revenue > $0 after cleaning. If fewer than 3 for a FIXED_BUNDLE, the mechanism is overridden to VOLUME_DISCOUNT.",
  "VIABILITY_CHECK.threshold":
    "Minimum SKU count required (3) to proceed with a FIXED_BUNDLE mechanism.",
  "VIABILITY_CHECK.overridden":
    "Whether the bundle mechanism was overridden due to insufficient viable SKUs.",

  // ── PRODUCT_SELECTION ──
  "PRODUCT_SELECTION.rule":
    "Selection rule applied \u2014 'standard' (grade-based picks), 'CART_BUILDER' (20\u201350 SKU pool), 'SHADE_CATALOG' (broad pool for low-price complementary catalogs), or 'viability_override'.",
  "PRODUCT_SELECTION.totalSelected":
    "Total number of products included in the bundle draft.",
  "PRODUCT_SELECTION.productId":
    "Shopify product ID of the selected SKU.",
  "PRODUCT_SELECTION.revenue":
    "60-day cleaned revenue for this product, used for ranking and grade assignment.",
  "PRODUCT_SELECTION.grade":
    "ABC grade (A/B/C) based on cumulative revenue contribution.",

  // ── PRICING ──
  "PRICING.mechanism":
    "Pricing mechanism used \u2014 FIXED_BUNDLE (set price), VOLUME_DISCOUNT (buy-more-save-more), MIX_AND_MATCH (pick-N tiered discount), or TIERED_DISCOUNT.",
  "PRICING.formula":
    "Human-readable pricing formula, e.g. 'Pick 2 \u2192 10% off, Pick 3 \u2192 15% off'.",
  "PRICING.suggestedBundlePrice":
    "Calculated bundle price for FIXED_BUNDLE mechanism, derived from median product price and selected SKU count.",
  "PRICING.tiers.quantity":
    "Number of items the customer must add to qualify for this discount tier.",
  "PRICING.tiers.discountPercent":
    "Percentage discount applied when the customer reaches this tier's quantity.",

  // ── STRATEGY_DECISION ──
  "STRATEGY_DECISION.strategySource":
    "How the strategy was determined \u2014 e.g. 'successful_matches' (vote), 'archetype_default', 'archetype_subrule_*', 'behavioral_override', or 'weak_vote_behavior_supported'.",
  "STRATEGY_DECISION.recommendedBundleType":
    "Final recommended bundle type \u2014 fixedBundlePrice, volumeDiscount, mixAndMatch, classic, or tieredDiscount.",
  "STRATEGY_DECISION.mechanism":
    "Internal mechanism name (FIXED_BUNDLE, VOLUME_DISCOUNT, MIX_AND_MATCH, TIERED_DISCOUNT) mapped from the bundle type.",
}
