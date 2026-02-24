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
  products: { id: string; productType: string }[];
}

export interface PipelineDebug {
  structureOutput: {
    structureType: 'SINGLE_STEP' | 'MULTI_STEP' | null;
    stepLabels?: string[];
    collectionHints?: string[];
  };
  discountOutput: {
    discountMode: 'PERCENTAGE' | 'FIXED' | 'FIXED_BUNDLE_PRICE' | null;
    rules?: { type: string; value: string; discountValue: string }[];
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
