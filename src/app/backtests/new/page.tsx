'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BacktestForm } from '@/components/backtests/backtest-form';
import { useCreateBacktest } from '@/hooks/useBacktests';
import { BacktestTradeInput } from '@/validators/backtestTrade';

function NewBacktestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStrategyId = searchParams.get('strategyId') ?? undefined;
  const createBacktest = useCreateBacktest();

  async function handleSubmit(input: BacktestTradeInput) {
    await createBacktest.mutateAsync(input);
    router.push('/');
  }

  return (
    <BacktestForm
      defaultStrategyId={defaultStrategyId}
      onSubmit={handleSubmit}
      submitting={createBacktest.isPending}
      submitLabel="Log Backtest"
    />
  );
}

export default function NewBacktestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Log Backtest</h1>
        <p className="text-sm text-muted-foreground">Record what actually happened at entry, stop, and exit — the R-multiple is calculated for you.</p>
      </div>
      <Suspense fallback={null}>
        <NewBacktestForm />
      </Suspense>
    </div>
  );
}
