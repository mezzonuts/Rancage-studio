'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BYOKProvider } from '@/lib/byok';
import { MUIThemeProvider } from '@/lib/mui';
import { BYOKManager } from '@/components/BYOKManager';
import { FormulaBar } from '@/components/FormulaBar';
import { UploadModal } from '@/components/UploadModal';
import { ErrorBoundary } from '@/lib/a11y';
import { AuthGuard } from '@/lib/auth/guard';
import {
  StudioHeader,
  StudioGrid,
  StudioSidebar,
  StudioAiPanel,
  StudioFooter,
} from './components';
import {
  useGridState,
  useClipboard,
  useFormatting,
  useRowsCols,
  useKeyboard,
} from './hooks';
import { SAMPLE_DATA } from './utils/constants';
import type {
  CellValue,
  CellRange,
  CellFormat,
  DashboardState,
  ViewMode,
  AIPanelTab,
} from './utils/constants';

import { loadDashboards, saveDashboard, createDefaultDashboard } from '@/lib/dashboard/store';
import { getDuckDBClient } from '@/lib/duckdb/client';
import { cellRef, parseRef, colLetter, normalizeRange, createGridFromData } from '@/lib/grid/store';

export default function StudioPage() {
  const {
    grid,
    setGrid,
    cellFormats,
    setCellFormats,
    selectedCell,
    setSelectedCell,
    selectedRange,
    setSelectedRange,
    editingCell,
    setEditingCell,
    editingValue,
    setEditingValue,
    startEditing,
    commitEditing,
    cancelEditing,
    applyFormat: applyFormatFromHook,
    getCellFormat,
  } = useGridState(SAMPLE_DATA);

  const {
    copy,
    cut,
    paste,
    clearClipboard,
  } = useClipboard(grid.data, cellFormats, selectedRange, selectedCell, setGrid, applyFormatFromHook);

  const {
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    setTextAlign,
    setVerticalAlign,
    setWrapText,
    setFontFamily,
    setFontSize,
    setBgColor,
    setTextColor,
  } = useFormatting(cellFormats, setCellFormats, selectedRange);

  const {
    insertRowAbove,
    insertRowBelow,
    deleteRow,
    insertColLeft,
    insertColRight,
    deleteCol,
  } = useRowsCols(grid, setGrid);

  const {
    onKeyDown: handleKeyDown,
  } = useKeyboard(
    editingCell,
    selectedRange,
    cellFormats,
    applyFormatFromHook,
    commitEditing,
    cancelEditing,
    startEditing,
    (pos) => {
      const newGrid = grid.data.map((r) => [...r]);
      newGrid[pos.row]![pos.col] = null;
      setGrid({ ...grid, data: newGrid });
    },
  );

  const [activeRibbonTab, setActiveRibbonTab] = useState<'Home'>('Home');
  const [showUpload, setShowUpload] = useState(false);
  const [showBYOK, setShowBYOK] = useState(false);
  const [sheets, setSheets] = useState<Record<string, CellValue[][]>>({ 'Sheet1': SAMPLE_DATA });
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [viewMode, setViewMode] = useState<'spreadsheets' | 'dashboards'>('spreadsheets');
  const [dashboard, setDashboard] = useState<DashboardState>(() => {
    const saved = loadDashboards();
    return saved.length > 0 ? saved[0]! : createDefaultDashboard();
  });

  const [chatOpen, setChatOpen] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiPanelTab, setAiPanelTab] = useState<'Chat' | 'Replays' | 'Templates' | 'Scripts' | 'Settings'>('Chat');
  const [zoom, setZoom] = useState(100);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [showHeadings, setShowHeadings] = useState(true);
  const [filterMode, setFilterMode] = useState(false);
  const [ribbonNumberFormat, setRibbonNumberFormat] = useState('General');

  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [clipboardFormats, setClipboardFormats] = useState<Record<string, CellFormat>>({});

  const clipboardRef = useRef<{ data: CellValue[][]; cut: boolean; range: { start: { row: number; col: number }; end: { row: number; col: number } } } | null>(null);

  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState<{ row: number; col: number }[]>([]);
  const [findIdx, setFindIdx] = useState(0);

  useEffect(() => {
    saveDashboard(dashboard);
  }, [dashboard]);

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
        const headerRow = result.columns.map(String);
        const dataRows = result.rows.map((r) =>
          r.map((v): CellValue => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
            return String(v);
          }),
        );
        if (cancelled) return;
        setGrid(createGridFromData([headerRow, ...dataRows]));
      } catch {
        // DuckDB not ready
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleGridChange = useCallback((data: CellValue[][]) => {
    setGrid(data);
    setSheets((prev) => ({ ...prev, [activeSheet]: data }));
  }, [activeSheet, setGrid]);

  const handleDashboardChange = useCallback((d: DashboardState) => setDashboard(d), []);

  const handleSelectionFormat = useCallback(
    (fmt: CellFormat | null) => {
      if (!fmt) return;
      setRibbonBold(fmt?.bold ?? false);
      setRibbonItalic(fmt?.italic ?? false);
      setRibbonUnderline(fmt?.underline ?? false);
      setRibbonStrike(fmt?.strikethrough ?? false);
      setRibbonAlign(fmt?.textAlign ?? 'left');
      setRibbonVAlign(fmt?.verticalAlign ?? 'bottom');
      setRibbonWrap(fmt?.wrapText ?? false);
      setRibbonFont(fmt?.fontFamily ?? 'Inter');
      setRibbonFontSize(fmt?.fontSize ?? 13);
      setRibbonNumberFormat(fmt?.numberFormat ?? 'General');
    },
    [],
  );

  const [ribbonBold, setRibbonBold] = useState(false);
  const [ribbonItalic, setRibbonItalic] = useState(false);
  const [ribbonUnderline, setRibbonUnderline] = useState(false);
  const [ribbonStrike, setRibbonStrike] = useState(false);
  const [ribbonAlign, setRibbonAlign] = useState<'left' | 'center' | 'right'>('left');
  const [ribbonVAlign, setRibbonVAlign] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [ribbonWrap, setRibbonWrap] = useState(false);
  const [ribbonFont, setRibbonFont] = useState('Inter');
  const [ribbonFontSize, setRibbonFontSize] = useState(13);
  const startEditingCell = useCallback((pos: { row: number; col: number }) => {
    const val = grid.data[pos.row]?.[pos.col];
    setEditingCell(pos);
    setEditingValue(
      val === null || val === undefined ? '' : String(val),
    );
  }, [grid.data]);

  const onFormatChange = useCallback(
    (range: CellRange, format: Partial<CellFormat>) => {
      applyFormatFromHook(range, format);
      if (format.bold !== undefined) setRibbonBold(format.bold);
      if (format.italic !== undefined) setRibbonItalic(format.italic);
      if (format.underline !== undefined) setRibbonUnderline(format.underline);
      if (format.strikethrough !== undefined) setRibbonStrike(format.strikethrough);
      if (format.textAlign !== undefined) setRibbonAlign(format.textAlign);
      if (format.verticalAlign !== undefined) setRibbonVAlign(format.verticalAlign);
      if (format.wrapText !== undefined) setRibbonWrap(format.wrapText);
      if (format.fontFamily !== undefined) setRibbonFont(format.fontFamily);
      if (format.fontSize !== undefined) setRibbonFontSize(format.fontSize);
      if (format.numberFormat !== undefined) setRibbonNumberFormat(format.numberFormat);
    },
    [applyFormatFromHook],
  );

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
      if (format.bold !== undefined) setRibbonBold(format.bold);
      if (format.italic !== undefined) setRibbonItalic(format.italic);
      if (format.underline !== undefined) setRibbonUnderline(format.underline);
      if (format.strikethrough !== undefined) setRibbonStrike(format.strikethrough);
      if (format.textAlign !== undefined) setRibbonAlign(format.textAlign);
      if (format.verticalAlign !== undefined) setRibbonVAlign(format.verticalAlign);
      if (format.wrapText !== undefined) setRibbonWrap(format.wrapText);
      if (format.fontFamily !== undefined) setRibbonFont(format.fontFamily);
      if (format.fontSize !== undefined) setRibbonFontSize(format.fontSize);
      if (format.numberFormat !== undefined) setRibbonNumberFormat(format.numberFormat);
    },
    [setCellFormats],
  );

  function normalizeRange(range: CellRange) {
    const start = range.start;
    const end = range.end;
    return {
      start: { row: Math.min(start.row, end.row), col: Math.min(start.col, end.col) },
      end: { row: Math.max(start.row, end.row), col: Math.max(start.col, end.col) },
    };
  }

  return (
    <MUIThemeProvider>
      <BYOKProvider>
        <div className="app">
          <StudioSidebar
            activeNav={viewMode}
            onNavChange={setViewMode}
            onImportClick={() => setShowUpload(true)}
          />
          <div className="main-content">
            <StudioHeader
              activeRibbonTab={activeRibbonTab}
              onTabChange={setActiveRibbonTab}
              showFormulaBar={showFormulaBar}
              onToggleFormulaBar={() => setShowFormulaBar(!showFormulaBar)}
              showGridlines={showGridlines}
              onToggleGridlines={() => setShowGridlines(!showGridlines)}
              showHeadings={showHeadings}
              onToggleHeadings={() => setShowHeadings(!showHeadings)}
              zoom={zoom}
              onZoomChange={setZoom}
            />
            <div className="grid-area">
              <StudioGrid
                data={grid.data}
                onDataChange={setGrid}
                onCellSelect={setSelectedCell}
                cellFormats={cellFormats}
                onFormatChange={handleFormatChange}
                onSelectionFormat={handleSelectionFormat}
                selectedCell={selectedCell}
                selectedRange={selectedRange}
                showGridlines={showGridlines}
                showHeadings={showHeadings}
                showFormulaBar={showFormulaBar}
                zoom={zoom}
                formulaBarValue=""
                onFormulaBarChange={() => {}}
                onFormulaBarSubmit={() => {}}
                formatPainterActive={formatPainterActive}
                onFormatPainterClick={(ref) => {
                  if (formatPainterActive) {
                    const sourceFmt = cellFormats[selectedCell ?? ''];
                    if (sourceFmt) {
                      const nr = { start: parseRef(ref)!, end: parseRef(ref)! };
                      handleFormatChange(nr, sourceFmt);
                    }
                    setFormatPainterActive(false);
                  }
                }}
              />
            </div>
            <StudioFooter
              zoom={zoom}
              onZoomChange={setZoom}
              selectedCell={selectedCell}
              selectedRange={selectedRange}
              showGridlines={showGridlines}
              onToggleGridlines={() => setShowGridlines(!showGridlines)}
              showFormulaBar={showFormulaBar}
              onToggleFormulaBar={() => setShowFormulaBar(!showFormulaBar)}
              showHeadings={showHeadings}
              onToggleHeadings={() => setShowHeadings(!showHeadings)}
            />
          </div>
          <StudioAiPanel
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
            aiProcessing={aiProcessing}
            onAIAnalystAction={(action) => {}}
            onToggleChat={setChatOpen}
            viewMode={viewMode}
          />
          <BYOKManager open={showBYOK} onClose={() => setShowBYOK(false)} />
          <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onImport={({ data }) => {}} />
        </div>
      </BYOKProvider>
    </MUIThemeProvider>
  );
}