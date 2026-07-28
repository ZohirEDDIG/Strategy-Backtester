'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { strategyInputSchema, StrategyInput } from '@/validators/strategy';
import { SYMBOLS, TIMEFRAMES, StrategyDTO } from '@/types/backtest';
import { Label, Input, Select, Textarea, FieldError } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface StrategyFormProps {
  defaultValues?: StrategyDTO;
  onSubmit: (input: StrategyInput) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
}

export function StrategyForm({ defaultValues, onSubmit, submitting, submitLabel = 'Save Strategy' }: StrategyFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StrategyInput>({
    resolver: zodResolver(strategyInputSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description,
          defaultSymbol: defaultValues.defaultSymbol as StrategyInput['defaultSymbol'],
          defaultTimeframe: defaultValues.defaultTimeframe as StrategyInput['defaultTimeframe'],
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(async (data) => onSubmit(data))} className="space-y-5">
      <Card>
        <div>
          <Label htmlFor="name">Strategy name</Label>
          <Input id="name" placeholder="e.g. London Breakout Retest" {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="defaultSymbol">Default symbol (optional)</Label>
            <Select id="defaultSymbol" {...register('defaultSymbol')} defaultValue="">
              <option value="">No default</option>
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="defaultTimeframe">Default timeframe (optional)</Label>
            <Select id="defaultTimeframe" {...register('defaultTimeframe')} defaultValue="">
              <option value="">No default</option>
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="description">Rules / description (optional)</Label>
          <Textarea
            id="description"
            rows={8}
            placeholder="Entry criteria, stop placement rules, invalidation conditions, target logic..."
            {...register('description')}
          />
          <FieldError message={errors.description?.message} />
          <p className="mt-1 text-xs text-muted-foreground">
            Writing the exact rules down makes it much easier to judge adherence later.
          </p>
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
