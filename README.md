# eBBot LLM Testing Dashboard

A React-based dashboard for testing and visualizing eBBot's LLM pipeline for merchant bundle configuration parsing.

## Features

- **Overview**: High-level metrics, pass rates by category/style, problematic cases summary
- **Structure LLM**: Test results for bundle structure detection (SINGLE_STEP, MULTI_STEP)
- **Discount LLM**: Test results for discount extraction (PERCENTAGE, FIXED, FIXED_BUNDLE_PRICE)
- **Rules LLM**: Test results for selection rules (quantity/amount conditions)
- **Assembly**: View assembled bundle configurations from combined LLM outputs
- **Playground**: Live testing of merchant queries against the pipeline

## View Modes

The dashboard supports two view modes, toggled via the sidebar:

### PM Mode (Product Manager)
Visual, form-like representation of data:
- Structure: Type badges, step cards with labels
- Discount: Mode badges, rule cards with Qualifier/Threshold/Discount
- Rules: Condition cards with Type/Condition/Value

### Dev Mode (Developer)
Raw JSON output for debugging:
- Full JSON code blocks
- Pipeline trace timeline (Playground)
- Technical debugging information

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   - Copy `.env.local.example` to `.env.local`
   - Set `VITE_API_BASE_URL` to your backend URL (default: `http://localhost:3001`)

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Project Structure

```
├── App.tsx                 # Main app with routing and state
├── components/
│   ├── Layout.tsx          # Sidebar navigation with PM/Dev toggle
│   ├── ResultsTable.tsx    # Test results table with PM/Dev views
│   ├── PMViews.tsx         # PM-friendly visual components
│   └── ui.tsx              # Shared UI components
├── views/
│   ├── Overview.tsx        # Dashboard overview
│   ├── StructureLLM.tsx    # Structure LLM results
│   ├── DiscountLLM.tsx     # Discount LLM results
│   ├── RulesLLM.tsx        # Rules LLM results
│   ├── Assembly.tsx        # Assembled output viewer
│   ├── TestResults.tsx     # Combined test results
│   └── Playground.tsx      # Live pipeline testing
├── services/
│   ├── dataService.ts      # Dashboard data fetching
│   └── pipelineApi.ts      # Pipeline API client
└── types.ts                # TypeScript interfaces
```

## API Integration

The dashboard fetches data from the backend API:

- `GET /api/internalUtility/bundleSetupLlmPipeline/dashboard` - All dashboard data
- `POST /api/internalUtility/bundleSetupLlmPipeline/pipeline/run` - Run pipeline (Playground)

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts (charts)
- Lucide React (icons)
