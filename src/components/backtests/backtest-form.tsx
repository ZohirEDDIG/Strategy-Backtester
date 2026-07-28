'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { backtestTradeInputSchema, BacktestTradeInput } from '@/validators/backtestTrade';
import { ADHERENCE_LEVELS, BacktestTradeDTO, DIRECTIONS, SETUPS, SYMBOLS, TIMEFRAMES } from '@/types/backtest';
import { Label, Input, Select, Textarea, FieldError } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStrategies } from '@/hooks/useStrategies';
import { calculateRMultiple, outcomeFromR } from '@/utils/rMultiple';
import { formatR } from '@/utils/format';
import { cn } from '@/utils/cn';

interface BacktestFormProps {
  defaultValues?: BacktestTradeDTO;
  defaultStrategyId?: string;
  onSubmit: (input: BacktestTradeInput) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
}

function toFormDefaults(trade?: BacktestTradeDTO, defaultStrategyId?: string): Partial<BacktestTradeInput> {
  if (!trade) {
    return { date: new Date().toISOString().slice(0, 10), strategyId: defaultStrategyId };
  }
  return {
    strategyId: trade.strategyId,
    date: trade.date.slice(0, 10),
    symbol: trade.symbol as BacktestTradeInput['symbol'],
    customSymbol: trade.customSymbol,
    timeframe: trade.timeframe as BacktestTradeInput['timeframe'],
    direction: trade.direction,
    setup: trade.setup as BacktestTradeInput['setup'],
    customSetup: trade.customSetup,
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    exitPrice: trade.exitPrice,
    riskAmount: trade.riskAmount,
    adherence: trade.adherence,
    notes: trade.notes,
    screenshotUrl: trade.screenshotUrl,
  };
}

export function BacktestForm({
  defaultValues,
  defaultStrategyId,
  onSubmit,
  submitting,
  submitLabel = 'Log Backtest',
}: BacktestFormProps) {
  const router = useRouter();
  const { data: strategies, isLoading: strategiesLoading } = useStrategies();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BacktestTradeInput>({
    resolver: zodResolver(backtestTradeInputSchema),
    defaultValues: toFormDefaults(defaultValues, defaultStrategyId),
  });

  const symbol = watch('symbol');
  const setup = watch('setup');
  const direction = watch('direction');
  const entryPrice = watch('entryPrice');
  const stopLoss = watch('stopLoss');
  const exitPrice = watch('exitPrice');

  const canPreview =
    direction && Number(entryPrice) > 0 && Number(stopLoss) > 0 && Number(exitPrice) > 0;
  const previewR = canPreview
    ? calculateRMultiple({
        direction,
        entryPrice: Number(entryPrice),
        stopLoss: Number(stopLoss),
        exitPrice: Number(exitPrice),
      })
    : null;
  const previewOutcome = previewR !== null ? outcomeFromR(previewR) : null;

  return (
    <form onSubmit={handleSubmit(async (data) => onSubmit(data))} className="space-y-5">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="strategyId">Strategy</Label>
            {!strategiesLoading && strategies?.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                No strategies yet.
                <Link href="/strategies/new" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                  <Plus size={13} />
                  Create one first
                </Link>
              </div>
            ) : (
              <Select id="strategyId" {...register('strategyId')} defaultValue={defaultStrategyId ?? ''}>
                <option value="" disabled>
                  Select a strategy
                </option>
                {strategies?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            )}
            <FieldError message={errors.strategyId?.message} />
          </div>

          <div>
            <Label htmlFor="date">Date (of the setup being tested)</Label>
            <Input id="date" type="date" {...register('date')} />
            <FieldError message={errors.date?.message} />
          </div>

          <div>
            <Label htmlFor="direction">Direction</Label>
            <Select id="direction" {...register('direction')} defaultValue="">
              <option value="" disabled>
                Select direction
              </option>
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <FieldError message={errors.direction?.message} />
          </div>

          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Select id="symbol" {...register('symbol')} defaultValue="">
              <option value="" disabled>
                Select a symbol
              </option>
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FieldError message={errors.symbol?.message} />
          </div>

          {symbol === 'Other' && (
            <div>
              <Label htmlFor="customSymbol">Custom symbol</Label>
              <Input id="customSymbol" placeholder="e.g. NAS100" {...register('customSymbol')} />
              <FieldError message={errors.customSymbol?.message} />
            </div>
          )}

          <div>
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select id="timeframe" {...register('timeframe')} defaultValue="">
              <option value="" disabled>
                Select a timeframe
              </option>
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <FieldError message={errors.timeframe?.message} />
          </div>

          <div>
            <Label htmlFor="setup">Setup</Label>
            <Select id="setup" {...register('setup')} defaultValue="">
              <option value="" disabled>
                Select a setup
              </option>
              {SETUPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FieldError message={errors.setup?.message} />
          </div>

          {setup === 'Other' && (
            <div>
              <Label htmlFor="customSetup">Custom setup</Label>
              <Input id="customSetup" placeholder="e.g. News Fade" {...register('customSetup')} />
              <FieldError message={errors.customSetup?.message} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="mb-4 text-xs font-medium text-muted-foreground">Prices</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="entryPrice">Entry price</Label>
            <Input id="entryPrice" type="number" step="any" {...register('entryPrice')} />
            <FieldError message={errors.entryPrice?.message} />
          </div>
          <div>
            <Label htmlFor="stopLoss">Stop loss</Label>
            <Input id="stopLoss" type="number" step="any" {...register('stopLoss')} />
            <FieldError message={errors.stopLoss?.message} />
          </div>
          <div>
            <Label htmlFor="takeProfit">Take profit (optional)</Label>
            <Input id="takeProfit" type="number" step="any" {...register('takeProfit')} />
            <FieldError message={errors.takeProfit?.message} />
          </div>
          <div>
            <Label htmlFor="exitPrice">Exit price (where it actually closed)</Label>
            <Input id="exitPrice" type="number" step="any" {...register('exitPrice')} />
            <FieldError message={errors.exitPrice?.message} />
          </div>
          <div>
            <Label htmlFor="riskAmount">Risk amount $ (optional)</Label>
            <Input id="riskAmount" type="number" step="any" placeholder="e.g. 100" {...register('riskAmount')} />
            <FieldError message={errors.riskAmount?.message} />
            <p className="mt-1 text-xs text-muted-foreground">
              Adds a dollar-equivalent result alongside the R-multiple. Leave blank to track in R only.
            </p>
          </div>
        </div>

        {previewR !== null && (
          <div
            className={cn(
              'mt-4 flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
              previewOutcome === 'win' && 'border-success/30 bg-success/10',
              previewOutcome === 'loss' && 'border-danger/30 bg-danger/10',
              previewOutcome === 'breakeven' && 'border-border bg-muted'
            )}
          >
            <span className="text-muted-foreground">Calculated result</span>
            <span
              className={cn(
                'font-mono font-semibold',
                previewOutcome === 'win' && 'text-success',
                previewOutcome === 'loss' && 'text-danger'
              )}
            >
              {formatR(previewR)}
            </span>
          </div>
        )}
      </Card>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="adherence">Followed the plan?</Label>
            <Select id="adherence" {...register('adherence')} defaultValue="">
              <option value="" disabled>
                Select adherence
              </option>
              {ADHERENCE_LEVELS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            <FieldError message={errors.adherence?.message} />
            <p className="mt-1 text-xs text-muted-foreground">
              Flags whether this result reflects the strategy's actual rules or a deviation from them.
            </p>
          </div>
          <div>
            <Label htmlFor="screenshotUrl">Chart screenshot link (optional)</Label>
            <Input id="screenshotUrl" type="url" placeholder="https://..." {...register('screenshotUrl')} />
            <FieldError message={errors.screenshotUrl?.message} />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={5}
            placeholder="Why this setup qualified, what you'd do differently, market context..."
            {...register('notes')}
          />
          <FieldError message={errors.notes?.message} />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
