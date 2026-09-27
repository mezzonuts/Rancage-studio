# Next Phase: HIGH/MEDIUM/LOW Gaps After Critical Blockers

## Status After Critical Blockers

All 7 critical blockers FIXED:
1. ✅ Auth system (login, demo mode, session)
2. ✅ CI/CD pipeline (.github/workflows/ci.yml)
3. ✅ Error boundary (global-error.tsx)
4. ✅ Key encryption (XOR+base64 in localStorage)
5. ✅ Security headers (public/_headers)
6. ✅ Env config (.env.example)
7. ✅ Hardcoded user removed (Sidebar now uses useAuth)

---

## HIGH Priority (Next Sprint)

### HIGH-1: SpreadsheetGrid Accessibility + Virtualization

**File:** `src/components/SpreadsheetGrid.tsx`

**Tasks:**
1. Add ARIA grid roles:
   - Container: `role="grid"`, `aria-label="Spreadsheet"`
   - Row: `role="row"`
   - Cell: `role="gridcell"`, `aria-rowindex={r+1}`, `aria-colindex={c+1}`, `aria-selected={isSelected}`
   - Column headers: `role="columnheader"`
   - Row headers: `role="rowheader"`

2. Add virtualization (react-window or custom):
   - Only render visible rows + small buffer
   - Column virtualization for wide sheets
   - Maintain scroll position

3. Add React.memo to cell components

### HIGH-2: Memoization Across Components

**Files to wrap with React.memo:**
- `Ribbon.tsx` — `RibbonBtn`, `RibbonToggle`, `G`, `ColorPalette`, `MenuItem`
- `SpreadsheetGrid.tsx` — Cell renderer, row renderer
- `AiPanel.tsx` — Message bubbles, tool calls
- `DashboardCanvas.tsx` — Widget containers
- `FormulaBar.tsx` — Input, suggestions
- `Sidebar.tsx` — Nav items

### HIGH-3: Split StudioApp Monolith (1,376 lines)

**Split into:**
```
src/app/studio/
├── components/
│   ├── StudioHeader.tsx      # Tab bar + formula bar
│   ├── StudioGrid.tsx        # SpreadsheetGrid wrapper
│   ├── StudioSidebar.tsx     # Sidebar (already separate)
│   ├── StudioRibbon.tsx      # Ribbon (already separate)
│   ├── StudioAiPanel.tsx     # AiPanel (already separate)
│   └── StudioFooter.tsx      # Status bar
├── hooks/
│   ├── useGridState.ts       # gridData, cellFormats, selection
│   ├── useClipboard.ts       # copy/cut/paste/formatPainter
│   ├── useFormatting.ts      # font, alignment, number, borders
│   ├── useRowsCols.ts        # insert/delete row/col
│   ├── useUndoRedo.ts        # undo/redo stack
│   └── useKeyboard.ts        # keyboard shortcuts
├── utils/
│   └── constants.ts          # SAMPLE_DATA, defaults
└── page.tsx                  # Main composer (~50 lines)
```

---

## MEDIUM Priority

### MEDIUM-1: Project-Specific README.md

**Replace generic Next.js README with:**
- Project description (AI spreadsheet + dashboard)
- Features list (Excel 365 ribbon, BYOK, AI analyst, etc.)
- Quick start (npm install, npm run dev, npm run build)
- Architecture diagram
- Deployment (GitHub Pages, Vercel)
- Contributing guide

### MEDIUM-2: Remove Duplicate FileUpload

**Files:**
- `src/components/FileUpload.tsx` (314 lines, Tailwind, unused)
- `src/components/UploadModal.tsx` (160 lines, MUI, used)

**Action:** Delete `FileUpload.tsx`, verify `UploadModal` covers all use cases.

### MEDIUM-3: Tailwind + CSS Vars Conflict

**Issue:** `globals.css` uses CSS variables, `FileUpload.tsx` uses Tailwind classes.

**Resolution:** Since removing `FileUpload.tsx`, conflict largely resolved. Audit remaining Tailwind usage.

### MEDIUM-4: Formula Autocomplete

**File:** `src/components/FormulaBar.tsx`

**Add:**
- `onKeyDown` for `=` trigger
- Suggestion dropdown with functions (SUM, AVERAGE, IF, VLOOKUP, etc.)
- Cell reference autocomplete (A1, B2:C10)
- Syntax highlighting for functions

---

## LOW Priority

### LOW-1: Split Ribbon.tsx (1,400+ lines)

**Extract sub-components:**
- `RibbonTabBar.tsx` — Tab switching
- `RibbonToolbar.tsx` — Group containers
- `RibbonGroup.tsx` — Individual group (Clipboard, Font, etc.)
- `RibbonButton.tsx` — Base button variants
- `RibbonDropdown.tsx` — Generic dropdown
- `ColorPalette.tsx` — Theme/standard colors
- `RibbonStyles.tsx` — All CSS-in-JS styles

### LOW-2: Dark Mode Support

**Files:** `src/lib/mui/provider.tsx`, `src/app/globals.css`

**Add:**
- Theme toggle in UI
- CSS variables for dark mode
- `useMediaQuery` for system preference
- Persist in localStorage

### LOW-3: Skip Links

**File:** `src/app/layout.tsx`

**Add at top of body:**
```tsx
<a href="#main-content" className="skip-link">Skip to main content</a>
<main id="main-content">...</main>
```

---

## Files Summary

| Priority | Files to Create/Modify |
|----------|------------------------|
| HIGH | `SpreadsheetGrid.tsx`, all component files (memo), `studio/` folder structure |
| MEDIUM | `README.md`, delete `FileUpload.tsx`, `FormulaBar.tsx` |
| LOW | Split `Ribbon.tsx`, `globals.css` (dark mode), `layout.tsx` (skip links) |

---

## Timeline Estimate

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 1 | HIGH-1, HIGH-2 | Accessible/virtualized grid, memoized components |
| 2 | HIGH-3, MEDIUM-1 | Split StudioApp, project README |
| 3 | MEDIUM-2,3,4 | Clean up duplicates, formula autocomplete |
| 4 | LOW-1,2,3 | Split ribbon, dark mode, skip links |

**Estimated: 4-5 weeks for HIGH+MEDIUM items**