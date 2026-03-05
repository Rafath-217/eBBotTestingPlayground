export type LLMType = 'structure' | 'discount' | 'rules';

export const CATEGORIES = [
  'TIERED_DISCOUNT',
  'FIXED_BUNDLE_PRICE',
  'MULTI_STEP',
  'ADVERSARIAL',
  'GOAL_STATEMENT',
  'SPEND_BASED',
  'SINGLE_STEP_MULTI_CATEGORY',
  'RULES_V5_RANGE',
  'RULES_V5_TEXT_WINS',
  'RULES_V5_FIXED_STRICT',
  'RULES_V5_MULTI_STEP_PARTIAL',
  'RULES_V5_FIXED_MULTI_STEP',
  'RULES_V5_EXACT',
  'BUNDLE_AS_UNIT',
] as const;

export type Category = typeof CATEGORIES[number];

export enum Style {
  TERSE = 'TERSE',
  STRUCTURED_LIST = 'STRUCTURED_LIST',
  CONVERSATIONAL = 'CONVERSATIONAL',
  MARKETING_COPY = 'MARKETING_COPY',
  TECHNICAL_DETAILED = 'TECHNICAL_DETAILED',
  VAGUE_ASSUMES_CONTEXT = 'VAGUE_ASSUMES_CONTEXT',
}

export enum AdversarialType {
  BOGO_ATTEMPT = 'BOGO_ATTEMPT',
  URL_ONLY = 'URL_ONLY',
  CONTRADICTORY = 'CONTRADICTORY',
  MIXED_PATTERN = 'MIXED_PATTERN',
  OFF_TOPIC = 'OFF_TOPIC',
  NONE = 'NONE'
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
}

export interface Product {
  id: string;
  title: string;
  productType: string;
  handle: string;
}

export interface TestCase {
  id: string;
  category: Category;
  style: Style;
  adversarialType?: AdversarialType;
  input: string;
  collections?: Collection[];
  products?: Product[];
  expectedStructure?: any;
  expectedDiscount?: any;
  expectedRules?: any;
  assembledOutput?: any;
}

export interface TestResult {
  id: string; // matches TestCase id
  testCaseId: string;
  llmType: LLMType;
  actual: any;
  status: 'PASS' | 'FAIL';
  latencyMs: number;
  timestamp: string;
}

export interface Metrics {
  timestamp: string;
  model: string;
  promptVersions: {
    structure: string;
    discount: string;
    rules: string;
  };
  totalTestCases: number;
  results: {
    structure: { passed: number; failed: number; rate: string };
    discount: { passed: number; failed: number; rate: string };
    rules: { passed: number; failed: number; rate: string };
    overall: { passed: number; total: number; rate: string };
  };
  byCategory: Record<string, { cases: number; passRate: string; structure: string; discount: string; rules: string }>;
  byStyle: Record<string, { cases: number; passRate: string; structure: string; discount: string; rules: string }>;
  problematicCases: { id: number; category: string; style: string; failedLLMs: string[] }[];
}

// --- LLM SPECIFICATIONS ---

export interface StructureLLMSpec {
  name: string;
  version: string;
  purpose: string;
  outputTypes: {
    value: string | null;
    description: string;
    color: string;
    useCases?: string[];
    additionalFields?: string[];
    triggers?: string[];
  }[];
  supportedPatterns: {
    name: string;
    output: string;
    example: {
      input: string;
      output: any;
    };
  }[];
  rejectionPatterns: {
    name: string;
    example: string;
  }[];
}

export interface DiscountLLMSpec {
  name: string;
  version: string;
  purpose: string;
  discountModes: {
    mode: string | null;
    description: string;
    color: string;
    example?: {
      input: string;
      output: any;
    };
    triggers?: string[];
  }[];
  keyRules: string[];
}

export interface RulesLLMSpec {
  name: string;
  version: string;
  purpose: string;
  defaultBehavior: {
    description: string;
    output: any;
  };
  conditions: {
    name: string;
    alias?: string;
    description: string;
    example: string;
  }[];
  patternMapping: {
    pattern: string;
    condition: string;
    valueSource: string;
    example: {
      input: string;
      output: any;
    };
  }[];
}

export interface LLMSpecs {
  structureLLM: StructureLLMSpec;
  discountLLM: DiscountLLMSpec;
  rulesLLM: RulesLLMSpec;
}

// --- PIPELINE API TYPES ---

export interface PipelineRequest {
  merchantText: string;
  collections: { id: string; title: string }[];
  products: { id: string; productType: string; title?: string }[];
}

export interface PipelineDebug {
  structureOutput: {
    structureType: 'SINGLE_STEP' | 'MULTI_STEP' | null;
    stepLabels?: string[];
    collectionHints?: string[];
  };
  discountOutput: {
    discountMode: 'PERCENTAGE' | 'FIXED' | 'FIXED_BUNDLE_PRICE' | 'BXGY' | null;
    rules?: { type: string; value: string; discountValue: string; buyQty?: string; getQty?: string; discountCodePrefix?: string }[];
  };
  rulesOutput: {
    conditions: {
      condition: 'equalTo' | 'greaterThanOrEqualTo' | 'lessThanOrEqualTo';
      value: string;
      stepIndex?: number;
    }[];
  };
}

export interface TraceEntry {
  step: number;
  name: string;
  durationMs?: number;
  pattern?: string;
  output?: any;
  [key: string]: any;
}

export interface PipelineResult {
  status: 'AUTO' | 'DOWNGRADED_TO_MANUAL' | 'MANUAL';
  bundleConfig: any;
  flags: Record<string, boolean>;
  decision_trace: any;
  _debug: PipelineDebug;
  _trace: TraceEntry[];
}

export interface PipelineResponse {
  statusCode: number;
  message: string;
  data: PipelineResult;
}

// --- PIPELINE HISTORY TYPES ---

export interface PipelineHistoryInput {
  merchantText: string;
  products: { id: string; title: string; productType: string }[];
  collections: { id: string; title: string }[];
}

export interface PipelineHistoryOutput {
  structureLLM: any;
  discountLLM: any;
  rulesLLM: any;
  assembledResult: any;
}

export type FeedbackRating = 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT';

export interface PipelineHistoryFeedback {
  rating: FeedbackRating;
  remarks: string;
  updatedAt: string;
}

export interface PipelineHistoryLog {
  id: string;
  timestamp: string;
  status: 'AUTO' | 'DOWNGRADED_TO_MANUAL' | 'MANUAL';
  source: 'APP' | 'NON-APP';
  shopName: string;
  bundleLink?: string | null;
  input: PipelineHistoryInput;
  output: PipelineHistoryOutput;
  durationMs?: number;
  feedback?: PipelineHistoryFeedback | null;
}

export interface PipelineHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PipelineHistoryResponse {
  statusCode: number;
  message: string;
  data: {
    logs: PipelineHistoryLog[];
    pagination: PipelineHistoryPagination;
  };
}

export interface PipelineHistoryQuery {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  source?: 'ALL' | 'APP' | 'NON-APP';
  feedback?: 'ALL' | 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' | 'NO_FEEDBACK';
  merchantText?: 'ALL' | 'EMPTY' | 'NON_EMPTY';
}

// --- EVALUATION TYPES ---

export interface ComparisonResult {
  expected: any;
  actual: any;
  match: boolean;
  details: string;
}

export interface EvaluationResult {
  testCaseId: number;
  category: string;
  style: string;
  text: string;
  status: 'PASS' | 'PARTIAL' | 'FAIL' | 'ERROR';
  structureResult: ComparisonResult;
  discountResult: ComparisonResult;
  rulesResult: ComparisonResult;
  latencyMs: number;
  error?: string;
}

export interface EvaluationRun {
  runId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  testCasesCount: number;
  category: string | null;
  summary: {
    overall: { passed: number; failed: number; partial: number; errors: number; accuracy: number };
    byLlm: {
      structure: { passed: number; failed: number; accuracy: number };
      discount: { passed: number; failed: number; accuracy: number };
      rules: { passed: number; failed: number; accuracy: number };
    };
    byCategory: Record<string, { passed: number; failed: number; partial: number; errors: number }>;
  };
  comparisonToPrevious?: {
    previousRunId: string | null;
    regressions: number;
    improvements: number;
    unchanged: number;
    regressedCases: number[];
    improvedCases: number[];
  };
  metadata?: { llmModel: string; nodeVersion: string };
}

export interface EvaluationRunDetail extends EvaluationRun {
  results: EvaluationResult[];
}

export interface RunComparison {
  run1: { runId: string; startedAt: string; summary: EvaluationRun['summary'] };
  run2: { runId: string; startedAt: string; summary: EvaluationRun['summary'] };
  delta: {
    overall: { accuracy: number; passed: number; failed: number; partial: number };
    byLlm: { structure: number; discount: number; rules: number };
  };
  changes: {
    regressions: { testCaseId: number; category: string; from: string; to: string; text?: string }[];
    improvements: { testCaseId: number; category: string; from: string; to: string; text?: string }[];
    unchanged: { testCaseId: number; status: string; category: string }[];
  };
}

export interface PromptVersionStats {
  currentVersions: { structure: string; discount: string; rules: string };
  totalRuns: number;
  structure: Record<string, { runs: number; avgAccuracy: number; minAccuracy: number; maxAccuracy: number }>;
  discount: Record<string, { runs: number; avgAccuracy: number; minAccuracy: number; maxAccuracy: number }>;
  rules: Record<string, { runs: number; avgAccuracy: number; minAccuracy: number; maxAccuracy: number }>;
}

export interface TestCaseDefinition {
  id: number;
  category: string;
  style: string;
  text: string;
  collections?: { id: string; title: string }[];
  products?: { id: string; productType: string }[];
  expected: {
    structure?: any;
    discounts?: any;
    rules?: any;
  };
}

// ─── BaaS Pipeline Types ─────────────────────────────────────────────────────

export interface ShippingData {
  hasFreeShipping: boolean
  threshold: number | null
  notes: string
}

export interface MerchandisingData {
  hasBundles: boolean
  hasKits: boolean
  hasGiftSets: boolean
  navItems: string[]
}

export interface AuditData {
  title: string
  description: string
  shipping: ShippingData
  merchandising: MerchandisingData
  score: number
  summary: string
}

export interface BaasPipelineResult {
  audit: AuditData
  salesAnalysis: Record<string, unknown> | null
  strategy: string | null
}

export interface BaasPipelineRun {
  _id: string
  url?: string
  shopName: string
  pipelineType: 'audit' | 'full-analysis'
  status: 'running' | 'completed' | 'failed'
  result: BaasPipelineResult
  error: string | null
  durationMs: number
  currency?: string
  createdAt: string
  updatedAt: string
}

export interface BaasHistoryResponse {
  data: BaasPipelineRun[]
  history?: BaasPipelineRun[]
  totalPages?: number
  pagination?: { totalPages: number }
}

// ─── Enriched Pipeline Run (new agent-level data) ─────────────────────────────

export type BaasAgentName =
  | 'Website Auditor'
  | 'Data Analyst'
  | 'Industry Classifier'
  | 'Strategy Architect'
  | 'Report Compiler'

export type AgentName = BaasAgentName
export type BaasAgentStatus = 'completed' | 'running' | 'failed' | 'pending' | 'skipped'

export interface AgentExecution {
  name: BaasAgentName
  status: BaasAgentStatus
  durationMs?: number
  startedAt?: string
  completedAt?: string
}

// ─── Auditor Results ──────────────────────────────────────────────────────────

export interface ShippingAnalysis {
  threshold: number | null
  deadZoneGap: number | null
  entryPriceGap: number | null
  coreProductPrice: number | null
  hasFreeShipping: boolean
  confidence?: string
  notes?: string
}

export interface NavigationAudit {
  hasBundleNavigation?: boolean
  result?: string
  bundleTermsFound: string[]
  hasGiftSection: boolean
  hasCustomization?: boolean
  recommendation?: string
  navItems?: string[]
}

export interface PdpAudit {
  score: number | string
  maxScore?: number
  widgetsPresent: string[]
  widgetsMissing: string[]
  productName?: string | null
  productPrice?: number | null
}

export interface PriceAnalysis {
  min: number
  max: number
  median: number
  currency?: string
}

export interface ScoreCriterion {
  label: string
  points: number
  met: boolean
  detail?: string
}

export interface ScoreCategory {
  name: string
  earned: number
  max: number
  criteria: ScoreCriterion[]
}

export interface ScoreBreakdown {
  total: number
  categories: ScoreCategory[]
}

export interface BundlePageEvidence {
  url: string
  label: string
  source: string
}

export interface BundleImageEvidence {
  alt?: string
  src?: string
  matchedTerm: string
  source: string
}

export interface AppDetectedEvidence {
  name: string
  type: string
}

export interface PriceDistributionBand {
  band: string
  count: number
  percentage: number
  score?: number | null
}

export interface ShippingEvidence {
  threshold: number | null
  currency: string | null
  medianProductPrice: number | null
  deadZoneGap: number | null
  hasUnconditionalFreeShipping: boolean
  anchorPrice: number | null
  anchorPriceRange?: { low: number | null; high: number | null } | null
  anchorBand?: string | null
  anchorConfidence?: string | null
  anchorDominance?: number | null
  dominanceStrength?: string | null
  storeShape?: string | null
  accessoriesSuppressed?: number
  priceDistribution?: PriceDistributionBand[]
  entryPriceGap?: number | null
  entryPriceGapRange?: { low: number | null; high: number | null } | null
  thresholdAlignment?: {
    multiple: number
    classification: string
  } | null
  behavioral?: {
    aov: number | null
    behavioralGap: number | null
    anchorVsAovDelta: number | null
    gapReductionPotential: number | null
  } | null
  pricingConfidence?: string
}

export interface PdpWidgetEvidence {
  present: string[]
  missing: string[]
  productAudited: string | null
}

export interface BaasBundleProduct {
  title: string
  handle: string
  price: number
  matchedTerm: string
}

export interface CatalogAnalysis {
  totalProducts: number
  bundleCount: number
  bundlePercentage: number
  bundleProducts: BaasBundleProduct[]
  categories?: Record<string, number>
  bundlePriceRange?: { min: number | null; max: number | null; median: number | null } | null
  nonBundlePriceRange?: { min: number | null; max: number | null; median: number | null } | null
}

export interface AuditorEvidence {
  scoreBreakdown?: ScoreBreakdown
  bundlePages?: BundlePageEvidence[]
  byobPages?: BundlePageEvidence[]
  bundleImages?: BundleImageEvidence[]
  appsDetected?: AppDetectedEvidence[]
  shipping?: ShippingEvidence
  pdpWidgets?: PdpWidgetEvidence
  catalogAnalysis?: CatalogAnalysis
  dataCompleteness?: 'structural_only' | 'revenue_validated'
  catalogProducts?: CatalogProduct[]
}

export interface BundleDetectionSignal {
  type: string
  value: string
  weight: string
}

export interface BundleDetection {
  confidence: string
  signals: BundleDetectionSignal[]
  appsDetected: string[]
  hasDedicatedNavigation: boolean
  hasGiftSection: boolean
  hasCustomization: boolean
  keywordsFound: string[]
  criticalGap: boolean
}

export interface AuditorResults {
  siteOverview?: {
    title?: string
    description?: string
    industryHint?: string
    productCategory?: string
  }
  shippingAnalysis: ShippingAnalysis
  navigationAudit: NavigationAudit
  pdpAudit: PdpAudit
  priceAnalysis: PriceAnalysis
  criticalFindings: (string | { finding?: string; impact?: string; recommendation?: string })[]
  overallScore: number
  summary: string
  currency?: string
  evidence?: AuditorEvidence
  bundleDetection?: BundleDetection
}

// ─── Analyst Results ──────────────────────────────────────────────────────────

export interface DataOverview {
  shop?: string
  orderCount: number
  productCount: number
  totalRevenue: number
  dataSource?: string
}

export interface HistogramBucket {
  label: string
  count: number
  percentage: number
}

export interface AbcAnalysis {
  gradeACount?: number
  gradeATopPerformers?: string[]
  gradeCCount?: number
  gradeCRevenue?: number
  liquidationPriority?: string[]
  // Legacy fields kept for backward compat
  gradeAProducts?: string[]
  gradeCProducts?: string[]
  deadstockCount?: number
}

export interface ReturnRateAnalysis {
  singleItemReturnRate: number
  multiItemReturnRate: number
  bundlingReducesReturns?: boolean
  insight?: string
}

export interface RetentionEconomics {
  newCustomerAov: number
  repeatCustomerAov: number
  aovGap: number
  hasReplenishmentProblem?: boolean
  returningCustomerRate?: number
  ordersPerCustomer?: number
  potentialMonthlyRecovery?: number
}

export interface AffinityTopPair {
  anchor: string
  boughtWith: string
  orders: number
}

export interface AffinityAnalysis {
  productsAnalyzed: number
  totalAffinitiesFound: number
  strongAffinities: number
  topPairs: AffinityTopPair[]
}

// Legacy flat pair shape
export interface AffinityPair {
  productA: string
  productB: string
  coPurchaseRate: number
  liftScore?: number
}

export interface MoneyLeftOnTable {
  gradeCLiability?: number | null
  affinityFrictionGap?: number | null
  replenishmentRecovery?: number | null
  returnReduction?: number | null
  totalOpportunity?: number | null
}

export interface RecommendedAction {
  action: string
  expectedImpact?: string
  priority?: number
}

export interface AnalystResults {
  dataOverview: DataOverview
  aovHistogram: HistogramBucket[] | { distribution: unknown; peakBucket: unknown; insight: unknown } | null
  abcAnalysis: AbcAnalysis
  returnRateAnalysis: ReturnRateAnalysis | null
  retentionEconomics: RetentionEconomics | null
  affinityAnalysis: AffinityAnalysis | AffinityPair[] | null
  moneyLeftOnTable: MoneyLeftOnTable | number | null
  recommendedActions: (string | RecommendedAction)[]
  summary?: string
}

// ─── Classifier Results ───────────────────────────────────────────────────────

export interface BaasVerticalContext {
  focus: string
  keyBundleTypes: string[]
}

export interface BaasRecommendedPillars {
  primary: string[]
  secondary: string[]
  avoid: string[]
}

export interface VerticalScoreEntry {
  name: string
  score: number
  matchedKeywords: string[]
  totalKeywords: number
  confidence: string
}

export interface ClassifierResults {
  primaryVertical: string
  confidence: number | string
  classificationEvidence: string[]
  verticalContext: BaasVerticalContext
  recommendedPillars: BaasRecommendedPillars
  psychologicalTriggers: string | string[]
  deterministicScoreBreakdown?: Record<string, VerticalScoreEntry>
}

// ─── Strategy Results ─────────────────────────────────────────────────────────

export interface OfferProduct {
  name: string
  price: number
}

export interface BaasOfferMathematics {
  products: OfferProduct[]
  // Backend sends combinedRetail; legacy sends originalTotal
  combinedRetail?: number
  originalTotal?: number
  bundlePrice: number
  // Backend sends discountPercent; legacy sends discount
  discountPercent?: number
  discount?: number
  savingsAmount?: number
}

export interface ExpectedImpact {
  aovLift?: string
  targetMetric?: string
}

export interface BundleStrategy {
  number?: number
  pillarName: string
  bundleName: string
  problemSolved: string
  concept: string
  offerMathematics: BaasOfferMathematics
  psychologicalTrigger: string
  executionTool: string
  executionReason?: string
  expectedImpact: string | ExpectedImpact
  strategyType?: 'new' | 'optimize'
  existingBundleReference?: string | null
}

export interface ImplementationPriorityItem {
  strategyNumber: number
  reason: string
}

export interface StrategyResults {
  strategies: BundleStrategy[]
  implementationPriority: (string | ImplementationPriorityItem)[]
}

// ─── Report Results ───────────────────────────────────────────────────────────

export interface ReportResults {
  markdownContent?: string
  generatedAt?: string
}

// ─── Agent Timing ────────────────────────────────────────────────────────────

export interface AgentTiming {
  durationMs: number
  inputTokens?: number
  outputTokens?: number
}

// ─── Planner Decisions ───────────────────────────────────────────────────────

export interface PlannerDecisions {
  parallelizable: boolean
  runAuditor: boolean
  runAnalyst: boolean
  requiredQueries: string[]
  reasoningDepth?: string
  decisionLog: string[]
}

// ─── Metrics Engine Results ──────────────────────────────────────────────────

export interface RawMetrics {
  aov: number | null
  totalRevenue: number | null
  orderCount: number | null
  returnRate: { single: number; multi: number } | null
  gradeACount: number | null
  gradeBCount?: number | null
  gradeCCount: number | null
  gradeCRevenue: number | null
  repeatAovGap: number | null
  repeatRate?: number | null
  freeShippingThreshold: number | null
  medianProductPrice: number | null
}

export interface DerivedMetrics {
  freeShippingOpportunity?: number | null
  deadZoneGap?: number | null
  behavioralGap?: number | null
  entryPriceGap?: number | null
  anchorVsAovDelta?: number | null
  gapReductionPotential?: number | null
  inventoryRiskScore: number | null
  retentionRiskScore: number | null
  revenueConcentrationIndex: number | null
  aovBridgeAmount: number | null
  gradeCRevenuePercent: number | null
  potentialBundleUplift: number | null
}

export interface Opportunities {
  topPainPoint: string | null
  freeShippingGap: boolean
  hasLiquidationOpportunity: boolean
  hasRetentionProblem: boolean
  hasAovBridgeOpportunity: boolean
  recommendedPillars: string[]
}

export interface MetricsResult {
  rawMetrics: RawMetrics
  derivedMetrics: DerivedMetrics
  opportunities: Opportunities
  currency: string | null
}

// ─── Reflection Results ──────────────────────────────────────────────────────

export interface StrategyValidation {
  strategyIndex: number
  checks: {
    exceedsFreeShipping: boolean
    improvesAov: boolean
    avoidsMarginDestruction: boolean
    alignsWithPainPoint: boolean
  }
  issues: string[]
  suggestedConstraints: string[]
}

export interface ReflectionResult {
  passed: boolean
  validationResults?: StrategyValidation[]
  overallIssues?: string[]
  reflectionLog: string[]
  constraintsForRetry: string[]
  tokenUsage?: { inputTokens: number; outputTokens: number }
}

// ─── Cross Validation ───────────────────────────────────────────────────────

export interface AnchorReconciliation {
  protocolA_anchorPrice: number | null
  revenueAnchorPrice: number | null
  finalAnchorPrice: number | null
  source: string
  override: boolean
  divergence: number | null
  joinRate: number | null
  reason: string
}

export interface ArchetypeReconciliation {
  protocolA_archetype: string | null
  finalArchetype: string
  override: boolean
  revenueShape: string | null
  reason: string
  evidence: {
    top1Share: number | null
    top3Share: number | null
    top5Share: number | null
    hhi: number | null
  }
}

export interface HiddenRevenueDriver {
  title: string
  revenue: number
  revenueShare: number
}

export interface HiddenRevenueDrivers {
  hasHiddenDrivers: boolean
  totalHiddenRevenueShare: number
  drivers: HiddenRevenueDriver[]
}

export interface CrossValidationHeroProduct {
  title: string
  revenue: number
  revenueShare: number
  isHiddenDriver: boolean
  heroOverride: boolean
}

export interface CrossValidationMismatch {
  field: string
  protocolA: unknown
  protocolB: unknown
  final: unknown
  divergence?: number | null
  action: string
  reason: string
}

export interface CrossValidation {
  anchorReconciliation: AnchorReconciliation
  archetypeReconciliation: ArchetypeReconciliation
  hiddenRevenueDrivers: HiddenRevenueDrivers
  heroProduct: CrossValidationHeroProduct
  confidence: string
  protocolASnapshot: Record<string, unknown>
  protocolBSnapshot: Record<string, unknown>
  reconciled: Record<string, unknown>
  mismatches: CrossValidationMismatch[]
}

// ─── Strategy Report ────────────────────────────────────────────────────────

export interface BaasStrategyReport {
  [key: string]: unknown
}

// ─── Catalog Product ────────────────────────────────────────────────────────

export interface CatalogProduct {
  title: string
  handle: string
  price: number
  variants?: { price: number }[]
}

// ─── Behavioral Profile ─────────────────────────────────────────────────────

export type AovTier = 'low' | 'mid' | 'high'
export type RepeatGap = 'declining' | 'growing' | 'stable'
export type BasketBehavior = 'single_item_heavy' | 'multi_item_heavy'
export type RevenueConcentration = 'top_heavy' | 'long_tail' | 'balanced'

export interface BehavioralProfile {
  aovTier: AovTier | null
  repeatGap: RepeatGap | null
  basketBehavior: BasketBehavior | null
  revenueConcentration: RevenueConcentration | null
}

// ─── Strategic Diagnosis ────────────────────────────────────────────────────

export interface StrategicDiagnosis {
  growthLever: string | null
  primaryConstraint: string | null
  secondaryFocus?: string | null
  opportunitySummary: string | null
}

// ─── Execution Blueprint ────────────────────────────────────────────────────

export interface ExecutionBlueprint {
  bundleFormats: string[]
  priceTargetRange: { low: number | null; high: number | null }
  placementPriority: string[]
  kpiToTrack: string[]
  secondaryFocus: string | null
}

// ─── Impact Projection ─────────────────────────────────────────────────────

export interface ImpactRange {
  low: number | null
  high: number | null
}

export interface ImpactProjection {
  aovLiftRange: ImpactRange
  incrementalRevenueRange: ImpactRange
  marginDeltaEstimate: ImpactRange
  inventoryClearanceEstimate: ImpactRange
  confidence: 'high' | 'medium' | 'low'
  strategies?: StrategyImpactBreakdown[]
  totalRevenueLiftLow?: number | null
  totalRevenueLiftHigh?: number | null
  blendedAOVLift?: ImpactRange | null
}

// ─── Impact Simulation ──────────────────────────────────────────────────────

export interface ImpactModifier {
  name: string
  applied: boolean
  value: number | null
  reason: string
}

export interface ImpactSimulation {
  currentAOV: number | null
  projectedBundlePrice: number | null
  bundleMultiple: number | null
  baseConversionRange: ImpactRange
  modifiers: ImpactModifier[]
  effectiveConversionRange: ImpactRange
  singleItemShareEstimate: number | null
  math?: {
    delta: number | null
    lowAOV: number | null
    highAOV: number | null
    aovLiftPctLow: number | null
    aovLiftPctHigh: number | null
  }
  revenueLift: ImpactRange
  inventoryClearance: ImpactRange
}

// ─── Sales Summary ──────────────────────────────────────────────────────────

export interface SalesSummaryPriorityMove {
  format: string
  revenueRange: string
  confidence: string
}

export interface SalesSummary90DayImpact {
  projectedRevenue: string
  projectedAOVLift: string
  inventoryImpact: string
}

export interface SalesSummaryCredibility {
  ordersAnalyzed: string
  revenueAnalyzed: string
  confidence: string
}

export interface SalesSummary {
  headlineRevenueOpportunity: string
  urgencyStatement: string
  rootCauses: string[]
  priorityMove: SalesSummaryPriorityMove
  '90DayImpact': SalesSummary90DayImpact
  credibility: SalesSummaryCredibility
}

// ─── Strategy Impact Breakdown ──────────────────────────────────────────────

export interface StrategyImpactBreakdown {
  format: string
  cohortSize: number | null
  adoptionRange: ImpactRange
  priceDelta: number | null
  aovLift: ImpactRange
  revenueLift: ImpactRange
  marginImpact: ImpactRange
  inventoryImpact: ImpactRange | null
  confidence: string
}

// ─── Guardrails ─────────────────────────────────────────────────────────────

export interface Guardrail {
  name: string
  triggered: boolean
  reason: string
}

export interface GuardrailsResult {
  behavioral: Guardrail
  threshold: Guardrail
  inventory: Guardrail
}

// ─── Full Enriched Run (superset of BaasPipelineRun) ──────────────────────────

export interface EnrichedPipelineRun extends BaasPipelineRun {
  appName?: string
  agentsExecuted: AgentExecution[]
  auditorResults?: AuditorResults
  analystResults?: AnalystResults
  classifierResults?: ClassifierResults
  strategyResults?: StrategyResults
  reportResults?: ReportResults
  plannerDecisions?: PlannerDecisions
  metricsResult?: MetricsResult
  reflectionResult?: ReflectionResult
  reflectionAttempts?: number
  decisionLog?: string[]
  agentTimings?: Record<string, AgentTiming>
  behavioralProfile?: BehavioralProfile | null
  strategicDiagnosis?: StrategicDiagnosis | null
  executionBlueprint?: ExecutionBlueprint | null
  impactProjection?: ImpactProjection | null
  impactSimulation?: ImpactSimulation | null
  guardrails?: GuardrailsResult | null
  archetype?: string | null
  orderCount?: number | null
  salesSummary?: SalesSummary | null
  crossValidation?: CrossValidation | null
  strategyReport?: BaasStrategyReport | null
  rawQueryData?: Record<string, unknown> | null
  queriesExecuted?: string[]
}
