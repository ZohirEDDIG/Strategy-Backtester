'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StrategyComparisonRow } from '@/types/backtest';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';
import { formatR } from '@/utils/format';

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as StrategyComparisonRow;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-soft-lg">
      <p className="font-medium text-foreground">{item.strategyName}</p>
      <p className="text-muted-foreground">
        {item.tradeCount} trades &middot; {item.winRate.toFixed(0)}% win rate
      </p>
      <p className={item.expectancyR >= 0 ? 'font-mono text-success' : 'font-mono text-danger'}>
        {formatR(item.expectancyR)} expectancy
      </p>
    </div>
  );
}

export function StrategyComparisonChart({
  data,
  isLoading,
}: {
  data?: StrategyComparisonRow[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison (Expectancy)</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data?.length ? (
        <EmptyState title="No strategies with backtests yet" description="Compare strategies here once you've logged results for more than one." />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 42)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatR(v)}
            />
            <YAxis
              type="category"
              dataKey="strategyName"
              width={140}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="expectancyR" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.expectancyR >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
