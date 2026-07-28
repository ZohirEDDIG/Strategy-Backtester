'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { useDashboard, useDeleteBacktest, useBacktests } from '@/hooks/useBacktests';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { EquityCurveChart } from '@/components/dashboard/equity-curve-chart';
import { RMultipleHistogram } from '@/components/dashboard/r-multiple-histogram';
import { WinLossPieChart } from '@/components/dashboard/win-loss-pie-chart';
import { CategoryBarChart } from '@/components/dashboard/category-bar-chart';
import { StrategyComparisonChart } from '@/components/dashboard/strategy-comparison-chart';
import { AdherenceChart } from '@/components/dashboard/adherence-chart';
import { BacktestFiltersBar } from '@/components/backtests/backtest-filters-bar';
import { BacktestTable } from '@/components/backtests/backtest-table';
import { Pagination } from '@/components/backtests/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { BacktestFilters, BacktestTradeDTO } from '@/types/backtest';

const DEFAULT_FILTERS: BacktestFilters = {
  sortBy: 'date',
  sortDir: 'desc',
  page: 1,
  pageSize: 10,
  outcome: 'all',
};

export default function HomePage() {
  const [filters, setFilters] = useState<BacktestFilters>(DEFAULT_FILTERS);
  const [pendingDelete, setPendingDelete] = useState<BacktestTradeDTO | null>(null);

  const dashboardFilters = {
    strategyId: filters.strategyId,
    from: filters.from,
    to: filters.to,
    symbol: filters.symbol,
    setup: filters.setup,
    timeframe: filters.timeframe,
    direction: filters.direction,
    adherence: filters.adherence,
  };
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard(dashboardFilters);
  const { data: tradesPage, isLoading: tradesLoading } = useBacktests(filters);
  const deleteTrade = useDeleteBacktest();

  function updateFilters(partial: Partial<BacktestFilters>) {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  }

  function handleSortChange(field: NonNullable<BacktestFilters['sortBy']>) {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'desc' ? 'asc' : 'desc',
    }));
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    await deleteTrade.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const hasNoBacktestsAtAll =
    !tradesLoading &&
    tradesPage?.total === 0 &&
    !filters.strategyId &&
    !filters.from &&
    !filters.symbol &&
    !filters.setup;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your backtesting performance at a glance.</p>
      </div>

      {hasNoBacktestsAtAll ? (
        <EmptyState
          icon={<FlaskConical size={28} />}
          title="No backtests logged yet"
          description="Create a strategy, then log your first backtest against it to start building stats and charts."
          action={
            <Link href="/strategies">
              <Button size="sm">Get started</Button>
            </Link>
          }
        />
      ) : (
        <>
          <StatsGrid stats={dashboard?.stats} isLoading={dashboardLoading} />

          <div className="grid gap-5 lg:grid-cols-2">
            <EquityCurveChart data={dashboard?.equityCurve} isLoading={dashboardLoading} />
            <RMultipleHistogram data={dashboard?.rMultipleHistogram} isLoading={dashboardLoading} />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <WinLossPieChart data={dashboard?.winLossBreakdown} isLoading={dashboardLoading} />
            <CategoryBarChart title="By Setup" data={dashboard?.bySetup} isLoading={dashboardLoading} metric="avgR" />
            <CategoryBarChart title="By Timeframe" data={dashboard?.byTimeframe} isLoading={dashboardLoading} metric="avgR" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <StrategyComparisonChart data={dashboard?.byStrategy} isLoading={dashboardLoading} />
            <AdherenceChart data={dashboard?.byAdherence} isLoading={dashboardLoading} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Backtest Log</h2>
            <BacktestFiltersBar filters={filters} onChange={updateFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

            {!tradesLoading && tradesPage?.total === 0 ? (
              <EmptyState title="No backtests match these filters" description="Try widening your date range or clearing filters." />
            ) : (
              <>
                <BacktestTable
                  trades={tradesPage?.data ?? []}
                  isLoading={tradesLoading}
                  sortBy={filters.sortBy}
                  sortDir={filters.sortDir}
                  onSortChange={handleSortChange}
                  onDeleteRequest={setPendingDelete}
                />
                {tradesPage && (
                  <Pagination
                    page={tradesPage.page}
                    totalPages={tradesPage.totalPages}
                    total={tradesPage.total}
                    onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this backtest?"
        description="This action can't be undone."
        loading={deleteTrade.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
