'use client';

import { useParams, useRouter } from 'next/navigation';
import { StrategyForm } from '@/components/strategies/strategy-form';
import { useStrategy, useUpdateStrategy } from '@/hooks/useStrategies';
import { StrategyInput } from '@/validators/strategy';
import { Skeleton } from '@/components/ui/misc';

export default function EditStrategyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: strategy, isLoading } = useStrategy(params.id);
  const updateStrategy = useUpdateStrategy(params.id);

  async function handleSubmit(input: StrategyInput) {
    await updateStrategy.mutateAsync(input);
    router.push(`/strategies/${params.id}`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!strategy) {
    return <p className="text-sm text-muted-foreground">Strategy not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Edit Strategy</h1>
        <p className="text-sm text-muted-foreground">Update the rules for {strategy.name}.</p>
      </div>
      <StrategyForm
        defaultValues={strategy}
        onSubmit={handleSubmit}
        submitting={updateStrategy.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
