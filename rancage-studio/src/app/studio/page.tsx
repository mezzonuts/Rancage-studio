'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BYOKProvider } from '@/lib/byok';
import { BYOKManager } from '@/components/BYOKManager';
import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { Ribbon } from '@/components/Ribbon';
import { FormulaBar } from '@/components/FormulaBar';
import { AiPanel } from '@/components/AiPanel';
import { UploadModal } from '@/components/UploadModal';
import { ErrorBoundary } from '@/lib/a11y';
import { createDefaultDashboard, type DashboardState } from '@/lib/dashboard/types';
import { loadDashboards, saveDashboard } from '@/lib/dashboard/store';
import { exportToExcel } from '@/lib/export/excel';
import { buildStandaloneHTML } from '@/lib/export/html';
import { gridToExcelExport, dashboardToHTMLConfig } from '@/lib/integration';
import { getDuckDBClient } from '@/lib/duckdb/client';
import {
  addRow as gridAddRow,
  removeRow as gridRemoveRow,
  addColumn as gridAddCol,
  removeColumn as gridRemoveCol,
} from '@/lib/grid/store';
import type { CellValue } from '@/lib/grid/types';
import type { CellFormat, CellRange, GridState } from '@/lib/grid/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function cellRef(row: number, col: number): string {
  let r = '';
  let n = col;
  while (n >= 0) {
    r = String.fromCharCode(65 + (n % 26)) + r;
    n = Math.floor(n / 26) - 1;
  }
  return `${r}${row + 1}`;
}

function parseRef(ref: string): { row: number; col: number } | null {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]!) {
    col = col * 26 + (ch.charCodeAt(0) - 64);
  }
  return { row: parseInt(m[2]!) - 1, col: col - 1 };
}

function normalizeRange(r: CellRange): CellRange {
  return {
    start: {
      row: Math.min(r.start.row, r.end.row),
      col: Math.min(r.start.col, r.end.col),
    },
    end: {
      row: Math.max(r.start.row, r.end.row),
      col: Math.max(r.start.col, r.end.col),
    },
  };
}

const SAMPLE_DATA: CellValue[][] = [
  ['Category', 'Q1 Actual', 'Q2 Actual', 'Q3 Actual', 'Q4 Forecast', 'YoY Growth'],
  ['Revenue', 245800, 312400, 289100, 341200, '+18.4%'],
  ['COGS', 98320, 124960, 115640, 136480, '-2.1%'],
  ['Gross Profit', 147480, 187440, 173460, 204720, '+24.7%'],
  ['OpEx', 62400, 71200, 68900, 74500, '-1.3%'],
  ['Net Income', 85080, 116240, 104560, 130220, '+31.2%'],
  ['EBITDA Margin', '39.2%', '42.8%', '41.5%', '43.7%', '+2.5pp'],
  ['Cash Flow', 72100, 98400, 89200, 112800, '+22.1%'],
  ['Headcount', 12, 14, 16, 18, '—'],
  ['Revenue / Employee', 20483, 22314, 18069, 18956, '-4.7%'],
];

export type ViewMode = 'spreadsheets' | 'dashboards';
export type AIPanelTab = 'Chat' | 'Replays' | 'Templates' | 'Scripts' | 'Settings';

export default function StudioPage() {
  const [activeRibbonTab, setActiveRibbonTab] = useState('Home');
  const [showUpload, setShowUpload] = useState(false);
  const [showBYOK, setShowBYOK] = useState(false);
  const [gridData, setGridData] = useState<CellValue[][]>(SAMPLE_DATA);
  // Multi-sheet support: key=sheet name, value=grid data
  const [sheets, setSheets] = useState<Record<string, CellValue[][]>>({ 'Sheet1': SAMPLE_DATA });
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [selectedCell, setSelectedCell] = useState<string | null>('A1');
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('spreadsheets');
  const [dashboard, setDashboard] = useState<DashboardState>(() => {
    const saved = loadDashboards();
    return saved.length > 0 ? saved[0]! : createDefaultDashboard();
  });

  // AI Chat panel
  const [chatOpen, setChatOpen] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiPanelTab, setAiPanelTab] = useState<AIPanelTab>('Chat');

  // View settings
  const [zoom, setZoom] = useState(100);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [showHeadings, setShowHeadings] = useState(true);
  const [filterMode, setFilterMode] = useState(false);
  const [numberFormat, setNumberFormat] = useState('General');

  // Per-cell formatting: key = "A1", value = CellFormat
  const [cellFormats, setCellFormats] = useState<Record<string, CellFormat>>({});

  // Ribbon sync — reflects the currently selected cell's format
  const [ribbonBold, setRibbonBold] = useState(false);
  const [ribbonItalic, setRibbonItalic] = useState(false);
  const [ribbonUnderline, setRibbonUnderline] = useState(false);
  const [ribbonStrike, setRibbonStrike] = useState(false);
  const [ribbonAlign, setRibbonAlign] = useState<'left' | 'center' | 'right'>('left');
  const [ribbonFont, setRibbonFont] = useState('Inter');
  const [ribbonFontSize, setRibbonFontSize] = useState(13);

  // Clipboard
  const clipboardRef = useRef<{ data: CellValue[][]; cut: boolean; range: CellRange } | null>(null);

  // Find dialog
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState<{ row: number; col: number }[]>([]);
  const [findIdx, setFindIdx] = useState(0);

  useEffect(() => {
    saveDashboard(dashboard);
  }, [dashboard]);

  // Auto-load existing DuckDB tables
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = getDuckDBClient();
        if (!client.ready) return;
        const tables = await client.getTables();
        if (cancelled || tables.length === 0) return;
        const tableName = tables[tables.length - 1]!;
        const result = await client.query(`SELECT * FROM "${tableName}" LIMIT 1000`);
        if (cancelled) return;
        const headerRow: CellValue[] = result.columns.map(String);
        const dataRows: CellValue[][] = result.rows.map((r) =>
          r.map((v): CellValue => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
            return String(v);
          }),
        );
        setGridData([headerRow, ...dataRows]);
      } catch {
        // DuckDB not ready
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Formatting handlers ─────────────────────────────────
  const handleFormatChange = useCallback(
    (range: CellRange, format: Partial<CellFormat>) => {
      const nr = normalizeRange(range);
      setCellFormats((prev) => {
        const next = { ...prev };
        for (let r = nr.start.row; r <= nr.end.row; r++) {
          for (let c = nr.start.col; c <= nr.end.col; c++) {
            const ref = cellRef(r, c);
            next[ref] = { ...next[ref], ...format };
          }
        }
        return next;
      });
      // Sync ribbon from the anchor cell
      if (selectedCell) {
        const f = cellFormats[selectedCell];
        if (f) {
          if (format.bold !== undefined) setRibbonBold(format.bold);
          if (format.italic !== undefined) setRibbonItalic(format.italic);
          if (format.underline !== undefined) setRibbonUnderline(format.underline);
          if (format.strikethrough !== undefined) setRibbonStrike(format.strikethrough);
          if (format.textAlign !== undefined) setRibbonAlign(format.textAlign);
          if (format.fontFamily !== undefined) setRibbonFont(format.fontFamily);
          if (format.fontSize !== undefined) setRibbonFontSize(format.fontSize);
        }
      }
    },
    [selectedCell, cellFormats],
  );

  const handleSelectionFormat = useCallback(
    (fmt: CellFormat | null) => {
      setRibbonBold(fmt?.bold ?? false);
      setRibbonItalic(fmt?.italic ?? false);
      setRibbonUnderline(fmt?.underline ?? false);
      setRibbonStrike(fmt?.strikethrough ?? false);
      setRibbonAlign(fmt?.textAlign ?? 'left');
      setRibbonFont(fmt?.fontFamily ?? 'Inter');
      setRibbonFontSize(fmt?.fontSize ?? 13);
    },
    [],
  );

  // ─── Grid data change ────────────────────────────────────
  const handleGridChange = useCallback((data: CellValue[][]) => {
    setGridData(data);
    // Sync current grid back to active sheet
    setSheets((prev) => ({ ...prev, [activeSheet]: data }));
  }, [activeSheet]);
  const handleDashboardChange = useCallback((d: DashboardState) => setDashboard(d), []);

  // ─── Sheet helpers ─────────────────────────────────────────
  const parseSheet = useCallback((rows: unknown[][]): CellValue[][] => {
    if (rows.length === 0) return [[]];
    const headerRow: CellValue[] = (rows[0]!).map((v) =>
      v === null || v === undefined ? null : String(v),
    );
    const dataRows: CellValue[][] = rows.slice(1).map((r) =>
      headerRow.map((_, i) => {
        const v = r[i];
        if (v === null || v === undefined) return null;
        if (typeof v === 'number' || typeof v === 'boolean') return v;
        return String(v);
      }),
    );
    return [headerRow, ...dataRows];
  }, []);

  const switchSheet = useCallback(
    (name: string) => {
      if (name === activeSheet) return;
      // Save current grid back to active sheet
      setSheets((prev) => ({ ...prev, [activeSheet]: gridData }));
      setActiveSheet(name);
      setGridData(sheets[name] ?? [[]]);
      setSelectedCell('A1');
      setSelectedRange(null);
      setCellFormats({});
    },
    [activeSheet, gridData, sheets],
  );

  const addSheet = useCallback(() => {
    const existing = Object.keys(sheets);
    let idx = existing.length + 1;
    while (existing.includes(`Sheet${idx}`)) idx++;
    const name = `Sheet${idx}`;
    const newData = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => null),
    );
    setSheets((prev) => ({ ...prev, [name]: newData }));
    switchSheet(name);
  }, [sheets, switchSheet]);

  // ─── Upload ──────────────────────────────────────────────
  const handleFilesSelected = useCallback(async (files: File[]) => {
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();

      // XLSX: parse client-side with SheetJS, skip DuckDB
      if (ext === 'xlsx' || ext === 'xls') {
        const XLSX = await import('xlsx');
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        if (wb.SheetNames.length === 0) throw new Error('Excel file has no sheets');
        const allSheets: Record<string, CellValue[][]> = {};
        for (const name of wb.SheetNames) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[name]!, {
            header: 1,
            defval: null,
          }) as unknown[][];
          allSheets[name] = parseSheet(rows);
        }
        const firstSheetName = wb.SheetNames[0]!;
        setSheets(allSheets);
        setActiveSheet(firstSheetName);
        setGridData(allSheets[firstSheetName]!);
        setCellFormats({});
        setViewMode('spreadsheets');
        return;
      }

      // CSV / Parquet: use DuckDB-Wasm
      const client = getDuckDBClient();
      const buf = await file.arrayBuffer();
      await client.registerFile(file.name, buf, ext === 'parquet' ? 'parquet' : 'csv');
      const tables = await client.getTables();
      if (tables.length === 0) throw new Error('No tables created from uploaded files');
      const tableName = tables[tables.length - 1]!;
      const result = await client.query(`SELECT * FROM "${tableName}" LIMIT 1000`);
      const headerRow: CellValue[] = result.columns.map(String);
      const dataRows: CellValue[][] = result.rows.map((r) =>
        r.map((v): CellValue => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
          return String(v);
        }),
      );
      setGridData([headerRow, ...dataRows]);
      setCellFormats({});
      setViewMode('spreadsheets');
    }
  }, []);

  // ─── Export ──────────────────────────────────────────────
  const handleExcelExport = useCallback(async () => {
    const headerRow = gridData[0] as CellValue[] | undefined;
    const headers = headerRow?.map((v, i) => (v !== null ? String(v) : String.fromCharCode(65 + i))) ?? [];
    const rows = gridData.slice(1).map((r) => r.map((v) => v ?? ''));
    const blob = await exportToExcel(gridToExcelExport(headers, rows));
    downloadBlob(blob, 'RancageExport.xlsx');
  }, [gridData]);

  const handleHTMLExport = useCallback(() => {
    const htmlConfig = dashboardToHTMLConfig(dashboard, new Map());
    const blob = new Blob([buildStandaloneHTML(htmlConfig)], { type: 'text/html' });
    downloadBlob(blob, 'RancageDashboard.html');
  }, [dashboard]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  // ─── Sort ────────────────────────────────────────────────
  const handleSortAsc = useCallback(() => {
    if (!selectedCell) return;
    const colIdx = parseRef(selectedCell)?.col ?? 0;
    const header = gridData[0]!;
    const body = gridData.slice(1);
    body.sort((a, b) => {
      const va = a[colIdx];
      const vb = b[colIdx];
      const na = typeof va === 'number' ? va : parseFloat(String(va)) || 0;
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb)) || 0;
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(va ?? '').localeCompare(String(vb ?? ''));
    });
    setGridData([header, ...body]);
  }, [selectedCell, gridData]);

  const handleSortDesc = useCallback(() => {
    if (!selectedCell) return;
    const colIdx = parseRef(selectedCell)?.col ?? 0;
    const header = gridData[0]!;
    const body = gridData.slice(1);
    body.sort((a, b) => {
      const va = a[colIdx];
      const vb = b[colIdx];
      const na = typeof va === 'number' ? va : parseFloat(String(va)) || 0;
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb)) || 0;
      if (!isNaN(na) && !isNaN(nb)) return nb - na;
      return String(vb ?? '').localeCompare(String(va ?? ''));
    });
    setGridData([header, ...body]);
  }, [selectedCell, gridData]);

  // ─── Remove Duplicates ───────────────────────────────────
  const handleRemoveDuplicates = useCallback(() => {
    const seen = new Set<string>();
    const unique: CellValue[][] = [gridData[0]!];
    for (let i = 1; i < gridData.length; i++) {
      const key = JSON.stringify(gridData[i]);
      if (!seen.has(key)) { seen.add(key); unique.push(gridData[i]!); }
    }
    setGridData(unique);
  }, [gridData]);

  // ─── Clipboard ───────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (!selectedRange) return;
    const nr = normalizeRange(selectedRange);
    const rows: CellValue[][] = [];
    for (let r = nr.start.row; r <= nr.end.row; r++) {
      const row: CellValue[] = [];
      for (let c = nr.start.col; c <= nr.end.col; c++) {
        row.push(gridData[r]?.[c] ?? null);
      }
      rows.push(row);
    }
    clipboardRef.current = { data: rows, cut: false, range: nr };
    // Also copy to system clipboard as TSV
    const tsv = rows.map((r) => r.map((v) => (v === null ? '' : String(v))).join('\t')).join('\n');
    navigator.clipboard?.writeText(tsv).catch(() => {});
  }, [selectedRange, gridData]);

  const handleCut = useCallback(() => {
    if (!selectedRange) return;
    handleCopy();
    // Clear source cells
    const nr = normalizeRange(selectedRange);
    const newData = gridData.map((r) => [...r]);
    for (let r = nr.start.row; r <= nr.end.row; r++) {
      for (let c = nr.start.col; c <= nr.end.col; c++) {
        if (newData[r]) newData[r]![c] = null;
      }
    }
    setGridData(newData);
  }, [selectedRange, gridData, handleCopy]);

  const handlePaste = useCallback(async () => {
    if (!selectedCell) return;
    const pos = parseRef(selectedCell);
    if (!pos) return;

    // Try system clipboard first
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const lines = text.split('\n').filter((l) => l.length > 0);
        const newData = gridData.map((r) => [...r]);
        for (let r = 0; r < lines.length; r++) {
          const cells = lines[r]!.split('\t');
          for (let c = 0; c < cells.length; c++) {
            const dr = pos.row + r;
            const dc = pos.col + c;
            if (!newData[dr]) continue;
            let v: CellValue = cells[c] ?? '';
            if (v !== '' && !isNaN(Number(v))) v = Number(v);
            newData[dr]![dc] = v;
          }
        }
        setGridData(newData);
        return;
      }
    } catch {
      // Fallback to internal clipboard
    }

    // Internal clipboard
    if (clipboardRef.current) {
      const { data: clipData, range: clipRange } = clipboardRef.current;
      const newData = gridData.map((r) => [...r]);
      for (let r = 0; r < clipData.length; r++) {
        for (let c = 0; c < clipData[r]!.length; c++) {
          const dr = pos.row + r;
          const dc = pos.col + c;
          if (!newData[dr]) continue;
          newData[dr]![dc] = clipData[r]![c] ?? null;
        }
      }
      setGridData(newData);
    }
  }, [selectedCell, gridData]);

  // ─── Insert / Delete Row / Col ──────────────────────────
  const getGridState = useCallback((): GridState => {
    return {
      data: gridData,
      rowCount: gridData.length,
      colCount: Math.max(...gridData.map((r) => r.length), 0),
      columnWidths: Array(Math.max(...gridData.map((r) => r.length), 0)).fill(100),
      selectedRange: null,
      editingCell: null,
      editValue: '',
    };
  }, [gridData]);

  const handleInsertRowAbove = useCallback(() => {
    const pos = parseRef(selectedCell ?? 'A1');
    if (!pos) return;
    const gs = getGridState();
    const ng = gridAddRow(gs, pos.row);
    setGridData(ng.data);
  }, [selectedCell, getGridState]);

  const handleInsertRowBelow = useCallback(() => {
    const pos = parseRef(selectedCell ?? 'A1');
    if (!pos) return;
    const gs = getGridState();
    const ng = gridAddRow(gs, pos.row + 1);
    setGridData(ng.data);
  }, [selectedCell, getGridState]);

  const handleDeleteRow = useCallback(() => {
    const pos = parseRef(selectedCell ?? 'A1');
    if (!pos) return;
    const gs = getGridState();
    const ng = gridRemoveRow(gs, pos.row);
    setGridData(ng.data);
  }, [selectedCell, getGridState]);

  const handleInsertColLeft = useCallback(() => {
    const pos = parseRef(selectedCell ?? 'A1');
    if (!pos) return;
    const gs = getGridState();
    const ng = gridAddCol(gs, pos.col);
    setGridData(ng.data);
  }, [selectedCell, getGridState]);

  const handleInsertColRight = useCallback(() => {
    const pos = parseRef(selectedCell ?? 'A1');
    if (!pos) return;
    const gs = getGridState();
    const ng = gridAddCol(gs, pos.col + 1);
    setGridData(ng.data);
  }, [selectedCell, getGridState]);

  const handleDeleteCol = useCallback(() => {
    const pos = parseRef(selectedCell ?? 'A1');
    if (!pos) return;
    const gs = getGridState();
    const ng = gridRemoveCol(gs, pos.col);
    setGridData(ng.data);
  }, [selectedCell, getGridState]);

  // ─── Find ────────────────────────────────────────────────
  const handleFind = useCallback(() => {
    setShowFind(true);
    setFindQuery('');
    setFindResults([]);
    setFindIdx(0);
  }, []);

  const runFind = useCallback(
    (q: string) => {
      setFindQuery(q);
      if (!q) { setFindResults([]); return; }
      const lower = q.toLowerCase();
      const results: { row: number; col: number }[] = [];
      for (let r = 0; r < gridData.length; r++) {
        for (let c = 0; c < (gridData[r]?.length ?? 0); c++) {
          const val = gridData[r]?.[c];
          if (val !== null && val !== undefined && String(val).toLowerCase().includes(lower)) {
            results.push({ row: r, col: c });
          }
        }
      }
      setFindResults(results);
      setFindIdx(0);
      if (results.length > 0) {
        const f = results[0]!;
        setSelectedCell(cellRef(f.row, f.col));
      }
    },
    [gridData],
  );

  const handleFindNext = useCallback(() => {
    if (findResults.length === 0) return;
    const next = (findIdx + 1) % findResults.length;
    setFindIdx(next);
    const f = findResults[next]!;
    setSelectedCell(cellRef(f.row, f.col));
  }, [findResults, findIdx]);

  const handleFindPrev = useCallback(() => {
    if (findResults.length === 0) return;
    const prev = (findIdx - 1 + findResults.length) % findResults.length;
    setFindIdx(prev);
    const f = findResults[prev]!;
    setSelectedCell(cellRef(f.row, f.col));
  }, [findResults, findIdx]);

  // ─── New Workbook ────────────────────────────────────────
  const handleNewWorkbook = useCallback(() => {
    const empty = Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => null));
    setGridData(empty);
    setSheets({ 'Sheet1': empty });
    setActiveSheet('Sheet1');
    setCellFormats({});
    setViewMode('spreadsheets');
  }, []);

  // ─── AI ──────────────────────────────────────────────────
  const handleAiSend = useCallback(() => {
    setAiProcessing(true);
    setTimeout(() => setAiProcessing(false), 2000);
  }, []);

  const toggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
    if (!chatOpen) setAiPanelTab('Chat');
  }, [chatOpen]);

  const handleAIAnalystAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'chat': toggleChat(); break;
        case 'replays': setChatOpen(true); setAiPanelTab('Replays'); break;
        case 'templates': setChatOpen(true); setAiPanelTab('Templates'); break;
        case 'scripts': setChatOpen(true); setAiPanelTab('Scripts'); break;
        case 'settings': setShowBYOK(true); break;
        case 'dashboard': setViewMode('dashboards' as ViewMode); break;
        case 'ai-column': break;
        case 'ai-forecast': break;
      }
    },
    [toggleChat],
  );

  const currentFormula =
    gridData[0] && selectedCell
      ? (() => {
          const pos = parseRef(selectedCell);
          if (!pos) return '';
          const val = gridData[pos.row]?.[pos.col];
          return val !== null && val !== undefined ? String(val) : '';
        })()
      : '';

  const rowCount = gridData.length;
  const colCount = Math.max(...gridData.map((r) => r.length), 0);

  return (
    <BYOKProvider>
      <div className="app">
        {/* RIBBON */}
        <Ribbon
          activeTab={activeRibbonTab}
          onTabChange={setActiveRibbonTab}
          onExportExcel={handleExcelExport}
          onExportHTML={handleHTMLExport}
          onPrint={handlePrint}
          onImport={() => setShowUpload(true)}
          onNewWorkbook={handleNewWorkbook}
          onSortAsc={handleSortAsc}
          onSortDesc={handleSortDesc}
          onRemoveDuplicates={handleRemoveDuplicates}
          toggleFilter={() => setFilterMode(!filterMode)}
          filterActive={filterMode}
          zoom={zoom}
          onZoomChange={setZoom}
          showGridlines={showGridlines}
          onToggleGridlines={() => setShowGridlines(!showGridlines)}
          showFormulaBar={showFormulaBar}
          onToggleFormulaBar={() => setShowFormulaBar(!showFormulaBar)}
          showHeadings={showHeadings}
          onToggleHeadings={() => setShowHeadings(!showHeadings)}
          bold={ribbonBold}
          onToggleBold={() => {
            if (!selectedCell || !selectedRange) return;
            const newB = !ribbonBold;
            setRibbonBold(newB);
            handleFormatChange(selectedRange, { bold: newB });
          }}
          italic={ribbonItalic}
          onToggleItalic={() => {
            if (!selectedCell || !selectedRange) return;
            const v = !ribbonItalic;
            setRibbonItalic(v);
            handleFormatChange(selectedRange, { italic: v });
          }}
          underline={ribbonUnderline}
          onToggleUnderline={() => {
            if (!selectedCell || !selectedRange) return;
            const v = !ribbonUnderline;
            setRibbonUnderline(v);
            handleFormatChange(selectedRange, { underline: v });
          }}
          strikethrough={ribbonStrike}
          onToggleStrikethrough={() => {
            if (!selectedCell || !selectedRange) return;
            const v = !ribbonStrike;
            setRibbonStrike(v);
            handleFormatChange(selectedRange, { strikethrough: v });
          }}
          textAlign={ribbonAlign}
          onTextAlignChange={(a) => {
            if (!selectedRange) return;
            setRibbonAlign(a);
            handleFormatChange(selectedRange, { textAlign: a });
          }}
          fontFamily={ribbonFont}
          onFontFamilyChange={(f) => {
            if (!selectedRange) return;
            setRibbonFont(f);
            handleFormatChange(selectedRange, { fontFamily: f });
          }}
          fontSize={ribbonFontSize}
          onFontSizeChange={(s) => {
            if (!selectedRange) return;
            setRibbonFontSize(s);
            handleFormatChange(selectedRange, { fontSize: s });
          }}
          numberFormat={numberFormat}
          onNumberFormatChange={setNumberFormat}
          chatOpen={chatOpen}
          aiProcessing={aiProcessing}
          onAIAnalystAction={handleAIAnalystAction}
          onToggleChat={toggleChat}
          viewMode={viewMode}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onInsertRowAbove={handleInsertRowAbove}
          onInsertRowBelow={handleInsertRowBelow}
          onDeleteRow={handleDeleteRow}
          onInsertColLeft={handleInsertColLeft}
          onInsertColRight={handleInsertColRight}
          onDeleteCol={handleDeleteCol}
          onFind={handleFind}
        />

        {/* FORMULA BAR */}
        {showFormulaBar && <FormulaBar selectedCell={selectedCell} formula={currentFormula} />}

        {/* CONTENT */}
        <main className="content" style={{ '--zoom': `${zoom / 100}` } as React.CSSProperties}>
          <div
            className="grid-container"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`,
            }}
          >
            <ErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center">
                  <p style={{ color: 'var(--danger)', fontSize: 13 }}>Something went wrong. Refresh to retry.</p>
                </div>
              }
            >
              {viewMode === 'dashboards' ? (
                <div style={{ padding: 16, height: '100%' }}>
                  <DashboardCanvas dashboard={dashboard} onDashboardChange={handleDashboardChange} />
                </div>
              ) : (
                <SpreadsheetGrid
                  data={gridData}
                  onDataChange={handleGridChange}
                  onCellSelect={(ref) => {
                    setSelectedCell(ref);
                    const p = parseRef(ref);
                    if (p) {
                      setSelectedRange({ start: p, end: p });
                      const fmt = cellFormats[ref];
                      handleSelectionFormat(fmt ?? null);
                    }
                  }}
                  className="h-full"
                  showGridlines={showGridlines}
                  showHeadings={showHeadings}
                  cellFormats={cellFormats}
                  onFormatChange={handleFormatChange}
                  onSelectionFormat={handleSelectionFormat}
                />
              )}
            </ErrorBoundary>
          </div>
          {/* Sheet Tabs */}
          {Object.keys(sheets).length > 0 && (
            <div className="sheet-tabs">
              <div className="sheet-tabs-list">
                {Object.keys(sheets).map((name) => (
                  <button
                    key={name}
                    className={`sheet-tab ${name === activeSheet ? 'active' : ''}`}
                    onClick={() => switchSheet(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <button className="sheet-tab-add" onClick={addSheet} title="New Sheet">+</button>
            </div>
          )}

          <div className="status-bar">
            <div className="status-left">
              <span className="status-pill ai">
                <span className={`status-dot ${aiProcessing ? 'processing' : ''}`} />
                {aiProcessing ? 'AI Processing...' : 'AI Analyst Active'}
              </span>
              <span>{rowCount} rows × {colCount} cols</span>
              {filterMode && <span className="status-pill filter-active">Filter On</span>}
            </div>
            <span>Autosaved 2 min ago</span>
          </div>
        </main>

        {/* AI PANEL */}
        <div className={`ai-panel-wrapper ${chatOpen ? 'open' : 'closed'}`}>
          <AiPanel
            onSend={handleAiSend}
            aiConnected={false}
            chatOpen={chatOpen}
            onClose={toggleChat}
            aiProcessing={aiProcessing}
            activeTab={aiPanelTab}
            onTabChange={setAiPanelTab}
          />
        </div>

        {/* BYOK Settings */}
        {showBYOK && (
          <div className="byok-overlay" onClick={() => setShowBYOK(false)}>
            <div className="byok-panel" onClick={(e) => e.stopPropagation()}>
              <BYOKManager />
            </div>
          </div>
        )}

        {/* FIND DIALOG */}
        {showFind && (
          <div className="find-overlay" onClick={() => setShowFind(false)}>
            <div className="find-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="find-header">
                <span>Find & Replace</span>
                <button className="find-close" onClick={() => setShowFind(false)}>×</button>
              </div>
              <div className="find-body">
                <input
                  className="find-input"
                  placeholder="Find..."
                  value={findQuery}
                  onChange={(e) => runFind(e.target.value)}
                  autoFocus
                />
                <div className="find-nav">
                  <button onClick={handleFindPrev}>◀</button>
                  <span>{findResults.length > 0 ? `${findIdx + 1}/${findResults.length}` : 'No results'}</span>
                  <button onClick={handleFindNext}>▶</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD MODAL */}
        <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onFilesSelected={handleFilesSelected} />
      </div>

      <style>{`
        .app {
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: auto auto 1fr;
          grid-template-areas:
            "ribbon  panel"
            "formula panel"
            "content panel";
          height: 100vh;
          overflow: hidden;
        }
        .content {
          grid-area: content;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .grid-container {
          flex: 1;
          overflow: auto;
          background: var(--bg-surface);
        }
        .ai-panel-wrapper {
          grid-area: panel;
          overflow: hidden;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        }
        .ai-panel-wrapper.open { width: 380px; opacity: 1; }
        .ai-panel-wrapper.closed { width: 0; opacity: 0; pointer-events: none; }
        .status-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 16px; border-top: 1px solid var(--border-light);
          background: var(--bg-surface); font-size: 12px; color: var(--text-tertiary); flex-shrink: 0;
        }
        .sheet-tabs {
          display: flex; align-items: center; gap: 0;
          border-top: 1px solid var(--border-light);
          background: var(--bg-surface); flex-shrink: 0;
        }
        .sheet-tabs-list {
          display: flex; overflow-x: auto; flex: 1;
        }
        .sheet-tab {
          padding: 6px 16px; border: none; background: transparent;
          font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; border-right: 1px solid var(--border-light);
          white-space: nowrap; transition: all 0.15s;
        }
        .sheet-tab:hover { background: var(--bg-grid-hover); }
        .sheet-tab.active {
          background: var(--accent-bg); color: var(--accent);
          border-bottom: 2px solid var(--accent);
        }
        .sheet-tab-add {
          width: 32px; height: 28px; border: none; background: transparent;
          font-size: 16px; font-weight: 600; color: var(--text-secondary);
          cursor: pointer; transition: all 0.15s; flex-shrink: 0;
        }
        .sheet-tab-add:hover { background: var(--bg-grid-hover); color: var(--accent); }
        .status-left { display: flex; gap: 16px; align-items: center; }
        .status-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-weight: 500; }
        .status-pill.ai { background: var(--accent-bg); color: var(--accent); }
        .status-pill.filter-active { background: var(--warning-bg); color: #b8860b; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .status-dot.processing { animation: pulse 1s ease-in-out infinite; }
        .byok-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 90;
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 120px; backdrop-filter: blur(2px);
        }
        .byok-panel {
          background: var(--bg-surface); border-radius: 16px; box-shadow: var(--shadow-xl);
          width: 560px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
        }
        .find-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.15); z-index: 80;
          display: flex; align-items: flex-start; justify-content: center; padding-top: 80px;
        }
        .find-dialog {
          background: var(--bg-surface); border-radius: 12px; box-shadow: var(--shadow-xl);
          width: 400px; max-width: 90vw; overflow: hidden;
        }
        .find-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; border-bottom: 1px solid var(--border-light);
          font-size: 13px; font-weight: 600;
        }
        .find-close {
          width: 24px; height: 24px; border-radius: 6px; border: none; background: transparent;
          font-size: 18px; cursor: pointer; color: var(--text-secondary);
        }
        .find-close:hover { background: var(--bg-grid-hover); }
        .find-body { padding: 16px; display: flex; gap: 8px; align-items: center; }
        .find-input {
          flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
          font-size: 13px; outline: none; font-family: var(--font-sans);
        }
        .find-input:focus { border-color: var(--accent); }
        .find-nav { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
        .find-nav button {
          width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
          background: transparent; cursor: pointer; font-size: 12px;
        }
        .find-nav button:hover { background: var(--bg-grid-hover); }
        @media (max-width: 900px) {
          .app { grid-template-columns: 1fr; }
          .ai-panel-wrapper { display: none; }
        }
        @media print {
          .app { display: block !important; }
          .ribbon, .formula-area, .ai-panel-wrapper, .status-bar, .byok-overlay, .find-overlay { display: none !important; }
          .content { overflow: visible !important; }
          .grid-container { overflow: visible !important; transform: none !important; width: 100% !important; }
          body { overflow: visible !important; height: auto !important; }
        }
      `}</style>
    </BYOKProvider>
  );
}
