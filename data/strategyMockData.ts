import type { StrategyReport } from '../types/strategy'

export const mockStrategyReport: StrategyReport = {
  industryClassification: {
    primaryVertical: 'Consumables (Food & Beverage)',
    confidence: 'High',
    classificationEvidence: [
      'Beverage products detected across catalog',
      'High repeat purchase rate (62% returning customers)',
      'Pantry-stocking behavior in cart data',
    ],
    verticalContext: {
      focus: 'Pantry Loading',
      keyBundleTypes: ['Variety Pack', 'Bulk Stash', 'Sampler Box'],
      avoid: ['Outfit Builder'],
      typicalAovLift: '35–60%',
    },
    recommendedPillars: {
      primary: ['volumeDriver', 'liquidationEngine'],
      secondary: ['conveniencePack'],
      avoid: ['outfitBuilder'],
    },
    psychologicalTriggers: 'Future self optimization',
  },

  strategies: [
    {
      number: 1,
      pillarName: 'Volume Driver',
      bundleName: 'Stock Up & Save',
      problemSolved: 'Repeat customers not purchasing in volume',
      concept:
        'Encourage loyal customers to buy larger quantities upfront by rewarding volume with meaningful savings. This converts single-purchase behavior into pantry-loading, dramatically increasing units per order and locking in future wallet share before competitors can.',
      offerMathematics: {
        products: [
          { name: 'Premium Mix Box', price: 78 },
          { name: 'Electrolyte Powder', price: 45 },
          { name: 'Shaker', price: 28 },
        ],
        combinedRetail: 151,
        bundlePrice: 128,
        discountPercent: 15,
      },
      psychologicalTrigger: 'Future self optimization',
      executionTool: 'Fly Bundles',
      executionReason:
        'Fly Bundles enables dynamic quantity-based discounts with real-time pricing updates, no dev work required.',
      expectedImpact: {
        aovLift: '25%',
        targetMetric: 'Units per order +1.5',
      },
    },
    {
      number: 2,
      pillarName: 'Liquidation Engine',
      bundleName: 'Clear & Save Bundle',
      problemSolved: 'Slow-moving SKUs tying up inventory capital',
      concept:
        'Bundle underperforming SKUs with bestsellers to move excess stock without destroying brand value through discounting. Customers perceive high value while you reclaim working capital and shelf space for your next winning product.',
      offerMathematics: {
        products: [
          { name: 'Original Formula (slow)', price: 32 },
          { name: 'New Citrus Blend', price: 42 },
          { name: 'Variety Sampler', price: 18 },
        ],
        combinedRetail: 92,
        bundlePrice: 72,
        discountPercent: 22,
      },
      psychologicalTrigger: 'Loss aversion + discovery',
      executionTool: 'Fly Bundles',
      executionReason:
        'Automated inventory-triggered bundles fire when stock thresholds are met, eliminating manual management.',
      expectedImpact: {
        aovLift: '18%',
        targetMetric: 'Slow-SKU sell-through +40%',
      },
    },
    {
      number: 3,
      pillarName: 'Convenience Pack',
      bundleName: 'Daily Routine Kit',
      problemSolved: 'High browse-to-buy friction for new customers',
      concept:
        'Remove decision fatigue for first-time buyers by curating a complete "starter kit" that handles everything they need. Lowering the cognitive load converts hesitant browsers into buyers, and a great first experience drives repeat purchase.',
      offerMathematics: {
        products: [
          { name: 'Starter Pack (30 day)', price: 55 },
          { name: 'Shaker Bottle', price: 28 },
          { name: 'Usage Guide PDF', price: 0 },
        ],
        combinedRetail: 83,
        bundlePrice: 69,
        discountPercent: 17,
      },
      psychologicalTrigger: 'Decision simplification',
      executionTool: 'Fly Bundles',
      executionReason:
        'Pre-configured kit pages with social proof integration convert new visitors at above-average rates.',
      expectedImpact: {
        aovLift: '22%',
        targetMetric: 'New customer conversion +8%',
      },
    },
  ],

  implementationPriority: [
    {
      strategyNumber: 1,
      reason: 'Highest immediate AOV impact with existing loyal customer base',
    },
    {
      strategyNumber: 3,
      reason: 'Addresses top-of-funnel friction, compounds with Strategy 1 for LTV',
    },
    {
      strategyNumber: 2,
      reason: 'Capital recovery play — implement once cash-flow is optimized',
    },
  ],

  roadmapPhases: [
    {
      phase: 1,
      label: 'Foundation',
      duration: 'Week 1–2',
      days: [1, 14],
      tasks: [
        'Install Fly Bundles on Shopify store',
        'Configure Stock Up & Save bundle (Strategy 1)',
        'Set discount rules and quantity tiers',
        'QA test bundle on staging environment',
        'Launch to live store',
      ],
      milestone: 'Strategy 1 live',
    },
    {
      phase: 2,
      label: 'Conversion',
      duration: 'Week 3–6',
      days: [15, 42],
      tasks: [
        'Build Daily Routine Kit (Strategy 3)',
        'Create dedicated kit landing page',
        'Add social proof + reviews to bundle page',
        'A/B test bundle price point ($65 vs $69)',
        'Set up email flow for kit purchasers',
      ],
      milestone: 'Strategy 3 live + first conversion data',
    },
    {
      phase: 3,
      label: 'Optimization',
      duration: 'Week 7–10',
      days: [43, 70],
      tasks: [
        'Review Strategy 1 & 3 performance data',
        'Identify slow-moving SKUs for Strategy 2',
        'Build liquidation bundle logic',
        'Optimize discount thresholds based on margin data',
        'Launch Strategy 2 for excess inventory',
      ],
      milestone: 'All 3 strategies live',
    },
    {
      phase: 4,
      label: 'Scale',
      duration: 'Week 11–13',
      days: [71, 90],
      tasks: [
        'Full performance audit across all bundles',
        'Expand top-performing bundle variants',
        'Integrate bundle upsells in post-purchase flow',
        'Report on AOV lift vs baseline',
        'Plan Q2 strategy iteration',
      ],
      milestone: '90-day review + Q2 plan',
    },
  ],

  fullReportMarkdown: `# BaaS Strategy Report

**Store:** example-store.myshopify.com
**Generated:** February 2026
**Analysis Type:** Full Pipeline Analysis

---

## Executive Thesis

This store operates in the **Consumables (Food & Beverage)** vertical with strong repeat-purchase signals and a loyal customer base that currently under-buys per order. The primary opportunity is **pantry loading** — converting single-item purchases into volume buys through structured bundle incentives.

The data shows 62% returning customers who average 1.3 items per order. If we move that to 2.5 items per order through bundle adoption, AOV climbs from approximately $42 to $78 — a **86% lift** — without acquiring a single new customer.

---

## Data Truth

### What the Numbers Show

- **Repeat rate:** 62% (industry avg: 34%) — your customers love you
- **Units per order:** 1.3 (industry avg for consumables: 2.8) — massive gap
- **AOV:** $42 (potential with bundles: $68–$78)
- **Cart abandonment:** 71% (high friction signals)

### Why This Matters

Your customer acquisition cost is being wasted because lifetime value is capped by low per-order value. Every repeat purchase that could be a bundle is instead a single item — you're paying for retention but not capturing the revenue it should generate.

---

## Recommendations

### Strategy 1: Stock Up & Save (Volume Driver)

Target your repeat buyers with volume incentives. A 15% discount for buying a 3-product bundle pays for itself in reduced shipping costs and higher margin per fulfillment.

**Trigger:** Customer visits product page for the 3rd+ time
**Mechanic:** Bundle discount at cart, auto-applied
**Expected result:** AOV +25% within 30 days

### Strategy 2: Clear & Save Bundle (Liquidation Engine)

Pair your slow-moving Original Formula with bestsellers to move 40% more excess inventory within 60 days. This frees working capital for your Q2 product launch.

**Trigger:** Inventory threshold alert (>90 days of stock)
**Mechanic:** Automated bundle with dynamic discount
**Expected result:** Slow-SKU sell-through +40%

### Strategy 3: Daily Routine Kit (Convenience Pack)

New visitors abandon because choosing is hard. A curated starter kit removes decision fatigue and bundles everything they need for a 30-day trial. This is your acquisition accelerant.

**Trigger:** First-visit homepage or product page
**Mechanic:** Featured bundle placement, dedicated landing page
**Expected result:** New customer conversion +8%, AOV +22%

---

## Financial Impact

### Conservative Scenario (30% bundle adoption)
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| AOV | $42 | $56 | +$14 (+33%) |
| Revenue per 100 orders | $4,200 | $5,600 | +$1,400 |
| Monthly revenue (500 orders) | $21,000 | $28,000 | +$7,000 |

### Optimistic Scenario (60% bundle adoption)
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| AOV | $42 | $72 | +$30 (+71%) |
| Revenue per 100 orders | $4,200 | $7,200 | +$3,000 |
| Monthly revenue (500 orders) | $21,000 | $36,000 | +$15,000 |

---

## 90-Day Roadmap

### Phase 1: Foundation (Days 1–14)
Install Fly Bundles, configure Stock Up & Save, launch live.

### Phase 2: Conversion (Days 15–42)
Build and launch Daily Routine Kit with dedicated landing page and A/B test.

### Phase 3: Optimization (Days 43–70)
Review data, launch liquidation bundles, optimize discount thresholds.

### Phase 4: Scale (Days 71–90)
Full audit, expand winners, plan Q2 strategy.

---

## Next Steps

1. **This week:** Install Fly Bundles from the Shopify App Store
2. **This week:** Share this report with your ops team
3. **Week 2:** Configure and QA Strategy 1 bundle
4. **Ongoing:** Review bundle performance weekly in Fly Bundles dashboard

> *This report was generated by the BaaS AI pipeline. Recommendations are based on store data analysis and industry benchmarks. Results will vary.*`,
}
