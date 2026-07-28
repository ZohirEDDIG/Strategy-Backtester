'use client';

import { useRouter } from 'next/navigation';
import { StrategyForm } from '@/components/strategies/strategy-form';
import { useCreateStrategy } from '@/hooks/useStrategies';
import { StrategyInput } from '@/validators/strategy';

export default function NewStrategyPage() {
  const router = useRouter();
  const createStrategy = useCreateStrategy();

  async function handleSubmit(input: StrategyInput) {
    const strategy = await createStrategy.mutateAsync(input);
    router.push(`/strategies/${strategy.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New Strategy</h1>
        <p className="text-sm text-muted-foreground">Write down the rules before you start testing — it makes judging adherence later much easier.</p>
      </div>
      <StrategyForm onSubmit={handleSubmit} submitting={createStrategy.isPending} submitLabel="Create Strategy" />
    </div>
  );
}
