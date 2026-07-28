'use client';

import Link from 'next/link';
import { ListTree, Plus } from 'lucide-react';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyCard } from '@/components/strategies/strategy-card';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';

export default function StrategiesPage() {
  const { data: strategies, isLoading } = useStrategies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Strategies</h1>
          <p className="text-sm text-muted-foreground">Define what you're testing, then compare results across them.</p>
        </div>
        <Link href="/strategies/new">
          <Button size="sm">
            <Plus size={15} />
            New Strategy
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : !strategies?.length ? (
        <EmptyState
          icon={<ListTree size={28} />}
          title="No strategies yet"
          description="Create a strategy to start logging backtests against it."
          action={
            <Link href="/strategies/new">
              <Button size="sm">Create your first strategy</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      )}
    </div>
  );
}
