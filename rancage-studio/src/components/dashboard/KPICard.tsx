'use client';

interface KPICardProps {
  value: number;
  prevValue?: number;
  format?: 'number' | 'currency' | 'percent';
  label: string;
}

function formatValue(v: number, format?: 'number' | 'currency' | 'percent'): string {
  if (format === 'currency') return `$${v.toLocaleString()}`;
  if (format === 'percent') return `${(v * 100).toFixed(1)}%`;
  return v.toLocaleString();
}

export function KPICard({ value, prevValue, format, label }: KPICardProps) {
  const change =
    prevValue !== undefined && prevValue !== 0
      ? ((value - prevValue) / Math.abs(prevValue)) * 100
      : undefined;
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-2xl font-bold">{formatValue(value, format)}</span>
      {change !== undefined && (
        <span
          className={`text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'}`}
        >
          {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(change).toFixed(1)}%
        </span>
      )}
      {/* Mini sparkline via CSS */}
      {prevValue !== undefined && (
        <div className="flex h-4 items-end gap-px" aria-hidden>
          <div className="bg-muted-foreground/30 w-2 rounded-t" style={{ height: '40%' }} />
          <div className="bg-muted-foreground/30 w-2 rounded-t" style={{ height: '60%' }} />
          <div
            className="bg-muted-foreground/30 w-2 rounded-t"
            style={{ height: `${Math.min(100, (value / Math.max(value, prevValue)) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
