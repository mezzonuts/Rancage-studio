# Rows AI — Frontend Design Spec for Cline Agent

## Overview
AI-powered spreadsheet application inspired by Rows.com. Self-contained HTML prototype at `rows-ai-spreadsheet.html`.

## Architecture (for implementation)
```
src/
├── App.tsx                    # Main layout (3-panel grid)
├── components/
│   ├── Sidebar/
│   │   ├── Sidebar.tsx        # Left nav with sections
│   │   ├── NavItem.tsx        # Clickable nav entry
│   │   └── UserInfo.tsx       # Footer user card
│   ├── Header/
│   │   ├── Header.tsx         # File tabs + actions
│   │   ├── FileTab.tsx        # Individual tab
│   │   └── ActionButtons.tsx  # Export/Share/Import
│   ├── Spreadsheet/
│   │   ├── Spreadsheet.tsx    # Table grid
│   │   ├── FormulaBar.tsx     # Cell ref + formula input
│   │   ├── Cell.tsx           # Individual cell (text/num/ai)
│   │   └── StatusBar.tsx      # Bottom status pills
│   ├── Panel/
│   │   ├── AiPanel.tsx        # Right panel container
│   │   ├── ChatArea.tsx       # Message list
│   │   ├── ChatMessage.tsx    # Single message (user/ai)
│   │   ├── ActionCard.tsx     # AI action results
│   │   ├── ChatInput.tsx      # Textarea + send + hints
│   │   └── QuickActions.tsx   # Chip row above input
│   └── Modal/
│       ├── UploadModal.tsx    # Document import dialog
│       └── Dropzone.tsx       # Drag-and-drop area
├── styles/
│   ├── tokens.css             # CSS variables (design system)
│   └── global.css             # Base reset + scrollbars
├── hooks/
│   └── useAutoResize.ts       # Textarea auto-height
└── types/
    └── index.ts               # Shared types
```

## Design System Tokens

### Colors
```css
--bg-primary: #f8f9fc;        /* page background */
--bg-surface: #ffffff;         /* cards, panels */
--bg-sidebar: #1a1b26;        /* dark sidebar */
--bg-sidebar-hover: #24253a;
--bg-sidebar-active: #2d2e45;
--bg-grid-header: #f1f3f8;    /* table headers */
--bg-grid-alt: #fafbfd;       /* zebra rows */
--bg-grid-selected: #eef0ff;  /* selected cell */
--bg-grid-hover: #f5f6fa;

--accent: #6c5ce7;            /* primary violet */
--accent-light: #a29bfe;
--accent-bg: #f0eeff;
--accent-hover: #5a4bd6;
--accent-gradient: linear-gradient(135deg, #6c5ce7, #a29bfe);

--text-primary: #1a1d2e;
--text-secondary: #6b7194;
--text-tertiary: #9498b3;
--text-sidebar: #c8cbe3;

--success: #00b894;
--danger: #e17055;
--border: #e2e5f0;
```

### Typography
- Font: `Inter` (sans), `JetBrains Mono` (code/formulas)
- Body: 13px, 500 weight
- Headers: 14-16px, 600-700 weight
- Monospace (formulas/cells): 12.5px

### Spacing Scale
4, 8, 12, 16, 20, 24, 32, 40px

### Radii
- sm: 6px, md: 8px, lg: 12px, xl: 16px

### Shadows
- sm: 0 1px 2px rgba(0,0,0,0.04)
- md: 0 2px 8px rgba(0,0,0,0.06)
- lg: 0 4px 16px rgba(0,0,0,0.08)

## Layout
CSS Grid: `grid-template-columns: 260px 1fr 380px;`
- Left: Sidebar (260px, dark)
- Center: Spreadsheet (flex)
- Right: AI Panel (380px)
- Top: Header (56px) spans center+right

## Key Components

### 1. Spreadsheet Grid
- `<table>` with sticky row/col headers
- Cell types: text, number, header, ai-generated (violet left border)
- Selected cell: outline 2px accent, offset -2px
- Zebra striping on even rows

### 2. AI Analyst Panel
- Tabbed: Chat | Replays | Sources
- Chat bubbles: user (right-aligned avatar), AI (violet gradient avatar)
- Action cards: bordered boxes showing actions AI performed
- Code blocks: dark bg (#1a1b26), syntax highlighting (kw=bb9af7, fn=7aa2f7, str=9ece6a, num=ff9e64, cm=565f89)
- Quick action chips: rounded pill buttons above input
- Auto-resizing textarea

### 3. Upload Modal
- Backdrop blur overlay
- Dropzone with dashed border, hover/drag state
- Format badges (PDF, PNG, JPG, CSV, XLSX)
- Click-outside-to-close

### 4. Sidebar
- Dark theme (#1a1b26)
- Section labels: uppercase, 10px, letter-spacing 1px
- Active state: lighter bg, white text
- Badge pills for counts

### 5. Formula Bar
- Cell reference (monospace, bordered)
- "fx" label
- Formula input (monospace, readonly in prototype)

## Interaction States
- Nav hover: bg-sidebar-hover
- Nav active: bg-sidebar-active
- Cell hover: bg-grid-hover
- Cell selected: bg-grid-selected + outline
- Button hover: border-focus color
- AI dot: 2s ease-in-out pulse animation
- Modal: opacity + translateY transition

## Responsive
At ≤1200px: collapse to single-column, hide sidebar+panel.

## Notes for Cline Agent
1. Use React with TypeScript
2. State management: useState for modal, tabs, cell selection
3. Spreadsheet data: array of row objects, render via map
4. AI panel: message array with role/content type
5. Modal: controlled open/close via App state
6. No external UI libs — hand-craft components to match pixel-perfect
7. CSS modules or styled-components for scoped styles
8. Keep the design token file separate for theming
