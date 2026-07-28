'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { BacktestFilters, BacktestTradeDTO } from '@/types/backtest';
import { Badge, Skeleton } from '@/components/ui/misc';
import { formatDate, formatR } from '@/utils/format';
import { cn } from '@/utils/cn';

interface BacktestTableProps {
  trades: BacktestTradeDTO[];
  isLoading: boolean;
  sortBy: BacktestFilters['sortBy'];
  sortDir: BacktestFilters['sortDir'];
  onSortChange: (field: NonNullable<BacktestFilters['sortBy']>) => void;
  onDeleteRequest: (trade: BacktestTradeDTO) => void;
}

const columns: { key: NonNullable<BacktestFilters['sortBy']>; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'setup', label: 'Setup' },
];

function SortIcon({ active, dir }: { active: boolean; dir?: BacktestFilters['sortDir'] }) {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />;
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

const adherenceVariant: Record<string, 'win' | 'loss' | 'neutral'> = {
  Yes: 'win',
  Partial: 'neutral',
  No: 'loss',
};

export function BacktestTable({
  trades,
  isLoading,
  sortBy,
  sortDir,
  onSortChange,
  onDeleteRequest,
}: BacktestTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                <button onClick={() => onSortChange(col.key)} className="flex items-center gap-1 hover:text-foreground">
                  {col.label}
                  <SortIcon active={sortBy === col.key} dir={sortDir} />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Strategy</th>
            <th className="px-4 py-3 font-medium">Direction</th>
            <th className="px-4 py-3 font-medium">
              <button onClick={() => onSortChange('rMultiple')} className="flex items-center gap-1 hover:text-foreground">
                R-Multiple
                <SortIcon active={sortBy === 'rMultiple'} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 font-medium">Adherence</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading &&
            trades.map((trade) => {
              const isWin = trade.rMultiple > 0;
              const isLoss = trade.rMultiple < 0;
              return (
                <tr key={trade.id} className="border-b border-border transition-colors last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 text-foreground">{formatDate(trade.date)}</td>
                  <td className="px-4 py-3 text-foreground">
                    {trade.symbol === 'Other' ? trade.customSymbol : trade.symbol}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {trade.setup === 'Other' ? trade.customSetup : trade.setup}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{trade.strategyName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{trade.direction}</Badge>
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 font-mono font-medium',
                      isWin && 'text-success',
                      isLoss && 'text-danger'
                    )}
                  >
                    {formatR(trade.rMultiple)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={adherenceVariant[trade.adherence]}>{trade.adherence}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/backtests/${trade.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="View backtest"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/backtests/${trade.id}/edit`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label="Edit backtest"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => onDeleteRequest(trade)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger"
                        aria-label="Delete backtest"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
