# eBBot LLM Testing Dashboard

A React dashboard for visualizing and analyzing test results from eBBot's LLM pipeline.

**Path:** `/Users/rafathunnisa/Documents/work/zura-apps/ebbot-llm-testing-dashboard`

## Project Overview

This dashboard monitors the performance of three specialized LLMs used in eBBot:

- **Structure LLM** - Classifies input type and determines output structure
- **Discount LLM** - Extracts and validates discount/pricing information
- **Rules LLM** - Applies business rules and conditions

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling (using `clsx` and `tailwind-merge`)
- **Recharts** for data visualization
- **Lucide React** for icons

## Project Structure

```
├── App.tsx              # Main app component with routing/tabs
├── index.tsx            # Entry point
├── types.ts             # TypeScript types and interfaces
├── components/
│   ├── Layout.tsx       # Main layout with navigation
│   ├── ResultsTable.tsx # Reusable results table
│   └── ui.tsx           # Shared UI components
├── views/
│   ├── Overview.tsx     # Dashboard overview with metrics
│   ├── StructureLLM.tsx # Structure LLM results view
│   ├── DiscountLLM.tsx  # Discount LLM results view
│   ├── RulesLLM.tsx     # Rules LLM results view
│   └── TestResults.tsx  # Combined test results view
└── services/
    ├── dataService.ts   # Data fetching and transformation
    └── mockData.ts      # Mock test data
```

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Key Types

- `LLMType`: `'structure' | 'discount' | 'rules'`
- `Category`: Test case categories (TIERED_DISCOUNT, FIXED_BUNDLE_PRICE, etc.)
- `Style`: Input styles (TERSE, CONVERSATIONAL, TECHNICAL_DETAILED, etc.)
- `TestCase`: Individual test case with input and expected outputs
- `TestResult`: Result of running a test case against an LLM
- `Metrics`: Aggregated test metrics and pass rates

## Environment

Requires `GEMINI_API_KEY` in `.env.local` for API access.

## Conventions

- Components use functional React with hooks
- State management via React useState/useEffect
- Dark mode support via `isDark` state and Tailwind's `dark:` classes
- Use `cn()` helper from `ui.tsx` for conditional class merging
