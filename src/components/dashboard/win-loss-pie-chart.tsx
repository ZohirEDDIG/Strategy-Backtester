'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';

const COLORS: Record<string, string> = {
  Wins: 'hsl(var(--success))',
  Losses: 'hsl(var(--danger))',
  Breakeven: 'hsl(var(--muted-foreground))',
};

export function WinLossPieChart({
  data,
  isLoading,
}: {
  data?: { name: string; value: number }[];
  isLoading: boolean;
}) {
  const filtered = data?.filter((d) => d.value > 0) ?? [];
  const total = filtered.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win / Loss / Breakeven</CardTitle>
      </CardHeader>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !total ? (
        <EmptyState title="No backtests yet" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {filtered.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.name] ?? 'hsl(var(--accent))'} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
