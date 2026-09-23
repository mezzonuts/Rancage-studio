# Implementation Plan: AI Formula Generation + Dual Export

## Goal
Extend Rancagé Studio with: (1) AI-driven formula generation that inserts validated Excel formulas into the grid from natural-language prompts, and (2) dual export producing an `.xlsx` workbook and a self-contained `dashboard.html` for offline sharing.

## Current State

### What Exists
| Component | Status | Details |
|-----------|--------|---------|
| `FormulaGenerator` (`src/lib/ai/generation.ts`) | ✅ Complete | Sends prompts to LLM via `AIClient`, validates formula, retries on failure |
| `validateFormula` (`src/lib/ai/validator.ts`) | ✅ Complete | Regex-based Excel formula validation (parentheses, known functions, chars) |
| `buildFormulaPrompt` (`src/lib/ai/prompts.ts`) | ✅ Complete | System prompt with angle-bracket column reference convention: `<ColumnName>` |
| `AIClient` (`src/lib/ai/adapter.ts`) | ✅ Complete | OpenAI-compatible client; works with Ollama, LM Studio, OpenAI, etc. |
| `BYOKProvider` (`src/lib/byok/`) | ✅ Complete | Provider config, localStorage persistence, model auto-detection |
| `exportToExcel` (`src/lib/export/excel.ts`) | ✅ Complete | ExcelJS-based export; supports formulas, conditional formatting |
| `buildStandaloneHTML` (`src/lib/export/html.ts`) | ⚠️ Partial | Generates HTML but loads ECharts from CDN (not offline-capable) |
| `DashboardCanvas.tsx` | ✅ Partial | Dashboard widgets/slicers but **no export buttons** |
| `SpreadsheetGrid.tsx` | ✅ Complete | Full grid with selection, editing, formatting |
| Studio page (`src/app/studio/page.tsx`) | ⚠️ Partial | Has `handleExcelExport`/`handleHTMLExport` but **AI handler is a mock**; no formula insertion |

### What's Missing
1. **AI Panel → Formula Generator wiring**: `AiPanel.onSend` is a mock (`setTimeout` + fake message). Needs to call `FormulaGenerator` with BYOK config.
2. **Formula insertion into grid**: No function exists to insert a formula string at the selected cell position.
3. **Dashboard export UI**: `DashboardCanvas` has no export buttons.
4. **Offline HTML**: `buildStandaloneHTML` loads ECharts from `cdn.jsdelivr.net` — fails offline.
5. **Formula-to-Excel bridge**: `gridToExcelExport()` in `integration.ts` copies raw values but doesn't detect formula cells (cells starting with `=`).

## Design Decisions

### Decision 1: Formula Format in Grid
**Chosen**: Store formulas as strings starting with `=` in grid cells (e.g., `"=SUMIFS(<Revenue>,<Category>,\"Food")"`).
- Rationale: Matches Excel convention; `SpreadsheetGrid` already supports string cells.
- The `<ColumnName>` angle-bracket convention from LLM prompts will be kept in formulas. These won't evaluate in-browser but will be valid formula strings visible to users.

### Decision 2: AI Context Building
**Chosen**: Convert first row (headers) + first 5 data rows into `TableContext`, then call `FormulaGenerator.generateWithValidation()`.
- Rationale: `TableContext` already exists with schema + sample rows. `FormulaGenerator` already handles prompt building and validation.

### Decision 3: Offline HTML Export
**Chosen**: Copy `echarts.min.js` to `public/` directory; `buildStandaloneHTML` reads it via `fetch` and inlines as `<script>`.
- Rationale: ECharts v6 minified is ~850KB — well under 5MB HTML limit. Users must open dashboards offline.
- Alternative considered: `import.meta.glob` to read at build time — but the export utility runs client-side and needs runtime inlining.

### Decision 4: Grid-to-Excel Formula Extraction
**Chosen**: Scan `gridData` for cells starting with `=`, extract position + formula, pass to `ExcelExportData.formulas[]`.
- Rationale: `excel.ts` already supports a `formulas` array. `handleExcelExport` in studio page needs to populate it.

### Decision 5: Error Handling & UX
**Chosen**: Show AI responses in chat panel (formulas in code blocks). Add inline toast notifications for formula inserted, export completed, errors.
- Formula validation errors shown in chat with option to retry.

## File Changes

### New Files
| File | Purpose |
|------|---------|
| `src/lib/ai/useFormulaGenerator.ts` | React hook: builds `TableContext` from grid data, calls `FormulaGenerator`, returns formula result |
| `tests/e2e/ai-formula-export.spec.ts` | E2E: generate formula → insert in grid → export XLSX/HTML |
| `public/echarts.min.js` | ECharts bundle for offline HTML (copied from node_modules) |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/AiPanel.tsx` | Replace mock `onSend` with `FormulaGenerator` call; add `onFormulaGenerated` callback; display formula in chat; show validation errors |
| `src/app/studio/page.tsx` | `handleAiSend` uses hook; `handleFormulaGenerated` inserts formula via `setCell`; pass export callbacks to `DashboardCanvas` |
| `src/components/dashboard/DashboardCanvas.tsx` | Add "Export XLSX" and "Export HTML" buttons; accept `onExportExcel`/`onExportHTML` props |
| `src/lib/export/html.ts` | Inline ECharts JS (load from `public/echarts.min.js`) instead of CDN script tag |
| `src/lib/integration.ts` | Enhance `gridToExcelExport` to scan for formula cells and populate `formulas` array |
| `src/lib/ai/generation.test.ts` | Add tests for `FormulaGenerator` with mock `AIClient` |
| `src/lib/export/excel.test.ts` | Add test for formula preservation |
| `src/lib/export/html.test.ts` | Add test for offline (no CDN) HTML |

## Implementation Order

1. **Step 1**: Create `useFormulaGenerator` hook + enhance `gridToExcelExport` for formulas
2. **Step 2**: Wire AiPanel to real formula generation + formula insertion in grid
3. **Step 3**: Add export buttons to DashboardCanvas
4. **Step 4**: Fix HTML export for offline (inline ECharts)
5. **Step 5**: Add tests (unit + E2E)
6. **Step 6**: Run typecheck, lint, all tests

## Validation Plan

| Check | Method |
|-------|--------|
| Formula generation works | Manual: type prompt → see formula in chat → see it in grid |
| Formula validation | Unit test: invalid formulas rejected |
| Formula insertion | Manual: select cell, generate, verify cell shows `=` formula |
| XLSX export preserves formulas | Unit test: `exportToExcel` with formulas → verify blob |
| HTML export is offline | Unit test: no `cdn.jsdelivr.net` reference; manual browser disconnect test |
| Dashboard export buttons | Manual: click → file downloads |
| E2E flow | Playwright: launch studio → generate formula → export |
| TypeScript strict | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| E2E tests | `npm run test:e2e` |

## Out of Scope (v1)
- Real-time multi-user collaboration
- Cloud-hosted database
- Full BI suite beyond existing widgets
- Streaming LLM responses (non-streaming only)
- Browser-side formula evaluation (formulas are display-only in grid)