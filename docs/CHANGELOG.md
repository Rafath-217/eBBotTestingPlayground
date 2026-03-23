# Changelog -- docs

## [staging] - 2026-03-23

### Added
- Created PM_HANDOFF_FLY_BUNDLE_RECOMMENDATIONS.md -- comprehensive PM handoff covering the full Fly Bundle Recommendations pipeline: 18-step flow, 6 data quality tiers, 4 recommendation formats (FBT triggers, custom pools, fixed bundles, volume discounts), PB/QB classification scoring, MVR guarantee, AI eligibility classification (Gemini 2.0 Flash), product grouping waterfall (5 strategies), FBT direction assignment and suppression rules, template selection, and 22-store validation metrics
- Created PM_FAQ_FLY_BUNDLE_RECOMMENDATIONS.md -- complementary FAQ covering: how to trigger/monitor/debug runs, edge cases (zero orders, ghost products, Tier 6 stores, all-gift-card catalogs), feedback workflow, threshold change process, merchant-facing explanations for common questions (0 FBT triggers, weak strength, volume discount fallbacks), and product exclusion via tags
- Verified all tier definitions, confidence levels, recommendation strength labels, companion strength labels, and order strategy confidence values against frontend type definitions in flyStrategyApi.ts and FlyStrategyPage.tsx tooltip mappings
