# SPEC: Rancagé Studio — Local-First AI Spreadsheet & Dashboard Engine

> **Generated from PRD.md using spec-driven-development workflow**
> **Status:** DRAFT — Pending human review and approval

---

## 1. PROBLEM STATEMENT

### 1.1 Core Problems
1. **Analysis Tool Dilemma**: Users are trapped between rigid traditional spreadsheets (Excel/Google Sheets) and expensive, steep-learning-curve BI platforms (Tableau/Power BI).
2. **Cloud Dependency & Privacy Risk**: Modern AI analytics tools (Rows.com, Julius AI) require uploading sensitive data to third-party clouds, creating compliance risks and recurring costs.
3. **Vendor Lock-in / "Dead Values"**: AI tools return static hardcoded values, losing Excel formulas, relational logic, and conditional formatting on export.
4. **Complex Dashboard Distribution**: Sharing interactive dashboards requires servers, paid accounts, or large files that recipients struggle to open.

### 1.2 Solution Vision
A **local-first, client-side** spreadsheet + dashboard engine that:
- Runs entirely in the browser (zero server dependency)
- Supports BYOK (Bring Your Own Key) for local LLMs (Ollama/LM Studio) or cloud providers
- Preserves Excel formulas, conditional formatting, and DAX expressions on export
- Produces dual standalone exports: live `.xlsx` + offline `dashboard.html`

---

## 2. GOALS & NON-GOALS

### 2.1 Goals (In Scope for v1)
| Goal | Description |
|------|-------------|
| **G1: Local-First & BYOK** | Full client-side execution; users configure their own LLM endpoints (Ollama, LM Studio, OpenAI, Anthropic, OpenRouter); zero data leaves user's machine unless they choose cloud provider |
| **G2: Excel-Native Preservation** | All AI-generated calculations convert to native Excel formulas (`XLOOKUP`, `SUMIFS`, `LET`, `PIVOTBY`) or Power DAX; conditional formatting preserved |
| **G3: Dual Standalone Export** | Export 1: `.xlsx` with live formulas/formatting; Export 2: `dashboard.html` — fully interactive, offline-capable, no server needed |
| **G4: Modular Dashboard Studio** | Drag-and-drop canvas with Global Slicers, KPI Metric Cards, Apache ECharts (cross-filtering support) |

### 2.2 Non-Goals (Out of Scope for v1)
| Non-Goal | Reason |
|----------|--------|
| Multi-tenant cloud system | No auth, no central DB, no billing |
| Real-time multi-user collaboration | No concurrent editing/cursors |
| Big Data Warehouse replacement | Browser limit: ~100K–500K rows via DuckDB-Wasm |

---

## 3. USER STORIES

| ID | Persona | Action | Benefit | Acceptance Link |
|----|---------|--------|---------|-----------------|
| **US-1** | Financial/Business Analyst | Generate revenue projections via natural language | AI inserts native Excel formulas (`=SUMIFS(...)`) + color scales; formulas stay live/auditable in `.xlsx` | AC-02, AC-03 |
| **US-2** | Freelance Data Consultant | Deliver interactive dashboard to client without software licenses | Single `dashboard.html` works offline in any browser | AC-04 |
| **US-3** | Data Privacy Officer / Corporate | Analyze payroll/profit data with AI via local LLM | 100% local processing via Ollama (`localhost:11434`); no internet traffic | AC-01, AC-05 |
---

## 4. FUNCTIONAL REQUIREMENTS

### FR-1: AI & BYOK Manager
| ID | Requirement | Detail |
|----|-------------|--------|
| **FR-1.1** | Provider Switching | Toggle between: Local LLM (Ollama, LM Studio), OpenAI, Anthropic, OpenRouter |
| **FR-1.2** | Config Fields | `Base URL`, `API Key`, `Model Name`, `Max Tokens` per provider |
| **FR-1.3** | Connection Test | "Test Connection" button sends lightweight ping to verify endpoint readiness |
| **FR-1.4** | Secure Storage | All sensitive config stored exclusively in browser `localStorage` |

### FR-2: Spreadsheet Engine & AI Formula Converter
| ID | Requirement | Detail |
|----|-------------|--------|
| **FR-2.1** | Grid Operations | Cell editing, drag-to-fill, range selection, add/remove rows/columns |
| **FR-2.2** | AI → Formula Translation | Natural language → single Excel formula, dynamic array formulas (`XLOOKUP`, `UNIQUE`, `FILTER`, `PIVOTBY`), Power DAX expressions |
| **FR-2.3** | `=AI()` Custom Function | `=AI("prompt", cell_ref)` with local memoization/caching to prevent redundant calls |

### FR-3: Visual Dashboard Builder (Tableau-Lite)
| ID | Requirement | Detail |
|----|-------------|--------|
| **FR-3.1** | Responsive Grid Canvas | Modular grid layout; drag-resize-position widgets |
| **FR-3.2** | ECharts Widgets | Bar (Stacked/Grouped), Line, Area, Pie/Donut, Scatter, Radar |
| **FR-3.3** | KPI Metric Cards | Primary value, growth %, trend indicator |
| **FR-3.4** | Global Slicers / Cross-Filtering | Date Range Picker + Multi-select Category Dropdown; instant filter across all widgets |

### FR-4: Dual Exporter
| ID | Requirement | Detail |
|----|-------------|--------|
| **FR-4.1** | Excel Export (`.xlsx`) | Via `exceljs`: preserves formulas, Pivot definitions, data types, Conditional Formatting (heatmaps, color scales) |
| **FR-4.2** | HTML Export (`.html`) | Single-file bundle: ECharts minified + dataset + interactivity; runs offline via `file:///` protocol |

---

## 5. NON-FUNCTIONAL REQUIREMENTS

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| **NFR-1** | Performance | Initial workspace render | < 1.5s |
| **NFR-1** | Performance | Filter/slicer latency (50K rows) | < 150ms (via DuckDB-Wasm) |
| **NFR-2** | Privacy | Zero external telemetry | No GA, Mixpanel, etc. tracking data content |
| **NFR-2** | Privacy | CSP in Local LLM mode | Block all egress except `http://localhost:*` / `http://127.0.0.1:*` |
| **NFR-3** | Code Quality | TypeScript strict mode | 100% TS, `strict: true`, no `any` |
| **NFR-3** | Code Quality | Separation of concerns | Presentation logic ≠ Business calculation |
| **NFR-4** | Portability | Offline HTML | All critical assets inlined/data-URI; no CDN deps |

---

## 6. ACCEPTANCE CRITERIA

| ID | Feature | Test Scenario | Expected PASS Result |
|----|---------|---------------|----------------------|
| **AC-01** | Local LLM Connection | Enter Ollama endpoint `http://localhost:11434/v1`, click "Test Connection" | Status → green (Connected); local models auto-detected (e.g., `llama3.2`) |
| **AC-02** | Formula Integrity | Ask AI to create discount lookup formula; download `.xlsx`; open in MS Excel Desktop | Target cell shows live `=XLOOKUP(...)` formula (not static value); changing input recalculates |
| **AC-03** | Conditional Formatting | Create rule: ">80 green, <50 red"; export to Excel | Excel Conditional Formatting Rules Manager shows original styling rules |
| **AC-04** | Offline Dashboard | Build dashboard (1 KPI + 2 Charts); export HTML; disable Wi-Fi; open `.html` in browser | Dashboard loads fully; ECharts render; slicers filter data offline |
| **AC-05** | Token Optimization | Load 20K-row file; ask AI for trend summary | Payload = column schema + 5 sample rows only; no context window error |
---

## 7. ARCHITECTURE & DESIGN DECISIONS

### 7.1 High-Level Architecture
```plaintext
[ User Input / Excel Import ]
             │
             ▼
   [ DuckDB-Wasm Engine ] ◄── (SQL Queries & Fast Client-Side Aggregation)
        │          │
        │          ├──────────────────────────────┐
        ▼          ▼                              ▼
[ Grid Spreadsheet ]    [ Canvas Dashboard ]    [ AI Schema Extractor ]
(Formulas & Formatting)  (ECharts & Slicers)    (Sampling 5-10 rows only)
        │                         │                       │
        │ (exceljs)               │ (Single-file bundler) ▼
        ▼                         ▼             [ Local / Cloud LLM ]
[ File: data.xlsx ]     [ File: dashboard.html ] (BYOK: Ollama/OpenAI)
(Live Formulas & Pivot)  (Interactive & Offline)           │
                                                          ▼
                                                [ Formula / DAX Output ]
```

### 7.2 Key Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js (App Router) + Tailwind CSS | Efficient rendering, strict modularity, future Tauri desktop wrapper ready |
| **Data Engine** | DuckDB-Wasm | Executes SQL aggregations (GROUP BY, SUM, FILTER) on 10K–500K rows in-browser at C++ speed |
| **Excel Library** | `exceljs` (not SheetJS CE) | Native formula writing, detailed cell styling, Conditional Formatting rules recognized by MS Excel |
| **Visualization** | Apache ECharts | Complete chart catalog, fast Canvas/SVG render, pure JSON config (AI-generatable) |
| **AI Adapter** | Universal OpenAI-Compatible Client | Single connector for Ollama, LM Studio, vLLM, OpenRouter — all implement OpenAI `/v1/chat/completions` spec |

### 7.3 Module Boundaries (Capability Map)

| Module ID | Responsibility | Depends On |
|-----------|----------------|------------|
| `byok-manager` | Provider config, connection test, secure storage | — |
| `spreadsheet-engine` | Grid, formulas, `=AI()` function, caching | `duckdb-engine` |
| `dashboard-builder` | Canvas, widgets, slicers, cross-filtering | `duckdb-engine` |
| `excel-exporter` | `.xlsx` generation with formulas/formatting | `spreadsheet-engine` |
| `html-exporter` | Standalone `.html` bundling | `dashboard-builder`, `duckdb-engine` |
| `duckdb-engine` | SQL queries, aggregation, sampling | — |
| `ai-adapter` | LLM communication, schema extraction, prompt guards | `byok-manager` |

**Build Order:** `duckdb-engine` → `byok-manager` → `ai-adapter` → `spreadsheet-engine` → `dashboard-builder` → `excel-exporter` + `html-exporter`

---

## 8. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| **R1: Small LLM Formula Hallucination** | High | Strict System Prompt Guardrails + few-shot examples; local AST/Regex validator for parentheses/function names before cell injection |
| **R2: CORS on Local LLM** | Medium | Document `OLLAMA_ORIGINS="*"`; provide Next.js Route Handler Proxy (`/api/ai/chat`) as fallback |
| **R3: Bloated Standalone HTML** | Medium | Tree-shaken ECharts build (only used modules); compress dataset JSON; cap raw data embed at 5MB/HTML |
| **R4: `=AI()` Chain Calculation Load** | High | Concurrency queue (max 3 parallel); Pause/Cancel button; persistent cache map for evaluated results |

---

## 9. BOUNDARIES (Always / Ask First / Never)

| Category | Always | Ask First | Never |
|----------|--------|-----------|-------|
| **Data Privacy** | Process locally by default | Send data to cloud LLM | Upload data without explicit user consent |
| **Formula Generation** | Validate syntax before insert | Use experimental functions | Generate formulas that reference volatile functions unnecessarily |
| **Export** | Preserve all formulas/formatting | Customize export options | Strip formulas to static values |
| **AI Calls** | Cache/memoize `=AI()` results | Increase concurrency limit | Allow unbounded parallel AI calls |
| **Dependencies** | Tree-shake bundles | Add new chart types | Include unused ECharts modules in HTML export |

---

## 10. SUCCESS CRITERIA (Definition of Done)

The spec is complete when:
- [ ] All 6 core areas covered (Problem, Goals, Users, Functional, Non-Functional, Acceptance)
- [ ] Human has reviewed and approved this spec
- [ ] Success criteria are specific and testable (linked to AC table)
- [ ] Boundaries (Always/Ask First/Never) are defined
- [ ] Spec saved to repository (`SPEC.md`)
- [ ] Capability map approved before module specs written
- [ ] Every module spec traces to a module ID in the approved map

---

## 11. NEXT STEPS (After Spec Approval)

1. **Phase: PLAN** → Run `planning-and-task-breakdown` to create `tasks/plan.md` and `tasks/todo.md` with atomic, verifiable tasks
2. **Phase: BUILD** → Implement per module in dependency order using `incremental-implementation` + `test-driven-development`
3. **Phase: VERIFY** → Run acceptance tests (AC-01 through AC-05)
4. **Phase: REVIEW** → `/review` with parallel agents (code-reviewer, security-auditor, test-engineer)
5. **Phase: SHIP** → `/ship` with release checklist