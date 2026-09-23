'use client';

import { useState, useEffect } from 'react';
import type { SlicerConfig } from '@/lib/dashboard/types';

interface SlicerPanelProps {
  slicers: SlicerConfig[];
  filters: Record<string, unknown>;
  onFilterChange: (column: string, value: unknown) => void;
  queryFn?: (sql: string) => Promise<{ columns: string[]; rows: unknown[][] }>;
}

export function SlicerPanel({ slicers, filters, onFilterChange, queryFn }: SlicerPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border p-3" role="group" aria-label="Filters">
      {slicers.map((s) =>
        s.type === 'date-range' ? (
          <DateRangeSlicer
            key={s.id}
            slicer={s}
            value={filters[s.column] as string | undefined}
            onChange={(v) => onFilterChange(s.column, v)}
          />
        ) : (
          <MultiSelectSlicer
            key={s.id}
            slicer={s}
            value={filters[s.column] as string[] | undefined}
            onChange={(v) => onFilterChange(s.column, v)}
            queryFn={queryFn}
          />
        )
      )}
    </div>
  );
}

function DateRangeSlicer({
  slicer,
  value,
  onChange,
}: {
  slicer: SlicerConfig;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium">{slicer.label}</span>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1"
        aria-label={`${slicer.label} filter`}
      />
    </label>
  );
}

function MultiSelectSlicer({
  slicer,
  value,
  onChange,
  queryFn,
}: {
  slicer: SlicerConfig;
  value?: string[];
  onChange: (v: string[]) => void;
  queryFn?: (sql: string) => Promise<{ columns: string[]; rows: unknown[][] }>;
}) {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!queryFn) return;
    queryFn(
      `SELECT DISTINCT "${slicer.column}" FROM "${slicer.tableName}" WHERE "${slicer.column}" IS NOT NULL ORDER BY "${slicer.column}" LIMIT 50`
    )
      .then(({ rows }) => setOptions(rows.map((r) => String(r[0]))))
      .catch(() => {});
  }, [queryFn, slicer.column, slicer.tableName]);

  const selected = value ?? [];
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="flex flex-col gap-1 text-xs">
      <span className="font-medium">{slicer.label}</span>
      <div
        className="max-h-32 overflow-auto rounded border p-1"
        role="listbox"
        aria-label={`${slicer.label} multi-select`}
      >
        {options.map((opt) => (
          <label
            key={opt}
            className="hover:bg-muted/50 flex cursor-pointer items-center gap-1 px-1"
          >
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
            <span>{opt}</span>
          </label>
        ))}
        {options.length === 0 && <span className="text-muted-foreground">No options</span>}
      </div>
    </div>
  );
}
