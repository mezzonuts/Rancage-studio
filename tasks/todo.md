# Task Tracker: Rancagé Studio

> Source: `tasks/plan.md` — 30 tasks across 7 phases
> Update this file as you complete tasks. Check off `[x]` when done.

---

## Phase 1: Foundation — DuckDB Engine & Project Setup
- [x] **Task 1**: Initialize Next.js project (TS strict, Tailwind, ESLint, Prettier, Vitest, Playwright)
- [x] **Task 2**: DuckDB-Wasm module — init, CSV/Parquet extensions, query executor
- [x] **Task 3**: Data ingestion pipeline — file upload, schema inference, table registration
- [x] **Task 4**: Sampling utility — 5-10 rows + column schema for AI context

**Checkpoint: Foundation**
- [x] Build succeeds
- [x] Unit tests pass (DuckDB init, schema inference, sampling)
- [ ] Manual: 50K-row CSV, `SELECT COUNT(*)` < 100ms

---

## Phase 2: BYOK Manager & AI Adapter
- [x] **Task 5**: BYOK Manager UI — provider selector, config form, localStorage persistence
- [x] **Task 6**: Test Connection — `/models` ping, status indicator, Ollama model auto-detect
- [x] **Task 7**: Universal AI Adapter — OpenAI-compatible client, normalization, streaming
- [x] **Task 8**: Schema Extractor — DuckDB schema + samples → compact AI prompt context
- [x] **Task 9**: Prompt Guardrails — system prompt, few-shot examples, AST/regex validator

**Checkpoint: BYOK & AI Adapter**
- [ ] Unit tests pass (config, connection, adapter, schema, validator)
- [ ] Manual: Connect Ollama (model list), OpenAI (key works)

---

## Phase 3: Spreadsheet Engine (Grid + Formulas + AI Function)
- [x] **Task 10**: Spreadsheet Grid — cell edit, drag-fill, range select, add/remove rows/cols, virtualized 50K+
- [x] **Task 11**: Formula Engine — parser/evaluator (XLOOKUP, SUMIFS, LET, PIVOTBY, UNIQUE, FILTER), dep graph
- [x] **Task 12**: `=AI()` Custom Function — memoization cache, async queue, result injection
- [x] **Task 13**: AI Formula Generation — NL → formula via Adapter, validator (T9) before insert, undo/redo

**Checkpoint: Spreadsheet Engine**
- [ ] Unit tests pass (grid, formula eval, AI cache, formula gen)
- [ ] Manual: `=AI("sum B where A>100", A1:B10)` → valid `=SUMIFS(...)`

---

## Phase 4: Dashboard Builder (Canvas + Widgets + Slicers)
- [x] **Task 14**: Dashboard Canvas — CSS Grid, drag-resize-position (react-grid-layout), localStorage persist
- [x] **Task 15**: ECharts Widget Library — Bar, Line, Area, Pie/Donut, Scatter, Radar (React + JSON config)
- [x] **Task 16**: KPI Metric Card — primary value, growth %, trend sparkline, conditional color
- [x] **Task 17**: Global Slicers — Date Range Picker, Multi-select Dropdown, cross-filtering via DuckDB
- [x] **Task 18**: Dashboard ↔ DuckDB — slicer → param SQL → widget refresh < 150ms (50K rows)

**Checkpoint: Dashboard Builder**
- [x] Unit tests pass (canvas, widgets, slicer filtering)
- [ ] Manual: 2 charts + 1 KPI + date slicer → instant filter

---

## Phase 5: Excel Exporter (`.xlsx`)
- [x] **Task 19**: Excel Exporter core — `exceljs` workbook, formula writing, data types
- [x] **Task 20**: Conditional Formatting Export — grid CF → `exceljs` CF rules (MS Excel compatible)
- [x] **Task 21**: Pivot Table Export — DuckDB PIVOTBY → Excel PivotTable
- [x] **Task 22**: Export UX — progress, download, filename, error handling

**Checkpoint: Excel Exporter**
- [x] Unit tests pass (formulas, CF, pivot)
- [ ] Manual: Export → open in MS Excel → formulas live, CF in Rules Manager

---

## Phase 6: HTML Exporter (Standalone `.html`)
- [x] **Task 23**: HTML Bundler — single-file template, inlined CSS/JS, tree-shaken ECharts, embedded JSON
- [x] **Task 24**: Offline Interactivity — slicer filter via embedded DuckDB-Wasm or pre-computed indices, ECharts re-render
- [x] **Task 25**: Bundle Optimization — compress JSON, 5MB cap, lazy-load charts, CSP-compatible
- [x] **Task 26**: Export UX — progress, download, offline test, size warning

**Checkpoint: HTML Exporter**
- [x] Unit tests pass (bundling, offline filter, size limits)
- [ ] Manual: Export → Wi-Fi off → open `.html` → charts render, slicers filter

---

## Phase 7: Integration, Polish & Acceptance Tests
- [x] **Task 27**: E2E Integration — Upload → Grid → AI Formula → Dashboard → Dual Export
- [x] **Task 28**: Acceptance Test Suite — Playwright E2E for AC-01 through AC-05
- [x] **Task 29**: Performance Optimization — 50K rows, <1.5s init, <150ms filter, <5MB HTML
- [x] **Task 30**: Accessibility & Polish — ARIA, keyboard nav, error boundaries, loading, responsive

**Checkpoint: Complete**
- [x] All 5 AC tests pass (Playwright)
- [x] Build succeeds, bundle size reasonable
- [ ] Ready for `/review`

---

## Phase 8: Frontend Redesign — Rows AI Spreadsheet Layout (2026-09-23)

> Redesign tata letak studio frontend: 3-panel CSS Grid (sidebar 260px | spreadsheet center | AI panel 380px) + Excel-style ribbon toolbar + formula bar + AI chat panel. Design spec: `design_frontend/DESIGN_SPEC.md` + mockup `rows-ai-spreadsheet.html`.

- [x] **Task 31**: `globals.css` — Design system tokens (violet accent #6c5ce7, Inter/JetBrains Mono, spacing scale, radii, shadows, CSS vars)
- [x] **Task 32**: `Sidebar.tsx` — Dark sidebar (#1a1b26), nav sections (Workspace/Automate/Analyze), badge pills, user info footer
- [x] **Task 33**: `Ribbon.tsx` — Excel-style tab bar (File/Home/Insert/Draw/Page Layout/Formulas/Data/Review/View/Dashboard) + toolbar groups (Clipboard/Font/Alignment/Number/Styles/Cells/Editing/AI/Export)
- [x] **Task 34**: `FormulaBar.tsx` — Cell reference (monospace, bordered) + fx label + formula input
- [x] **Task 35**: `SpreadsheetGrid.tsx` — Enhanced: AI-generated column styling (violet left border), zebra striping, selected cell accent outline, numeric alignment, positive/negative colors
- [x] **Task 36**: `AiPanel.tsx` — Right panel 380px: Chat/Replays/Sources tabs, chat messages (user right-aligned / AI violet gradient avatar), action cards, code blocks with syntax highlighting, quick action chips, auto-resize textarea, send button
- [x] **Task 37**: `UploadModal.tsx` — Backdrop blur overlay, dropzone with drag/hover state, format badges (PDF/PNG/JPG/CSV/XLSX), click-outside-to-close
- [x] **Task 38**: `studio/page.tsx` — Rewritten: CSS Grid 3-panel layout, integrates Sidebar + Ribbon + FormulaBar + SpreadsheetGrid + AiPanel + UploadModal, BYOK settings as modal overlay
- [x] **Task 39**: Verify build (`next build`) + TypeScript (`tsc --noEmit`) + unit tests (`vitest run` 140 pass)

**Checkpoint: UI Redesign**
- [x] `tsc --noEmit` → 0 errors
- [x] `vitest run` → 140 tests pass, 14 files
- [x] `next build` → success, static generation OK
- [ ] Manual QA: Verify 3-panel layout renders, sidebar navigation, ribbon tabs switch, AI panel chat send, upload modal open/close

---

## Phase 9: Excel-Like Ribbon UI Overhaul (2026-09-23)

> Remove sidebar, restructure into Excel-like top ribbon + collapsible AI chat. 10 functional ribbon tabs, print support, all buttons wired.

### 9A: Layout Restructure
- [x] **Task 40**: Remove `Sidebar.tsx` import + render from `studio/page.tsx`
- [x] **Task 41**: New state: `chatOpen`, `aiProcessing`, `viewMode`, `aiPanelTab`
- [x] **Task 42**: CSS grid restructure: `grid-template-columns: 1fr auto` — content fills width, AI panel slides from right
- [x] **Task 43**: AI panel wrapper: `width: 380px → 0` CSS transition on toggle
- [x] **Task 44**: Move logo to ribbon `logo-tab` (already existed)

### 9B: Ribbon Tabs — Excel-Like
- [x] **Task 45**: Tab order: `File | Home | Insert | Draw | Page Layout | Formulas | Data | Review | View | AI Analyst`
- [x] **Task 46**: File ribbon: New, Open (Import CSV/XLSX/Parquet), Save & Export (Excel/HTML), Print, Close
- [x] **Task 47**: Home ribbon: Clipboard, Font (family/size/bold/italic/underline/strike), Alignment (left/center/right + merge/wrap), Number (format + decimal), Styles, Cells, Editing (sort/filter/find)
- [x] **Task 48**: Insert ribbon: Tables, Charts (Bar/Line/Pie/Scatter/Radar), Illustrations, Links, Text, Symbols
- [x] **Task 49**: Draw ribbon: Pens, Highlighter, Eraser, Ink to Shape, Undo/Redo
- [x] **Task 50**: Page Layout ribbon: Themes, Page Setup (Margins/Orientation/Size/Background), Scale to Fit, Sheet Options (Gridlines/Headings checkboxes)
- [x] **Task 51**: Formulas ribbon: Function Library (Insert/AutoSum/Financial/Logical/Text/Date/Lookup), Defined Names, Formula Auditing (Trace/Show Formulas/Error Check), Calculation
- [x] **Task 52**: Data ribbon: Get & Transform (From CSV/Web), Sort & Filter (A→Z/Z→A/Custom/Filter/Clear), Data Tools (Remove Dups/Validation/What-If), Forecast, Outline (Group/Ungroup/Subtotal)
- [x] **Task 53**: Review ribbon: Proofing (Spelling/Thesaurus), Comments (New/Delete/Navigate), Protect (Sheet/Workbook), Changes (Merge/Track)
- [x] **Task 54**: View ribbon: Workbook Views, Show (Gridlines/FormulaBar/Headings toggles), Zoom (+/−/%), Window (Freeze/Split), Open Dashboard
- [x] **Task 55**: AI Analyst ribbon: Chat toggle (animated), Automate (Replays/Templates), Scripts (Python), AI Generate (Column/Forecast), Settings (BYOK)

### 9C: AI Chat Panel — Collapsible + Animation
- [x] **Task 56**: Close button (X) in AiPanel header
- [x] **Task 57**: Collapsible wrapper: `width transition 0.3s`, `pointer-events: none` when closed
- [x] **Task 58**: Processing animation: `@keyframes spin` on chat icon in ribbon, `@keyframes pulse` on ai-dot in panel
- [x] **Task 59**: Replays + Templates + Scripts sub-views in AiPanel

### 9D: Functional Wiring
- [x] **Task 60**: File > Import → opens UploadModal
- [x] **Task 61**: File > Export Excel/HTML → triggers handlers
- [x] **Task 62**: File > Print → `window.print()`
- [x] **Task 63**: View > Open Dashboard → switches viewMode
- [x] **Task 64**: Data > Sort A→Z / Z→A → sorts selected column
- [x] **Task 65**: Data > Filter → toggleFilterMode
- [x] **Task 66**: Data > Remove Duplicates → dedup rows
- [x] **Task 67**: Home > Bold/Italic/Underline/Strike → toggles cell formatting
- [x] **Task 68**: Home > Font family/size → applies to SpreadsheetGrid
- [x] **Task 69**: Home > Alignment → textAlign state
- [x] **Task 70**: View > Zoom In/Out → zoom state (25%–200%)
- [x] **Task 71**: View > Gridlines/FormulaBar/Headings toggles → hide/show
- [x] **Task 72**: AI Analyst > Chat/Replays/Templates/Scripts → sets panel tab + opens panel

### 9E: SpreadsheetGrid Enhancements
- [x] **Task 73**: New props: showGridlines, showHeadings, bold, italic, underline, strikethrough, textAlign, fontFamily, fontSize
- [x] **Task 74**: CSS class `.no-gridlines` hides cell borders
- [x] **Task 75**: CSS class `.no-headings` hides col/row headers
- [x] **Task 76**: Inline style application for font formatting

### 9F: Print Support
- [x] **Task 77**: `@media print` CSS: hides ribbon, formula bar, AI panel, status bar — shows only grid

### 9G: Verify
- [x] **Task 78**: `next build` → success
- [x] **Task 79**: `vitest run` → 140/140 pass
- [x] **Task 80**: `eslint` on changed files → 0 errors, 0 warnings

**Checkpoint: UI Overhaul**
- [x] Build clean, all 140 tests pass, lint 0 errors
- [ ] Manual QA: All 10 ribbon tabs functional, AI chat toggle with animation, print works

---

## Phase 10: Ribbon Integration (2026-09-23)

All ribbon buttons wired to actual spreadsheet operations.

### 10A: Per-Cell Formatting
- [x] **Task 81**: `CellFormat` type added to `types.ts`
- [x] **Task 82**: `SpreadsheetGrid` accepts `cellFormats` map + `onFormatChange` + `onSelectionFormat` callbacks
- [x] **Task 83**: `page.tsx` stores per-cell format state, applies to selected range

### 10B: Clipboard
- [x] **Task 84**: Copy — system clipboard (TSV) + internal clipboard fallback
- [x] **Task 85**: Cut — copy then clear source cells
- [x] **Task 86**: Paste — system clipboard first, then internal fallback

### 10C: Insert/Delete
- [x] **Task 87**: Insert Row Above/Below via `gridAddRow`
- [x] **Task 88**: Insert Column Left/Right via `gridAddCol`
- [x] **Task 89**: Delete Row/Column via `gridRemoveRow`/`gridRemoveCol`

### 10D: Data Operations
- [x] **Task 90**: Sort Asc/Desc by selected column
- [x] **Task 91**: Remove Duplicates by full row hash
- [x] **Task 92**: Filter toggle

### 10E: Find
- [x] **Task 93**: Find dialog with next/prev navigation
- [x] **Task 94**: Results highlighting via `setSelectedCell`

### 10F: Ribbon Button Wiring
- [x] **Task 95**: Home > Clipboard (Copy/Cut/Paste) → wired
- [x] **Task 96**: Home > Font (B/I/U/S/Family/Size) → wired via `handleFormatChange`
- [x] **Task 97**: Home > Alignment (Left/Center/Right) → wired
- [x] **Task 98**: Home > Cells (Insert/Delete Row/Col) → wired
- [x] **Task 99**: Home > Editing (Sort/Filter/Find) → wired
- [x] **Task 100**: Data > Sort & Filter → wired
- [x] **Task 101**: Data > Remove Dups → wired
- [x] **Task 102**: Review > Find & Replace → wired
- [x] **Task 103**: AI Analyst > Chat/Replays/Templates/Scripts → wired

### 10G: Verify
- [x] **Task 104**: `next build` → success
- [x] **Task 105**: `vitest run` → 140/140 pass

**Checkpoint: Ribbon Integration**
- [x] Build clean, all 140 tests pass
- [ ] Manual QA: All formatting, clipboard, insert/delete, find operations functional

---

## Notes
- Update this file after each task completion
- Run `npm run test` at each checkpoint
- Don't overwrite this file if tasks are in progress in another session