'use client';

import { useState, useCallback } from 'react';
import type { DashboardState, WidgetConfig, WidgetType } from '@/lib/dashboard/types';
import { createWidget } from '@/lib/dashboard/types';
import { saveDashboard } from '@/lib/dashboard/store';
import { EChartsWidget } from './ChartWidget';
import { KPICard } from './KPICard';
import { SlicerPanel } from './Slicers';

interface DashboardCanvasProps {
  dashboard: DashboardState;
  onDashboardChange?: (d: DashboardState) => void;
  queryFn?: (sql: string) => Promise<{ columns: string[]; rows: unknown[][] }>;
}

export function DashboardCanvas({ dashboard, onDashboardChange, queryFn }: DashboardCanvasProps) {
  const [dash, setDash] = useState(dashboard);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);

  const updateDash = useCallback(
    (updater: (d: DashboardState) => DashboardState) => {
      const next = updater(dash);
      setDash(next);
      saveDashboard(next);
      onDashboardChange?.(next);
    },
    [dash, onDashboardChange]
  );

  const addWidget = useCallback(
    (type: WidgetType) => {
      const sql = type === 'kpi' ? 'SELECT 1 as value' : 'SELECT 1 as x, 0 as y';
      const w = createWidget(type, `New ${type}`, sql, {
        col: 0,
        row: dash.widgets.length * 2,
        colSpan: type === 'kpi' ? 1 : 2,
        rowSpan: type === 'kpi' ? 1 : 2,
      });
      updateDash((d) => ({ ...d, widgets: [...d.widgets, w] }));
    },
    [dash, updateDash]
  );

  const removeWidget = useCallback(
    (id: string) => updateDash((d) => ({ ...d, widgets: d.widgets.filter((w) => w.id !== id) })),
    [updateDash]
  );

  const updateWidget = useCallback(
    (id: string, changes: Partial<WidgetConfig>) =>
      updateDash((d) => ({
        ...d,
        widgets: d.widgets.map((w) => (w.id === id ? { ...w, ...changes } : w)),
      })),
    [updateDash]
  );

  const cols = Math.max(...dash.widgets.map((w) => w.col + w.colSpan), 3);
  const rows = Math.max(...dash.widgets.map((w) => w.row + w.rowSpan), 2);

  return (
    <div className="flex flex-col gap-4" role="region" aria-label="Dashboard">
      <Toolbar onAdd={addWidget} name={dash.name} />
      {dash.slicers.length > 0 && (
        <SlicerPanel
          slicers={dash.slicers}
          filters={dash.filters}
          onFilterChange={(col, val) =>
            updateDash((d) => ({ ...d, filters: { ...d.filters, [col]: val } }))
          }
          queryFn={queryFn}
        />
      )}
      <div
        className="relative min-h-[400px] gap-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, minmax(150px, auto))`,
        }}
      >
        {dash.widgets.map((w) => (
          <div
            key={w.id}
            className="bg-card rounded-lg border p-2"
            style={{
              gridColumn: `${w.col + 1} / span ${w.colSpan}`,
              gridRow: `${w.row + 1} / span ${w.rowSpan}`,
            }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">{w.title}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingWidget(editingWidget === w.id ? null : w.id)}
                  className="hover:bg-muted rounded px-1 text-xs"
                  aria-label={`Edit ${w.title}`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeWidget(w.id)}
                  className="hover:bg-muted rounded px-1 text-xs"
                  aria-label={`Remove ${w.title}`}
                >
                  🗑️
                </button>
              </div>
            </div>
            {editingWidget === w.id ? (
              <WidgetEditor widget={w} onSave={(c) => updateWidget(w.id, c)} />
            ) : w.type === 'kpi' ? (
              <KPICard
                value={w.kpiValue ?? 0}
                prevValue={w.kpiPrevValue}
                format={w.kpiFormat}
                label={w.title}
              />
            ) : (
              <EChartsWidget widget={w} queryFn={queryFn} filters={dash.filters} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Toolbar({ onAdd, name }: { onAdd: (t: WidgetType) => void; name: string }) {
  const types: WidgetType[] = ['bar', 'line', 'area', 'pie', 'scatter', 'radar', 'kpi'];
  return (
    <div className="flex items-center gap-2 border-b pb-2">
      <h2 className="text-lg font-semibold">{name}</h2>
      <div className="ml-auto flex gap-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => onAdd(t)}
            className="hover:bg-muted rounded border px-2 py-1 text-xs"
            aria-label={`Add ${t}`}
          >
            + {t.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function WidgetEditor({
  widget,
  onSave,
}: {
  widget: WidgetConfig;
  onSave: (c: Partial<WidgetConfig>) => void;
}) {
  const [title, setTitle] = useState(widget.title);
  const [sql, setSql] = useState(widget.sql);
  const [xField, setXField] = useState(widget.xField ?? '');
  const [yField, setYField] = useState(widget.yField ?? '');
  return (
    <div className="flex flex-col gap-1">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded border px-1 py-0.5 text-xs"
        placeholder="Title"
      />
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        className="h-16 rounded border px-1 py-0.5 font-mono text-xs"
        placeholder="SQL"
      />
      <input
        value={xField}
        onChange={(e) => setXField(e.target.value)}
        className="rounded border px-1 py-0.5 text-xs"
        placeholder="X field"
      />
      <input
        value={yField}
        onChange={(e) => setYField(e.target.value)}
        className="rounded border px-1 py-0.5 text-xs"
        placeholder="Y field"
      />
      <button
        onClick={() =>
          onSave({ title, sql, xField: xField || undefined, yField: yField || undefined })
        }
        className="bg-primary text-primary-foreground rounded px-2 py-0.5 text-xs"
      >
        Save
      </button>
    </div>
  );
}
