'use client';

export interface RibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportExcel: () => void;
  onExportHTML: () => void;
  onPrint: () => void;
  onImport: () => void;
  onNewWorkbook: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onRemoveDuplicates: () => void;
  toggleFilter: () => void;
  filterActive: boolean;
  zoom: number;
  onZoomChange: (z: number) => void;
  showGridlines: boolean;
  onToggleGridlines: () => void;
  showFormulaBar: boolean;
  onToggleFormulaBar: () => void;
  showHeadings: boolean;
  onToggleHeadings: () => void;
  bold: boolean;
  onToggleBold: () => void;
  italic: boolean;
  onToggleItalic: () => void;
  underline: boolean;
  onToggleUnderline: () => void;
  strikethrough: boolean;
  onToggleStrikethrough: () => void;
  textAlign: 'left' | 'center' | 'right';
  onTextAlignChange: (a: 'left' | 'center' | 'right') => void;
  fontFamily: string;
  onFontFamilyChange: (f: string) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
  numberFormat: string;
  onNumberFormatChange: (f: string) => void;
  chatOpen: boolean;
  aiProcessing: boolean;
  onAIAnalystAction: (action: string) => void;
  onToggleChat: () => void;
  viewMode: string;
  // Clipboard
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  // Insert/Delete
  onInsertRowAbove?: () => void;
  onInsertRowBelow?: () => void;
  onDeleteRow?: () => void;
  onInsertColLeft?: () => void;
  onInsertColRight?: () => void;
  onDeleteCol?: () => void;
  // Find
  onFind?: () => void;
}

const TABS = [
  'File',
  'Home',
  'Insert',
  'Draw',
  'Page Layout',
  'Formulas',
  'Data',
  'Review',
  'View',
  'AI Analyst',
];

/* ─── Shared SVG icons ─── */
const I = {
  // Clipboard group
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  cut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  // Font group
  bold: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-4 w-4"
    >
      <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
      <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  underline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  strikethrough: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.5 2.8 4.2 3.4" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M8.5 16.4c.6 1.6 2.3 2.6 4.5 2.6 2.7 0 5.3-.9 5.3-3.6 0-.7-.2-1.4-.6-2" />
    </svg>
  ),
  // Alignment
  alignLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  ),
  alignCenter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  ),
  alignRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  ),
  merge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  ),
  wrap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 6h18M3 12h12M3 18h16" />
    </svg>
  ),
  // Number
  format: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  ),
  style: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  // Cells
  insert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12h8" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  // Editing
  sort: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M11 5h10M11 9h7M11 13h4M3 17l4 4 4-4M7 3v18" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  find: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  // File
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  newFile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  open: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  export: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  // Sort
  sortAsc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  sortDesc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  clearFilter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M4 4h16M6 10h12M8 16h8" />
    </svg>
  ),
  // Draw
  pen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  highlighter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M15.5 4.5l4 4L8 20H4v-4L15.5 4.5z" />
      <line x1="18" y1="2" x2="22" y2="6" />
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M20 20H7L3 16a1 1 0 010-1.41l9.59-9.59a2 2 0 012.82 0l5 5a2 2 0 010 2.82L14 20" />
    </svg>
  ),
  // Page Layout
  margins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  ),
  orientation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  ),
  size: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 3H3v18h18V3z" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
    </svg>
  ),
  bg: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  ),
  gridlines: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  ),
  // Formula
  function: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <text x="4" y="17" fontSize="14" fontWeight="bold" fill="currentColor" stroke="none">
        fx
      </text>
    </svg>
  ),
  sum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <text x="3" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">
        Σ
      </text>
    </svg>
  ),
  trace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 8l8 8" />
    </svg>
  ),
  showFormula: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M4 19h16M4 15h8M12 5v14" />
    </svg>
  ),
  calc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="12" cy="11" r="1" />
      <circle cx="16" cy="11" r="1" />
      <circle cx="8" cy="16" r="1" />
      <circle cx="12" cy="16" r="1" />
      <circle cx="16" cy="16" r="1" />
    </svg>
  ),
  nameManager: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  // Data
  dataImport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  removeDup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M17.5 14v7M14 17.5h7" />
    </svg>
  ),
  group: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M18 3v18M3 9h18M3 15h18" />
    </svg>
  ),
  validate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  // Review
  spellcheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
    </svg>
  ),
  comment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  // View
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  zoomIn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  zoomOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  freeze: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 2v20M2 12h20M12 2l8 8M12 22l-8-8" />
    </svg>
  ),
  split: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  // AI Analyst
  aiBrain: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      style={{ color: 'var(--accent)' }}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  aiDollar: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      style={{ color: 'var(--accent)' }}
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  aiChart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      style={{ color: 'var(--accent)' }}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  chat: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      style={{ color: 'var(--accent)' }}
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  python: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      style={{ color: 'var(--accent)' }}
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  template: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      style={{ color: 'var(--accent)' }}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  replay: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      style={{ color: 'var(--accent)' }}
    >
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
    </svg>
  ),
  // Misc
  search: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-[14px] w-[14px]"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  bell: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-[14px] w-[14px]"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    </svg>
  ),
  dots: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-[14px] w-[14px]"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
  symbol: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <text x="4" y="18" fontSize="16" fill="currentColor" stroke="none">
        Ω
      </text>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

function R({
  icon,
  label,
  onClick,
  active,
  small,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  small?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      className={`ribbon-btn ${small ? 'ribbon-btn-sm' : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
      style={accent ? { color: 'var(--accent)' } : undefined}
    >
      {icon}
      <span style={{ fontSize: small ? 10 : 10.5, color: accent ? 'var(--accent)' : undefined }}>
        {label}
      </span>
    </button>
  );
}

function G({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="ribbon-group">
      <div className="ribbon-group-content">{children}</div>
      <div className="ribbon-group-label">{label}</div>
    </div>
  );
}

/* ─── Tab-specific ribbon content ─── */
function FileRibbon({
  onNew,
  onImport,
  onExportExcel,
  onExportHTML,
  onPrint,
}: {
  onNew: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onExportHTML: () => void;
  onPrint: () => void;
}) {
  return (
    <>
      <G label="New">
        <R icon={I.newFile} label="Blank" onClick={onNew} />
        <R icon={I.template} label="From Template" onClick={onNew} accent />
      </G>
      <G label="Open">
        <R icon={I.open} label="Import CSV" onClick={onImport} />
        <R icon={I.open} label="Import XLSX" onClick={onImport} />
        <R icon={I.open} label="Import Parquet" onClick={onImport} />
      </G>
      <G label="Save & Export">
        <R icon={I.save} label="Save" onClick={onExportExcel} />
        <R icon={I.export} label="Export Excel" onClick={onExportExcel} />
        <R icon={I.export} label="Export HTML" onClick={onExportHTML} />
      </G>
      <G label="Print">
        <R icon={I.print} label="Print" onClick={onPrint} />
      </G>
      <G label="Close">
        <R icon={I.close} label="Close" onClick={onNew} />
      </G>
    </>
  );
}

function HomeRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Clipboard">
        <R icon={I.clipboard} label="Paste" onClick={props.onPaste} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <R icon={I.copy} label="Copy" small onClick={props.onCopy} />
          <R icon={I.cut} label="Cut" small onClick={props.onCut} />
        </div>
      </G>
      <G label="Font">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <select
              className="ribbon-select"
              style={{ flex: 1, minWidth: 90 }}
              value={props.fontFamily}
              onChange={(e) => props.onFontFamilyChange(e.target.value)}
            >
              <option value="Inter">Inter</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
            </select>
            <select
              className="ribbon-select"
              style={{ width: 52 }}
              value={props.fontSize}
              onChange={(e) => props.onFontSizeChange(Number(e.target.value))}
            >
              {[8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 36, 48, 72].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <R icon={I.bold} label="" active={props.bold} onClick={props.onToggleBold} small />
            <R
              icon={I.italic}
              label=""
              active={props.italic}
              onClick={props.onToggleItalic}
              small
            />
            <R
              icon={I.underline}
              label=""
              active={props.underline}
              onClick={props.onToggleUnderline}
              small
            />
            <R
              icon={I.strikethrough}
              label=""
              active={props.strikethrough}
              onClick={props.onToggleStrikethrough}
              small
            />
          </div>
        </div>
      </G>
      <G label="Alignment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <R
              icon={I.alignLeft}
              label=""
              active={props.textAlign === 'left'}
              onClick={() => props.onTextAlignChange('left')}
              small
            />
            <R
              icon={I.alignCenter}
              label=""
              active={props.textAlign === 'center'}
              onClick={() => props.onTextAlignChange('center')}
              small
            />
            <R
              icon={I.alignRight}
              label=""
              active={props.textAlign === 'right'}
              onClick={() => props.onTextAlignChange('right')}
              small
            />
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <R icon={I.merge} label="Merge" small />
            <R icon={I.wrap} label="Wrap" small />
          </div>
        </div>
      </G>
      <G label="Number">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
          <select
            className="ribbon-select"
            style={{ minWidth: 100 }}
            value={props.numberFormat}
            onChange={(e) => props.onNumberFormatChange(e.target.value)}
          >
            <option>General</option>
            <option>Currency</option>
            <option>Currency ($)</option>
            <option>Percentage</option>
            <option>Date</option>
            <option>Time</option>
            <option>Scientific</option>
            <option>Text</option>
          </select>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="ribbon-btn ribbon-btn-sm" title="Increase Decimal">
              <span className="mono-sm">.0→.00</span>
            </button>
            <button className="ribbon-btn ribbon-btn-sm" title="Decrease Decimal">
              <span className="mono-sm">.00→.0</span>
            </button>
          </div>
        </div>
      </G>
      <G label="Styles">
        <R icon={I.format} label="Conditional" small />
        <R icon={I.style} label="Cell Styles" small />
      </G>
      <G label="Cells">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <R icon={I.insert} label="Row ▲" small onClick={props.onInsertRowAbove} />
            <R icon={I.insert} label="Row ▼" small onClick={props.onInsertRowBelow} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <R icon={I.insert} label="Col ◀" small onClick={props.onInsertColLeft} />
            <R icon={I.insert} label="Col ▶" small onClick={props.onInsertColRight} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <R icon={I.delete} label="Del Row" small onClick={props.onDeleteRow} />
            <R icon={I.delete} label="Del Col" small onClick={props.onDeleteCol} />
          </div>
        </div>
      </G>
      <G label="Editing">
        <R icon={I.sort} label="Sort" onClick={props.onSortAsc} small />
        <R
          icon={I.filter}
          label="Filter"
          onClick={props.toggleFilter}
          small
          active={props.filterActive}
        />
        <R icon={I.find} label="Find" small onClick={props.onFind} />
      </G>
    </>
  );
}

function InsertRibbon() {
  return (
    <>
      <G label="Tables">
        <R icon={I.format} label="Table" />
        <R icon={I.format} label="Pivot Table" small />
      </G>
      <G label="Charts">
        <R icon={I.aiChart} label="Bar" accent />
        <R icon={I.aiChart} label="Line" accent />
        <R icon={I.aiChart} label="Pie" accent />
        <R icon={I.aiChart} label="Scatter" accent />
        <R icon={I.aiChart} label="Radar" accent />
      </G>
      <G label="Illustrations">
        <R icon={I.pen} label="Shapes" small />
      </G>
      <G label="Links">
        <R icon={I.open} label="Link" small />
      </G>
      <G label="Text">
        <R icon={I.file} label="Text Box" small />
        <R icon={I.file} label="WordArt" small />
      </G>
      <G label="Symbols">
        <R icon={I.function} label="Equation" small />
        <R icon={I.symbol} label="Symbol" small />
      </G>
    </>
  );
}

function DrawRibbon() {
  return (
    <>
      <G label="Pens">
        <R icon={I.pen} label="Pen" />
        <R icon={I.highlighter} label="Highlight" />
        <R icon={I.eraser} label="Eraser" />
      </G>
      <G label="Convert">
        <R icon={I.pen} label="Ink to Shape" small />
      </G>
      <G label="Actions">
        <R icon={I.sort} label="Undo" small />
        <R icon={I.sortDesc} label="Redo" small />
      </G>
    </>
  );
}

function PageLayoutRibbon() {
  return (
    <>
      <G label="Themes">
        <R icon={I.style} label="Colors" small />
        <R icon={I.style} label="Fonts" small />
        <R icon={I.style} label="Effects" small />
      </G>
      <G label="Page Setup">
        <R icon={I.margins} label="Margins" small />
        <R icon={I.orientation} label="Orientation" />
        <R icon={I.size} label="Size" small />
        <R icon={I.bg} label="Background" small />
      </G>
      <G label="Scale to Fit">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Width: Auto
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Height: Auto
          </div>
        </div>
      </G>
      <G label="Sheet Options">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="ribbon-checkbox">
            <input type="checkbox" defaultChecked /> Gridlines
          </label>
          <label className="ribbon-checkbox">
            <input type="checkbox" defaultChecked /> Headings
          </label>
        </div>
      </G>
    </>
  );
}

function FormulasRibbon() {
  return (
    <>
      <G label="Function Library">
        <R icon={I.function} label="Insert Function" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <R icon={I.sum} label="AutoSum" small />
          <R icon={I.function} label="Financial" small />
          <R icon={I.function} label="Logical" small />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <R icon={I.function} label="Text" small />
          <R icon={I.function} label="Date/Time" small />
          <R icon={I.function} label="Lookup" small />
        </div>
        <R icon={I.aiDollar} label="More" small accent />
      </G>
      <G label="Defined Names">
        <R icon={I.nameManager} label="Name Manager" />
        <R icon={I.nameManager} label="Define Name" small />
      </G>
      <G label="Formula Auditing">
        <R icon={I.trace} label="Trace Precedents" small />
        <R icon={I.trace} label="Trace Dependents" small />
        <R icon={I.showFormula} label="Show Formulas" small />
        <R icon={I.validate} label="Error Check" small />
      </G>
      <G label="Calculation">
        <R icon={I.calc} label="Calculate Now" />
        <R icon={I.calc} label="Calc Mode" small />
      </G>
    </>
  );
}

function DataRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Get & Transform">
        <R icon={I.dataImport} label="From CSV" onClick={props.onImport} />
        <R icon={I.open} label="From Web" small />
      </G>
      <G label="Sort & Filter">
        <div style={{ display: 'flex', gap: 2 }}>
          <R icon={I.sortAsc} label="A→Z" onClick={props.onSortAsc} small />
          <R icon={I.sortDesc} label="Z→A" onClick={props.onSortDesc} small />
        </div>
        <R icon={I.sort} label="Custom" small />
        <R
          icon={I.filter}
          label="Filter"
          onClick={props.toggleFilter}
          active={props.filterActive}
        />
        <R icon={I.clearFilter} label="Clear" small />
      </G>
      <G label="Data Tools">
        <R icon={I.removeDup} label="Remove Dups" onClick={props.onRemoveDuplicates} />
        <R icon={I.validate} label="Validation" small />
        <R icon={I.aiChart} label="What-If" small accent />
      </G>
      <G label="Forecast">
        <R icon={I.aiChart} label="Forecast" small accent />
      </G>
      <G label="Outline">
        <R icon={I.group} label="Group" small />
        <R icon={I.group} label="Ungroup" small />
        <R icon={I.group} label="Subtotal" small />
      </G>
    </>
  );
}

function ReviewRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Proofing">
        <R icon={I.spellcheck} label="Spelling" />
        <R icon={I.spellcheck} label="Thesaurus" small />
      </G>
      <G label="Comments">
        <R icon={I.comment} label="New Comment" />
        <R icon={I.delete} label="Delete" small />
        <R icon={I.sort} label="Navigate" small />
      </G>
      <G label="Find">
        <R icon={I.find} label="Find & Replace" onClick={props.onFind} />
        <R icon={I.find} label="Go To" small onClick={props.onFind} />
      </G>
      <G label="Protect">
        <R icon={I.lock} label="Protect Sheet" />
        <R icon={I.lock} label="Protect Workbook" small />
      </G>
      <G label="Changes">
        <R icon={I.merge} label="Merge" small />
        <R icon={I.eye} label="Track Changes" small />
      </G>
    </>
  );
}

function ViewRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Workbook Views">
        <R icon={I.file} label="Normal" active />
        <R icon={I.file} label="Page Layout" small />
        <R icon={I.file} label="Page Break" small />
      </G>
      <G label="Show">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="ribbon-checkbox">
            <input
              type="checkbox"
              checked={props.showGridlines}
              onChange={props.onToggleGridlines}
            />{' '}
            Gridlines
          </label>
          <label className="ribbon-checkbox">
            <input
              type="checkbox"
              checked={props.showFormulaBar}
              onChange={props.onToggleFormulaBar}
            />{' '}
            Formula Bar
          </label>
          <label className="ribbon-checkbox">
            <input type="checkbox" checked={props.showHeadings} onChange={props.onToggleHeadings} />{' '}
            Headings
          </label>
        </div>
      </G>
      <G label="Zoom">
        <R
          icon={I.zoomIn}
          label="Zoom +"
          onClick={() => props.onZoomChange(Math.min(200, props.zoom + 10))}
        />
        <R
          icon={I.zoomOut}
          label="Zoom −"
          onClick={() => props.onZoomChange(Math.max(25, props.zoom - 10))}
        />
        <R icon={I.eye} label={`${props.zoom}%`} small />
      </G>
      <G label="Window">
        <R icon={I.freeze} label="Freeze" small />
        <R icon={I.split} label="Split" small />
      </G>
      <G label="Dashboards">
        <R
          icon={I.dashboard}
          label="Open Dashboard"
          onClick={() => props.onAIAnalystAction('dashboard')}
          accent
        />
      </G>
    </>
  );
}

function AIAnalystRibbon(props: RibbonProps) {
  return (
    <>
      <G label="AI Chat">
        <R
          icon={
            <span className={props.aiProcessing ? 'ai-spin' : ''}>
              {props.chatOpen ? I.chat : I.eye}
            </span>
          }
          label={props.chatOpen ? 'Close Chat' : 'Open Chat'}
          onClick={props.onToggleChat}
          accent
          active={props.chatOpen}
        />
      </G>
      <G label="Automate">
        <R
          icon={I.replay}
          label="Replays"
          onClick={() => props.onAIAnalystAction('replays')}
          accent
        />
        <R
          icon={I.template}
          label="Templates"
          onClick={() => props.onAIAnalystAction('templates')}
          accent
        />
      </G>
      <G label="Scripts">
        <R
          icon={I.python}
          label="Python"
          onClick={() => props.onAIAnalystAction('scripts')}
          accent
        />
      </G>
      <G label="AI Generate">
        <R
          icon={I.aiDollar}
          label="AI Column"
          onClick={() => props.onAIAnalystAction('ai-column')}
          accent
        />
        <R
          icon={I.aiChart}
          label="AI Forecast"
          onClick={() => props.onAIAnalystAction('ai-forecast')}
          accent
        />
      </G>
      <G label="Settings">
        <R
          icon={I.settings}
          label="BYOK Config"
          onClick={() => props.onAIAnalystAction('settings')}
        />
      </G>
    </>
  );
}

/* ─── Main Ribbon ─── */
export function Ribbon(props: RibbonProps) {
  return (
    <div className="ribbon">
      {/* Tab Bar */}
      <div className="ribbon-tabs">
        <div className="logo-tab">
          <svg viewBox="0 0 28 28" fill="none" className="h-5 w-5">
            <rect width="28" height="28" rx="7" fill="#6c5ce7" />
            <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        {TABS.map((t) => (
          <button
            key={t}
            className={`ribbon-tab ${props.activeTab === t ? 'active' : ''} ${t === 'AI Analyst' ? 'ai-tab' : ''}`}
            onClick={() => props.onTabChange(t)}
          >
            {t === 'AI Analyst' && (
              <span className={`ai-tab-dot ${props.aiProcessing ? 'processing' : ''}`} />
            )}
            {t}
          </button>
        ))}
        <div className="ribbon-spacer" />
        <div className="ribbon-tabs-right">
          <button className="ribbon-tab-right">{I.search}</button>
          <button className="ribbon-tab-right">{I.bell}</button>
          <button className="ribbon-tab-right">{I.dots}</button>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <div className="ribbon-toolbar">
        {props.activeTab === 'File' && (
          <FileRibbon
            onNew={props.onNewWorkbook}
            onImport={props.onImport}
            onExportExcel={props.onExportExcel}
            onExportHTML={props.onExportHTML}
            onPrint={props.onPrint}
          />
        )}
        {props.activeTab === 'Home' && <HomeRibbon {...props} />}
        {props.activeTab === 'Insert' && <InsertRibbon />}
        {props.activeTab === 'Draw' && <DrawRibbon />}
        {props.activeTab === 'Page Layout' && <PageLayoutRibbon />}
        {props.activeTab === 'Formulas' && <FormulasRibbon />}
        {props.activeTab === 'Data' && <DataRibbon {...props} />}
        {props.activeTab === 'Review' && <ReviewRibbon {...props} />}
        {props.activeTab === 'View' && <ViewRibbon {...props} />}
        {props.activeTab === 'AI Analyst' && <AIAnalystRibbon {...props} />}
      </div>

      <style>{`
        .ribbon {
          grid-area: ribbon;
          background: var(--bg-ribbon);
          border-bottom: 1px solid var(--border-ribbon);
          display: flex;
          flex-direction: column;
          grid-column: 1 / -1;
        }
        .ribbon-tabs {
          display: flex;
          align-items: center;
          padding: 0;
          background: var(--bg-ribbon);
          border-bottom: 1px solid var(--border-ribbon);
          min-height: 36px;
        }
        .logo-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          height: 36px;
          border-right: 1px solid var(--border-ribbon);
          cursor: default;
        }
        .ribbon-tab {
          padding: 0 16px;
          height: 36px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-ribbon);
          cursor: pointer;
          position: relative;
          transition: background 0.12s;
          user-select: none;
          border: none;
          background: transparent;
          font-family: var(--font-sans);
        }
        .ribbon-tab:hover { background: var(--bg-grid-hover); }
        .ribbon-tab.active { color: var(--text-ribbon-active); font-weight: 600; }
        .ribbon-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 16px;
          right: 16px;
          height: 2.5px;
          background: var(--text-ribbon-active);
          border-radius: 2px 2px 0 0;
        }
        .ribbon-tab.ai-tab.active { color: var(--accent); }
        .ribbon-tab.ai-tab.active::after { background: var(--accent); }
        .ai-tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }
        .ai-tab-dot.processing {
          animation: pulse 1s ease-in-out infinite;
        }
        .ribbon-spacer { flex: 1; }
        .ribbon-tabs-right {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
        }
        .ribbon-tab-right {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          background: transparent;
          border: none;
          font-family: var(--font-sans);
          transition: all 0.12s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ribbon-tab-right:hover { background: var(--bg-grid-hover); color: var(--text-primary); }
        .ribbon-toolbar {
          display: flex;
          align-items: stretch;
          padding: 8px 12px;
          background: var(--bg-ribbon);
          min-height: 72px;
          gap: 4px;
          overflow-x: auto;
        }
        .ribbon-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 8px;
          border-right: 1px solid var(--border-ribbon);
          position: relative;
          min-width: 0;
        }
        .ribbon-group:last-child { border-right: none; }
        .ribbon-group-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          font-weight: 500;
          color: var(--text-tertiary);
          padding: 2px 0;
          border-top: 1px solid var(--border-light);
        }
        .ribbon-group-content {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          padding: 4px 0;
        }
        .ribbon-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.12s;
          background: transparent;
          border: none;
          font-family: var(--font-sans);
          min-width: 44px;
        }
        .ribbon-btn:hover { background: var(--bg-grid-hover); }
        .ribbon-btn:active { background: var(--accent-bg); }
        .ribbon-btn.active { background: var(--accent-bg); outline: 1px solid var(--accent); }
        .ribbon-btn svg { width: 20px; height: 20px; color: var(--text-secondary); }
        .ribbon-btn:hover svg { color: var(--text-primary); }
        .ribbon-btn span { font-size: 10.5px; font-weight: 500; color: var(--text-secondary); white-space: nowrap; }
        .ribbon-btn:hover span { color: var(--text-primary); }
        .ribbon-btn-paste {
          flex-direction: column;
          padding: 4px 12px;
          min-width: 52px;
        }
        .ribbon-btn-paste svg { width: 28px; height: 28px; color: var(--accent); }
        .ribbon-btn-sm { min-width: 32px; padding: 4px; }
        .ribbon-btn-sm svg { width: 16px; height: 16px; }
        .ribbon-select {
          padding: 3px 6px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 11px;
          font-family: var(--font-sans);
          background: #fff;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
        }
        .ribbon-select:focus { border-color: var(--accent); }
        .ribbon-checkbox {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
        }
        .ribbon-checkbox input[type="checkbox"] {
          accent-color: var(--accent);
          width: 12px;
          height: 12px;
        }
        .mono-sm { font-size: 11px; font-weight: 600; font-family: var(--font-mono); color: var(--text-secondary); }
        .ribbon-separator {
          width: 1px;
          background: var(--border-ribbon);
          margin: 4px 4px;
          align-self: stretch;
        }
        .ai-spin {
          display: inline-flex;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
