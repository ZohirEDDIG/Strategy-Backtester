import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StrategySummary } from '@/types/backtest';
import { Card } from '@/components/ui/card';
import { formatPercent, formatR } from '@/utils/format';
import { cn } from '@/utils/cn';

export function StrategyCard({ strategy }: { strategy: StrategySummary }) {
  return (
    <Link href={`/strategies/${strategy.id}`}>
      <Card className="group h-full transition-colors hover:bg-surface-hover">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold tracking-tight text-foreground">{strategy.name}</h3>
          <ArrowRight
            size={16}
            className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        </div>
        {strategy.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{strategy.description}</p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Backtests</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">{strategy.tradeCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Win Rate</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">
              {strategy.tradeCount ? formatPercent(strategy.winRate) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Expectancy</p>
            <p
              className={cn(
                'mt-0.5 font-mono text-sm font-semibold',
                strategy.tradeCount && strategy.expectancyR >= 0 ? 'text-success' : strategy.tradeCount ? 'text-danger' : ''
              )}
            >
              {strategy.tradeCount ? formatR(strategy.expectancyR) : '—'}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
