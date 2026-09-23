---
sessionId: session-260923-205627-1377
---

# Requirements

# Requirements

## Overview & Goals
The goal of this task is to extend Rancagé Studio with a local‑first AI assistant that:
- Generates native Excel‑style formulas from natural language prompts.
- Provides a dual‑export capability that creates both an `.xlsx` workbook and a standalone `dashboard.html` file for offline sharing (e.g., via WhatsApp).

## Scope
### In Scope
- AI‑driven formula conversion that outputs valid Excel formulas (`XLOOKUP`, `SUMIFS`, etc.) and inserts them into the grid.
- Dual export of the dashboard: generate an `.xlsx` file preserving formulas and conditional formatting, and generate a single‑file `dashboard.html` that contains all visualizations and can be opened offline.
- Integration with the existing BYOK manager to allow users to configure local or cloud LLMs.

### Out of Scope (v1)
- Real‑time multi‑user collaboration.
- Cloud‑hosted database or multi‑tenant backend.
- Full‑featured BI suite beyond the listed widgets.

## User Stories
- **Financial Analyst**: "I want to type ‘calculate total sales by region’ and have the app insert a ready‑to‑use `SUMIFS` formula into my spreadsheet, so I can instantly see the result and share the workbook."
- **Freelance Consultant**: "I need to export a dashboard as a single HTML file that I can send to a client; the client should be able to open it offline and interact with filters."
- **Privacy Officer**: "I want the AI to run locally, using my own LLM endpoint, ensuring that sensitive payroll data never leaves my computer."

## Functional Requirements
- **FR‑1**: Users can select a local LLM provider (Ollama, LM Studio, OpenAI, etc.) via the BYOK manager.
- **FR‑2**: The AI copilot converts a natural‑language prompt into an Excel formula and inserts it into the active cell.
- **FR‑3**: The generated formula must be validated against the Excel formula grammar before insertion.
- **FR‑4**: Exporting produces an `.xlsx` file that retains formulas, data types, and conditional formatting.
- **FR‑5**: Exporting also produces a `dashboard.html` file that is fully self‑contained and can be opened without internet access.

## Non‑Functional Requirements
- **NFR‑1**: All AI processing occurs locally; no data is transmitted to external services unless the user explicitly configures an external provider.
- **NFR‑2**: Export files must open within 2 seconds for datasets up to 50 k rows.
- **NFR‑3**: The solution must be type‑safe (TypeScript `strict` mode) and maintain 100 % code coverage on new logic.


# Technical Design

# Technical Design

## Current Implementation
The Rancagé Studio codebase is a Next.js 15 application using React 19, Tailwind CSS, and DuckDB‑Wasm for in‑browser data processing. Core components include:
- `SpreadsheetGrid.tsx` – renders the Excel‑style grid, handles cell selection, and formula entry.
- `AiPanel.tsx` – UI for configuring AI providers and sending prompts to a local or external LLM.
- `DashboardCanvas.tsx` and associated widget files (`ChartWidget.tsx`, `KPICard.tsx`, `Slicers.tsx`) – implement the drag‑and‑drop canvas, ECharts visualizations, and global slicers.
- Export logic in `exportUtils.ts` (to be created) will eventually generate `.xlsx` using `exceljs` and HTML dashboards.

## Key Decisions
1. **Local‑First Architecture** – All AI inference runs in the browser against a user‑provided endpoint; no server‑side state is stored.
2. **Dual Export Model** – Generating both `.xlsx` (via `exceljs`) and a self‑contained `dashboard.html` satisfies the sharing requirement while preserving offline capability.
3. **Component Isolation** – UI logic is separated: grid handling lives in `SpreadsheetGrid`, dashboard rendering in `DashboardCanvas`, and AI interaction in `AiPanel`.

## Proposed Changes
- **AI Formula Generation**: Extend `AiPanel.tsx` to send prompts to the configured LLM, parse the response into a validated Excel formula, and programmatically insert that formula into the active cell of `SpreadsheetGrid`.
- **Dual Export Logic**: Add utilities in `exportUtils.ts` to create an `.xlsx` workbook preserving formulas and a `dashboard.html` file that bundles ECharts assets. Hook these utilities into `DashboardCanvas` to expose export buttons.
- **Validation & Testing**: Add unit tests for formula parsing and export output, and integrate end‑to‑end tests for the sharing workflow.

## File Structure
- `src/components/AiPanel.tsx` – add AI prompt handling and formula insertion logic.
- `src/components/DashboardCanvas.tsx` – add export UI and call export utilities.
- `src/lib/exportUtils.ts` – new file containing `.xlsx` generation (using `exceljs`) and HTML dashboard bundling.
- `src/app/studio/page.tsx` – may need minor adjustments to wire export actions.

## Architecture Diagram
The diagram below shows the data flow from user prompt to dual export:
```mermaid
graph LR
    A[User Prompt] --> B[AiPanel: LLM Call]
    B --> C[Formula Generation]
    C --> D[SpreadsheetGrid: Insert Formula]
    D --> E[Export Utilities]
    E --> F[.xlsx File]
    E --> G[dashboard.html File]
    F --> H[Share via WhatsApp]
    G --> H
```

## Risks
- **Formula Validation Failure** – Incorrectly parsed formulas could break the spreadsheet; mitigated by strict regex validation and fallback to manual edit.
- **Export Bundle Size** – Large dashboards may produce sizable HTML files; mitigated by tree‑shaking ECharts modules and limiting embedded data to 5 MB.
- **Local LLM Compatibility** – Not all local models format responses identically; mitigated by provider‑specific prompt templates and response parsing guards.


# Testing

# Testing

## Validation Approach
- Unit tests for formula parsing and validation logic.
- Integration tests for export utilities to verify `.xlsx` and `dashboard.html` outputs.
- End‑to‑end tests for the WhatsApp sharing workflow.

## Key Scenarios
- Generate a formula from a natural‑language prompt and confirm it appears correctly in the grid.
- Export a workbook and open it in Excel to verify formulas and conditional formatting persist.
- Export a dashboard to HTML and open it offline to ensure all visualizations and slicers function.

## Edge Cases
- Formula parsing errors or ambiguous prompts.
- Large datasets causing export bundles to exceed size limits.
- Incompatible response formats from different local LLMs.

## Test Changes
- Add `__tests__/AiPanel.test.tsx` and `__tests__/exportUtils.test.ts`.
- Update CI pipeline to run new test suites.
- Add manual verification steps in the UI for export success feedback.


# Delivery Steps

###   Step 1: Implement AI Formula Generation
Implement AI-driven formula generation in `AiPanel.tsx`.
- Add prompt state handling using StateFlow.
- Use BYOK manager to call LLM.
- Parse response into Excel formula.
- Insert formula into grid selection.
- Validate formula syntax.
- Update unit tests for formula parsing.

###   Step 2: Add Dual Export Logic
Add dual export functionality to generate .xlsx and HTML dashboard.
- Create export utilities using `exceljs` and bundler for ECharts.
- Implement file download handlers in `DashboardCanvas.tsx`.
- Add UI buttons for export.
- Ensure offline HTML includes embedded assets.
- Test export output integrity.

###   Step 3: Integrate Export UI and Validate
Connect export actions to UI and perform validation.
- Wire export buttons to respective handlers.
- Provide user feedback on success/failure.
- Run end‑to‑end tests for WhatsApp sharing scenario.
- Fix any UI/UX issues.
- Update documentation.