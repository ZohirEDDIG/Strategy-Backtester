'use client';

import { X } from 'lucide-react';
import { ADHERENCE_LEVELS, BacktestFilters, DIRECTIONS, SETUPS, SYMBOLS, TIMEFRAMES } from '@/types/backtest';
import { Input, Select } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { useStrategies } from '@/hooks/useStrategies';

interface BacktestFiltersBarProps {
  filters: BacktestFilters;
  onChange: (filters: Partial<BacktestFilters>) => void;
  onReset: () => void;
}

export function BacktestFiltersBar({ filters, onChange, onReset }: BacktestFiltersBarProps) {
  const { data: strategies } = useStrategies();

  const hasActiveFilters =
    filters.strategyId ||
    filters.from ||
    filters.to ||
    filters.symbol ||
    filters.setup ||
    filters.timeframe ||
    filters.direction ||
    filters.adherence ||
    (filters.outcome && filters.outcome !== 'all');

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Strategy</label>
        <Select
          className="h-9 w-40"
          value={filters.strategyId ?? ''}
          onChange={(e) => onChange({ strategyId: e.target.value || undefined })}
        >
          <option value="">All strategies</option>
          {strategies?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">From</label>
        <Input
          type="date"
          className="h-9 w-36"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="date"
          className="h-9 w-36"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Symbol</label>
        <Select
          className="h-9 w-32"
          value={filters.symbol ?? ''}
          onChange={(e) => onChange({ symbol: e.target.value || undefined })}
        >
          <option value="">All symbols</option>
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Setup</label>
        <Select
          className="h-9 w-36"
          value={filters.setup ?? ''}
          onChange={(e) => onChange({ setup: e.target.value || undefined })}
        >
          <option value="">All setups</option>
          {SETUPS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Timeframe</label>
        <Select
          className="h-9 w-28"
          value={filters.timeframe ?? ''}
          onChange={(e) => onChange({ timeframe: e.target.value || undefined })}
        >
          <option value="">All</option>
          {TIMEFRAMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Direction</label>
        <Select
          className="h-9 w-28"
          value={filters.direction ?? ''}
          onChange={(e) => onChange({ direction: e.target.value || undefined })}
        >
          <option value="">All</option>
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Adherence</label>
        <Select
          className="h-9 w-28"
          value={filters.adherence ?? ''}
          onChange={(e) => onChange({ adherence: e.target.value || undefined })}
        >
          <option value="">All</option>
          {ADHERENCE_LEVELS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Outcome</label>
        <Select
          className="h-9 w-32"
          value={filters.outcome ?? 'all'}
          onChange={(e) => onChange({ outcome: e.target.value as BacktestFilters['outcome'] })}
        >
          <option value="all">All</option>
          <option value="win">Wins only</option>
          <option value="loss">Losses only</option>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X size={13} />
          Clear filters
        </Button>
      )}
    </div>
  );
}
