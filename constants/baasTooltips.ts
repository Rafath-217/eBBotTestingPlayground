/**
 * Centralized tooltip descriptions for all BaaS RunDetail panels.
 * Keys are camelCase identifiers; values are 1–2 sentence descriptions
 * shown via the <InfoTip> component on hover.
 */

export const TIPS = {
  // ─── Overview Panel ─────────────────────────────────────────────
  auditScore:
    'Merchandising readiness score (0–10) computed from Bundle Detection, Shipping Intelligence, PDP Cross-sell, and Discovery & Gifting. Higher = better bundling infrastructure.',
  revenueOpportunity:
    'Estimated annual revenue the store is leaving on the table that could be captured through bundling strategies.',
  vertical:
    "The store's industry category (e.g., Fashion, Supplements) determined by keyword matching and AI classification. Confidence % reflects how many industry-specific signals were detected.",
  bundleStrategies:
    'Number of actionable bundle strategies generated (1–3), each targeting a specific revenue problem using the 8-Pillar Framework.',
  criticalFindings:
    'Key gaps and risks identified during the storefront audit — such as missing bundle navigation, no cross-sell widgets, or a misaligned free shipping threshold.',
  recommendedActions:
    "Prioritized next steps derived from the data analysis, addressing the store's top pain points like shipping gap, inventory risk, or retention decline.",
  implementationPriority:
    'Recommended launch sequence for the bundle strategies, ordered by expected revenue impact and implementation complexity.',

  // ─── Auditor Panel ──────────────────────────────────────────────
  overallScore:
    'Merchandising readiness score computed from four categories: Bundle Detection (max 4), Shipping Intelligence (max 2), PDP Cross-sell (max 2), and Discovery & Gifting (max 2).',
  scoreBreakdown:
    'Detailed rubric showing how the overall score was earned across four categories, with specific criteria and whether each was met during the storefront audit.',
  shippingAnalysis:
    'Analysis of the store\'s shipping configuration — free shipping availability, threshold amounts, and pricing gaps that affect bundle strategy.',
  freeShipping:
    'Whether the store offers free shipping on any orders. A key factor in determining bundle pricing strategy.',
  shippingThreshold:
    'The minimum order value required for free shipping. Bundles are often priced to exceed this threshold.',
  deadZoneGap:
    'The gap between the store\'s AOV and the free shipping threshold. Customers in this "dead zone" are prime bundle targets.',
  entryPriceGap:
    'The difference between the lowest product price and the free shipping threshold — indicates how far a single-item buyer is from qualifying.',
  coreProductPrice:
    'The price of the store\'s most commonly purchased product, used as an anchor for bundle pricing.',
  shippingConfidence:
    'How confident the system is in the shipping data accuracy (High/Medium/Low), based on the number of signals found.',
  pdpAudit:
    'Product Detail Page audit — checks for cross-sell widgets like "Frequently Bought Together," bundle builders, and kit options.',
  widgetsPresent:
    'Cross-sell tools detected on the product page — e.g., "Frequently Bought Together," volume discount tables, or kit builders.',
  navigationAudit:
    'Checks the store\'s navigation structure for bundle-related sections, gift categories, and customization options.',
  giftSection:
    'Whether the store has a dedicated gift or gift-set section in its navigation — indicates gifting bundle potential.',
  bundleNavigation:
    'Whether the store has dedicated navigation pointing to bundles, sets, or kits.',
  bundleTermsFound:
    'Specific bundle-related keywords detected in the store\'s navigation and page content (e.g., "bundle," "kit," "set").',
  customization:
    'Whether the store offers product customization (e.g., engraving, color choice) — relevant for premium bundle strategies.',
  priceRangeAnalysis:
    'Minimum, median, and maximum product prices across the catalog — used to calibrate bundle pricing.',
  bundleDetection:
    'Assessment of existing bundling activity on the store — whether bundles, kits, or BYOB options are already present.',
  dedicatedNav:
    'Whether the store has a dedicated navigation link for bundles or kits.',
  signals:
    'Individual signals detected during the audit (e.g., "bundle" keyword in nav, bundling app installed), each with a type and weight.',
  keywordsFound:
    'Bundle-related keywords found in the store\'s content and navigation during the audit.',
  appsDetected:
    'Third-party Shopify apps detected on the store that relate to bundling, upselling, or cross-selling.',
  criticalGap:
    'A critical gap flag indicating no bundling activity was detected on the store at all.',
  catalogAnalysis:
    'Analysis of the store\'s product catalog — total products, how many are bundles, and bundle price distribution.',
  bundlePriceRange:
    'The minimum, median, and maximum prices of products identified as bundles in the catalog.',
  byobPages:
    '"Build Your Own Bundle" pages detected on the store — indicates the store already supports customizable bundles.',
  evidenceTrail:
    'Raw evidence collected during the audit — screenshots, links, app detections, and shipping data that support the score.',
  storeShape:
    'Classification of the store\'s product catalog shape (e.g., long-tail, concentrated) based on price distribution.',
  anchorPrice:
    'The most common price point in the catalog — used as the anchor for threshold and bundle pricing calculations.',
  anchorBand:
    'The price band (e.g., "$20–$30") that contains the most products, indicating the store\'s dominant price tier.',
  anchorDominance:
    'Percentage of products that fall within the anchor price band — higher values mean more pricing concentration.',
  dominanceStrength:
    'How dominant the anchor price band is relative to other bands (e.g., "strong," "moderate," "weak").',
  thresholdAlignment:
    'How well the free shipping threshold aligns with the store\'s AOV — expressed as a classification and multiple (e.g., "tight 1.2x").',
  behavioralGap:
    'The gap between the current AOV and the free shipping threshold, representing the amount customers need to add to their cart.',
  gapReductionPotential:
    'Estimated amount by which bundling could reduce the behavioral gap and push customers over the free shipping threshold.',
  pricingConfidence:
    'Confidence level in the shipping pricing analysis based on data quality and signal count.',
  priceDistribution:
    'Breakdown of products by price band showing how the catalog is distributed across price tiers.',

  // ─── Analyst Panel ──────────────────────────────────────────────
  moneyLeftOnTable:
    'Total estimated revenue opportunity — the sum of Grade C liability, replenishment recovery, and return reduction potential.',
  orders:
    'Total number of orders analyzed in the data window used for this pipeline run.',
  products:
    'Total number of active products in the store\'s catalog at the time of analysis.',
  revenue:
    'Total revenue generated across all orders in the analysis window.',
  aovDistribution:
    'Histogram showing how orders are distributed across different AOV (Average Order Value) ranges — reveals pricing sweet spots.',
  returnRateAnalysis:
    'Comparison of return rates between single-item and multi-item orders — multi-item orders typically have lower return rates, supporting the case for bundles.',
  singleItemReturnRate:
    'Return rate for orders containing only one item. Typically higher than multi-item orders.',
  multiItemReturnRate:
    'Return rate for orders containing two or more items. Bundling can help reduce overall returns.',
  retentionEconomics:
    'Comparison of new vs. repeat customer spending behavior — shows the AOV gap that retention bundles could address.',
  newCustomerAov:
    'Average order value for first-time customers. Typically lower than repeat customers.',
  repeatCustomerAov:
    'Average order value for returning customers. The gap between this and new customer AOV is a bundle opportunity.',
  aovGap:
    'Difference between repeat and new customer AOV — represents the revenue potential from retention-focused bundles.',
  abcAnalysis:
    'Products ranked by revenue contribution: Grade A (top 80%), Grade B (next 15%), Grade C (bottom 5%). Grade C items are candidates for bundling to move inventory.',
  gradeAProducts:
    'Top-performing products that drive the majority of revenue — include these in bundles as anchor items.',
  gradeCProducts:
    'Underperforming products contributing minimal revenue — prime candidates for inclusion in bundles to move inventory.',
  deadstockCount:
    'Number of products with zero or near-zero sales — strong candidates for clearance bundles.',
  affinityPairs:
    'Product pairs that are frequently purchased together — these natural affinities suggest high-potential bundle combinations.',
  coPurchaseRate:
    'How often two products are bought together as a percentage of all orders containing either product.',
  liftScore:
    'Statistical measure of how much more likely two products are bought together vs. independently. >1.0 means positive affinity.',
  analystRecommendations:
    'Prioritized list of data-driven actions the store should take, ranked by expected revenue impact.',

  // ─── Classifier Panel ──────────────────────────────────────────
  primaryVertical:
    'The industry vertical assigned to this store (e.g., "Health & Wellness," "Fashion") based on catalog keyword analysis.',
  confidence:
    'How confident the classifier is in the vertical assignment — based on the percentage of matched industry keywords.',
  classificationEvidence:
    'Specific signals that led to the vertical classification — product keywords, category patterns, and catalog indicators.',
  recommendedBundlePillars:
    'Bundle strategy pillars recommended for this vertical — primary pillars should be prioritized, secondary are optional, avoid pillars may not fit.',
  primaryPillars:
    'The most effective bundle strategy types for this store\'s vertical — prioritize these when building strategies.',
  secondaryPillars:
    'Supporting bundle strategies that can complement the primary pillars for additional revenue.',
  avoidPillars:
    'Bundle strategies that typically don\'t work well for this vertical and should be avoided.',
  verticalContext:
    'Industry-specific context that informs bundle strategy — including focus areas, typical AOV lift, and recommended bundle types.',
  strategicFocus:
    'The primary strategic focus recommended for this vertical — guides the overall bundling approach.',
  keyBundleTypes:
    'The most effective bundle formats for this vertical (e.g., "starter kit," "replenishment bundle," "gift set").',
  typicalAovLift:
    'The typical AOV increase seen when stores in this vertical implement bundling strategies.',
  verticalScoreBreakdown:
    'Score breakdown across all candidate verticals showing keyword matches and confidence — explains why a specific vertical was chosen.',
  matchedKeywords:
    'Specific product keywords that matched this vertical\'s industry dictionary.',
  psychologicalTriggers:
    'Behavioral psychology principles (e.g., "anchoring," "loss aversion," "social proof") that can be leveraged in bundle presentation.',

  // ─── Strategy Panel ─────────────────────────────────────────────
  launchOrder:
    'Recommended implementation sequence for bundle strategies — start with #1 for highest expected impact.',
  pillarName:
    'The bundle pillar category (e.g., Starter, Value, Premium, Replenishment, Gift, Cross-sell, Upsell) from the 8-Pillar Framework.',
  bundleName:
    'The name of this specific bundle strategy — used as the customer-facing bundle title.',
  problemSolved:
    'The specific revenue problem this bundle addresses (e.g., high single-item return rate, low AOV, excess inventory).',
  concept:
    'The strategic concept behind this bundle — explains the "why" and positioning for the bundle.',
  savingsDiscount:
    'The percentage discount applied to the bundle compared to buying items separately.',
  offerMathematics:
    'Detailed pricing breakdown: individual product prices, original total, savings amount, and final bundle price.',
  originalTotal:
    'Sum of individual product prices before the bundle discount is applied.',
  savingsAmount:
    'Dollar amount saved when purchasing the bundle vs. buying items individually.',
  bundlePrice:
    'The final price customers pay for the bundle after the discount is applied.',
  psychologicalTrigger:
    'The behavioral psychology principle used to make this bundle compelling (e.g., "anchoring," "scarcity," "completeness").',
  executionTool:
    'The recommended Shopify app or tool for implementing this bundle (e.g., "PickyStory," "Rebuy," "Shopify Bundles").',
  executionReason:
    'Why this specific tool was chosen — based on the store\'s existing tech stack and bundle type requirements.',
  expectedImpact:
    'The projected revenue or AOV impact of implementing this bundle strategy.',

  // ─── Metrics Panel ──────────────────────────────────────────────
  topPainPoint:
    'The single most impactful problem identified across all analysis — the first thing to address for maximum revenue improvement.',
  freeShippingGap:
    'Whether the store has a significant gap between AOV and free shipping threshold — a key bundle pricing opportunity.',
  liquidationOpportunity:
    'Whether the store has excess slow-moving inventory (Grade C products) that could be cleared through bundles.',
  retentionProblem:
    'Whether the store shows signs of poor customer retention — repeat customer AOV gap, low return rate, or declining orders.',
  aovBridgeOpportunity:
    'Whether there\'s an opportunity to bridge the gap between current AOV and free shipping threshold with bundle add-ons.',
  aov:
    'Average Order Value — the mean revenue per order across the analysis period.',
  freeShippingThreshold:
    'The minimum cart value for free shipping. Bundles should be priced to exceed this threshold.',
  aovBridgeAmount:
    'The dollar gap between current AOV and free shipping threshold — the ideal add-on bundle price range.',
  revenueConcentration:
    'How much revenue depends on a small number of products. High concentration = risk if those products decline.',
  potentialBundleUplift:
    'Estimated percentage AOV increase achievable through bundling, based on industry benchmarks and store data.',
  gradeCRevenuePercent:
    'Percentage of total revenue coming from Grade C (underperforming) products — higher values indicate more inventory at risk.',
  inventoryRiskScore:
    'Risk score (0–100) for inventory health — considers deadstock count, Grade C revenue share, and product concentration.',
  retentionRiskScore:
    'Risk score (0–100) for customer retention — considers repeat rate, AOV gap between new/repeat customers, and order frequency.',
  recommendedPillars:
    'Bundle strategy pillars recommended by the metrics engine based on the store\'s specific pain points and opportunities.',

  // ─── Pipeline Observability Panel ───────────────────────────────
  pipelineFlow:
    'Visual timeline showing which AI agents ran and how long each took — helps identify bottlenecks in the analysis pipeline.',
  parallelExecution:
    'When enabled, the Auditor and Analyst agents run simultaneously to reduce total pipeline duration.',
  plannerDecisions:
    'Decisions made by the Planner agent — which agents to run, whether to parallelize, and the reasoning behind each choice.',
  decisionLog:
    'Chronological log of all decisions made during the pipeline run — useful for debugging and understanding the analysis flow.',
  reflection:
    'Quality check that validates generated strategies against constraints — checks for pricing errors, threshold alignment, and strategic coherence.',
  tokenUsage:
    'Number of AI tokens consumed by the reflection step — input tokens (prompt) and output tokens (response).',
  reflectionLog:
    'Detailed log entries from the reflection agent explaining what was checked and why.',
  constraintsForRetry:
    'Specific constraints that failed validation and would need to be addressed if the pipeline were retried.',
  overallIssues:
    'High-level issues identified by the reflection agent that affect the overall quality of the analysis.',
  strategyValidations:
    'Per-strategy validation results — each strategy is checked against four key constraints.',
  exceedsFreeShipping:
    'Whether the bundle price exceeds the free shipping threshold — critical for reducing cart abandonment.',
  improvesAov:
    'Whether the bundle would increase the store\'s average order value compared to individual purchases.',
  avoidsMarginDestruction:
    'Whether the discount is sustainable — ensures the bundle doesn\'t erode margins below acceptable levels.',
  alignsWithPainPoint:
    'Whether the bundle directly addresses one of the store\'s identified pain points (e.g., high returns, low retention).',

  // ─── Sales Summary Panel ────────────────────────────────────────
  headlineRevenueOpportunity:
    'The top-line revenue opportunity headline — the most compelling data point for the sales conversation.',
  urgencyStatement:
    'A time-sensitive statement emphasizing why the store should act now on bundling.',
  rootCauses:
    'The underlying problems causing revenue loss — each root cause maps to a specific bundle strategy.',
  priorityMove:
    'The single highest-impact action the store should take first, with projected revenue range and confidence level.',
  projectedRevenue:
    'Estimated additional revenue from implementing all recommended bundle strategies over 90 days.',
  projectedAovLift:
    'Expected percentage increase in average order value after bundle implementation.',
  inventoryImpact:
    'Projected reduction in slow-moving inventory through bundle inclusion over 90 days.',
  ordersAnalyzed:
    'Total number of historical orders used as the data foundation for this analysis.',
  revenueAnalyzed:
    'Total historical revenue analyzed — provides context for the scale of the opportunity projections.',

  // ─── Dashboard Stats Bar ────────────────────────────────────────
  totalRuns:
    'Total number of pipeline runs across all stores in the current view.',
  successRate:
    'Percentage of pipeline runs that completed successfully without errors.',
  avgScore:
    'Average audit score across all completed runs — indicates overall portfolio readiness for bundling.',
  totalOpportunity:
    'Sum of all "money left on table" estimates across completed runs — the total addressable bundling opportunity.',
  topVertical:
    'The most frequently classified industry vertical across all analyzed stores.',
} as const;
