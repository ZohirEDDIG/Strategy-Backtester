import { DashboardStats } from '@/types/backtest';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { formatPercent, formatR } from '@/utils/format';
import { cn } from '@/utils/cn';

interface StatDefinition {
  label: string;
  value: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

function buildStats(stats: DashboardStats): StatDefinition[] {
  const streakLabel =
    stats.currentStreak.type === 'none'
      ? '—'
      : `${stats.currentStreak.count} ${stats.currentStreak.type === 'win' ? 'win' : 'loss'}${
          stats.currentStreak.count === 1 ? '' : 'es'
        }`;

  return [
    { label: 'Total Backtests', value: String(stats.totalBacktests) },
    { label: 'Wins', value: String(stats.wins), tone: 'positive' },
    { label: 'Losses', value: String(stats.losses), tone: 'negative' },
    { label: 'Breakeven', value: String(stats.breakevens) },
    { label: 'Win Rate', value: formatPercent(stats.winRate) },
    { label: 'Loss Rate', value: formatPercent(stats.lossRate) },
    { label: 'Net R', value: formatR(stats.netR), tone: stats.netR >= 0 ? 'positive' : 'negative' },
    {
      label: 'Expectancy / Trade',
      value: formatR(stats.expectancyR),
      tone: stats.expectancyR >= 0 ? 'positive' : 'negative',
    },
    { label: 'Average Win', value: formatR(stats.averageWinR), tone: 'positive' },
    { label: 'Average Loss', value: formatR(stats.averageLossR), tone: 'negative' },
    { label: 'Largest Win', value: formatR(stats.largestWinR), tone: 'positive' },
    { label: 'Largest Loss', value: formatR(stats.largestLossR), tone: 'negative' },
    { label: 'Profit Factor', value: stats.profitFactor === null ? '∞' : stats.profitFactor.toFixed(2) },
    { label: 'R Std. Deviation', value: stats.stdDevR.toFixed(2), tone: 'neutral' },
    {
      label: 'Current Streak',
      value: streakLabel,
      tone: stats.currentStreak.type === 'win' ? 'positive' : stats.currentStreak.type === 'loss' ? 'negative' : 'neutral',
    },
    { label: 'Best Win Streak', value: String(stats.bestWinStreak), tone: 'positive' },
    { label: 'Worst Loss Streak', value: String(stats.worstLossStreak), tone: 'negative' },
    {
      label: 'Plan Adherence',
      value: formatPercent(stats.adherenceRate),
      tone: stats.adherenceRate >= 80 ? 'positive' : stats.adherenceRate >= 50 ? 'neutral' : 'negative',
    },
  ];
}

const toneClasses: Record<NonNullable<StatDefinition['tone']>, string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral: 'text-foreground',
};

export function StatsGrid({ stats, isLoading }: { stats?: DashboardStats; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 17 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const items = buildStats(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className={cn('mt-1.5 font-mono text-lg font-semibold', toneClasses[item.tone ?? 'neutral'])}>
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
