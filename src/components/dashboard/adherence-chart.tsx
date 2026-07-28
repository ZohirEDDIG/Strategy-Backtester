'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdherenceBreakdown } from '@/types/backtest';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';
import { formatR } from '@/utils/format';

const COLORS: Record<string, string> = {
  Yes: 'hsl(var(--success))',
  Partial: 'hsl(38 92% 50%)',
  No: 'hsl(var(--danger))',
};

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as AdherenceBreakdown;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-soft-lg">
      <p className="font-medium text-foreground">Followed plan: {item.adherence}</p>
      <p className="text-muted-foreground">{item.count} trades</p>
      <p className={item.avgR >= 0 ? 'font-mono text-success' : 'font-mono text-danger'}>{formatR(item.avgR)} avg</p>
    </div>
  );
}

export function AdherenceChart({ data, isLoading }: { data?: AdherenceBreakdown[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Does Following the Plan Matter?</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : !data?.length ? (
        <EmptyState title="No backtests yet" description="See average R for trades that followed the plan vs. deviated." />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="adherence" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatR(v)}
              width={50}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="avgR" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.adherence]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
