# Implementation Plan: Rancagé Studio v2 — Excel-Like Ribbon UI Overhaul

> **Status:** APPROVED — Ready for Implementation
> **Date:** 2026-09-23
> **Trigger:** User requested complete UI restructure to match Microsoft Excel UX

---

## Summary of Changes

Remove left sidebar, restructure into Excel-like top ribbon + collapsible AI chat panel. Every menu functional with real ribbon sub-menus matching Excel.

---

## Architecture Decisions
- **Layout:** Remove sidebar. Full-width top ribbon (tabs + toolbar), content fills remaining space, AI chat panel toggleable from right
- **AI Chat Panel:** Collapsible from right side, toggled via "Chat" button in AI Analyst ribbon. Animated icon when AI processing
- **State:** React Context for active ribbon tab, chat panel visibility, AI processing state
- **Grid Layout:** `grid-template-columns` changes from `260px 1fr 380px` to `1fr` (or `1fr 380px` when chat open)
- **No new dependencies** — pure CSS transitions, existing React state

---

## Task Breakdown

### Phase 1: Layout Restructure — Remove Sidebar, New Grid
**Files:** `src/app/studio/page.tsx`, `src/components/Sidebar.tsx`, `src/components/AiPanel.tsx`, `src/components/Ribbon.tsx`

- [ ] **T1:** Remove `Sidebar` component import and render from `studio/page.tsx`
- [ ] **T2:** Add state: `chatOpen: boolean` (default `true`), `aiProcessing: boolean`
- [ ] **T3:** Update CSS grid: `grid-template-columns: 1fr ${chatOpen ? '380px' : '0px'}` with transition
- [ ] **T4:** AI panel gets `overflow: hidden` + `width: 380px` + `transition: width 0.3s ease` when toggled
- [ ] **T5:** Remove `grid-area: sidebar` / `grid-area: panel` fixed assignments — use dynamic grid
- [ ] **T6:** Move logo from sidebar to ribbon `logo-tab` (already exists, verify)

**Checkpoint:**
- [ ] `npm run build` succeeds
- [ ] Layout renders without sidebar, content fills width
- [ ] Chat panel slides in/out smoothly

---

### Phase 2: Ribbon Tab Restructure — Excel-Like Menus
**Files:** `src/components/Ribbon.tsx`

#### 2A: Tab Bar Update
- [ ] **T7:** New tab order: `File | Home | Insert | Draw | Page Layout | Formulas | Data | Review | View | AI Analyst`
- [ ] **T8:** Remove `Dashboard` from tabs (dashboard now accessible via View tab)

#### 2B: File Tab Ribbon
- [ ] **T9:** File ribbon groups: **New** (Blank Workbook, From Template) | **Open** (Import CSV/XLSX/Parquet — opens UploadModal) | **Save & Export** (Export .xlsx, Export .html) | **Print** (Print to PDF via `window.print()` + print preview) | **Close**

#### 2C: Home Tab Ribbon (existing, verify completeness)
- [ ] **T10:** Verify existing Home ribbon: Clipboard, Font, Alignment, Number, Styles, Cells, Editing — all match Excel layout
- [ ] **T11:** Wire functional buttons: Bold/Italic/Underline/Strikethrough toggle formatting on selected cell, Font family/size selectors, Alignment buttons, Number format selector

#### 2D: Insert Tab Ribbon
- [ ] **T12:** Groups: **Tables** (Table, Pivot Table) | **Charts** (Bar, Line, Pie, Scatter, Radar — create chart widget) | **Illustrations** (Shapes) | **Links** (Hyperlink) | **Text** (Text Box, WordArt) | **Symbols** (Equation, Symbol)

#### 2E: Draw Tab Ribbon
- [ ] **T13:** Groups: **Pens** (Pen, Highlighter, Eraser) | **Convert** (Ink to Shape) | **Actions** (Undo, Redo)

#### 2F: Page Layout Tab Ribbon
- [ ] **T14:** Groups: **Themes** (Colors, Fonts, Effects) | **Page Setup** (Margins, Orientation, Size, Print Area, Breaks, Background) | **Scale to Fit** (Width, Height, Scale) | **Sheet Options** (Gridlines, Headings checkboxes)

#### 2G: Formulas Tab Ribbon
- [ ] **T15:** Groups: **Function Library** (Insert Function, AutoSum dropdown, Financial, Logical, Text, Date/Time, Lookup, Math, More) | **Defined Names** (Name Manager, Define Name) | **Formula Auditing** (Trace Precedents, Trace Dependents, Show Formulas, Error Checking) | **Calculation** (Calculate Now, Auto/Manual toggle)

#### 2H: Data Tab Ribbon
- [ ] **T16:** Groups: **Get & Transform** (From CSV, From Web) | **Sort & Filter** (Sort A-Z, Sort Z-A, Custom Sort, Filter, Clear, Reapply) | **Data Tools** (Remove Duplicates, Data Validation, What-If Analysis) | **Forecast** (Forecast Sheet) | **Outline** (Group, Ungroup, Subtotal)

#### 2I: Review Tab Ribbon
- [ ] **T17:** Groups: **Proofing** (Spelling, Thesaurus) | **Comments** (New Comment, Delete, Navigate) | **Protect** (Protect Sheet, Protect Workbook) | **Changes** (Merge, Track Changes)

#### 2J: View Tab Ribbon
- [ ] **T18:** Groups: **Workbook Views** (Normal, Page Layout, Page Break) | **Show** (Gridlines, Formula Bar, Headings — toggles) | **Zoom** (Zoom In, Zoom Out, 100%) | **Window** (Freeze Panes, Split, New Window) | **Open Dashboard** button (switches main content to DashboardCanvas)

#### 2K: AI Analyst Tab Ribbon
- [ ] **T19:** Groups: **AI Chat** (Chat toggle button with animated sparkle icon when `aiProcessing`) | **Automate** (Replays, Templates) | **Scripts** (Python Scripts editor) | **AI Generate** (AI Column, AI Forecast) | **Settings** (Open BYOK Manager)
- [ ] **T20:** Chat toggle button: when `chatOpen=false` click opens panel; when `chatOpen=true` click closes panel. Icon animates (`@keyframes spin` + `pulse`) when `aiProcessing=true`

**Checkpoint:**
- [ ] All 10 tabs render with Excel-like ribbon content
- [ ] Tab switching shows correct ribbon toolbar
- [ ] AI Analyst ribbon contains Chat, Automate, Scripts, AI Generate, Settings

---

### Phase 3: AI Chat Panel — Collapsible + Animation
**Files:** `src/components/AiPanel.tsx`, `src/app/studio/page.tsx`

- [ ] **T21:** Add `onClose` prop to `AiPanel` — renders close (X) button in header
- [ ] **T22:** Chat panel wraps in `div` with `transition: width 0.3s, opacity 0.3s` — when `chatOpen=false`, width becomes 0 + opacity 0 + overflow hidden
- [ ] **T23:** AI processing state: when AI is generating, set `aiProcessing=true`. Clear when response arrives
- [ ] **T24:** Processing animation on Chat button in ribbon: SVG icon rotates + pulses via CSS keyframes
- [ ] **T25:** Processing animation in chat panel header: `ai-dot` already has `@keyframes pulse` — verify it activates only during processing (not idle)
- [ ] **T26:** Replays and Templates sub-tabs in AiPanel stay (moved from sidebar)

**Checkpoint:**
- [ ] Chat panel slides in/out without layout jump
- [ ] AI processing shows animated icon in ribbon + panel
- [ ] Chat continues processing even when panel is minimized

---

### Phase 4: Functional Wiring
**Files:** `src/components/Ribbon.tsx`, `src/app/studio/page.tsx`, `src/components/SpreadsheetGrid.tsx`

- [ ] **T27:** File > Import opens `UploadModal` (wire `onImportClick`)
- [ ] **T28:** File > Export Excel triggers `handleExcelExport`
- [ ] **T29:** File > Export HTML triggers `handleHTMLExport`
- [ ] **T30:** File > Print triggers `window.print()` with print-specific CSS media query
- [ ] **T31:** View > Open Dashboard switches `activeNav` to `dashboards` view
- [ ] **T32:** Data > Sort A-Z / Z-A sorts selected column in grid
- [ ] **T33:** Data > Filter toggles filter mode on grid
- [ ] **T34:** Home > Bold/Italic/Underline toggles CSS formatting on selected cell
- [ ] **T35:** Home > Font family/size updates selected cell style
- [ ] **T36:** Home > Alignment updates selected cell text-align
- [ ] **T37:** Formulas > Insert Function shows formula helper dialog
- [ ] **T38:** AI Analyst > Replays opens replay panel in AiPanel
- [ ] **T39:** AI Analyst > Templates opens template panel in AiPanel
- [ ] **T40:** AI Analyst > Python Scripts opens script editor in AiPanel
- [ ] **T41:** AI Analyst > Settings opens BYOK Manager overlay
- [ ] **T42:** Gridlines/Headings toggles in View ribbon hide/show grid headers

**Checkpoint:**
- [ ] Each ribbon button performs its intended action
- [ ] No dead buttons remaining
- [ ] `npm run test` passes

---

### Phase 5: Print Support
**Files:** `src/app/globals.css`, `src/components/SpreadsheetGrid.tsx`

- [ ] **T43:** Add `@media print` CSS: hide sidebar, ribbon, AI panel, formula bar — show only spreadsheet content
- [ ] **T44:** File > Print triggers print dialog with proper page setup
- [ ] **T45:** Print preview shows grid with current data, headers, and basic formatting

**Checkpoint:**
- [ ] Ctrl+P or File > Print opens browser print dialog
- [ ] Print output shows clean spreadsheet without UI chrome

---

### Phase 6: Polish & Verification
- [ ] **T46:** Verify all 10 ribbon tabs have correct sub-menus and icons
- [ ] **T47:** Verify responsive behavior: on narrow screens, ribbon scrolls horizontally
- [ ] **T48:** Verify no orphaned sidebar code remains (remove `Sidebar.tsx` or deprecate)
- [ ] **T49:** `npm run build` clean, `npm run lint` passes
- [ ] **T50:** Visual regression: compare each ribbon tab to Excel reference

**Checkpoint:**
- [ ] All 50 tasks complete
- [ ] `npm run build && npm run test` green
- [ ] Ready for `/review`

---

## File Change Summary

| File | Action |
|------|--------|
| `src/app/studio/page.tsx` | Major: Remove sidebar, new grid, new state vars, wire all handlers |
| `src/components/Ribbon.tsx` | Major: 10 complete ribbon toolbars, tab restructure |
| `src/components/AiPanel.tsx` | Medium: close button, collapsible wrapper, Replays/Templates/Scripts tabs |
| `src/app/globals.css` | Medium: print CSS, animation keyframes, responsive ribbon |
| `src/components/Sidebar.tsx` | Delete or deprecate |
| `src/components/FormulaBar.tsx` | Minor: verify still works in new layout |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Ribbon toolbar height too large | Cap at 90px, horizontal scroll for overflow |
| Chat panel animation janky | Use `transform: translateX` instead of `width` animation |
| Print CSS breaks layout | Isolate print styles with `@media print` block, test early |
| State explosion (many ribbon buttons) | Group related state in reducer, not individual useState |

---

## Execution Order

```
Phase 1 (Layout) → Phase 2 (Ribbons) → Phase 3 (AI Chat) → Phase 4 (Wiring) → Phase 5 (Print) → Phase 6 (Polish)
```

Estimated: ~4-6 hours implementation, ~1-2 hours testing/polish
