'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useBacktest, useDeleteBacktest } from '@/hooks/useBacktests';
import { Card } from '@/components/ui/card';
import { Badge, Skeleton } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDate, formatR, formatCurrency } from '@/utils/format';

const adherenceVariant: Record<string, 'win' | 'loss' | 'neutral'> = {
  Yes: 'win',
  Partial: 'neutral',
  No: 'loss',
};

export default function BacktestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: trade, isLoading } = useBacktest(params.id);
  const deleteTrade = useDeleteBacktest();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    if (!trade) return;
    await deleteTrade.mutateAsync(trade.id);
    router.push('/');
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trade) {
    return <p className="text-sm text-muted-foreground">Backtest not found.</p>;
  }

  const isWin = trade.rMultiple > 0;
  const isLoss = trade.rMultiple < 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{formatDate(trade.date)}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {trade.symbol === 'Other' ? trade.customSymbol : trade.symbol}
            </h1>
            {trade.strategyName && (
              <Link href={`/strategies/${trade.strategyId}`} className="mt-1 inline-block text-xs text-accent hover:underline">
                {trade.strategyName}
              </Link>
            )}
          </div>
          <div className="text-right">
            <p className={`font-mono text-2xl font-semibold ${isWin ? 'text-success' : isLoss ? 'text-danger' : ''}`}>
              {formatR(trade.rMultiple)}
            </p>
            {trade.resultDollars !== null && (
              <p className="text-xs text-muted-foreground">{formatCurrency(trade.resultDollars)}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="neutral">{trade.direction}</Badge>
          <Badge variant="neutral">{trade.timeframe}</Badge>
          <Badge variant="neutral">{trade.setup === 'Other' ? trade.customSetup : trade.setup}</Badge>
          <Badge variant={adherenceVariant[trade.adherence]}>Followed plan: {trade.adherence}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Entry</p>
            <p className="font-mono text-sm">{trade.entryPrice}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Stop Loss</p>
            <p className="font-mono text-sm">{trade.stopLoss}</p>
          </div>
          {trade.takeProfit !== undefined && (
            <div>
              <p className="text-[11px] text-muted-foreground">Take Profit</p>
              <p className="font-mono text-sm">{trade.takeProfit}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] text-muted-foreground">Exit</p>
            <p className="font-mono text-sm">{trade.exitPrice}</p>
          </div>
        </div>

        {trade.screenshotUrl && (
          <a
            href={trade.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
          >
            View chart screenshot
            <ExternalLink size={12} />
          </a>
        )}

        {trade.notes && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{trade.notes}</p>
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          <Trash2 size={14} />
          Delete
        </Button>
        <Link href={`/backtests/${trade.id}/edit`}>
          <Button variant="secondary">
            <Pencil size={14} />
            Edit
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this backtest?"
        description="This action can't be undone."
        loading={deleteTrade.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
