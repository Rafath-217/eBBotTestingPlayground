// ─── Strategy & Report Types ──────────────────────────────────────────────────

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export type PillarName =
  | 'volumeDriver'
  | 'liquidationEngine'
  | 'conveniencePack'
  | 'outfitBuilder'
  | 'giftEngine'
  | 'subscriptionConverter'
  | 'urgencyBundle'
  | 'premiumUpsell'

export interface VerticalContext {
  focus: string
  keyBundleTypes: string[]
  avoid: string[]
  typicalAovLift: string
}

export interface RecommendedPillars {
  primary: PillarName[]
  secondary: PillarName[]
  avoid: PillarName[]
}

export interface IndustryClassification {
  primaryVertical: string
  confidence: ConfidenceLevel
  classificationEvidence: string[]
  verticalContext: VerticalContext
  recommendedPillars: RecommendedPillars
  psychologicalTriggers: string
}

export interface BundleProduct {
  name: string
  price: number
}

export interface OfferMathematics {
  products: BundleProduct[]
  combinedRetail: number
  bundlePrice: number
  discountPercent: number
}

export interface ExpectedImpact {
  aovLift: string
  targetMetric: string
}

export interface StrategyRecommendation {
  number: number
  pillarName: string
  bundleName: string
  problemSolved: string
  concept: string
  offerMathematics: OfferMathematics
  psychologicalTrigger: string
  executionTool: string
  executionReason: string
  expectedImpact: ExpectedImpact
}

export interface ImplementationPriority {
  strategyNumber: number
  reason: string
}

export interface RoadmapPhase {
  phase: number
  label: string
  duration: string
  days: [number, number]
  tasks: string[]
  milestone: string
}

export interface StrategyReport {
  industryClassification: IndustryClassification
  strategies: StrategyRecommendation[]
  implementationPriority: ImplementationPriority[]
  roadmapPhases: RoadmapPhase[]
  fullReportMarkdown: string
}
