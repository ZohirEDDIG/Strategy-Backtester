'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useDeleteStrategy, useStrategy, useStrategies } from '@/hooks/useStrategies';
import { useBacktests, useDashboard, useDeleteBacktest } from '@/hooks/useBacktests';
import { Card } from '@/components/ui/card';
import { Skeleton, EmptyState } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { EquityCurveChart } from '@/components/dashboard/equity-curve-chart';
import { RMultipleHistogram } from '@/components/dashboard/r-multiple-histogram';
import { BacktestTable } from '@/components/backtests/backtest-table';
import { Pagination } from '@/components/backtests/pagination';
import { BacktestFilters, BacktestTradeDTO } from '@/types/backtest';

export default function StrategyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: strategy, isLoading } = useStrategy(params.id);
  const { data: strategySummaries } = useStrategies();
  const deleteStrategy = useDeleteStrategy();
  const deleteTrade = useDeleteBacktest();
  const [confirmStrategyDelete, setConfirmStrategyDelete] = useState(false);
  const [pendingTradeDelete, setPendingTradeDelete] = useState<BacktestTradeDTO | null>(null);
  const [page, setPage] = useState(1);

  const summary = strategySummaries?.find((s) => s.id === params.id);

  const dashboardFilters = { strategyId: params.id };
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard(dashboardFilters);

  const backtestFilters: BacktestFilters = {
    strategyId: params.id,
    sortBy: 'date',
    sortDir: 'desc',
    page,
    pageSize: 10,
    outcome: 'all',
  };
  const { data: tradesPage, isLoading: tradesLoading } = useBacktests(backtestFilters);

  async function handleDeleteStrategy() {
    await deleteStrategy.mutateAsync(params.id);
    router.push('/strategies');
  }

  async function handleDeleteTrade() {
    if (!pendingTradeDelete) return;
    await deleteTrade.mutateAsync(pendingTradeDelete.id);
    setPendingTradeDelete(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!strategy) {
    return <p className="text-sm text-muted-foreground">Strategy not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/strategies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        Back to strategies
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{strategy.name}</h1>
          {(strategy.defaultSymbol || strategy.defaultTimeframe) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[strategy.defaultSymbol, strategy.defaultTimeframe].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/backtests/new?strategyId=${strategy.id}`}>
            <Button size="sm">
              <Plus size={14} />
              Log Backtest
            </Button>
          </Link>
          <Link href={`/strategies/${strategy.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setConfirmStrategyDelete(true)}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {strategy.description && (
        <Card>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Rules / description</p>
          <p className="whitespace-pre-wrap text-sm text-foreground">{strategy.description}</p>
        </Card>
      )}

      {summary && summary.tradeCount === 0 ? (
        <EmptyState
          title="No backtests logged for this strategy yet"
          description="Log your first one to start seeing its stats and charts."
          action={
            <Link href={`/backtests/new?strategyId=${strategy.id}`}>
              <Button size="sm">Log a backtest</Button>
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

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Backtests for this strategy</h2>
            <BacktestTable
              trades={tradesPage?.data ?? []}
              isLoading={tradesLoading}
              sortBy="date"
              sortDir="desc"
              onSortChange={() => {}}
              onDeleteRequest={setPendingTradeDelete}
            />
            {tradesPage && (
              <Pagination
                page={tradesPage.page}
                totalPages={tradesPage.totalPages}
                total={tradesPage.total}
                onPageChange={setPage}
              />
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmStrategyDelete}
        title="Delete this strategy?"
        description="You'll need to delete or reassign its logged backtests first if it has any."
        loading={deleteStrategy.isPending}
        onConfirm={handleDeleteStrategy}
        onCancel={() => setConfirmStrategyDelete(false)}
      />
      <ConfirmDialog
        open={!!pendingTradeDelete}
        title="Delete this backtest?"
        description="This action can't be undone."
        loading={deleteTrade.isPending}
        onConfirm={handleDeleteTrade}
        onCancel={() => setPendingTradeDelete(null)}
      />
    </div>
  );
}
