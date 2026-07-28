'use client';

import { useParams, useRouter } from 'next/navigation';
import { BacktestForm } from '@/components/backtests/backtest-form';
import { useBacktest, useUpdateBacktest } from '@/hooks/useBacktests';
import { BacktestTradeInput } from '@/validators/backtestTrade';
import { Skeleton } from '@/components/ui/misc';

export default function EditBacktestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: trade, isLoading } = useBacktest(params.id);
  const updateBacktest = useUpdateBacktest(params.id);

  async function handleSubmit(input: BacktestTradeInput) {
    await updateBacktest.mutateAsync(input);
    router.push(`/backtests/${params.id}`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!trade) {
    return <p className="text-sm text-muted-foreground">Backtest not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit Backtest</h1>
        <p className="text-sm text-muted-foreground">Update the details of this backtest.</p>
      </div>
      <BacktestForm
        defaultValues={trade}
        onSubmit={handleSubmit}
        submitting={updateBacktest.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
