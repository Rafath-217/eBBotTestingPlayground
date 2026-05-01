# Merchant Diagnostics Implementation Plan

## Scope

Build an internal dashboard section in this frontend app backed by new read-only APIs in the GiftWrap/GiftLab backend.

Backend base route:

```txt
/api/merchantDiagnosticSnapshots
```

Frontend sidebar group:

```txt
Merchant Diagnostics
```

## Screens

Top-level sidebar items:

1. Overview
2. Baseline Insights
3. AOV Impact
4. Bundle Drivers

Store Drilldown is linked from rows and is not a sidebar item.

## APIs

```txt
GET /insights/summary
GET /insights/baseline
GET /insights/aov-impact
GET /insights/bundle-drivers
GET /insights/store/:shopName
```

## Metric Rules

- Store revenue uses `restOrderMetrics.totalPrice`.
- Missing store revenue renders as `-`.
- Store sessions use `shopifyQlMetrics.sessionCount`.
- Missing store sessions renders as `-`.
- EB revenue uses `easyBundlesMetrics.finalRevenueUsd`.
- Bundle revenue uses `storeebbundlesprofiles.performance.finalRevenueUsd`.
- Revenue tables sort highest to lowest by the relevant revenue metric.
- Bundling strategy is `Full page` or `Mix-match`.
- Offer strategy is `Discount`, `Percentage`, `Fixed bundle price`, or `BOGO`.
- Price band is available as an advanced filter.

## Build Order

1. Backend read-only insight endpoints.
2. Frontend service/types.
3. Shared Merchant Diagnostics UI helpers.
4. Overview screen.
5. Baseline Insights screen.
6. AOV Impact screen.
7. Bundle Drivers screen.
8. Store Drilldown screen.
9. Sidebar and routes.
10. Build validation.
