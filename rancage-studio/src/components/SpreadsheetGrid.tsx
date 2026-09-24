'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type {
  CellValue,
  CellPosition,
  CellRange,
  CellFormat,
  GridState,
} from '@/lib/grid/types';
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_HEIGHT,
  ROW_HEADER_WIDTH,
} from '@/lib/grid/types';
import { createGridFromData, setCell, normalizeRange, isInRange } from '@/lib/grid/store';

export interface SpreadsheetGridProps {
  data: CellValue[][];
  onDataChange?: (data: CellValue[][]) => void;
  onCellSelect?: (ref: string) => void;
  className?: string;
  showGridlines?: boolean;
  showHeadings?: boolean;
  /** Per-cell formatting map: key = "A1", value = CellFormat */
  cellFormats?: Record<string, CellFormat>;
  /** Called when user toggles format on a selection */
  onFormatChange?: (range: CellRange, format: Partial<CellFormat>) => void;
  /** Called when selection changes; parent reads current cell's format to sync ribbon */
  onSelectionFormat?: (format: CellFormat | null) => void;
}

function colLetter(idx: number): string {
  let r = '';
  let n = idx;
  while (n >= 0) {
    r = String.fromCharCode(65 + (n % 26)) + r;
    n = Math.floor(n / 26) - 1;
  }
  return r;
}

function cellRef(pos: CellPosition): string {
  return `${colLetter(pos.col)}${pos.row + 1}`;
}

function mergeFormat(
  base: CellFormat | undefined,
  override: Partial<CellFormat>,
): CellFormat {
  return { ...base, ...override };
}

function getFontFamilyCSS(f: string | undefined): string {
  if (!f || f === 'Inter') return 'var(--font-sans)';
  if (f === 'JetBrains Mono') return 'var(--font-mono)';
  return f;
}

export function SpreadsheetGrid({
  data,
  onDataChange,
  onCellSelect,
  className,
  showGridlines = true,
  showHeadings = true,
  cellFormats = {},
  onFormatChange,
  onSelectionFormat,
}: SpreadsheetGridProps) {
  const [grid, setGrid] = useState<GridState>(() => createGridFromData(data));
  const [edCell, setEdCell] = useState<CellPosition | null>(null);
  const [edVal, setEdVal] = useState('');
  const [sel, setSel] = useState<CellRange | null>(null);
  const [drag, setDrag] = useState(false);
  const cRef = useRef<HTMLDivElement>(null);
  const [sTop, setST] = useState(0);
  const [sLeft, setSL] = useState(0);
  const [cw, setCw] = useState(1000);

  // Sync external data changes
  useEffect(() => {
    setGrid(createGridFromData(data));
  }, [data]);

  const startEd = useCallback(
    (pos: CellPosition) => {
      setEdCell(pos);
      setEdVal(
        grid.data[pos.row]?.[pos.col] === null ||
          grid.data[pos.row]?.[pos.col] === undefined
          ? ''
          : String(grid.data[pos.row]![pos.col]),
      );
    },
    [grid.data],
  );

  const commitEd = useCallback(() => {
    if (!edCell) return;
    let v: CellValue = edVal;
    if (edVal === '' || edVal === 'null') v = null;
    else if (!isNaN(Number(edVal)) && edVal !== '') v = Number(edVal);
    else if (edVal === 'true') v = true;
    else if (edVal === 'false') v = false;
    const ng = setCell(grid, edCell, v);
    setGrid(ng);
    setEdCell(null);
    onDataChange?.(ng.data);
  }, [edCell, edVal, grid, onDataChange]);

  const cancelEd = useCallback(() => {
    setEdCell(null);
    setEdVal('');
  }, []);

  const onDown = useCallback(
    (pos: CellPosition, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (edCell) commitEd();
      if (e.shiftKey && sel) {
        setSel({ start: sel.start, end: pos });
      } else {
        setSel({ start: pos, end: pos });
        // Push current cell's format to parent
        const ref = cellRef(pos);
        onSelectionFormat?.(cellFormats[ref] ?? null);
      }
      setDrag(true);
      onCellSelect?.(cellRef(pos));
    },
    [edCell, commitEd, sel, onCellSelect, cellFormats, onSelectionFormat],
  );

  const onEnter = useCallback(
    (pos: CellPosition) => {
      if (!drag || !sel) return;
      setSel({ start: sel.start, end: pos });
    },
    [drag, sel],
  );

  const onUp = useCallback(() => setDrag(false), []);

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl+B / Ctrl+I / Ctrl+U shortcut
      if ((e.ctrlKey || e.metaKey) && !edCell) {
        const ref = sel ? cellRef(sel.start) : null;
        if (ref && onFormatChange && sel) {
          if (e.key === 'b') {
            e.preventDefault();
            const cur = cellFormats[ref];
            onFormatChange(sel, { bold: !cur?.bold });
            return;
          }
          if (e.key === 'i') {
            e.preventDefault();
            const cur = cellFormats[ref];
            onFormatChange(sel, { italic: !cur?.italic });
            return;
          }
          if (e.key === 'u') {
            e.preventDefault();
            const cur = cellFormats[ref];
            onFormatChange(sel, { underline: !cur?.underline });
            return;
          }
        }
      }

      if (edCell) {
        if (e.key === 'Enter') {
          commitEd();
          e.preventDefault();
        } else if (e.key === 'Escape') cancelEd();
        else if (e.key === 'Tab') {
          commitEd();
          e.preventDefault();
        }
        return;
      }
      if (!sel) return;
      const pos = sel.start;
      if (e.key === 'Enter' || e.key === 'F2') {
        startEd(pos);
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const g2 = setCell(grid, pos, null);
        setGrid(g2);
        onDataChange?.(g2.data);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setEdCell(pos);
        setEdVal(e.key);
      }
    },
    [edCell, sel, grid, commitEd, cancelEd, startEd, onDataChange, cellFormats, onFormatChange],
  );

  const onSc = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setST(e.currentTarget.scrollTop);
    setSL(e.currentTarget.scrollLeft);
  }, []);

  useEffect(() => {
    const el = cRef.current;
    if (!el) return;
    setCw(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setCw(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const th = grid.rowCount * DEFAULT_ROW_HEIGHT + HEADER_HEIGHT;
  const tw =
    ROW_HEADER_WIDTH + grid.columnWidths.reduce((a, b) => a + b, 0);
  const sr = Math.max(0, Math.floor(sTop / DEFAULT_ROW_HEIGHT) - 2);
  const er = Math.min(
    grid.rowCount,
    Math.ceil((sTop + 800) / DEFAULT_ROW_HEIGHT) + 2,
  );

  const vRows = useMemo(() => {
    const r: { i: number; y: number }[] = [];
    for (let i = sr; i < er; i++)
      r.push({ i, y: i * DEFAULT_ROW_HEIGHT + HEADER_HEIGHT });
    return r;
  }, [sr, er]);

  const cP = useMemo(() => {
    const p: { i: number; x: number; w: number }[] = [];
    let x = 0;
    for (let i = 0; i < grid.colCount; i++) {
      const w = grid.columnWidths[i] ?? DEFAULT_COL_WIDTH;
      p.push({ i, x, w });
      x += w;
    }
    return p;
  }, [grid.columnWidths, grid.colCount]);

  const ns = sel ? normalizeRange(sel) : null;

  return (
    <div
      ref={cRef}
      className={`spreadsheet-container ${className ?? ''} ${!showGridlines ? 'no-gridlines' : ''} ${!showHeadings ? 'no-headings' : ''}`}
      style={{ height: '100%' }}
      onScroll={onSc}
      onMouseUp={onUp}
      onKeyDown={onKey}
      tabIndex={0}
    >
      <div style={{ width: tw, height: th, position: 'relative' }}>
        {showHeadings && (
          <>
            <div
              className="spreadsheet-col-header"
              style={{ height: HEADER_HEIGHT }}
            >
              <div
                className="spreadsheet-corner"
                style={{ width: ROW_HEADER_WIDTH, height: HEADER_HEIGHT }}
              />
              {cP.map(
                (col) =>
                  col.x + col.w > sLeft - 200 &&
                  col.x < sLeft + cw + 200 && (
                    <div
                      key={col.i}
                      className="spreadsheet-col-cell"
                      style={{
                        width: col.w,
                        height: HEADER_HEIGHT,
                        minWidth: col.w,
                      }}
                    >
                      {colLetter(col.i)}
                    </div>
                  ),
              )}
            </div>
            <div
              className="spreadsheet-row-headers"
              style={{
                position: 'absolute',
                top: HEADER_HEIGHT,
                width: ROW_HEADER_WIDTH,
                height: th - HEADER_HEIGHT,
              }}
            >
              {vRows.map(({ i, y }) => (
                <div
                  key={i}
                  className="spreadsheet-row-cell"
                  style={{
                    height: DEFAULT_ROW_HEIGHT,
                    position: 'absolute',
                    top: y - HEADER_HEIGHT,
                    width: ROW_HEADER_WIDTH,
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </>
        )}

        <div
          style={{
            position: 'absolute',
            top: HEADER_HEIGHT,
            left: showHeadings ? ROW_HEADER_WIDTH : 0,
          }}
        >
          {vRows.map(({ i, y }) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: y - HEADER_HEIGHT,
                display: 'flex',
              }}
            >
              {cP.map((col) => {
                if (
                  col.x + col.w < sLeft - 200 ||
                  col.x > sLeft + cw + 200
                )
                  return (
                    <div
                      key={col.i}
                      style={{ width: col.w, minWidth: col.w }}
                    />
                  );
                const pos = { row: i, col: col.i };
                const isEd =
                  edCell?.row === i && edCell?.col === col.i;
                const isHi = ns ? isInRange(pos, ns) : false;
                const val = grid.data[i]?.[col.i];
                const isNum = typeof val === 'number';
                const isHeader = i === 0;
                const isNegative =
                  typeof val === 'string' &&
                  (val.startsWith('-') ||
                    (val.endsWith('%') && val.startsWith('-')));
                const isPositive =
                  typeof val === 'string' && val.startsWith('+');

                // Per-cell formatting
                const ref = cellRef(pos);
                const fmt = cellFormats[ref];
                const effectiveBold = fmt?.bold ?? false;
                const effectiveItalic = fmt?.italic ?? false;
                const effectiveUnderline = fmt?.underline ?? false;
                const effectiveStrike = fmt?.strikethrough ?? false;
                const effectiveAlign =
                  fmt?.textAlign ?? (isNum ? 'right' : 'left');
                const effectiveFont = fmt?.fontFamily;
                const effectiveSize = fmt?.fontSize;
                const effectiveColor = fmt?.color;
                const effectiveBg = fmt?.bgColor;

                const cellStyle: React.CSSProperties = {
                  width: col.w,
                  minWidth: col.w,
                  height: DEFAULT_ROW_HEIGHT,
                  fontWeight:
                    effectiveBold || isHeader ? 700 : undefined,
                  fontStyle: effectiveItalic ? 'italic' : undefined,
                  textDecoration:
                    [
                      effectiveUnderline ? 'underline' : '',
                      effectiveStrike ? 'line-through' : '',
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined,
                  textAlign: isNum ? 'right' : effectiveAlign,
                  fontFamily: getFontFamilyCSS(effectiveFont),
                  fontSize: effectiveSize,
                  color: effectiveColor,
                  backgroundColor: effectiveBg,
                };

                return (
                  <div
                    key={col.i}
                    className={`spreadsheet-cell ${isHi ? 'selected' : ''} ${isNum ? 'num' : ''} ${isHeader ? 'header-cell' : ''} ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}
                    style={cellStyle}
                    onMouseDown={(e) => onDown(pos, e)}
                    onMouseEnter={() => onEnter(pos)}
                    onDoubleClick={() => startEd(pos)}
                  >
                    {isEd ? (
                      <input
                        autoFocus
                        value={edVal}
                        onChange={(e) => setEdVal(e.target.value)}
                        onBlur={commitEd}
                        className="spreadsheet-cell-input"
                        style={{ width: col.w }}
                      />
                    ) : (
                      <div className="spreadsheet-cell-content">
                        {val === null || val === undefined
                          ? ''
                          : String(val)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .spreadsheet-container {
          overflow: auto;
          background: var(--bg-surface);
          outline: none;
        }
        .spreadsheet-container.no-gridlines .spreadsheet-cell {
          border-right-color: transparent;
          border-bottom-color: transparent;
        }
        .spreadsheet-container.no-gridlines .spreadsheet-col-cell,
        .spreadsheet-container.no-gridlines .spreadsheet-row-cell,
        .spreadsheet-container.no-gridlines .spreadsheet-col-header,
        .spreadsheet-container.no-gridlines .spreadsheet-corner {
          border-color: transparent;
        }
        .spreadsheet-container.no-headings .spreadsheet-col-header,
        .spreadsheet-container.no-headings .spreadsheet-row-headers {
          display: none !important;
        }
        .spreadsheet-col-header {
          display: flex;
          background: var(--bg-grid-header);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .spreadsheet-corner {
          background: var(--bg-grid-header);
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          position: sticky;
          left: 0;
          z-index: 4;
        }
        .spreadsheet-col-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border);
          font-weight: 500;
          color: var(--text-secondary);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          user-select: none;
        }
        .spreadsheet-row-headers {
          position: sticky;
          left: 0;
          z-index: 10;
          background: var(--bg-surface);
        }
        .spreadsheet-row-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border-light);
          background: var(--bg-grid-header);
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          position: sticky;
          left: 0;
          z-index: 3;
        }
        .spreadsheet-cell {
          border-right: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          padding: 4px 12px;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: cell;
          transition: background 0.1s;
        }
        .spreadsheet-cell:hover { background: var(--bg-grid-hover); }
        .spreadsheet-cell.selected {
          background: var(--bg-grid-selected);
          outline: 2px solid var(--accent);
          outline-offset: -2px;
        }
        .spreadsheet-cell.num { text-align: right; font-family: var(--font-mono); font-size: 12.5px; }
        .spreadsheet-cell.header-cell { font-weight: 600; background: var(--bg-grid-header); }
        .spreadsheet-cell.positive { color: var(--success); }
        .spreadsheet-cell.negative { color: var(--danger); }
        .spreadsheet-cell.ai-generated { background: var(--accent-bg); border-left: 2px solid var(--accent); }
        .spreadsheet-cell.ai-generated.header-cell { background: var(--accent-bg); }
        .spreadsheet-cell-input {
          height: 100%; width: 100%; background: transparent;
          padding: 4px 8px; font-size: 13px; border: none; outline: none; font-family: var(--font-sans);
        }
        .spreadsheet-cell-content { display: flex; height: 100%; align-items: center; font-family: var(--font-sans); }
        .spreadsheet-cell.num .spreadsheet-cell-content { font-family: var(--font-mono); justify-content: flex-end; }
      `}</style>
    </div>
  );
}
