'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { WidgetConfig } from '@/lib/dashboard/types';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  CanvasRenderer,
]);

interface EChartsWidgetProps {
  widget: WidgetConfig;
  queryFn?: (sql: string) => Promise<{ columns: string[]; rows: unknown[][] }>;
  filters?: Record<string, unknown>;
}

export function EChartsWidget({ widget, queryFn, filters }: EChartsWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = echarts.init(ref.current);
    const ro = new ResizeObserver(() => chartRef.current?.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chartRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!queryFn) return;
    const sql = applyFilters(widget.sql, filters);
    queryFn(sql)
      .then(({ columns, rows }) => {
        const option = buildChartOption(widget, columns, rows);
        chartRef.current?.setOption(option, true);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [widget.sql, widget.type, widget.xField, widget.yField, widget.seriesField, filters, queryFn]);

  if (error) return <div className="text-destructive text-xs">{error}</div>;
  if (!queryFn) return <div className="text-muted-foreground text-xs">No data source</div>;
  return <div ref={ref} className="h-full min-h-[120px] w-full" />;
}

function applyFilters(sql: string, filters?: Record<string, unknown>): string {
  if (!filters || Object.keys(filters).length === 0) return sql;
  const wheres = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([col, val]) => {
      if (Array.isArray(val)) return `"${col}" IN (${val.map((v) => `'${v}'`).join(',')})`;
      return `"${col}" = '${val}'`;
    });
  if (wheres.length === 0) return sql;
  if (sql.toUpperCase().includes('WHERE')) return `${sql} AND ${wheres.join(' AND ')}`;
  return `${sql} WHERE ${wheres.join(' AND ')}`;
}

function buildChartOption(
  widget: WidgetConfig,
  columns: string[],
  rows: unknown[][]
): Record<string, unknown> {
  const x = widget.xField || columns[0] || 'x';
  const y = widget.yField || columns[1] || 'y';
  const series = widget.seriesField || columns[2];

  const xData = rows.map((r) => r[columns.indexOf(x)] ?? r[0]);
  const yData = rows.map((r) => Number(r[columns.indexOf(y)] ?? r[1] ?? 0));

  if (widget.type === 'pie') {
    return {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: xData.map((name, i) => ({ name, value: yData[i] })),
        },
      ],
    };
  }

  if (widget.type === 'radar') {
    return {
      radar: { indicator: xData.map((name) => ({ name, max: Math.max(...yData) * 1.2 || 100 })) },
      series: [{ type: 'radar', data: [{ value: yData, name: widget.title }] }],
    };
  }

  const base: Record<string, unknown> = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
  };

  if (series) {
    const groups = new Map<string, { x: unknown[]; y: number[] }>();
    rows.forEach((r) => {
      const key = String(r[columns.indexOf(series)] ?? 'default');
      if (!groups.has(key)) groups.set(key, { x: [], y: [] });
      groups.get(key)!.x.push(r[columns.indexOf(x)]);
      groups.get(key)!.y.push(Number(r[columns.indexOf(y)] ?? 0));
    });
    return {
      ...base,
      series: [...groups.entries()].map(([name, g]) => ({
        name,
        type: widget.type,
        data: g.y,
      })),
    };
  }

  return {
    ...base,
    series: [
      {
        type: widget.type === 'area' ? 'line' : widget.type,
        areaStyle: widget.type === 'area' ? {} : undefined,
        data: yData,
      },
    ],
  };
}
