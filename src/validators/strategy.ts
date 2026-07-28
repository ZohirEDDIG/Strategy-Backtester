import { z } from 'zod';
import { SYMBOLS, TIMEFRAMES } from '@/types/backtest';

export const strategyInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  defaultSymbol: z.enum(SYMBOLS).optional(),
  defaultTimeframe: z.enum(TIMEFRAMES).optional(),
});

export type StrategyInput = z.infer<typeof strategyInputSchema>;
