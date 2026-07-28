import { z } from 'zod';
import { ADHERENCE_LEVELS, DIRECTIONS, SETUPS, SYMBOLS, TIMEFRAMES } from '@/types/backtest';

const positiveNumber = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .refine((v) => Number.isFinite(v), `${label} must be a number`)
    .refine((v) => v > 0, `${label} must be greater than 0`);

export const backtestTradeInputSchema = z
  .object({
    strategyId: z.string().trim().min(1, 'Choose a strategy'),
    date: z.string().trim().min(1, 'Date is required').refine((v) => !Number.isNaN(Date.parse(v)), {
      message: 'Date must be a valid date',
    }),
    symbol: z.enum(SYMBOLS, { required_error: 'Symbol is required' }),
    customSymbol: z.string().trim().max(60).optional(),
    timeframe: z.enum(TIMEFRAMES, { required_error: 'Timeframe is required' }),
    direction: z.enum(DIRECTIONS, { required_error: 'Direction is required' }),
    setup: z.enum(SETUPS, { required_error: 'Setup is required' }),
    customSetup: z.string().trim().max(60).optional(),
    entryPrice: positiveNumber('Entry price'),
    stopLoss: positiveNumber('Stop loss'),
    takeProfit: z.coerce.number().optional(),
    exitPrice: positiveNumber('Exit price'),
    riskAmount: z.coerce.number().positive('Risk amount must be greater than 0').optional(),
    adherence: z.enum(ADHERENCE_LEVELS, { required_error: 'Select how closely you followed the plan' }),
    notes: z.string().trim().max(5000).optional().or(z.literal('')),
    screenshotUrl: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .or(z.literal(''))
      .refine((v) => !v || /^https?:\/\//.test(v), 'Must be a full URL starting with http(s)://'),
  })
  .superRefine((data, ctx) => {
    if (data.symbol === 'Other' && !data.customSymbol) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customSymbol'], message: 'Enter a symbol name' });
    }
    if (data.setup === 'Other' && !data.customSetup) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customSetup'], message: 'Enter a setup name' });
    }

    if (data.direction === 'Long' && data.stopLoss >= data.entryPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stopLoss'],
        message: 'For a Long trade, stop loss must be below entry price',
      });
    }
    if (data.direction === 'Short' && data.stopLoss <= data.entryPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stopLoss'],
        message: 'For a Short trade, stop loss must be above entry price',
      });
    }

    if (data.takeProfit !== undefined) {
      if (data.direction === 'Long' && data.takeProfit <= data.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['takeProfit'],
          message: 'For a Long trade, take profit should be above entry price',
        });
      }
      if (data.direction === 'Short' && data.takeProfit >= data.entryPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['takeProfit'],
          message: 'For a Short trade, take profit should be below entry price',
        });
      }
    }
  });

export type BacktestTradeInput = z.infer<typeof backtestTradeInputSchema>;

export const backtestFiltersSchema = z.object({
  strategyId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  symbol: z.string().optional(),
  setup: z.string().optional(),
  timeframe: z.string().optional(),
  direction: z.string().optional(),
  adherence: z.string().optional(),
  outcome: z.enum(['win', 'loss', 'all']).optional().default('all'),
  sortBy: z.enum(['date', 'rMultiple', 'symbol', 'setup']).optional().default('date'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type BacktestFiltersInput = z.infer<typeof backtestFiltersSchema>;
