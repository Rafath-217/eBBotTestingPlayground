export type LLMType = 'structure' | 'discount' | 'rules';

export enum Category {
  TIERED_DISCOUNT = 'TIERED_DISCOUNT',
  FIXED_BUNDLE_PRICE = 'FIXED_BUNDLE_PRICE',
  MULTI_STEP = 'MULTI_STEP',
  GOAL_STATEMENT = 'GOAL_STATEMENT',
  SPEND_BASED = 'SPEND_BASED',
  ADVERSARIAL = 'ADVERSARIAL',
}

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