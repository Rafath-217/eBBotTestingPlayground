# eBBotTestingPlayground - Frontend Update Plan

This plan aligns the playground frontend with the backend changes made to `bundleSetupLlmPipeline`.

## Backend Changes Summary

| Change | Impact on Frontend |
|--------|-------------------|
| Centralized `pipeline.config.js` | Display prompt versions & model info |
| Prompt versioning (version + hash) | Show in UI, track across runs |
| New evaluation system (59 test cases) | New pages, API integration |
| 14 test categories (up from 6) | Update category filters & colors |
| Evaluation runs stored in MongoDB | New "Runs" page with history |
| Run comparison API | New comparison view |
| Dashboard service refactored | Update API calls |

---

## Phase 1: API Service Updates

### 1.1 New Evaluation API Service

**Create:** `services/evaluationApi.ts`

```typescript
// New endpoints to integrate:
GET  /evaluation/testCases              // List all 59 test cases
GET  /evaluation/testCases/:id          // Get single test case
GET  /evaluation/testCases/:id/history  // Get test case history across runs
GET  /evaluation/categories             // List categories with counts
GET  /evaluation/runs                   // List evaluation runs (paginated)
GET  /evaluation/runs/:runId            // Get full run details
GET  /evaluation/runs/:runId/failures   // Get failed cases from run
POST /evaluation/run                    // Trigger new evaluation
GET  /evaluation/compare                // Compare two runs
GET  /evaluation/promptVersions         // Get accuracy by prompt version
```

### 1.2 Update Existing Services

**Modify:** `services/dataService.ts`
- Update to use new dashboard endpoints if structure changed
- Add `getPromptVersions()` function

---

## Phase 2: Type Definitions

### 2.1 Update `types.ts`

```typescript
// New types needed:

interface EvaluationRun {
  runId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  testCasesCount: number;
  category: string | null;  // null = all categories
  accuracy: number;
  passed: number;
  failed: number;
  partial: number;
  errors: number;
  comparisonToPrevious?: {
    previousRunId: string;
    regressions: number;
    improvements: number;
    regressedCases: number[];
    improvedCases: number[];
  };
  metadata?: {
    llmModel: string;
    nodeVersion: string;
  };
}

interface EvaluationResult {
  testCaseId: number;
  category: string;
  status: 'PASS' | 'PARTIAL' | 'FAIL' | 'ERROR';
  structureResult: ComparisonResult;
  discountResult: ComparisonResult;
  rulesResult: ComparisonResult;
  latencyMs: number;
  error?: string;
}

interface ComparisonResult {
  expected: any;
  actual: any;
  match: boolean;
  details: string;
}

interface RunComparison {
  run1: { runId: string; summary: any };
  run2: { runId: string; summary: any };
  delta: {
    overall: { accuracy: number; passed: number; failed: number };
    byLlm: { structure: number; discount: number; rules: number };
  };
  changes: {
    regressions: TestCaseChange[];
    improvements: TestCaseChange[];
    unchanged: number;
  };
}

interface PromptVersionStats {
  currentVersions: { structure: string; discount: string; rules: string };
  structure: Record<string, { runs: number; avgAccuracy: number }>;
  discount: Record<string, { runs: number; avgAccuracy: number }>;
  rules: Record<string, { runs: number; avgAccuracy: number }>;
}

// Update Category type (now 14 categories)
type Category =
  | 'TIERED_DISCOUNT'
  | 'FIXED_BUNDLE_PRICE'
  | 'MULTI_STEP'
  | 'ADVERSARIAL'
  | 'GOAL_STATEMENT'
  | 'SPEND_BASED'
  | 'SINGLE_STEP_MULTI_CATEGORY'
  | 'RULES_V5_RANGE'
  | 'RULES_V5_TEXT_WINS'
  | 'RULES_V5_FIXED_STRICT'
  | 'RULES_V5_MULTI_STEP_PARTIAL'
  | 'RULES_V5_FIXED_MULTI_STEP'
  | 'RULES_V5_EXACT'
  | 'BUNDLE_AS_UNIT';
```

---

## Phase 3: New Views/Pages

### 3.1 Evaluation Runs Page

**Create:** `views/EvaluationRuns.tsx`

**Features:**
- List of past evaluation runs with pagination
- Summary cards: accuracy, passed/failed/partial counts
- Filter by category
- Click to expand full run details
- "Compare" button to select two runs
- "Trigger New Run" button
- Regression/improvement indicators (↑↓ arrows)

**PM Mode:**
- Visual cards for each run
- Color-coded accuracy (green >90%, yellow 70-90%, red <70%)
- Trend arrows showing improvement/regression

**Dev Mode:**
- Full JSON of run results
- Individual test case status table
- Error messages for failed cases

### 3.2 Run Comparison Page

**Create:** `views/RunComparison.tsx`

**Features:**
- Side-by-side run summaries
- Delta metrics (accuracy change, passed/failed change)
- Per-LLM accuracy changes (structure, discount, rules)
- List of regressions (cases that got worse)
- List of improvements (cases that got better)
- Click to expand individual test case diff

**PM Mode:**
- Visual diff with green/red highlighting
- Summary cards with trend indicators
- Simplified regression/improvement lists

**Dev Mode:**
- Full JSON diff
- Detailed per-test-case comparison
- Expected vs actual for each LLM

### 3.3 Test Case History Page

**Create:** `views/TestCaseHistory.tsx`

**Features:**
- View single test case results across all runs
- Timeline of pass/fail status
- Identify flaky tests (inconsistent results)
- See which prompt versions affected this case

---

## Phase 4: Component Updates

### 4.1 Update CategoryBadge (ui.tsx)

Add colors for 8 new categories:
```typescript
const categoryColors: Record<string, string> = {
  // Existing
  'TIERED_DISCOUNT': 'bg-purple-100 text-purple-800',
  'FIXED_BUNDLE_PRICE': 'bg-orange-100 text-orange-800',
  'MULTI_STEP': 'bg-blue-100 text-blue-800',
  'ADVERSARIAL': 'bg-red-100 text-red-800',
  'GOAL_STATEMENT': 'bg-green-100 text-green-800',
  'SPEND_BASED': 'bg-teal-100 text-teal-800',
  // New
  'SINGLE_STEP_MULTI_CATEGORY': 'bg-indigo-100 text-indigo-800',
  'RULES_V5_RANGE': 'bg-cyan-100 text-cyan-800',
  'RULES_V5_TEXT_WINS': 'bg-amber-100 text-amber-800',
  'RULES_V5_FIXED_STRICT': 'bg-rose-100 text-rose-800',
  'RULES_V5_MULTI_STEP_PARTIAL': 'bg-violet-100 text-violet-800',
  'RULES_V5_FIXED_MULTI_STEP': 'bg-fuchsia-100 text-fuchsia-800',
  'RULES_V5_EXACT': 'bg-lime-100 text-lime-800',
  'BUNDLE_AS_UNIT': 'bg-sky-100 text-sky-800',
};
```

### 4.2 New Components

**Create:** `components/EvaluationCards.tsx`
- `RunSummaryCard` - Shows run metrics
- `AccuracyBadge` - Color-coded accuracy display
- `TrendIndicator` - ↑↓ arrows for improvements/regressions
- `RunSelector` - Dropdown/modal for selecting runs to compare

**Create:** `components/ComparisonViews.tsx`
- `SideBySideComparison` - Two-column run comparison
- `DeltaMetrics` - Shows change between runs
- `RegressionList` - Cases that got worse
- `ImprovementList` - Cases that got better

### 4.3 Update Overview.tsx

- Display current prompt versions with hashes
- Show "Last Evaluation Run" summary
- Add link to full evaluation history
- Update category chart for 14 categories

### 4.4 Update Layout.tsx (Sidebar)

Add new navigation items:
```
Dashboard
├── Overview
│
Components
├── Structure LLM
├── Discount LLM
├── Rules LLM
├── Assembly
│
Analysis
├── Test Results
├── Evaluation Runs    ← NEW
├── Run Comparison     ← NEW
│
Live Testing
├── Playground
├── Pipeline History
```

---

## Phase 5: Feature Enhancements

### 5.1 Trigger Evaluation from UI

**Add to EvaluationRuns.tsx:**
- "Run Evaluation" button
- Category selector (optional filter)
- Dry run checkbox
- Progress indicator while running
- Real-time status updates (if possible via polling)

### 5.2 Prompt Version Display

**Update Overview.tsx header:**
```
┌─────────────────────────────────────────────┐
│ Bundle Setup LLM Pipeline                   │
│                                             │
│ Model: gemini-2.0-flash                     │
│                                             │
│ Prompt Versions:                            │
│   Structure: v3.0.0 (hash: a1b2c3d4)       │
│   Discount:  v2.1.0 (hash: e5f6g7h8)       │
│   Rules:     v5.0.0 (hash: i9j0k1l2)       │
│                                             │
│ Last Evaluation: 2024-01-15 (92% accuracy) │
└─────────────────────────────────────────────┘
```

### 5.3 Accuracy Trends Chart

**Add to Overview.tsx or new Trends page:**
- Line chart showing accuracy over time
- Separate lines for each LLM
- Markers for prompt version changes
- Hover to see run details

---

## Phase 6: Data Flow Updates

### 6.1 App.tsx Changes

Add new state and data fetching:
```typescript
const [evaluationRuns, setEvaluationRuns] = useState<EvaluationRun[]>([]);
const [promptVersions, setPromptVersions] = useState<PromptVersionStats | null>(null);
const [selectedRuns, setSelectedRuns] = useState<[string, string] | null>(null);

useEffect(() => {
  // Existing data loading...

  // Add:
  getEvaluationRuns().then(setEvaluationRuns);
  getPromptVersions().then(setPromptVersions);
}, []);
```

### 6.2 Route/Tab Updates

Add new tabs:
```typescript
type Tab =
  | 'overview'
  | 'structure'
  | 'discount'
  | 'rules'
  | 'assembly'
  | 'testResults'
  | 'evaluationRuns'    // NEW
  | 'runComparison'     // NEW
  | 'playground'
  | 'history';
```

---

## Implementation Priority

### Priority 1 (Must Have)
- [ ] `services/evaluationApi.ts` - New API service
- [ ] Update `types.ts` with new types
- [ ] `views/EvaluationRuns.tsx` - List runs
- [ ] Update `CategoryBadge` for 14 categories
- [ ] Update sidebar navigation

### Priority 2 (Should Have)
- [ ] `views/RunComparison.tsx` - Compare runs
- [ ] Prompt version display in Overview
- [ ] Trigger evaluation button
- [ ] `components/EvaluationCards.tsx`

### Priority 3 (Nice to Have)
- [ ] `views/TestCaseHistory.tsx` - Per-test history
- [ ] Accuracy trends chart
- [ ] Real-time evaluation progress

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| CREATE | `services/evaluationApi.ts` | New evaluation API client |
| MODIFY | `types.ts` | Add new types, update Category |
| CREATE | `views/EvaluationRuns.tsx` | Evaluation runs list page |
| CREATE | `views/RunComparison.tsx` | Run comparison page |
| CREATE | `views/TestCaseHistory.tsx` | Test case history page |
| CREATE | `components/EvaluationCards.tsx` | Evaluation UI components |
| CREATE | `components/ComparisonViews.tsx` | Comparison UI components |
| MODIFY | `components/ui.tsx` | Add new category colors |
| MODIFY | `components/Layout.tsx` | Add sidebar items |
| MODIFY | `views/Overview.tsx` | Add prompt versions, last run |
| MODIFY | `App.tsx` | Add new state, routes, data fetching |

---

## Notes

- Keep existing PM/Dev mode toggle - apply to all new views
- Maintain consistent Tailwind styling approach
- Use existing component patterns (Card, Badge, Table, etc.)
- No new dependencies needed (Recharts handles new charts)
- All new API calls should use existing fetch pattern from services/
