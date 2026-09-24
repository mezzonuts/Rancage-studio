'use client';

import { useState, useCallback } from 'react';
import type { DashboardState, WidgetConfig, WidgetType } from '@/lib/dashboard/types';
import { createWidget } from '@/lib/dashboard/types';
import { saveDashboard } from '@/lib/dashboard/store';
import { EChartsWidget } from './ChartWidget';
import { KPICard } from './KPICard';
import { SlicerPanel } from './Slicers';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import RadarIcon from '@mui/icons-material/Radar';
import SpeedIcon from '@mui/icons-material/Speed';
import DownloadIcon from '@mui/icons-material/Download';
import LanguageIcon from '@mui/icons-material/Language';

interface DashboardCanvasProps {
  dashboard: DashboardState;
  onDashboardChange?: (d: DashboardState) => void;
  queryFn?: (sql: string) => Promise<{ columns: string[]; rows: unknown[][] }>;
  onExportExcel?: () => void;
  onExportHTML?: () => void;
}

const WIDGET_ICONS: Record<WidgetType, React.ReactNode> = {
  bar: <TableChartIcon sx={{ fontSize: 12 }} />,
  line: <ShowChartIcon sx={{ fontSize: 12 }} />,
  area: <AreaChartIcon sx={{ fontSize: 12 }} />,
  pie: <PieChartIcon sx={{ fontSize: 12 }} />,
  scatter: <BubbleChartIcon sx={{ fontSize: 12 }} />,
  radar: <RadarIcon sx={{ fontSize: 12 }} />,
  kpi: <SpeedIcon sx={{ fontSize: 12 }} />,
};

export function DashboardCanvas({ dashboard, onDashboardChange, queryFn, onExportExcel, onExportHTML }: DashboardCanvasProps) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} role="region" aria-label="Dashboard">
      <Toolbar onAdd={addWidget} name={dash.name} onExportExcel={onExportExcel} onExportHTML={onExportHTML} />
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, minmax(150px, auto))`,
          gap: 1,
          minHeight: 400,
        }}
      >
        {dash.widgets.map((w) => (
          <Card
            key={w.id}
            sx={{
              gridColumn: `${w.col + 1} / span ${w.colSpan}`,
              gridRow: `${w.row + 1} / span ${w.rowSpan}`,
              p: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{w.title}</Typography>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => setEditingWidget(editingWidget === w.id ? null : w.id)}
                  >
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={() => removeWidget(w.id)}
                    color="error"
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
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
          </Card>
        ))}
      </Box>
    </Box>
  );
}

function Toolbar({
  onAdd,
  name,
  onExportExcel,
  onExportHTML,
}: {
  onAdd: (t: WidgetType) => void;
  name: string;
  onExportExcel?: () => void;
  onExportHTML?: () => void;
}) {
  const types: WidgetType[] = ['bar', 'line', 'area', 'pie', 'scatter', 'radar', 'kpi'];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h3">{name}</Typography>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {types.map((t) => (
          <Tooltip key={t} title={`Add ${t}`}>
            <Button
              size="small"
              variant="outlined"
              startIcon={WIDGET_ICONS[t]}
              onClick={() => onAdd(t)}
            >
              {t.toUpperCase()}
            </Button>
          </Tooltip>
        ))}
        {onExportExcel && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportExcel}
          >
            Export XLSX
          </Button>
        )}
        {onExportHTML && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<LanguageIcon />}
            onClick={onExportHTML}
          >
            Export HTML
          </Button>
        )}
      </Box>
    </Box>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <TextField
        size="small"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 28 } }}
      />
      <TextField
        size="small"
        multiline
        rows={3}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="SQL"
        sx={{ '& .MuiInputBase-root': { fontSize: 11, fontFamily: 'monospace' } }}
      />
      <TextField
        size="small"
        value={xField}
        onChange={(e) => setXField(e.target.value)}
        placeholder="X field"
        sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 28 } }}
      />
      <TextField
        size="small"
        value={yField}
        onChange={(e) => setYField(e.target.value)}
        placeholder="Y field"
        sx={{ '& .MuiInputBase-root': { fontSize: 12, height: 28 } }}
      />
      <Button
        size="small"
        variant="contained"
        onClick={() =>
          onSave({ title, sql, xField: xField || undefined, yField: yField || undefined })
        }
      >
        Save
      </Button>
    </Box>
  );
}