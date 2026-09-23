'use client';

import { useCallback, useEffect, useState } from 'react';

export interface FormulaBarProps {
  selectedCell: string | null;
  formula: string;
  onFormulaChange?: (formula: string) => void;
}

export function FormulaBar({ selectedCell, formula, onFormulaChange }: FormulaBarProps) {
  const [val, setVal] = useState(formula);

  useEffect(() => { setVal(formula); }, [formula]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVal(e.target.value);
      onFormulaChange?.(e.target.value);
    },
    [onFormulaChange]
  );

  return (
    <div className="formula-area">
      <div className="cell-ref">{selectedCell ?? 'A1'}</div>
      <span className="formula-icon">fx</span>
      <input
        className="formula-input"
        value={val}
        onChange={handleChange}
        readOnly={!onFormulaChange}
      />
      <style>{`
        .formula-area {
          grid-area: formula;
          display: flex;
          align-items: center;
          padding: 0 12px;
          border-bottom: 1px solid var(--border-light);
          background: var(--bg-surface);
          gap: 8px;
          min-height: 32px;
        }
        .cell-ref {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-grid-header);
          padding: 3px 8px;
          border-radius: 6px;
          min-width: 60px;
          text-align: center;
          border: 1px solid var(--border);
        }
        .formula-icon {
          color: var(--text-tertiary);
          font-style: italic;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 13px;
        }
        .formula-input {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-primary);
          border: none;
          outline: none;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
