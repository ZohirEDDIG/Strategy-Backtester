'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { HistogramBucket } from '@/types/backtest';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-soft-lg">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono font-medium text-foreground">{payload[0].value} trades</p>
    </div>
  );
}

function bucketColor(label: string): string {
  if (label.includes('-')) return 'hsl(var(--danger))';
  if (label === '0R to 1R') return 'hsl(var(--muted-foreground))';
  return 'hsl(var(--success))';
}

export function RMultipleHistogram({ data, isLoading }: { data?: HistogramBucket[]; isLoading: boolean }) {
  const total = data?.reduce((sum, b) => sum + b.count, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>R-Multiple Distribution</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !total ? (
        <EmptyState title="No backtests yet" description="See how your results spread across R-multiple ranges once you log some." />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={30}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data!.map((entry, i) => (
                <Cell key={i} fill={bucketColor(entry.label)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
