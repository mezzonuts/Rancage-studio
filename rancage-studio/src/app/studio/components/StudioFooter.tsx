'use client';

import { useState } from 'react';

export interface StudioFooterProps {
  zoom: number;
  onZoomChange: (z: number) => void;
  selectedCell: string | null;
  selectedRange: { start: { row: number; col: number }; end: { row: number; col: number } } | null;
  showGridlines: boolean;
  onToggleGridlines: () => void;
  showFormulaBar: boolean;
  onToggleFormulaBar: () => void;
  showHeadings: boolean;
  onToggleHeadings: () => void;
}

export function StudioFooter({
  zoom,
  onZoomChange,
  selectedCell,
  selectedRange,
  showGridlines,
  onToggleGridlines,
  showFormulaBar,
  onToggleFormulaBar,
  showHeadings,
  onToggleHeadings,
}: StudioFooterProps) {
  return (
    <div style={{
      height: 28,
      background: 'var(--bg-sidebar)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      fontSize: 12,
      color: 'var(--text-secondary)',
      userSelect: 'none',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>{selectedCell ? `Cell: ${selectedCell}` : 'Ready'}</span>
        {selectedRange && (
          <span>Range: {selectedRange.start.row + 1}:{selectedRange.start.col + 1} to {selectedRange.end.row + 1}:{selectedRange.end.col + 1}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={showGridlines} onChange={onToggleGridlines} />
          Gridlines
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={showHeadings} onChange={onToggleHeadings} />
          Headings
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={showFormulaBar} onChange={onToggleFormulaBar} />
          Formula Bar
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ minWidth: 40 }}>{zoom}%</span>
          <input
            type="range"
            min={25}
            max={200}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </div>
      </div>
    </div>
  );
}